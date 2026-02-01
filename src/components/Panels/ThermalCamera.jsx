import React, { useState, useEffect } from 'react';
import { Camera } from 'lucide-react';

const ThermalCamera = ({ topic = '/camera/thermal/image_raw' }) => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsConnected(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="thermal-view">
      {!isConnected ? (
        <div className="loading-state">
          <div className="spinner thermal-spinner"></div>
          <p>Waiting for thermal feed...</p>
          <span className="topic-name">Topic: {topic}</span>
        </div>
      ) : (
        <div className="thermal-active">
          <div className="thermal-gradient"></div>
          <Camera size={48} className="thermal-icon" />
          <p>Thermal Feed Active</p>
        </div>
      )}

      <style jsx>{`
        .thermal-view {
          width: 100%;
          height: 100%;
          background: linear-gradient(145deg, #1a0000 0%, #000000 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          color: #5a6270;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(0, 255, 65, 0.1);
          border-top-color: #00ff41;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .thermal-spinner {
          border-color: rgba(255, 100, 0, 0.1);
          border-top-color: #ff6400;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .topic-name {
          font-size: 10px;
          color: #3a4150;
          font-family: monospace;
        }

        .thermal-active {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          position: relative;
          width: 100%;
          height: 100%;
          justify-content: center;
        }

        .thermal-gradient {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at 40% 40%, 
            rgba(255, 100, 0, 0.3) 0%, 
            rgba(255, 0, 0, 0.2) 30%, 
            rgba(100, 0, 0, 0.1) 60%, 
            transparent 80%);
          animation: thermal-pulse 3s ease-in-out infinite;
        }

        @keyframes thermal-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.9; }
        }

        .thermal-icon {
          color: #ff6400;
          opacity: 0.5;
          z-index: 1;
        }

        p {
          color: #ff6400;
          opacity: 0.7;
          z-index: 1;
        }
      `}</style>
    </div>
  );
};

export default ThermalCamera;
