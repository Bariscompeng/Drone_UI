import React, { useState } from 'react';
import { X, Camera, Flame, Radio, MapPin, Compass, Activity } from 'lucide-react';

const AddPanelModal = ({ onClose, onAdd }) => {
  const [selectedType, setSelectedType] = useState(null);
  const [panelTitle, setPanelTitle] = useState('');

  const panelTypes = [
    { 
      value: 'camera', 
      label: 'RGB Camera', 
      icon: Camera,
      description: 'Standard camera feed',
      defaultTopic: '/camera/rgb/image_raw'
    },
    { 
      value: 'thermal', 
      label: 'Thermal Camera', 
      icon: Flame,
      description: 'Thermal imaging feed',
      defaultTopic: '/camera/thermal/image_raw'
    },
    { 
      value: 'lidar', 
      label: 'LiDAR 3D', 
      icon: Radio,
      description: '3D point cloud visualization',
      defaultTopic: '/velodyne_points'
    },
    { 
      value: 'gps', 
      label: 'GPS Map', 
      icon: MapPin,
      description: 'Real-time GPS tracking',
      defaultTopic: '/gps/fix'
    },
    { 
      value: 'incline', 
      label: 'Vehicle Incline', 
      icon: Compass,
      description: 'Pitch and Roll angles',
      defaultTopic: '/imu/data'
    },
    { 
      value: 'system', 
      label: 'System Status', 
      icon: Activity,
      description: 'CPU, Memory, Disk usage',
      defaultTopic: ''
    }
  ];

  const handleAdd = () => {
    if (!selectedType) {
      alert('Please select a panel type!');
      return;
    }

    const panelType = panelTypes.find(p => p.value === selectedType);
    const title = panelTitle || panelType.label.toUpperCase();

    onAdd({
      type: selectedType,
      title: title,
      topic: panelType.defaultTopic
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
      backdropFilter: 'blur(4px)',
      animation: 'fadeIn 0.2s ease'
    },
    modal: {
      background: '#161b26',
      border: '1px solid rgba(0, 255, 65, 0.3)',
      borderRadius: '12px',
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '80vh',
      overflow: 'auto',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
      animation: 'slideUp 0.3s ease'
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
      fontSize: '18px',
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
      transition: 'all 0.2s',
      borderRadius: '6px'
    },
    body: {
      padding: '24px'
    },
    inputGroup: {
      marginBottom: '24px'
    },
    label: {
      display: 'block',
      fontSize: '12px',
      fontWeight: 600,
      color: '#8b92a0',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '8px'
    },
    input: {
      width: '100%',
      padding: '12px',
      background: 'rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '6px',
      color: '#e0e0e0',
      fontSize: '14px',
      fontFamily: 'inherit'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '12px'
    },
    card: {
      padding: '16px',
      background: 'rgba(0, 0, 0, 0.2)',
      border: '2px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    cardSelected: {
      padding: '16px',
      background: 'rgba(0, 255, 65, 0.1)',
      border: '2px solid #00ff41',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      boxShadow: '0 0 20px rgba(0, 255, 65, 0.2)'
    },
    cardIcon: {
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0, 255, 65, 0.1)',
      borderRadius: '8px',
      marginBottom: '12px'
    },
    cardTitle: {
      fontSize: '14px',
      fontWeight: 700,
      color: '#e0e0e0',
      marginBottom: '4px'
    },
    cardDesc: {
      fontSize: '11px',
      color: '#8b92a0'
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
          <h3 style={styles.title}>Add New Panel</h3>
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
          <div style={styles.inputGroup}>
            <label style={styles.label}>Panel Name (Optional)</label>
            <input
              type="text"
              style={styles.input}
              value={panelTitle}
              onChange={(e) => setPanelTitle(e.target.value)}
              placeholder="Enter custom panel name..."
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

          <div style={styles.inputGroup}>
            <label style={styles.label}>Select Panel Type</label>
            <div style={styles.grid}>
              {panelTypes.map(panel => {
                const Icon = panel.icon;
                const isSelected = selectedType === panel.value;
                return (
                  <div
                    key={panel.value}
                    style={isSelected ? styles.cardSelected : styles.card}
                    onClick={() => setSelectedType(panel.value)}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = 'rgba(0, 255, 65, 0.3)';
                        e.currentTarget.style.background = 'rgba(0, 255, 65, 0.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.2)';
                      }
                    }}
                  >
                    <div style={styles.cardIcon}>
                      <Icon size={20} color="#00ff41" />
                    </div>
                    <div style={styles.cardTitle}>{panel.label}</div>
                    <div style={styles.cardDesc}>{panel.description}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div style={styles.footer}>
          <button 
            style={styles.btnSecondary} 
            onClick={onClose}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.05)'}
          >
            Cancel
          </button>
          <button 
            style={styles.btnPrimary} 
            onClick={handleAdd}
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
            Add Panel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPanelModal;
