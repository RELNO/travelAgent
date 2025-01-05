import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'store';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { updateInfo } from 'store/actions';
import { resizeImage } from 'components/utils/render';

export default function Path(props) {
  const logs = useSelector((state) => state.logs);
  const experimentScene = useSelector((state) => state.scene);
  const settings = useSelector((state) => state.settings);
  const cameraPosition = useSelector((state) => state.settings?.cameraPosition);
  const [vertices, setVertices] = useState([]);
  const [arrow, setArrow] = useState(null);
  const { camera, gl, scene } = useThree();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!camera || !cameraPosition) return;
    camera.position.set(
      cameraPosition[0],
      cameraPosition[1],
      cameraPosition[2]
    );
  }, [camera, cameraPosition]);

  //clear path when scene changes
  useEffect(() => {
    setVertices([]);
    setArrow(null);
  }, [experimentScene]);

  // update minimap when path changes
  useEffect(() => {
    const getMinimap = async () => {
      gl.render(scene, camera);
      const canvas = gl.domElement;
      const ratio = canvas.height / canvas.width;
      const base64Image = gl.domElement.toDataURL();
      const miniMap = await resizeImage(base64Image, 512, ratio);
      dispatch(updateInfo({ miniMap }));
    };
    getMinimap();
    // eslint-disable-next-line
  }, [vertices]);

  useEffect(() => {
    const logPositions = logs.filter((log) => log.type === 'position');
    const points = JSON.parse(`[${logPositions.map((log) => log.message)}]`);
    if (points.length === 0) return;
    // draw Path
    setVertices(
      points.map(
        (point) =>
          new THREE.Vector3(
            point.position.x,
            point.position.y,
            point.position.z
          )
      )
    );
    // draw Arrow
    const start = new THREE.Vector3(
      points[0].position.x,
      points[0].position.y,
      points[0].position.z
    );
    const direction = new THREE.Vector3(
      points[0].direction.x,
      points[0].direction.y,
      points[0].direction.z
    );
    const length = settings?.pathSize;
    const arrowHelper = new THREE.ArrowHelper(
      direction,
      start,
      length,
      settings?.pathColor,
      settings?.pathSize,
      settings?.pathSize
    );
    setArrow(arrowHelper);
    // eslint-disable-next-line
  }, [logs]);

  return (
    vertices.length > 0 && (
      <>
        <Line points={vertices} color={settings?.pathColor} lineWidth={2} />
        {arrow && <primitive object={arrow} />}
        {vertices.map((vertex, idx) => {
          const { x, y, z } = vertex;
          const position = new THREE.Vector3(x, y + 1, z);
          return (
            <pointLight
              key={idx}
              position={position}
              intensity={0.8}
              distance={100}
              decay={10}
            />
          );
        })}
      </>
    )
  );
}
