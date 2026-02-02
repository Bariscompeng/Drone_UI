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
    horizon: [
      '/imu/data',
      '/imu/raw',
      '/mavros/imu/data',
      '/flight/attitude'
    ],
    system: []
  };

  const panelTypes = [
    { value: 'camera', label: '📷 RGB Camera' },
    { value: 'thermal', label: '🔴 Thermal Camera' },
    { value: 'lidar', label: '📡 LiDAR 3D' },
    { value: 'gps', label: '📍 GPS Map' },
    { value: 'incline', label: '📐 Vehicle Incline' },
    { value: 'horizon', label: '🎯 Artificial Horizon' },
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

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      backdropFilter: 'blur(4px)'
    },
    modal: {
      background: '#161b26',
      border: '1px solid rgba(0, 255, 65, 0.3)',
      borderRadius: '12px',
      width: '500px',
      maxWidth: '90vw',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '20px 24px',
      borderBottom: '1px solid rgba(0, 255, 65, 0.2)'
    },
    title: {
      color: '#00ff41',
      fontSize: '16px',
      fontWeight: 700
    },
    closeBtn: {
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'transparent',
      border: 'none',
      color: '#8b92a0',
      cursor: 'pointer',
      borderRadius: '6px'
    },
    body: {
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    label: {
      fontSize: '12px',
      fontWeight: 600,
      color: '#8b92a0',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    input: {
      padding: '12px',
      background: 'rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '6px',
      color: '#e0e0e0',
      fontSize: '14px',
      fontFamily: 'inherit'
    },
    select: {
      padding: '12px',
      background: 'rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '6px',
      color: '#e0e0e0',
      fontSize: '14px',
      fontFamily: 'inherit',
      cursor: 'pointer'
    },
    helpText: {
      fontSize: '11px',
      color: '#5a6270',
      fontStyle: 'italic'
    },
    footer: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px',
      padding: '20px 24px',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)'
    },
    btnSecondary: {
      padding: '10px 24px',
      background: 'rgba(255, 255, 255, 0.05)',
      color: '#e0e0e0',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '6px',
      fontWeight: 600,
      fontSize: '13px',
      cursor: 'pointer'
    },
    btnPrimary: {
      padding: '10px 24px',
      background: '#00ff41',
      color: '#0a0e1a',
      border: 'none',
      borderRadius: '6px',
      fontWeight: 600,
      fontSize: '13px',
      cursor: 'pointer'
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={styles.title}>Panel Settings</h3>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={styles.body}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Panel Title</label>
            <input
              type="text"
              style={styles.input}
              value={panelTitle}
              onChange={(e) => setPanelTitle(e.target.value)}
              placeholder="Enter panel title..."
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Panel Type</label>
            <select style={styles.select} value={panelType} onChange={(e) => {
              setPanelType(e.target.value);
              setSelectedTopic('');
            }}>
              {panelTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {topicsByType[panelType]?.length > 0 && (
            <div style={styles.formGroup}>
              <label style={styles.label}>ROS Topic</label>
              <select style={styles.select} value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)}>
                <option value="">Select Topic...</option>
                {topicsByType[panelType].map(topic => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
              <span style={styles.helpText}>
                Choose the ROS topic for this panel to subscribe to
              </span>
            </div>
          )}
        </div>

        <div style={styles.footer}>
          <button style={styles.btnSecondary} onClick={onClose}>
            Cancel
          </button>
          <button style={styles.btnPrimary} onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default PanelSettings;
