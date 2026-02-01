import React from 'react';
import { Wifi, WifiOff, Battery, Gauge, Plus } from 'lucide-react';

const StatusBar = ({ systemStatus, onAddPanel }) => {
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

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

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
      `}</style>
    </div>
  );
};

export default StatusBar;
