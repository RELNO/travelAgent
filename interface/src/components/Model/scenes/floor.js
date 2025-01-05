import { CuboidCollider, RigidBody } from '@react-three/rapier';

function Floor(props) {
  const FLOOR_SIZE = 10000;
  return (
    <RigidBody {...props}>
      <mesh position={[0, -0.1, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[FLOOR_SIZE, FLOOR_SIZE]} />
        {props.standardMaterial ? (
          <meshStandardMaterial color="gray" transparent={true} opacity={1} />
        ) : (
          <meshBasicMaterial color="gray" transparent={true} opacity={1} />
        )}
      </mesh>
      <CuboidCollider args={[FLOOR_SIZE, 0.1, FLOOR_SIZE]} />
    </RigidBody>
  );
}

export default Floor;
