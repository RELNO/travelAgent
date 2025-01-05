import Canvas from './Canvas';
import Overlay from './Overlay';

export default function ThreeView(props) {
  return (
    <div {...props} id="threeview">
      <Overlay />
      <div className="flex w-full h-full" id="threecanvas">
        {/* <Canvas direction={2} /> */}
        <Canvas direction={1} />
        <Canvas direction={0} />
        <Canvas direction={-1} />
        {/* <Canvas direction={-2} /> */}
      </div>
    </div>
  );
}
