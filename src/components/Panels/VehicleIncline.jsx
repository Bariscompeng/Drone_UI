import React, { useState, useEffect } from 'react';
import { useROSTopic } from '../../hooks/useROS';

const VehicleIncline = ({ ros, topic = '/imu/data' }) => {
  const { data } = useROSTopic(ros, topic, 'sensor_msgs/Imu');
  const [angles, setAngles] = useState({ pitch: 0, roll: 0 });

  useEffect(() => {
    if (data && data.orientation) {
      const { x, y, z, w } = data.orientation;
      
      // Quaternion to Euler angles conversion
      const sinr_cosp = 2 * (w * x + y * z);
      const cosr_cosp = 1 - 2 * (x * x + y * y);
      const roll = Math.atan2(sinr_cosp, cosr_cosp) * (180 / Math.PI);
      
      const sinp = 2 * (w * y - z * x);
      const pitch = Math.abs(sinp) >= 1 
        ? Math.sign(sinp) * 90
        : Math.asin(sinp) * (180 / Math.PI);
      
      setAngles({ pitch, roll });
    }
  }, [data]);

  return (
    <div className="vehicle-incline">
      <div className="incline-item">
        <span className="incline-label">PITCH ANGLE</span>
        <span className="incline-value">{angles.pitch >= 0 ? '+' : ''}{angles.pitch.toFixed(1)}°</span>
        <div className="vehicle-view front">
          <div className="vehicle-body" style={{ transform: `rotateX(${angles.pitch}deg)` }}>
            <div className="vehicle-top"></div>
            <div className="vehicle-front"></div>
          </div>
        </div>
      </div>
      
      <div className="incline-divider"></div>
      
      <div className="incline-item">
        <span className="incline-label">ROLL ANGLE</span>
        <span className="incline-value">{angles.roll >= 0 ? '+' : ''}{angles.roll.toFixed(1)}°</span>
        <div className="vehicle-view side">
          <div className="vehicle-body" style={{ transform: `rotateY(${angles.roll}deg)` }}>
            <div className="vehicle-top"></div>
            <div className="vehicle-side"></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .vehicle-incline {
          width: 100%;
          height: 100%;
          display: flex;
          gap: 20px;
          padding: 20px;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at center, rgba(0, 255, 65, 0.03) 0%, transparent 70%);
        }

        .incline-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .incline-divider {
          width: 2px;
          height: 80%;
          background: linear-gradient(to bottom, transparent, rgba(0, 255, 65, 0.2), transparent);
        }

        .incline-label {
          font-size: 10px;
          color: #00ff41;
          font-weight: 700;
          letter-spacing: 1.5px;
        }

        .incline-value {
          font-size: 32px;
          font-weight: 700;
          color: #00ff41;
          text-shadow: 0 0 20px rgba(0, 255, 65, 0.5);
          min-width: 120px;
          text-align: center;
        }

        .vehicle-view {
          width: 120px;
          height: 120px;
          perspective: 600px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .vehicle-body {
          width: 80px;
          height: 40px;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.3s ease;
        }

        .vehicle-top,
        .vehicle-front,
        .vehicle-side {
          position: absolute;
          background: linear-gradient(145deg, #00ff41, #00aa2b);
          box-shadow: 0 0 20px rgba(0, 255, 65, 0.4);
        }

        .vehicle-top {
          width: 80px;
          height: 40px;
          transform: translateZ(20px);
          border-radius: 8px;
          border: 2px solid #00ff41;
        }

        .vehicle-front {
          width: 80px;
          height: 40px;
          transform: rotateX(90deg) translateZ(20px);
          background: linear-gradient(145deg, #00cc35, #008822);
          border-radius: 0 0 8px 8px;
        }

        .vehicle-side {
          width: 40px;
          height: 40px;
          transform: rotateY(90deg) translateZ(40px);
          background: linear-gradient(145deg, #00cc35, #008822);
          border-radius: 0 8px 8px 0;
        }

        @media (max-width: 768px) {
          .vehicle-incline {
            flex-direction: column;
            padding: 10px;
          }

          .incline-divider {
            width: 80%;
            height: 2px;
            background: linear-gradient(to right, transparent, rgba(0, 255, 65, 0.2), transparent);
          }

          .incline-value {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default VehicleIncline;
