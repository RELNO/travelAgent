import { useSelector } from 'store';

export default function Logs(props) {
  const logs = useSelector((state) => state.logs);
  const colorMap = {
    memory: 'text-green-500',
    task: 'text-yellow-500',
    observation: 'text-orange-500',
    thought: 'text-purple-500',
    plan: 'text-purple-500',
    action: 'text-blue-500',
    position: 'text-cyan-500',
    info: 'text-gray-500',
    error: 'text-red-500',
    warning: 'text-red-500',
  };
  return (
    <div className="h-full w-full overflow-y-auto" {...props}>
      {/* <h1 className="text-2xl">Logs</h1> */}
      <div className="pt-2 pl-10">
        {logs.map((log, index) => {
          if (log.type === 'observation') {
            return (
              <div key={index}>
                <br />
                <p className={`text-xs ${colorMap[log.type]}`}>{`[${
                  log.step !== undefined ? `step ${log.step}` : ''
                }-${log.type}-${log.time}}] ${log.message}`}</p>
                <div className="flex w-full space-x-1">
                  <img src={log.seg} alt="seg" className="w-1/2" />
                  <br />
                  <img src={log.image} alt="img" className="w-1/2" />
                </div>
              </div>
            );
          } else if (log.type === 'info') {
            return null;
          } else {
            return (
              <div key={index}>
                <br />
                <p className={`text-xs ${colorMap[log.type]}`}>{`[${
                  log.step !== undefined ? `step ${log.step}` : ''
                }-${log.type}-${log.time}] ${log.message}`}</p>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}
