import Logs from 'components/Logs';
import MiniMap from 'components/MiniMap';
import Panel from 'components/Panel';
import ThreeView from 'components/ThreeView';
import Render from 'components/Render';
import Compass from 'components/Compass';

function App() {
  return (
    <div className="bg-black text-white max-w-screen flex">
      <div className="w-1/4 h-screen pt-4 pb-4 space-y-1">
        <Panel />
      </div>
      <div className="w-3/4 h-screen pt-4 pb-4 space-y-1">
        <ThreeView className="h-1/3" />
        <Render className="h-1/3" />
        <Compass />
        <div className="flex w-full h-1/3 space-x-1">
          <Logs className="w-3/4 overflow-y-auto" />
          <MiniMap className="w-1/4 " />
        </div>
      </div>
    </div>
  );
}

export default App;
