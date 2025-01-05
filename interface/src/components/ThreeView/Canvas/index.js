import Model from 'components/Model';
import BaseAgent from 'components/Agent';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { useSelector, useDispatch } from 'store';
import { updateCanvas } from 'store/actions';
import { PerspectiveCamera } from '@react-three/drei';

const UpdateCamera = ({ direction }) => {
  const { camera, gl, scene } = useThree();
  const dispatch = useDispatch();
  useFrame(() => {
    dispatch(updateCanvas({ [direction]: { camera, gl, scene } }));
  });
};

export default function ThreeCanvas(props) {
  const modelPosition = useSelector((state) => state.settings?.modelPosition);
  const initPosition = useSelector((state) => state.settings?.agentPosition);
  const direction = props.direction;
  const [x, y, z] = initPosition.rotation;
  const getRotateY = (direction) => {
    const canvas = document.querySelector('#threecanvas');
    const childCanvas = document.querySelectorAll(`.child-canvas`);
    if (!canvas) return { aspect: 1, fov: 45, rotateY: 0 };
    const numChildNodes = childCanvas.length;
    const aspect = canvas.clientWidth / canvas.clientHeight / numChildNodes;
    const fov = 45;
    const fovRadian = fov * (Math.PI / 180);
    const angle = 2 * Math.atan(Math.tan(fovRadian / 2) * aspect);
    const rotateY = direction * angle;
    return { aspect, fov, rotateY };
  };
  const { aspect, fov, rotateY } = getRotateY(direction);
  return (
    <div className="w-full h-full child-canvas" id={direction}>
      <Canvas dpr={[1, 1]} shadows>
        <color attach="background" args={['#06E6E6']} />
        <Physics gravity={[0, -10, 0]}>
          <Model position={modelPosition} outline={true} />
          <PerspectiveCamera
            makeDefault
            near={0.1}
            position={initPosition.position}
            rotation={[x, y + rotateY, z]}
            fov={fov}
            aspect={aspect}
          />
          {direction === 0 && <BaseAgent />}
          <UpdateCamera direction={direction} />
        </Physics>
      </Canvas>
    </div>
  );
}
