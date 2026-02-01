import React, { useState, useEffect } from 'react';
import { Camera } from 'lucide-react';

const RGBCamera = ({ topic = '/camera/rgb/image_raw' }) => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsConnected(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="camera-view">
      {!isConnected ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Waiting for camera feed...</p>
          <span className="topic-name">Topic: {topic}</span>
        </div>
      ) : (
        <div className="camera-active">
          <div className="camera-grid"></div>
          <div className="camera-crosshair"></div>
          <Camera size={48} className="camera-icon" />
          <p>Camera Feed Active</p>
        </div>
      )}

      <style jsx>{`
        .camera-view {
          width: 100%;
          height: 100%;
          background: #000;
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

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .topic-name {
          font-size: 10px;
          color: #3a4150;
          font-family: monospace;
        }

        .camera-active {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          position: relative;
          width: 100%;
          height: 100%;
          justify-content: center;
        }

        .camera-grid {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: 
            repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(0, 255, 65, 0.1) 30px, rgba(0, 255, 65, 0.1) 31px),
            repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(0, 255, 65, 0.1) 30px, rgba(0, 255, 65, 0.1) 31px);
        }

        .camera-crosshair {
          position: absolute;
          width: 60px;
          height: 60px;
          border: 2px solid #00ff41;
          opacity: 0.5;
        }

        .camera-crosshair::before,
        .camera-crosshair::after {
          content: '';
          position: absolute;
          background: #00ff41;
        }

        .camera-crosshair::before {
          width: 100%;
          height: 2px;
          top: 50%;
          left: 0;
          transform: translateY(-50%);
        }

        .camera-crosshair::after {
          width: 2px;
          height: 100%;
          left: 50%;
          top: 0;
          transform: translateX(-50%);
        }

        .camera-icon {
          color: #00ff41;
          opacity: 0.5;
          z-index: 1;
        }

        p {
          color: #5a6270;
          z-index: 1;
        }
      `}</style>
    </div>
  );
};

export default RGBCamera;
