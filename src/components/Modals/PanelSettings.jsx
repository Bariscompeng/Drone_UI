import React, { useState } from 'react';
import { X } from 'lucide-react';

const PanelSettings = ({ panel, onClose, onSave }) => {
  const [selectedTopic, setSelectedTopic] = useState(panel.topic || '');
  const [panelType, setPanelType] = useState(panel.type);
  const [panelTitle, setPanelTitle] = useState(panel.title);

  const topicsByType = {
    camera: [
      '/camera/rgb/image_raw',
      '/camera/rgb/image_raw/compressed',
      '/camera/depth/image_raw',
      '/front_camera/image_raw'
    ],
    thermal: [
      '/camera/thermal/image_raw',
      '/flir/image_raw',
      '/thermal/image_compressed'
    ],
    lidar: [
      '/velodyne_points',
      '/lidar/points',
      '/ouster/points',
      '/scan'
    ],
    gps: [
      '/gps/fix',
      '/gps/position',
      '/navsat/fix'
    ],
    incline: [
      '/imu/data',
      '/imu/raw',
      '/mavros/imu/data'
    ],
    system: []
  };

  const panelTypes = [
    { value: 'camera', label: '📷 RGB Camera' },
    { value: 'thermal', label: '🔴 Thermal Camera' },
    { value: 'lidar', label: '📡 LiDAR 3D' },
    { value: 'gps', label: '📍 GPS Map' },
    { value: 'incline', label: '📐 Vehicle Incline' },
    { value: 'system', label: '💻 System Status' }
  ];

  const handleSave = () => {
    onSave({
      ...panel,
      type: panelType,
      title: panelTitle,
      topic: selectedTopic
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Panel Settings</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Panel Title</label>
            <input
              type="text"
              value={panelTitle}
              onChange={(e) => setPanelTitle(e.target.value)}
              placeholder="Enter panel title..."
            />
          </div>

          <div className="form-group">
            <label>Panel Type</label>
            <select value={panelType} onChange={(e) => {
              setPanelType(e.target.value);
              setSelectedTopic(''); // Reset topic when type changes
            }}>
              {panelTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {topicsByType[panelType]?.length > 0 && (
            <div className="form-group">
              <label>ROS Topic</label>
              <select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)}>
                <option value="">Select Topic...</option>
                {topicsByType[panelType].map(topic => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
              <span className="help-text">
                Choose the ROS topic for this panel to subscribe to
              </span>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSave}>
            Save Changes
          </button>
        </div>

        <style jsx>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            backdrop-filter: blur(4px);
            animation: fadeIn 0.2s ease;
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          .modal-content {
            background: #161b26;
            border: 1px solid rgba(0, 255, 65, 0.3);
            border-radius: 12px;
            width: 500px;
            max-width: 90vw;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
            animation: slideUp 0.3s ease;
          }

          @keyframes slideUp {
            from {
              transform: translateY(20px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }

          .modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20px 24px;
            border-bottom: 1px solid rgba(0, 255, 65, 0.2);
          }

          .modal-header h3 {
            color: #00ff41;
            font-size: 16px;
            font-weight: 700;
          }

          .modal-close {
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: transparent;
            border: none;
            color: #8b92a0;
            cursor: pointer;
            transition: all 0.2s;
            border-radius: 6px;
          }

          .modal-close:hover {
            color: #ff4444;
            background: rgba(255, 68, 68, 0.1);
          }

          .modal-body {
            padding: 24px;
            display: flex;
            flex-direction: column;
            gap: 20px;
          }

          .form-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .form-group label {
            font-size: 12px;
            font-weight: 600;
            color: #8b92a0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .form-group input,
          .form-group select {
            padding: 12px;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 6px;
            color: #e0e0e0;
            font-size: 14px;
            font-family: 'JetBrains Mono', monospace;
            transition: all 0.2s;
          }

          .form-group input:focus,
          .form-group select:focus {
            outline: none;
            border-color: #00ff41;
            box-shadow: 0 0 0 3px rgba(0, 255, 65, 0.1);
          }

          .form-group select {
            cursor: pointer;
          }

          .help-text {
            font-size: 11px;
            color: #5a6270;
            font-style: italic;
          }

          .modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            padding: 20px 24px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
          }

          .btn-primary,
          .btn-secondary {
            padding: 10px 24px;
            border: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.2s;
          }

          .btn-primary {
            background: #00ff41;
            color: #0a0e1a;
          }

          .btn-primary:hover {
            background: #00dd37;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 255, 65, 0.3);
          }

          .btn-secondary {
            background: rgba(255, 255, 255, 0.05);
            color: #e0e0e0;
            border: 1px solid rgba(255, 255, 255, 0.1);
          }

          .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.1);
          }
        `}</style>
      </div>
    </div>
  );
};

export default PanelSettings;
