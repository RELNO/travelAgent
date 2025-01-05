from diffusers import ControlNetModel, AutoencoderKL
from diffusers import StableDiffusionXLControlNetPipeline
from PIL import Image
from io import BytesIO
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Union, Optional
import torch
import os
import base64
import threading
import json
import cv2
import numpy as np
import io

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
pipeline_lock = threading.Lock()

device = "mps"


def setup_pipeline():
    # load the sdxl model
    vae = AutoencoderKL.from_pretrained(
        "madebyollin/sdxl-vae-fp16-fix", torch_dtype=torch.float16)
    seg_controlnet = ControlNetModel.from_pretrained(
        "./sdxl_controlnet_seg_model",  torch_dtype=torch.float16)
    canny_controlnet = ControlNetModel.from_pretrained(
        "diffusers/controlnet-canny-sdxl-1.0-small",
        torch_dtype=torch.float16
    )
    pipe = StableDiffusionXLControlNetPipeline.from_pretrained(
        "stabilityai/sdxl-turbo",
        # "stabilityai/stable-diffusion-xl-base-1.0",
        vae=vae,
        controlnet=[seg_controlnet, canny_controlnet],
        torch_dtype=torch.float16
    )
    pipe.to(device=device)
    return pipe


def resize_img(image):

    # find the image ratio
    image_ratio = image.size[0] / image.size[1]

    # # the image should be larger than 256x256
    image_height = 325
    image_width = int(image_height * image_ratio)

    image = image.resize((image_width, image_height))
    return image


class LogsRequest(BaseModel):
    id: str
    logs: dict


class CannyRequest(BaseModel):
    image: str


def pil2base64(pil_image):
    buffer = io.BytesIO()
    pil_image.save(buffer, format='PNG')
    buffer.seek(0)
    # Convert the bytes to base64
    img_str = base64.b64encode(buffer.getvalue()).decode('utf-8')
    # Format the base64 string for use in HTML/CSS as an image
    base64_image = f"data:image/png;base64,{img_str}"
    return base64_image


def base642pil(base64_string):
    base64Image = base64_string.split(",")[1]
    image_data = base64.b64decode(base64Image)
    image = Image.open(BytesIO(image_data))
    return image


def load_resize_base64(base64_string):
    base64Image = base64_string.split(",")[1]
    image_data = base64.b64decode(base64Image)
    image = Image.open(BytesIO(image_data)).convert("RGB")
    image = resize_img(image)
    return image


def get_canny_image(image):
    image = np.array(image)
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
    image = cv2.Canny(image, 100, 200)
    image = image[:, :, None]
    image = np.concatenate([image, image, image], axis=2)
    image = Image.fromarray(image)
    return image


@app.post('/api/get_canny')
def get_canny(request: CannyRequest):
    image = load_resize_base64(request.image)
    canny_image = get_canny_image(image)
    base64_image = pil2base64(canny_image)
    return {'canny_image': base64_image}


@app.post('/api/save_logs')
def save_logs(request: LogsRequest):

    # check if logs folder exists and create it if not
    if not os.path.exists('logs'):
        os.makedirs('logs')

    # get the request data
    id = request.id
    logs = request.logs

    # check if folder with the id exists and create it if not
    if not os.path.exists(f'logs/exp_{id}'):
        os.makedirs(f'logs/exp_{id}')

    # save the images
    for step, log_data in logs.items():
        seg = log_data.get('seg')
        image = log_data.get('image')
        mini_map = log_data.get('miniMap')
        if seg:
            seg = base642pil(seg)
            seg.save(f'logs/exp_{id}/step_{step}_seg.png')
            logs[step]['seg'] = f'logs/exp_{id}/step_{step}_seg.png'
        else:
            logs[step]['seg'] = None
        if image:
            image = base642pil(image)
            image.save(f'logs/exp_{id}/step_{step}_image.png')
            logs[step]['image'] = f'logs/exp_{id}/step_{step}_image.png'
        else:
            logs[step]['image'] = None
        if mini_map:
            mini_map = base642pil(mini_map)
            mini_map.save(f'logs/exp_{id}/step_{step}_mini_map.png')
            logs[step]['miniMap'] = f'logs/exp_{id}/step_{step}_mini_map.png'
        else:
            logs[step]['miniMap'] = None
    # save the logs
    with open(f'logs/exp_{id}/logs.json', 'w') as f:
        json.dump(logs, f, indent=4)

    return {'message': 'logs saved successfully'}


class ImageRequest(BaseModel):
    init_image: Optional[str]
    seg_image: str
    prompt: str
    negative_prompt: Union[str, None] = "people, disfigured, ugly, bad, immature, cartoon, anime, 3d, painting, b&w, black and white, low quality, blurry, grainy, noisy, pixelated, low resolution, low res, low quality"
    # controlnet_conditioning_scale: float = 0.95
    # guidance_scale: float = 1
    seed: Optional[int] = -1



@app.post('/api/gen_image')
def gen_image(request: ImageRequest):
    if not pipeline_lock.acquire(blocking=False):
        raise HTTPException(
            status_code=429, detail="Pipeline is currently busy. Please try again later.")
    try:
        torch.cuda.empty_cache()
        seg_image = load_resize_base64(request.seg_image)
        canny_image = get_canny_image(seg_image)

        if request.seed == -1 or request.seed is None:
            generator = torch.manual_seed(torch.seed())
        else:
            generator = torch.manual_seed(request.seed)

        render = pipe(
            prompt=request.prompt,
            negative_prompt=request.negative_prompt,
            image=[seg_image, canny_image],
            num_inference_steps=2,
            width=seg_image.width,
            height=seg_image.height,
            controlnet_conditioning_scale=0.5,
            guidance_scale=0.25,
            generator=generator,
        ).images[0]

        render_image = pil2base64(render)
        # render_image = pil2base64(canny_image)

        return {'render_image': render_image}
    finally:
        pipeline_lock.release()


pipe = setup_pipeline()

# Run the app
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=False)
