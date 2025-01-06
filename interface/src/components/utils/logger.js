import { updateLogs } from 'store/actions';
import { useSelector } from 'store';

const SERVEURL = process.env.REACT_APP_SDXL_URL;
const saveApi = '/api/save_logs';

export const useLogger = () => {
  const experimentId = useSelector((state) => state.settings.experimentId);
  const logs = useSelector((state) => state.logs);
  const miniMap = useSelector((state) => state.info?.miniMap);

  const parseLogs = () => {
    let parsedLogs = {};
    logs.forEach((log) => {
      if (log.step !== undefined) {
        if (log.type === 'observation') {
          const { seg, image, ...rest } = log;
          parsedLogs[log.step] = {
            ...parsedLogs[log.step],
            seg,
            image,
            miniMap,
            logs: {
              ...parsedLogs[log.step]?.logs,
              [log.type]: rest,
            },
          };
        } else {
          parsedLogs[log.step] = {
            ...parsedLogs[log.step],
            logs: {
              ...parsedLogs[log.step]?.logs,
              [log.type]: log,
            },
          };
        }
      }
    });
    return parsedLogs;
  };

  const saveLogs = async () => {
    const parsedLogs = parseLogs();
    fetch(SERVEURL + saveApi, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: experimentId,
        logs: parsedLogs,
      }),
    });
  };

  const logger = (dispatch) => {
    const memory = (message) => {
      const currentTime = new Date().toLocaleTimeString();
      const log = {
        type: 'memory',
        time: currentTime,
        message: message.message,
        step: message.step,
      };
      dispatch(updateLogs(log));
    };

    const task = (message) => {
      const currentTime = new Date().toLocaleTimeString();
      const log = {
        type: 'task',
        time: currentTime,
        message: message.message,
        step: message.step,
      };
      dispatch(updateLogs(log));
    };

    const observation = (message) => {
      const currentTime = new Date().toLocaleTimeString();
      const log = {
        type: 'observation',
        time: currentTime,
        message: message.message,
        step: message.step,
        image: message.image,
        seg: message.seg,
      };
      dispatch(updateLogs(log));
    };

    const thought = (message) => {
      const currentTime = new Date().toLocaleTimeString();
      const log = {
        type: 'thought',
        time: currentTime,
        message: message.message,
        step: message.step,
      };
      dispatch(updateLogs(log));
    };

    const plan = (message) => {
      const currentTime = new Date().toLocaleTimeString();
      const log = {
        type: 'plan',
        time: currentTime,
        message: message.message,
        step: message.step,
      };
      dispatch(updateLogs(log));
    };

    const position = (message) => {
      const currentTime = new Date().toLocaleTimeString();
      const log = {
        type: 'position',
        time: currentTime,
        message: message.message,
        step: message.step,
      };
      dispatch(updateLogs(log));
    };

    const action = (message) => {
      const currentTime = new Date().toLocaleTimeString();
      const log = {
        type: 'action',
        time: currentTime,
        message: message.message,
        step: message.step,
      };
      dispatch(updateLogs(log));
    };

    const info = (message) => {
      const currentTime = new Date().toLocaleTimeString();
      dispatch(updateLogs({ type: 'info', time: currentTime, message }));
    };

    const error = (message) => {
      const currentTime = new Date().toLocaleTimeString();
      dispatch(updateLogs({ type: 'error', time: currentTime, message }));
    };

    const warning = (message) => {
      const currentTime = new Date().toLocaleTimeString();
      const log = {
        type: 'warning',
        time: currentTime,
        message: message.message,
        step: message.step,
      };
      dispatch(updateLogs(log));
      // saveLogs(log);
    };
    return {
      memory,
      position,
      task,
      observation,
      thought,
      plan,
      action,
      info,
      error,
      warning,
    };
  };

  return { logger, saveLogs };
};
