import React, { useState, useEffect } from 'react';
import { Cpu, HardDrive, Activity } from 'lucide-react';

const SystemStatus = () => {
  const [stats, setStats] = useState({
    cpu: 45,
    memory: 62,
    disk: 78,
    temperature: 45
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats({
        cpu: 40 + Math.random() * 20,
        memory: 60 + Math.random() * 10,
        disk: 75 + Math.random() * 8,
        temperature: 40 + Math.random() * 15
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (value, thresholds = { warning: 70, danger: 85 }) => {
    if (value >= thresholds.danger) return '#ff4444';
    if (value >= thresholds.warning) return '#ffaa00';
    return '#00ff41';
  };

  return (
    <div className="system-status">
      <div className="status-grid">
        <div className="status-item">
          <div className="status-header">
            <Cpu size={16} />
            <span className="status-label">CPU USAGE</span>
          </div>
          <div className="status-value" style={{ color: getStatusColor(stats.cpu) }}>
            {stats.cpu.toFixed(1)}%
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ 
                width: `${stats.cpu}%`,
                background: getStatusColor(stats.cpu)
              }}
            ></div>
          </div>
        </div>

        <div className="status-item">
          <div className="status-header">
            <Activity size={16} />
            <span className="status-label">MEMORY</span>
          </div>
          <div className="status-value" style={{ color: getStatusColor(stats.memory) }}>
            {stats.memory.toFixed(1)}%
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ 
                width: `${stats.memory}%`,
                background: getStatusColor(stats.memory)
              }}
            ></div>
          </div>
        </div>

        <div className="status-item">
          <div className="status-header">
            <HardDrive size={16} />
            <span className="status-label">DISK USAGE</span>
          </div>
          <div className="status-value" style={{ color: getStatusColor(stats.disk) }}>
            {stats.disk.toFixed(1)}%
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ 
                width: `${stats.disk}%`,
                background: getStatusColor(stats.disk)
              }}
            ></div>
          </div>
        </div>

        <div className="status-item">
          <div className="status-header">
            <span className="temp-icon">🌡️</span>
            <span className="status-label">TEMPERATURE</span>
          </div>
          <div className="status-value" style={{ color: getStatusColor(stats.temperature, { warning: 60, danger: 75 }) }}>
            {stats.temperature.toFixed(1)}°C
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ 
                width: `${stats.temperature}%`,
                background: getStatusColor(stats.temperature, { warning: 60, danger: 75 })
              }}
            ></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .system-status {
          width: 100%;
          height: 100%;
          padding: 20px;
          overflow: auto;
        }

        .status-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          height: 100%;
        }

        .status-item {
          background: rgba(0, 0, 0, 0.2);
          padding: 16px;
          border-radius: 8px;
          border: 1px solid rgba(0, 255, 65, 0.1);
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: all 0.3s;
        }

        .status-item:hover {
          border-color: rgba(0, 255, 65, 0.3);
          background: rgba(0, 0, 0, 0.3);
        }

        .status-header {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #8b92a0;
        }

        .status-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .temp-icon {
          font-size: 16px;
        }

        .status-value {
          font-size: 28px;
          font-weight: 700;
          text-shadow: 0 0 10px currentColor;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
          overflow: hidden;
          position: relative;
        }

        .progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease, background 0.3s ease;
          box-shadow: 0 0 10px currentColor;
          position: relative;
          overflow: hidden;
        }

        .progress-fill::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @media (max-width: 768px) {
          .status-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default SystemStatus;
