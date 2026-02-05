import React, { useState } from 'react';
import { Wifi, WifiOff, Battery, Gauge, Plus, Power } from 'lucide-react';

const StatusBar = ({ systemStatus, onAddPanel, onEmergencyStop }) => {
  const [isActivated, setIsActivated] = useState(false);

  const handleEmergencyClick = () => {
    const newState = !isActivated;
    setIsActivated(newState);
    if (onEmergencyStop) {
      onEmergencyStop(newState);
    }
  };

  return (
    <div className="status-bar">
      <div className="status-left">
        <div className="logo">⚡ DRONE CONTROL</div>
      </div>
      
      <div className="status-center">
        <div className={`status-item ${systemStatus.connected ? 'connected' : 'disconnected'}`}>
          {systemStatus.connected ? <Wifi size={16} /> : <WifiOff size={16} />}
          <span>CONN: {systemStatus.connected ? 'Connected' : 'No data'}</span>
        </div>
        
        <div className="status-item">
          <Battery size={16} />
          <span>BATTERY: {systemStatus.battery}%</span>
        </div>
        
        <div className="status-item">
          <Gauge size={16} />
          <span>SPEED: {systemStatus.speed} m/s</span>
        </div>
      </div>
      
      <div className="status-right">
        {/* Emergency Stop Button */}
        <button 
          className={`emergency-btn ${isActivated ? 'active' : ''}`}
          onClick={handleEmergencyClick}
          title={isActivated ? "Click to deactivate emergency stop" : "Emergency Stop"}
        >
          <Power size={18} />
          <span>E-STOP</span>
        </button>

        {/* Add Panel Button */}
        <button className="add-panel-btn" onClick={onAddPanel}>
          <Plus size={16} />
          Add Panel
        </button>
      </div>

      <style jsx>{`
        .status-bar {
          height: 60px;
          background: linear-gradient(180deg, #111827 0%, #0f1419 100%);
          border-bottom: 2px solid #00ff41;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          box-shadow: 0 4px 20px rgba(0, 255, 65, 0.1);
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
        }

        .logo {
          font-size: 18px;
          font-weight: 700;
          color: #00ff41;
          letter-spacing: 2px;
          text-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
        }

        .status-center {
          display: flex;
          gap: 32px;
        }

        .status-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 500;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.2s;
        }

        .status-item:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .status-item.connected {
          border-color: #00ff41;
          color: #00ff41;
        }

        .status-item.disconnected {
          border-color: #ff4444;
          color: #ff4444;
          animation: blink 2s ease-in-out infinite;
        }

        .status-right {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        /* Emergency Stop Button */
        .emergency-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: rgba(255, 68, 68, 0.15);
          color: #ff4444;
          border: 2px solid rgba(255, 68, 68, 0.4);
          border-radius: 6px;
          font-weight: 700;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .emergency-btn:hover {
          background: rgba(255, 68, 68, 0.25);
          border-color: #ff4444;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255, 68, 68, 0.4);
        }

        .emergency-btn:active {
          transform: translateY(0);
        }

        .emergency-btn.active {
          background: linear-gradient(145deg, #cc0000, #ff0000);
          color: #ffffff;
          border-color: #ff0000;
          animation: emergencyPulse 1s infinite, emergencyGlow 2s ease-in-out infinite;
          box-shadow: 0 0 20px rgba(255, 0, 0, 0.6), inset 0 -2px 10px rgba(0, 0, 0, 0.3);
        }

        /* Add Panel Button */
        .add-panel-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: #00ff41;
          color: #0a0e1a;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .add-panel-btn:hover {
          background: #00dd37;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 255, 65, 0.3);
        }

        .add-panel-btn:active {
          transform: translateY(0);
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes emergencyPulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(255, 0, 0, 0.6), inset 0 -2px 10px rgba(0, 0, 0, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(255, 0, 0, 0.9), inset 0 -2px 10px rgba(0, 0, 0, 0.3);
          }
        }

        @keyframes emergencyGlow {
          0%, 100% {
            filter: brightness(1);
          }
          50% {
            filter: brightness(1.2);
          }
        }

        @media (max-width: 1024px) {
          .status-bar {
            padding: 0 16px;
          }

          .status-center {
            gap: 16px;
          }

          .status-item {
            padding: 6px 12px;
            font-size: 11px;
          }

          .emergency-btn,
          .add-panel-btn {
            padding: 8px 12px;
            font-size: 11px;
          }
        }

        @media (max-width: 768px) {
          .status-item span {
            display: none;
          }

          .status-center {
            gap: 8px;
          }

          .emergency-btn span,
          .add-panel-btn span {
            display: none;
          }

          .emergency-btn,
          .add-panel-btn {
            padding: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default StatusBar;
