import { useRef } from 'react';
import { CapsuleCollider, RigidBody } from '@react-three/rapier';
import { KeyBoardController } from 'components/utils';

import Observe from './Observe';
import Plan from './Plan';
import Action from './Action';

const args = {
  CHARACTER_HEIGHT: 1.4,
  CHARACTER_RADIUS: 1,
  MOVE_DISTANCE: 0.5,
  STEP_HEIGHT: 0.5,
};

export default function BaseAgent(props) {
  const ref = useRef();

  return (
    <>
      <RigidBody
        ref={ref}
        colliders="trimesh"
        mass={1}
        type="dynamic"
        angularDamping={0.9}
        linearDamping={0.9}
        // position={position ? position : [1, 1, 1]}
        enabledRotations={[false, false, false]}
      >
        <CapsuleCollider
          args={[args.CHARACTER_RADIUS, args.CHARACTER_HEIGHT / 2]}
        />
        <Observe {...args} />
        <Plan {...args} />
        <Action body={ref} {...args} />
      </RigidBody>
      <KeyBoardController />
    </>
  );
}
