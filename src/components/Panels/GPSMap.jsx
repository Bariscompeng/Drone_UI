import React, { useState, useEffect } from 'react';
import { useROSTopic } from '../../hooks/useROS';

const GPSMap = ({ ros, topic = '/gps/fix' }) => {
  const { data } = useROSTopic(ros, topic, 'sensor_msgs/NavSatFix');
  const [coordinates, setCoordinates] = useState({ lat: 39.9334, lon: 32.8597 });

  useEffect(() => {
    if (data && data.latitude && data.longitude) {
      setCoordinates({ lat: data.latitude, lon: data.longitude });
    }
  }, [data]);

  return (
    <div className="gps-map">
      <div className="map-placeholder">
        <div className="map-grid"></div>
        <div className="map-marker">
          <div className="marker-dot"></div>
          <div className="marker-pulse"></div>
        </div>
        <div className="map-overlay">
          <button className="map-btn">MAP</button>
          <button className="map-btn active">SATELLITE</button>
        </div>
        <div className="map-info">
          <span>Lat: {coordinates.lat.toFixed(6)}</span>
          <span>Lon: {coordinates.lon.toFixed(6)}</span>
          <span className="topic-label">Topic: {topic}</span>
        </div>
      </div>

      <style jsx>{`
        .gps-map {
          width: 100%;
          height: 100%;
          position: relative;
        }

        .map-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(145deg, #1a2a1a 0%, #0f1a0f 100%);
          position: relative;
          overflow: hidden;
        }

        .map-grid {
          width: 100%;
          height: 100%;
          background-image: 
            repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(0, 255, 65, 0.05) 20px, rgba(0, 255, 65, 0.05) 21px),
            repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(0, 255, 65, 0.05) 20px, rgba(0, 255, 65, 0.05) 21px);
        }

        .map-marker {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .marker-dot {
          width: 16px;
          height: 16px;
          background: #00ff41;
          border-radius: 50%;
          border: 3px solid #0a0e1a;
          box-shadow: 0 0 20px rgba(0, 255, 65, 0.8);
          position: relative;
          z-index: 2;
        }

        .marker-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 40px;
          height: 40px;
          background: rgba(0, 255, 65, 0.3);
          border-radius: 50%;
          animation: pulse 2s ease-out infinite;
        }

        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }

        .map-overlay {
          position: absolute;
          top: 12px;
          right: 12px;
          display: flex;
          gap: 6px;
          z-index: 3;
        }

        .map-btn {
          padding: 6px 12px;
          font-size: 10px;
          font-weight: 600;
          background: rgba(0, 0, 0, 0.7);
          color: #8b92a0;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
          backdrop-filter: blur(4px);
        }

        .map-btn.active {
          background: rgba(0, 255, 65, 0.2);
          color: #00ff41;
          border-color: #00ff41;
        }

        .map-btn:hover {
          background: rgba(0, 255, 65, 0.1);
          color: #00ff41;
        }

        .map-info {
          position: absolute;
          bottom: 12px;
          left: 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 10px;
          font-family: monospace;
          color: #00ff41;
          background: rgba(0, 0, 0, 0.7);
          padding: 8px 12px;
          border-radius: 4px;
          border: 1px solid rgba(0, 255, 65, 0.3);
          z-index: 3;
          backdrop-filter: blur(4px);
        }

        .topic-label {
          color: #5a6270;
          font-size: 9px;
          margin-top: 4px;
        }
      `}</style>
    </div>
  );
};

export default GPSMap;
