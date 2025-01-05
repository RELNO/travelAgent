import { useSelector, useDispatch } from 'store';
import { updateInfo } from 'store/actions';
import { useLogger } from 'components/utils';

const SERVEURL = process.env.REACT_APP_SDXL_URL;
const genApi = '/api/gen_image';
const cannyApi = '/api/get_canny';

export async function getCompass() {
  const svgElement = document.getElementById('compass');
  if (svgElement) {
    // Serialize SVG and encode it to base64
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const encodedSVG = `data:image/svg+xml;base64,${btoa(
      encodeURIComponent(svgData).replace(/%([0-9A-F]{2})/g, (_, p1) =>
        String.fromCharCode(`0x${p1}`)
      )
    )}`;

    // Optional: Convert SVG to PNG if SVG rendering issues persist
    const svgImage = new Image();
    return new Promise((resolve, reject) => {
      svgImage.onload = () => {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = svgImage.width;
        tempCanvas.height = svgImage.height;
        tempCtx.drawImage(svgImage, 0, 0);

        // Save PNG data URL instead of SVG data URL
        const pngDataURL = tempCanvas.toDataURL('image/png');
        resolve(pngDataURL);
      };
      svgImage.onerror = reject;
      svgImage.src = encodedSVG;
    });
  }
  return null;
}

export function resizeImage(base64Image, width, ratio) {
  return new Promise((resolve, reject) => {
    // Create an off-screen canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Set the dimensions
    canvas.width = width;
    canvas.height = width * ratio;

    // Create a new Image
    const img = new Image();
    img.onload = function () {
      // Draw the resized image
      ctx.drawImage(img, 0, 0, width, width * ratio);
      // Resolve the promise with the new base64 data URL
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = base64Image;
  });
}

export async function getSegImage(canvases) {
  let ratio;
  const keys = Object.keys(canvases);
  keys.sort((a, b) => {
    return b[0].localeCompare(a[0]);
  });
  const segImages = await Promise.all(
    keys.map(async (direction) => {
      const { gl, camera, scene } = canvases[direction];
      gl.render(scene, camera);
      const canvas = gl.domElement;
      ratio = canvas.height / canvas.width;
      const base64Image = canvas.toDataURL();
      const segImage = await resizeImage(base64Image, 512, ratio);
      return segImage;
    })
  );
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const width = 512;
  const height = width * ratio;
  canvas.width = width * segImages.length;
  canvas.height = width * ratio;

  const loadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };
  const loadedImages = await Promise.all(segImages.map(loadImage));

  loadedImages.forEach((img, index) => {
    ctx.drawImage(img, index * width, 0, width, height);
  });
  return canvas.toDataURL('image/png');
}

export async function reviseRenderedImage(renderedImage) {
  const compassImage = await getCompass();
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const image = new Image();
    image.onload = () => {
      // Set canvas size to match the image
      const ratio = image.width / image.height;
      canvas.height = 325;
      canvas.width = canvas.height * ratio;
      // Draw the image onto the canvas
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      // Draw the compass image
      if (compassImage) {
        const compass = new Image();
        compass.crossOrigin = 'anonymous';
        compass.onload = () => {
          ctx.drawImage(
            compass,
            canvas.width / 2 - 125,
            canvas.height - 125,
            250,
            125
          );
          resolve(canvas.toDataURL('image/png'));
        };
        compass.onerror = () =>
          reject(new Error('Failed to load compass image'));
        compass.src = compassImage;
      } else {
        resolve(canvas.toDataURL('image/png'));
      }
    };
    image.onerror = reject;
    image.src = renderedImage.includes('data:')
      ? renderedImage
      : `data:image/jpeg;base64,${renderedImage}`;
  });
}

export function useRender() {
  const dispatch = useDispatch();
  const serverIsBusy = useSelector((state) => state.info?.serverIsBusy);
  const renderSwitch = useSelector((state) => state.settings?.renderSwitch);
  const prompt = useSelector((state) => state.settings?.prompt);
  const seed = useSelector((state) => state.settings?.seed);
  const initImage = useSelector((state) => state.settings?.initImage);
  const canvases = useSelector((state) => state.canvases);
  const { logger } = useLogger();
  const log = logger(dispatch);
  // const renderedImage = useSelector(state=>state.info?.renderedImage);
  const render = async () => {
    // if the server is busy, return
    if (serverIsBusy) return;
    const childCanvas = document.querySelectorAll(`.child-canvas`);
    if (!(canvases && Object.keys(canvases).length === childCanvas.length))
      return;
    // get the seg image
    let segImage;
    segImage = await getSegImage(canvases);
    let renderedImage;
    dispatch(updateInfo({ serverIsBusy: true }));

    // send to sxdl server to render
    if (!renderSwitch) {
      renderedImage = await reviseRenderedImage(segImage);
      dispatch(
        updateInfo({ renderedImage: renderedImage, serverIsBusy: false })
      );
      log.info('finish rendering');
      return [segImage, renderedImage];
    }
    const response = await fetch(SERVEURL + genApi, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        init_image: initImage ? initImage : null,
        seg_image: segImage,
        prompt: prompt,
        seed: seed,
      }),
    });
    // if the response is ok, update the rendered image
    if (response.status === 200) {
      const render = await response.json();
      renderedImage = await reviseRenderedImage(render['render_image']);
      segImage = await reviseRenderedImage(segImage);
      log.info('finish rendering');
      dispatch(updateInfo({ renderedImage, serverIsBusy: false }));
      return [segImage, renderedImage];
    }
  };

  const getCanny = async () => {
    // if the server is busy, return
    if (serverIsBusy) return;
    const childCanvas = document.querySelectorAll(`.child-canvas`);
    if (!(canvases && Object.keys(canvases).length === childCanvas.length))
      return;
    // get the seg image
    const segImage = await getSegImage(canvases);
    const response = await fetch(SERVEURL + cannyApi, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: segImage,
      }),
    });
    // if the response is ok, update the rendered image
    if (response.status === 200) {
      const canny = await response.json();
      const cannyImage = await reviseRenderedImage(canny['canny_image']);
      dispatch(updateInfo({ cannyImage }));
      return { cannyImage };
    }
  };
  return { render, getCanny };
}
