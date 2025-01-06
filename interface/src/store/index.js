import React, { createContext, useContext, useState } from 'react';

import { initSettings } from './settings';

const initScene = Object.keys(initSettings)[3];

const initState = {
  info: {},
  movement: null,
  scene: initScene,
  settings: initSettings[initScene],
  logs: [],
  rendering: false,
  canvases: null,
  miniMap: null,
};

const StateContext = createContext({
  state: {},
  setState: () => {},
});

export const Provider = ({ children }) => {
  const [state, setState] = useState(initState);

  return (
    <StateContext.Provider value={{ state, setState }}>
      {children}
    </StateContext.Provider>
  );
};

export const useSelector = (selector) => {
  const { state } = useContext(StateContext);
  return selector(state);
};

export const useDispatch = () => {
  const { setState } = useContext(StateContext);
  return (action) => {
    setState((prevState) => action(prevState));
  };
};
