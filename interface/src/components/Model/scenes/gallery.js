/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.5.0 vision_llm_agent/interface/public/assets/models/gallery.glb 
*/

import React from 'react';
import { useGLTF, Environment } from '@react-three/drei';

export function Gallery({ props, nodes, materials }) {
  return (
    <group {...props} dispose={null}>
      <spotLight
        castShadow
        intensity={1}
        angle={0.1}
        position={[-200, 220, -100]}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.000001}
      />
      <Environment
        files="https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/hdris/noon-grass/noon_grass_1k.hdr"
        background
      />
      <mesh
        geometry={nodes.Lights.geometry}
        material={materials.Art_Room1}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.01}
      />
      <mesh
        geometry={nodes.Art_Room.geometry}
        material={materials.Art_Room1}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.01}
      />
    </group>
  );
}

useGLTF.preload('/gallery.glb');
