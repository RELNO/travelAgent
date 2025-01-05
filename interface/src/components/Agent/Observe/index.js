import { useEffect } from 'react';
import { useDispatch, useSelector } from 'store';
import { updateInfo, updateSettings } from 'store/actions';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { delay, useRender } from 'components/utils';

export default function Observe(props) {
  const dispatch = useDispatch();
  const { scene, camera } = useThree();
  const renderSwitch = useSelector((state) => state.settings?.renderSwitch);
  const initImage = useSelector((state) => state.settings?.initImage);
  const initScene = useSelector((state) => state.scene);
  const initPosition = useSelector((state) => state.settings?.agentPosition);
  const { render } = useRender();
  const seed = useSelector((state) => state.settings?.seed);
  const wayPoinsts = useSelector((state) => state.settings?.wayPoinsts);
  const currentPointIndex = useSelector(
    (state) => state.settings?.currentPointIndex
  );

  // get the direction of the camera
  const getDirection = () => {
    let direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    const forward = direction.normalize();
    const backward = forward.clone().negate();
    const left = forward
      .clone()
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
    const right = left.clone().negate();
    return {
      forward,
      backward,
      left,
      right,
    };
  };

  const getTargetAngle = () => {
    if (currentPointIndex === null) return 0;
    const targetPosition = wayPoinsts[currentPointIndex];
    const position = camera.position;
    // Calculate the distance between the camera and the target
    const distance = Math.sqrt(
      Math.pow(targetPosition[0] - position.x, 2) +
        Math.pow(targetPosition[2] - position.z, 2)
    );
    if (distance < 4) {
      if (currentPointIndex < wayPoinsts.length - 1) {
        dispatch(updateSettings({ currentPointIndex: currentPointIndex + 1 }));
      } else if (currentPointIndex === wayPoinsts.length - 1) {
        dispatch(updateSettings({ currentPointIndex: null }));
      }
    }
    // console.log('currentPointIndex', currentPointIndex, 'distance', distance);

    const target = new THREE.Vector3(
      targetPosition[0],
      camera.position.y,
      targetPosition[2]
    );
    // Check if position and target are the same
    if (target.equals(position)) {
      return 0;
    }
    // create 2 point vector from camera to target
    const targetDirection = target.clone().sub(position).normalize();
    // // calculate the angle between the camera direction and the target direction
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    // // ignore the y axis
    forward.y = targetDirection.y = 0;

    // Calculate the angle in degrees
    const angle = forward.angleTo(targetDirection) * (180 / Math.PI);

    // Determine the direction of the angle using the cross product
    const crossProduct = new THREE.Vector3().crossVectors(
      forward,
      targetDirection
    );
    const signedAngle = crossProduct.y < 0 ? angle : -angle;

    return signedAngle.toFixed(0);
  };

  const checkStep = () => {
    let direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    const forward = direction.normalize();
    const position = camera.position
      .clone()
      .add(forward.clone().multiplyScalar(props.MOVE_DISTANCE));
    const raycaster = new THREE.Raycaster();
    const detectDirection = new THREE.Vector3(0, -1, 0);
    raycaster.set(position, detectDirection);
    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
      const intersectedObject = intersects[0];
      const distance = intersectedObject.distance;
      const stepY = position.y - distance;
      const ground = camera.position.y - initPosition.position[1];
      const stepHeight = stepY - ground;
      return stepHeight;
    }
    return 0;
  };
  // Function to perform a raycast from the camera to the object in the scene
  // This function will require the material of the object named properly
  const raycast = () => {
    const directions = getDirection();
    let raycasterInfo = {};
    Object.keys(directions).forEach((key) => {
      raycasterInfo[key] = {};
      const direction = directions[key];
      const raycaster = new THREE.Raycaster();
      let position = camera.position.clone();
      // position.y -= 1;
      raycaster.set(position, direction);
      const intersects = raycaster.intersectObjects(scene.children, true);
      if (intersects.length > 0) {
        const intersectedObject = intersects[0];
        raycasterInfo[key]['material'] =
          intersectedObject.object?.material?.name;
        raycasterInfo[key]['distance'] = intersectedObject.distance;
      } else {
        raycasterInfo[key]['material'] = null;
        raycasterInfo[key]['distance'] = null;
      }
    });
    return raycasterInfo;
  };

  const getPostion = () => {
    const position = camera.position;
    const rotation = camera.rotation;
    // let direction = new THREE.Vector3();
    // camera.getWorldDirection(direction);
    // direction = direction.normalize();
    return { position, rotation };
  };

  // update information every frame
  useFrame(() => {
    const distance = raycast();
    const stepHeight = checkStep();
    const { position, rotation } = getPostion();
    const targetAngle = getTargetAngle();
    dispatch(
      updateInfo({
        raycasterInfo: distance,
        stepHeight: stepHeight,
        positionInfo: position,
        rotationInfo: rotation,
        targetAngle: targetAngle,
      })
    );
  });

  // init render
  useEffect(() => {
    const initRender = async () => {
      await delay(100);
      render();
    };
    initRender();
    // eslint-disable-next-line
  }, [renderSwitch, initImage, seed, initScene]);

  return null;
}
