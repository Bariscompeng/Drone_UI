import React, { useState } from 'react';
import { Settings, X, Maximize2, Minimize2 } from 'lucide-react';

const Panel = ({ title, children, onClose, onSettings, style = {} }) => {
  const [isMaximized, setIsMaximized] = useState(false);

  return (
    <div 
      className={`panel ${isMaximized ? 'maximized' : ''}`}
      style={style}
    >
      <div className="panel-header">
        <h3 className="panel-title">{title}</h3>
        <div className="panel-actions">
          <button 
            className="panel-btn" 
            onClick={() => setIsMaximized(!isMaximized)}
            title={isMaximized ? "Restore" : "Maximize"}
          >
            {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          {onSettings && (
            <button className="panel-btn" onClick={onSettings} title="Settings">
              <Settings size={14} />
            </button>
          )}
          {onClose && (
            <button className="panel-btn panel-close" onClick={onClose} title="Close">
              <X size={14} />
            </button>
          )}
        </div>
      </div>
      <div className="panel-content">
        {children}
      </div>

      <style jsx>{`
        .panel {
          background: linear-gradient(145deg, #161b26 0%, #0f1419 100%);
          border: 1px solid rgba(0, 255, 65, 0.2);
          border-radius: 12px;
          height: 100%;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          transition: all 0.3s ease;
        }

        .panel:hover {
          border-color: rgba(0, 255, 65, 0.4);
          box-shadow: 0 8px 32px rgba(0, 255, 65, 0.1);
        }

        .panel.maximized {
          position: fixed;
          top: 80px;
          left: 240px;
          right: 20px;
          bottom: 20px;
          z-index: 1000;
        }

        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: rgba(0, 0, 0, 0.3);
          border-bottom: 1px solid rgba(0, 255, 65, 0.2);
          cursor: grab;
        }

        .panel-header:active {
          cursor: grabbing;
        }

        .panel-title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.5px;
          color: #00ff41;
          text-transform: uppercase;
        }

        .panel-actions {
          display: flex;
          gap: 6px;
        }

        .panel-btn {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          color: #8b92a0;
          cursor: pointer;
          transition: all 0.2s;
        }

        .panel-btn:hover {
          background: rgba(0, 255, 65, 0.1);
          border-color: #00ff41;
          color: #00ff41;
        }

        .panel-btn.panel-close:hover {
          background: rgba(255, 68, 68, 0.1);
          border-color: #ff4444;
          color: #ff4444;
        }

        .panel-content {
          flex: 1;
          overflow: hidden;
          position: relative;
        }
      `}</style>
    </div>
  );
};

export default Panel;
