import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useDispatch } from 'store';
import { updateInfo } from 'store/actions';
import { RigidBody } from '@react-three/rapier';
import { useModel } from './scenes';
import Floor from './scenes/floor';

export default function Model({ ...props }) {
  const ref = useRef();
  const dispatch = useDispatch();
  const model = useModel(props);

  useEffect(() => {
    if (ref.current) {
      const box = new THREE.Box3().setFromObject(ref.current);
      const size = new THREE.Vector3();
      box.getSize(size);
      const modelSize = {
        width: size.x,
        height: size.y,
        depth: size.z,
      };
      dispatch(updateInfo({ modelSize }));
    }
    // eslint-disable-next-line
  }, [ref.current]);

  return (
    <>
      <RigidBody type="fixed" colliders={false}>
        {model}
      </RigidBody>
      <Floor type="fixed" colliders="trimesh" {...props} />
    </>
  );
}
