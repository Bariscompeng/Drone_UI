import React, { useState } from 'react';
import { X, Plus, Palette } from 'lucide-react';

const AddPanelModal = ({ onClose, onAdd }) => {
  const panelTypes = [
    { id: 'camera', name: 'RGB Camera', topic: '/camera/rgb/image_raw/compressed', icon: '📷' },
    { id: 'thermal', name: 'Thermal Camera', topic: '/camera/thermal/image_raw/compressed', icon: '🌡️' },
    { id: 'lidar', name: 'LiDAR 3D', topic: '/velodyne_points', icon: '📡' },
    { id: 'incline', name: 'Vehicle Incline', topic: '/imu/data', icon: '📐' },
    { id: 'horizon', name: 'Artificial Horizon', topic: '/imu/data', icon: '🛩️' },
    { id: 'gps', name: 'GPS Map', topic: '/gps/fix', icon: '🗺️' },
    { id: 'system', name: 'System Status', topic: '', icon: '💻' }
  ];

  const presetColors = [
    { name: 'Matrix Green', color: '#00ff41' },
    { name: 'Cyber Blue', color: '#00aaff' },
    { name: 'Purple', color: '#a855f7' },
    { name: 'Cyan', color: '#00ffff' },
    { name: 'Orange', color: '#ff9500' },
    { name: 'Red', color: '#ff3b30' },
    { name: 'Pink', color: '#ff2d55' },
    { name: 'Yellow', color: '#ffcc00' }
  ];

  const [selectedType, setSelectedType] = useState(panelTypes[0]);
  const [title, setTitle] = useState(panelTypes[0].name);
  const [topic, setTopic] = useState(panelTypes[0].topic);
  const [color, setColor] = useState('#00ff41');

  const handleTypeChange = (type) => {
    setSelectedType(type);
    setTitle(type.name);
    setTopic(type.topic);
  };

  const handleAdd = () => {
    onAdd({
      type: selectedType.id,
      title,
      topic,
      color
    });
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <Plus size={24} style={{ color: 'var(--primary-color)' }} />
            <h2 style={styles.title}>Add New Panel</h2>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={styles.body}>
          {/* Panel Type Selection */}
          <div style={styles.section}>
            <label style={styles.label}>PANEL TYPE</label>
            <div style={styles.typeGrid}>
              {panelTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => handleTypeChange(type)}
                  style={{
                    ...styles.typeCard,
                    borderColor: selectedType.id === type.id ? color : 'var(--border-secondary)',
                    background: selectedType.id === type.id ? `${color}15` : 'rgba(0, 0, 0, 0.2)'
                  }}
                >
                  <span style={{ fontSize: '32px', marginBottom: '8px' }}>{type.icon}</span>
                  <span style={{ 
                    fontSize: '12px', 
                    fontWeight: 600,
                    color: selectedType.id === type.id ? color : 'var(--text-secondary)'
                  }}>
                    {type.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Panel Title */}
          <div style={styles.section}>
            <label style={styles.label}>PANEL TITLE</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={styles.input}
              placeholder="Enter panel title..."
            />
          </div>

          {/* ROS Topic */}
          <div style={styles.section}>
            <label style={styles.label}>ROS TOPIC</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              style={styles.input}
              placeholder="/topic/name"
            />
          </div>

          {/* Panel Color */}
          <div style={styles.section}>
            <label style={styles.label}>
              <Palette size={14} />
              PANEL ACCENT COLOR
            </label>
            
            {/* Color Picker */}
            <div style={styles.colorPickerWrapper}>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={styles.colorInput}
              />
              <div style={{
                ...styles.colorPreview,
                background: color,
                boxShadow: `0 0 20px ${color}50`
              }} />
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={styles.colorTextInput}
                placeholder="#00ff41"
              />
            </div>

            {/* Preset Colors */}
            <div style={styles.presetColors}>
              {presetColors.map(preset => (
                <button
                  key={preset.color}
                  onClick={() => setColor(preset.color)}
                  style={{
                    ...styles.presetColorBtn,
                    background: preset.color,
                    border: color === preset.color ? `3px solid ${preset.color}` : '2px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: color === preset.color ? `0 0 15px ${preset.color}80` : 'none'
                  }}
                  title={preset.name}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div style={styles.previewSection}>
            <label style={styles.label}>PREVIEW</label>
            <div style={{
              ...styles.previewPanel,
              borderColor: color
            }}>
              <div style={{
                ...styles.previewHeader,
                background: `${color}20`,
                borderBottom: `1px solid ${color}`,
                color: color
              }}>
                <span style={{ fontSize: '20px', marginRight: '8px' }}>{selectedType.icon}</span>
                {title}
              </div>
              <div style={styles.previewBody}>
                <div style={{
                  fontSize: '48px',
                  opacity: 0.5
                }}>
                  {selectedType.icon}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.footer}>
          <button style={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button 
            style={{
              ...styles.addBtn,
              background: color,
              boxShadow: `0 4px 12px ${color}40`
            }} 
            onClick={handleAdd}
          >
            <Plus size={18} />
            Add Panel
          </button>
        </div>
      </div>
    </div>
  );
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
    zIndex: 1000,
    backdropFilter: 'blur(4px)'
  },
  modal: {
    background: 'var(--bg-secondary)',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '700px',
    maxHeight: '90vh',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
    border: '1px solid var(--border-primary)',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px',
    borderBottom: '1px solid var(--border-secondary)',
    background: 'var(--bg-tertiary)'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  title: {
    fontSize: '20px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    margin: 0
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '6px',
    transition: 'all 0.2s'
  },
  body: {
    padding: '24px',
    overflowY: 'auto',
    flex: 1
  },
  section: {
    marginBottom: '24px'
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '12px'
  },
  typeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px'
  },
  typeCard: {
    padding: '16px 12px',
    borderRadius: '12px',
    border: '2px solid',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    background: 'transparent'
  },
  input: {
    width: '100%',
    padding: '12px',
    background: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid var(--border-primary)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    fontSize: '14px',
    fontFamily: 'inherit'
  },
  colorPickerWrapper: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    marginBottom: '12px'
  },
  colorInput: {
    width: '60px',
    height: '50px',
    border: '2px solid var(--border-primary)',
    borderRadius: '8px',
    cursor: 'pointer',
    background: 'transparent'
  },
  colorPreview: {
    width: '50px',
    height: '50px',
    borderRadius: '8px',
    border: '2px solid var(--border-primary)',
    flexShrink: 0
  },
  colorTextInput: {
    flex: 1,
    padding: '12px',
    background: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid var(--border-primary)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    fontSize: '14px',
    fontFamily: 'monospace',
    textTransform: 'uppercase'
  },
  presetColors: {
    display: 'grid',
    gridTemplateColumns: 'repeat(8, 1fr)',
    gap: '8px'
  },
  presetColorBtn: {
    width: '100%',
    aspectRatio: '1',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    padding: 0
  },
  previewSection: {
    paddingTop: '24px',
    borderTop: '1px solid var(--border-secondary)'
  },
  previewPanel: {
    border: '2px solid',
    borderRadius: '12px',
    overflow: 'hidden',
    background: 'rgba(0, 0, 0, 0.3)'
  },
  previewHeader: {
    padding: '12px 16px',
    fontWeight: 600,
    fontSize: '13px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    display: 'flex',
    alignItems: 'center'
  },
  previewBody: {
    padding: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '120px'
  },
  footer: {
    display: 'flex',
    gap: '12px',
    padding: '24px',
    borderTop: '1px solid var(--border-secondary)',
    background: 'var(--bg-tertiary)'
  },
  cancelBtn: {
    flex: 1,
    padding: '12px',
    background: 'transparent',
    border: '1px solid var(--border-secondary)',
    borderRadius: '8px',
    color: 'var(--text-secondary)',
    fontWeight: 600,
    fontSize: '14px',
    cursor: 'pointer'
  },
  addBtn: {
    flex: 1,
    padding: '12px',
    border: 'none',
    borderRadius: '8px',
    color: '#000',
    fontWeight: 600,
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  }
};

export default AddPanelModal;
