import { useState, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useDispatch } from 'store';
import { updateMovement } from 'store/actions';

export { useRender } from './render';
export { useLogger } from './logger';

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const KeyBoardController = () => {
  const dispatch = useDispatch();

  const keys = {
    KeyW: 'forward',
    KeyS: 'backward',
    KeyA: 'left',
    KeyD: 'right',
    KeyQ: 'turnLeft',
    KeyE: 'turnRight',
    Space: 'hold',
  };
  const moveFieldByKey = (key) => keys[key];

  const [movement, setMovement] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) =>
      setMovement((m) => ({
        [moveFieldByKey(e.code)]:
          moveFieldByKey(e.code) === 'turnLeft' ||
          moveFieldByKey(e.code) === 'turnRight'
            ? 30
            : 10,
      }));
    const handleKeyUp = (e) => setMovement(null);

    const canvas = document.querySelector('#threecanvas');
    canvas.setAttribute('tabindex', '0');

    canvas.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('keyup', handleKeyUp);

    return () => {
      canvas.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('keyup', handleKeyUp);
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    dispatch(updateMovement(movement));
    // eslint-disable-next-line
  }, [movement]);

  return null;
};

export const CameraController = () => {
  const { camera, gl } = useThree();
  const handleClick = (event) => {
    const [x, y] = [event.clientX, event.clientY];
    const { left, top, width, height } = gl.domElement.getBoundingClientRect();

    // Convert screen coordinates to normalized device coordinates (-1 to +1)
    const ndcX = ((x - left) / width) * 2 - 1;
    const ndcY = -((y - top) / height) * 2 + 1;

    // Convert NDC to 3D coordinates
    const vector = new THREE.Vector3(ndcX, ndcY, 0.5).unproject(camera);
    camera.lookAt(vector);
  };

  useEffect(() => {
    gl.domElement.addEventListener('click', handleClick);
    return () => {
      gl.domElement.removeEventListener('click', handleClick);
    };
    // eslint-disable-next-line
  }, [gl.domElement, camera]);

  return null;
};
