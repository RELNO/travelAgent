import { useSelector } from 'store';

const collisionDistance = 1.5;

export default function InfoPanel() {
  const raycasterInfo = useSelector((state) => state.info?.raycasterInfo);
  const stepHeight = useSelector((state) => state.info?.stepHeight);
  const positionInfo = useSelector((state) => state.info?.positionInfo);
  const targetAngle = useSelector((state) => state.info?.targetAngle);
  return (
    <>
      <div className="absolute p-1 z-10 bg-black bg-opacity-50">
        {positionInfo &&
          Object.keys(positionInfo)?.map((key, index) => (
            <p
              key={index}
              className="text-xs text-gray-500"
            >{`${key}: ${positionInfo[key].toFixed(2)}`}</p>
          ))}
        {raycasterInfo &&
          Object.keys(raycasterInfo)?.map((key, index) => (
            <p
              key={index}
              className={`text-xs ${
                raycasterInfo[key]['distance'] < collisionDistance
                  ? 'text-red-500'
                  : 'text-gray-500'
              }`}
            >{`${key}: ${
              raycasterInfo[key]['distance']
                ? raycasterInfo[key]['distance'].toFixed(2)
                : '∞'
            }m`}</p>
          ))}
        <p className="text-xs text-gray-500">{`step: ${
          stepHeight ? stepHeight.toFixed(2) : 0
        }m`}</p>
        <p className="text-xs text-gray-500">{`targetAngle: ${
          targetAngle ? targetAngle : 0
        }`}</p>
      </div>
    </>
  );
}
