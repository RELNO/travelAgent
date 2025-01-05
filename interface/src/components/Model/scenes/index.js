import { Street } from './street';
import { Lobby } from './lobby';
import { Gallery } from './gallery';

import React from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useSelector } from 'store';

const clippingPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 1.4);

const mapToMeshBasicMaterial = (originalMaterial) => {
  const color = originalMaterial?.color
    ? originalMaterial.color.getHex()
    : '0xffffff';
  const side = THREE.DoubleSide;
  const name = originalMaterial?.name;
  return new THREE.MeshBasicMaterial({
    name,
    color,
    side,
    clippingPlanes: [clippingPlane],
  });
};

const mapToClippingMaterial = (originalMaterial) => {
  const newMaterial = originalMaterial.clone();
  newMaterial.clippingPlanes = [clippingPlane];
  newMaterial.side = THREE.DoubleSide;
  return newMaterial;
};

const getMappedMaterials = (materials, standardMaterial = false) => {
  return Object.keys(materials).reduce((acc, key) => {
    if (standardMaterial) {
      acc[key] = mapToClippingMaterial(materials[key]);
    } else {
      acc[key] = mapToMeshBasicMaterial(materials[key]);
    }
    return acc;
  }, {});
};

export function useModel(props) {
  const scene = useSelector((state) => state.scene);
  const modelPath = useSelector((state) => state.settings?.modelPath);
  const gltf = useGLTF(modelPath);
  const nodes = gltf.nodes;
  const materials = gltf.materials;
  let model;
  if (scene === 'lobby') {
    model = (
      <Lobby
        props={props}
        nodes={nodes}
        materials={getMappedMaterials(materials, props.standardMaterial)}
      />
    );
  } else if (scene === 'gallery') {
    model = (
      <Gallery
        props={props}
        nodes={nodes}
        materials={getMappedMaterials(materials, props.standardMaterial)}
      />
    );
  } else {
    model = (
      <Street
        props={props}
        nodes={nodes}
        materials={getMappedMaterials(materials, props.standardMaterial)}
      />
    );
  }

  return <>{model}</>;
}
