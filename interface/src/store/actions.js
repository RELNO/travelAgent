export const updateSettings = (payload) => (state) => ({
  ...state,
  settings: {
    ...state.settings,
    ...payload,
  },
});

export const updateScene = (payload) => (state) => ({
  ...state,
  scene: payload,
  logs: [],
});

export const updateMovement = (payload) => (state) => ({
  ...state,
  movement: payload,
});

export const updateInfo = (payload) => (state) => ({
  ...state,
  info: {
    ...state.info,
    ...payload,
  },
});

export const updateLogs = (payload) => (state) => ({
  ...state,
  logs: [payload, ...state.logs],
});

export const updateCanvas = (payload) => (state) => ({
  ...state,
  canvases: {
    ...state.canvases,
    ...payload,
  },
});

export const updateRendering = (payload) => (state) => ({
  ...state,
  rendering: payload,
});
