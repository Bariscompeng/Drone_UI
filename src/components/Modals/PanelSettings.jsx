import React, { useState } from 'react';
import { X } from 'lucide-react';

const PanelSettings = ({ panel, onClose, onSave }) => {
  const [selectedTopic, setSelectedTopic] = useState(panel.topic || '');
  const [customTopic, setCustomTopic] = useState('');
  const [useCustomTopic, setUseCustomTopic] = useState(false);
  const [panelType, setPanelType] = useState(panel.type);
  const [panelTitle, setPanelTitle] = useState(panel.title);

  const topicsByType = {
    camera: [
      '/camera/rgb/image_raw',
      '/camera/color/image_raw',
      '/usb_cam/image_raw',
      '/front_camera/image_raw',
      '/camera/image_raw'
    ],
    thermal: [
      '/camera/thermal/image_raw',
      '/flir/image_raw',
      '/thermal/image_raw',
      '/thermal_camera/image_raw'
    ],
    lidar: [
      '/velodyne_points',
      '/lidar/points',
      '/ouster/points',
      '/scan',
      '/cloud_in'
    ],
    gps: [
      '/gps/fix',
      '/mavros/global_position/global',
      '/navsat/fix',
      '/fix'
    ],
    incline: [
      '/imu/data',
      '/imu/raw',
      '/mavros/imu/data',
      '/imu/data_raw'
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
    const finalTopic = useCustomTopic ? customTopic : selectedTopic;
    
    onSave({
      ...panel,
      type: panelType,
      title: panelTitle,
      topic: finalTopic
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
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '80vh',
      overflow: 'auto',
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
    checkboxContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px',
      background: 'rgba(0, 255, 65, 0.05)',
      border: '1px solid rgba(0, 255, 65, 0.2)',
      borderRadius: '8px',
      cursor: 'pointer'
    },
    checkbox: {
      width: '18px',
      height: '18px',
      cursor: 'pointer',
      accentColor: '#00ff41'
    },
    helpText: {
      fontSize: '11px',
      color: '#5a6270',
      fontStyle: 'italic',
      marginTop: '4px'
    },
    divider: {
      height: '1px',
      background: 'rgba(255, 255, 255, 0.1)',
      margin: '8px 0'
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
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    btnPrimary: {
      padding: '10px 24px',
      background: '#00ff41',
      color: '#0a0e1a',
      border: 'none',
      borderRadius: '6px',
      fontWeight: 600,
      fontSize: '13px',
      cursor: 'pointer',
      transition: 'all 0.2s'
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={styles.title}>Panel Settings</h3>
          <button 
            style={styles.closeBtn} 
            onClick={onClose}
            onMouseEnter={(e) => {
              e.target.style.color = '#ff4444';
              e.target.style.background = 'rgba(255, 68, 68, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#8b92a0';
              e.target.style.background = 'transparent';
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={styles.body}>
          {/* Panel Title */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Panel Title</label>
            <input
              type="text"
              style={styles.input}
              value={panelTitle}
              onChange={(e) => setPanelTitle(e.target.value)}
              placeholder="Enter panel title..."
              onFocus={(e) => {
                e.target.style.borderColor = '#00ff41';
                e.target.style.boxShadow = '0 0 0 3px rgba(0, 255, 65, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Panel Type */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Panel Type</label>
            <select 
              style={styles.select} 
              value={panelType} 
              onChange={(e) => {
                setPanelType(e.target.value);
                setSelectedTopic('');
                setUseCustomTopic(false);
              }}
            >
              {panelTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.divider} />

          {/* Custom Topic Toggle */}
          {topicsByType[panelType]?.length > 0 && (
            <div 
              style={styles.checkboxContainer}
              onClick={() => setUseCustomTopic(!useCustomTopic)}
            >
              <input
                type="checkbox"
                style={styles.checkbox}
                checked={useCustomTopic}
                onChange={(e) => setUseCustomTopic(e.target.checked)}
                onClick={(e) => e.stopPropagation()}
              />
              <label style={{ fontSize: '13px', color: '#e0e0e0', cursor: 'pointer', userSelect: 'none' }}>
                Use custom ROS topic name
              </label>
            </div>
          )}

          {/* ROS Topic - Dropdown */}
          {!useCustomTopic && topicsByType[panelType]?.length > 0 && (
            <div style={styles.formGroup}>
              <label style={styles.label}>ROS Topic (Preset)</label>
              <select 
                style={styles.select} 
                value={selectedTopic} 
                onChange={(e) => setSelectedTopic(e.target.value)}
              >
                <option value="">Select Topic...</option>
                {topicsByType[panelType].map(topic => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
              <span style={styles.helpText}>
                Choose from common topic names
              </span>
            </div>
          )}

          {/* ROS Topic - Custom Input */}
          {useCustomTopic && (
            <div style={styles.formGroup}>
              <label style={styles.label}>ROS Topic (Custom)</label>
              <input
                type="text"
                style={styles.input}
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="/usb_cam/image_raw"
                onFocus={(e) => {
                  e.target.style.borderColor = '#00ff41';
                  e.target.style.boxShadow = '0 0 0 3px rgba(0, 255, 65, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <span style={styles.helpText}>
                Enter your exact ROS topic name (e.g., /usb_cam/image_raw)
              </span>
            </div>
          )}

          {/* Current Topic Display */}
          {panel.topic && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Current Topic</label>
              <div style={{
                padding: '12px',
                background: 'rgba(0, 0, 0, 0.4)',
                borderRadius: '6px',
                color: '#00ff41',
                fontSize: '13px',
                fontFamily: 'monospace',
                border: '1px solid rgba(0, 255, 65, 0.2)'
              }}>
                {panel.topic}
              </div>
            </div>
          )}
        </div>

        <div style={styles.footer}>
          <button 
            style={styles.btnSecondary} 
            onClick={onClose}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.05)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Cancel
          </button>
          <button 
            style={styles.btnPrimary} 
            onClick={handleSave}
            onMouseEnter={(e) => {
              e.target.style.background = '#00dd37';
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 12px rgba(0, 255, 65, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#00ff41';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default PanelSettings;
