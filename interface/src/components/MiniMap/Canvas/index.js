import Model from 'components/Model';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { useSelector } from 'store';
import Path from './Path';

export default function ThreeCanvas(props) {
  const modelPosition = useSelector((state) => state.settings?.modelPosition);
  const cameraPosition = useSelector((state) => state.settings?.cameraPosition);

  return (
    <div id="minimap" className="w-full h-full">
      <Canvas
        dpr={[1, 1.5]}
        shadows={{ enabled: true }}
        gl={{ localClippingEnabled: true }}
        camera={{
          position: cameraPosition,
          fov: 100,
          near: 0.1,
          far: 1000,
        }}
      >
        <Physics gravity={[0, -10, 0]}>
          <Model position={modelPosition} standardMaterial={true} />
        </Physics>
        <Path />
      </Canvas>
    </div>
  );
}
