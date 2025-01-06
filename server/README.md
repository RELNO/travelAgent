# Server

This folder is the python backend server to run the image generation model (sdxl-turbo).

### Setup

- prepare the environment

```bash
cd server
pip install -r requirements.txt
```

- download the sdxl_controlnet_seg_model

The model is not included in the repository. You can download the model from the following link and place it in the `sdxl_controlnet_seg_model` folder. https://huggingface.co/abovzv/sdxl_segmentation_controlnet_ade20k

You might need to rename the model filename to `diffusion_pytorch_model.safetensors`. see discussion [here](https://huggingface.co/abovzv/sdxl_segmentation_controlnet_ade20k/discussions/1)

- run the backend

```bash
python main.py
```

Note: if you are using gpu change the device in `main.py` to `cuda`