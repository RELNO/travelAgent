import { useThree } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'store';
import { updateMovement } from 'store/actions';
import * as THREE from 'three';
import { delay, useLogger, useRender } from 'components/utils';

const collisionDistance = 1.5;

export default function Action(props) {
  const { body } = props;
  const dispatch = useDispatch();
  const { camera } = useThree();
  const { render } = useRender();
  const { logger } = useLogger();
  const movement = useSelector((state) => state.movement);
  const raycasterInfo = useSelector((state) => state.info?.raycasterInfo);
  const stepHeight = useSelector((state) => state.info?.stepHeight);
  const serverIsBusy = useSelector((state) => state.info?.serverIsBusy);
  const step = useSelector((state) => state.info?.currentStep);
  const plan = useSelector((state) => state.settings?.plan);
  const scene = useSelector((state) => state.scene);
  const canvases = useSelector((state) => state.canvases);
  const log = logger(dispatch);
  const [currentStep, setCurrentStep] = useState(0);

  const getPostion = () => {
    const position = camera.position;
    let direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    direction = direction.normalize();
    return { position, direction };
  };

  const hold = () => {
    dispatch(updateMovement(null));
    // log position
    const { position, direction } = getPostion();
    step >= 0 &&
      log.position({
        step: step,
        message: JSON.stringify({
          position: position,
          direction: direction,
        }),
      });
    // reset current step
    setCurrentStep(0);
    // update render when it is not in plan mode
    // cause plan will update render in each step too
    plan || render();
  };

  const finish = () => {
    log.info('Task Finished');
    hold();
  };

  const forward = async (totalStep) => {
    const warning =
      raycasterInfo.forward?.distance < collisionDistance &&
      raycasterInfo.forward?.material !== 'person';
    const { position, direction } = getPostion();
    // don't perform forward action if there is a warning
    if (warning === true || totalStep === 0) {
      hold();
      return;
    }
    if (totalStep && currentStep < totalStep) {
      // log.info(`forward ${currentStep}`);
      body.current.setTranslation({
        x: position.x + props.MOVE_DISTANCE * direction.x,
        y: stepHeight < 0.5 ? position.y + stepHeight : position.y,
        z: position.z + props.MOVE_DISTANCE * direction.z,
      });
      // Sync camera position with collider
      const { x, y, z } = body.current.translation();
      // camera.position.set(x, y, z);
      // Sync camera
      Object.keys(canvases).forEach((direction) => {
        const { camera } = canvases[direction];
        camera.position.set(x, y, z);
      });
      setCurrentStep((prevStep) => prevStep + 1);
    } else {
      hold();
    }
  };

  const turnLeft = async (rotateAngle) => {
    const warning =
      raycasterInfo.left?.distance < collisionDistance &&
      raycasterInfo.left?.material !== 'person';
    // don't perform turn left action if there is a warning
    if (warning === true || rotateAngle === 0) {
      hold();
      return;
    }

    // camera.rotateY(rotateAngle * (Math.PI / 180));
    // Sync camera
    Object.keys(canvases).forEach((direction) => {
      const { camera } = canvases[direction];
      camera.rotateY(rotateAngle * (Math.PI / 180));
    });

    hold();
  };

  const turnRight = async (rotateAngle) => {
    const warning =
      raycasterInfo.right?.distance < collisionDistance &&
      raycasterInfo.right?.material !== 'person';
    // don't perform turn right action if there is a warning
    if (warning === true || rotateAngle === 0) {
      hold();
      return;
    }
    // camera.rotateY(-rotateAngle * (Math.PI / 180));
    // Sync camera
    Object.keys(canvases).forEach((direction) => {
      const { camera } = canvases[direction];
      camera.rotateY(-rotateAngle * (Math.PI / 180));
    });

    hold();
  };

  //init
  const numChildNodes = canvases && Object.keys(canvases).length;
  useEffect(() => {
    const init = async () => {
      await delay(100);
      hold();
    };
    init();
    // eslint-disable-next-line
  }, [scene, numChildNodes]);

  useEffect(() => {
    if (!(body && body.current && movement)) return;
    if (serverIsBusy) {
      // log.info('server is busy, please wait for a moment.');
      return;
    }
    movement.forward && forward(movement.forward);
    movement.hold && hold();
    movement.turnLeft && turnLeft(movement.turnLeft);
    movement.turnRight && turnRight(movement.turnRight);
    movement.finish && finish();
    // eslint-disable-next-line
  }, [movement, raycasterInfo]);

  return null;
}
