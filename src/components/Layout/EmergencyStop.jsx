import React, { useState } from 'react';
import { Power } from 'lucide-react';

const EmergencyStop = ({ onEmergencyStop }) => {
  const [isActivated, setIsActivated] = useState(false);

  const handleClick = () => {
    setIsActivated(!isActivated);
    onEmergencyStop(!isActivated);
  };

  return (
    <button 
      className={`emergency-stop ${isActivated ? 'activated' : ''}`}
      onClick={handleClick}
    >
      <Power size={24} />
      <span>EMERGENCY STOP</span>
      {isActivated && <span className="activated-label">ACTIVATED</span>}

      <style jsx>{`
        .emergency-stop {
          position: fixed;
          bottom: 32px;
          right: 32px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 20px;
          background: linear-gradient(145deg, #ff4444, #cc0000);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 12px;
          cursor: pointer;
          box-shadow: 0 8px 32px rgba(255, 68, 68, 0.4);
          transition: all 0.2s;
          z-index: 1001;
          min-width: 140px;
        }

        .emergency-stop:hover {
          transform: scale(1.05);
          box-shadow: 0 12px 40px rgba(255, 68, 68, 0.6);
        }

        .emergency-stop:active {
          transform: scale(0.98);
        }

        .emergency-stop.activated {
          background: linear-gradient(145deg, #cc0000, #990000);
          animation: emergency-pulse 1s ease-in-out infinite;
        }

        @keyframes emergency-pulse {
          0%, 100% {
            box-shadow: 0 8px 32px rgba(255, 68, 68, 0.4);
          }
          50% {
            box-shadow: 0 8px 32px rgba(255, 68, 68, 0.8), 0 0 60px rgba(255, 68, 68, 0.6);
          }
        }

        .activated-label {
          font-size: 10px;
          padding: 4px 12px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 4px;
          animation: blink 0.5s ease-in-out infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @media (max-width: 768px) {
          .emergency-stop {
            bottom: 16px;
            right: 16px;
            padding: 16px;
            min-width: 120px;
          }
        }
      `}</style>
    </button>
  );
};

export default EmergencyStop;
