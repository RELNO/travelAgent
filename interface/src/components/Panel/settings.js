import { useDispatch, useSelector } from 'store';
import {
  updateSettings,
  updateMovement,
  updateScene,
  updateCanvas,
} from 'store/actions';
import { initSettings } from 'store/settings';
import { useEffect, useState } from 'react';

export default function Settings(props) {
  const scene = useSelector((state) => state.scene);
  const settings = useSelector((state) => state.settings);
  const dispatch = useDispatch();
  const plan = useSelector((state) => state.settings?.plan);
  const [planSteps, setPlanSteps] = useState(0);

  const handleSettingChange = (event) => {
    const { name, type, value, checked } = event.target;
    const newValue = type === 'checkbox' ? checked : value;
    dispatch(updateSettings({ [name]: newValue }));
  };

  const handleSceneChange = (event) => {
    const scene = event.target.value;
    dispatch(updateScene(scene));
    dispatch(updateSettings(initSettings[scene]));
    dispatch(updateCanvas(null));
  };

  const handleMovementChange = (event) => {
    if (event.target.name === 'turnLeft' || event.target.name === 'turnRight') {
      dispatch(updateMovement({ [event.target.name]: (Math.PI / 180) * 15 }));
    } else {
      dispatch(updateMovement({ [event.target.name]: 1 }));
    }
  };

  const handlePlanChange = (event) => {
    setPlanSteps(event.target.value);
  };

  useEffect(() => {
    setPlanSteps(plan);
  }, [plan]);

  return (
    <div className="space-y-1" {...props}>
      {/* <h1 className="text-2xl">Config</h1> */}
      <div className="overflow-y-auto h-full">
        <p>Scenes</p>
        <select
          name="scene"
          className="text-black"
          value={scene}
          onChange={handleSceneChange}
        >
          {initSettings &&
            Object.keys(initSettings).map((scene) => (
              <option key={scene} value={scene}>
                {scene}
              </option>
            ))}
        </select>
        <div className="flex space-x-10">
          <div className="space-x-2">
            <input
              name="renderSwitch"
              type="checkbox"
              checked={settings.renderSwitch}
              onChange={handleSettingChange}
            />
            <label>RenderSwitch</label>
          </div>
          <div className="space-x-2">
            <input
              name="compassSwitch"
              type="checkbox"
              checked={settings.compassSwitch}
              onChange={handleSettingChange}
            />
            <label>CompassSwitch</label>
          </div>
        </div>
        <p>Prompt</p>
        <textarea
          name="prompt"
          row="2"
          className="text-black w-full h-15"
          type="text"
          placeholder="Enter Prompt"
          value={settings.prompt}
          onChange={handleSettingChange}
        />
        <p>Persona</p>
        <textarea
          name="persona"
          row="2"
          className="text-black w-full h-15"
          type="text"
          placeholder="Enter Prompt"
          value={settings.persona}
          onChange={handleSettingChange}
        />
        <p>Move</p>
        <div className="space-x-2 justify-between flex">
          <button
            className="bg-blue-500 px-2 py-1 rounded flex-1"
            name="forward"
            onClick={handleMovementChange}
          >
            Forward
          </button>
          <button
            className="bg-blue-500 px-2 py-1 rounded flex-1"
            name="turnLeft"
            onClick={handleMovementChange}
          >
            TurnLeft
          </button>
          <button
            className="bg-blue-500 px-2 py-1 rounded flex-1"
            name="turnRight"
            onClick={handleMovementChange}
          >
            TurnRight
          </button>
        </div>
        <p>Task</p>
        <input
          name="task"
          className="text-black w-full"
          type="text"
          placeholder="Enter Task"
          value={settings.task}
          onChange={handleSettingChange}
        />
        <p>Seed</p>
        <input
          name="seed"
          className="text-black w-full"
          type="number"
          value={settings.seed}
          onChange={handleSettingChange}
        />
        <div className="flex space-x-2 w-full">
          <div>
            <p>Experiment ID</p>
            <input
              className="text-black w-full"
              name="experimentId"
              type="text"
              value={settings.experimentId}
              onChange={handleSettingChange}
            />
          </div>
          <div>
            <p>Action Steps</p>
            <input
              className="text-black w-full"
              name="plan"
              type="number"
              value={planSteps}
              onChange={handlePlanChange}
            />
          </div>
        </div>
        <div className="pt-2 space-x-2 w-full flex">
          <button
            className="bg-blue-500 px-2 py-1 rounded flex-1"
            onClick={() => {
              setPlanSteps(planSteps || 20);
              dispatch(updateSettings({ plan: planSteps || 20 }));
            }}
          >
            Start
          </button>
          <button
            className="bg-blue-500 px-2 py-1 rounded flex-1"
            onClick={() => dispatch(updateSettings({ plan: 0 }))}
          >
            Stop
          </button>
        </div>
      </div>
      {settings.initImage && (
        <img
          className="w-full"
          src={settings.initImage}
          alt="initImage"
          id="initImage"
        />
      )}
    </div>
  );
}
