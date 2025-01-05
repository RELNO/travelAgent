
# TravelAgent
[TravelAgent](https://www.arielnoyman.com/travelAgent/) simulates human-like behaviors and experiences in diverse built environments. This repository hosts the code and the website for the TravelAgent.

![schema](static/figs/ta-scheme.png)

# Folder Structure

- `<root>` : the website of the TravelAgent paper, which showcases the concepts, results described in our paper (The website is inspired by and built using the framework of the [Nerfies website](https://nerfies.github.io)).

- `interface` : The React App of TravelAgent user interface.

- `server` : Python backend server to run the image generation model.

- `server/logs`: All the experiment logs will be saved in this folder for further analysis.


# Setup

### Interface

- prepare the environment

```bash
cd interface
npm install
```

- openai api key

The openai api key is not included in this repo, you'll need to prepare your own key, and paste in the `.env` file.

```
REACT_APP_OPENAI_KEY=<your openai api key here>
```

- run the interface

```bash
npm start
```

### Server

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


# Citiation

If you find TravelAgent useful for you work please cite:

```
@article{noyman2024travelagent,
      title={TravelAgent: Generative Agents in the Built Environment},
      author={Noyman, Ariel and Hu, Kai and Larson, Kent},
      year={2024},
      journal={arXiv preprint},
    }
```




