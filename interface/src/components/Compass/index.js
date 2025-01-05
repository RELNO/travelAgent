import { useRef } from 'react';
import { useSelector } from 'store';

export default function Compass() {
  const compassRef = useRef();
  const targetAngle = useSelector((state) => state.info?.targetAngle);
  const compassSwitch = useSelector((state) => state.settings?.compassSwitch);
  const currentPointIndex = useSelector(
    (state) => state.settings?.currentPointIndex
  );
  const angle = targetAngle < -90 ? -90 : targetAngle > 90 ? 90 : targetAngle;
  // const directions = ['0', '45', '90', '135', '180', '-135', '-90', '-45'];
  const compassSize = 180;

  return (
    compassSwitch && (
      <div
        style={{
          width: compassSize,
          height: compassSize,
          position: 'absolute',
          left: '50%',
          top: '33.3%',
          transform: 'translate(-50%, -50%)',
          display: 'none',
          zIndex: 1000,
        }}
      >
        <svg
          id="compass"
          ref={compassRef}
          width={compassSize}
          height={compassSize / 2 + 2}
          viewBox="0 0 100 52"
        >
          {/* Outer circle */}
          <circle
            cx="50"
            cy="50"
            r="48"
            // fill="#212121"
            fill={
              angle >= -30 && angle <= 30
                ? '#00C853'
                : angle < -30
                ? '#304FFE'
                : '#b90000'
            }
            stroke="#2E2F3E"
            strokeWidth="4"
          />
          {/* Dot Circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#546E7A"
            strokeWidth="0.5"
            strokeDasharray="2 2"
          />

          {/* Direction markers */}
          {/* {directions.map((dir, index) => (
          <text
            key={dir}
            x={50 + 38 * Math.cos((index * Math.PI) / 4 - Math.PI / 2)}
            y={50 + 38 * Math.sin((index * Math.PI) / 4 - Math.PI / 2)}
            fill="#ffffff"
            textAnchor="middle"
            dominantBaseline="middle"
            style={{
              fontSize: '8px',
              fontFamily: 'Arial, sans-serif',
              fontWeight: dir === 'N' ? 'bold' : 'normal',
            }}
          >
            {dir}
          </text>
        ))} */}

          {/* Centered drop shape */}
          {currentPointIndex !== null ? (
            <>
              {/* Arrow Circle */}
              <circle cx="50" cy="52" r="10" fill="#212121" stroke="none" />
              <path
                d="M50,20 L60,50 L40,50 Z"
                fill="#212121"
                transform={`rotate(${angle || 0}, 50, 50)`}
              />

              {/* Center N text */}
              <text
                x="50"
                y="48"
                fill="#ffffff"
                textAnchor="middle"
                dominantBaseline="middle"
                //   transform={`rotate(${angle}, 50, 50)`}
                style={{
                  fontSize: '12px',
                  fontFamily: 'Arial, sans-serif',
                  fontWeight: 'bold',
                }}
              >
                {angle}°
              </text>
            </>
          ) : (
            <>
              <text
                x="50"
                y="45"
                fill="#ffffff"
                textAnchor="middle"
                dominantBaseline="middle"
                //   transform={`rotate(${angle}, 50, 50)`}
                style={{
                  fontSize: '12px',
                  fontFamily: 'Arial, sans-serif',
                  fontWeight: 'bold',
                }}
              >
                Finish!
              </text>
            </>
          )}
        </svg>
      </div>
    )
  );
}
