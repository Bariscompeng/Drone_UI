import React, { useState, useEffect } from 'react';
import { Palette, Check } from 'lucide-react';

const ThemeManager = () => {
  const presets = [
    { id: 'dark', name: 'Matrix Green', color: '#00ff41', bg: '#0a0e1a' },
    { id: 'blue', name: 'Cyber Blue', color: '#00aaff', bg: '#0a0e1a' },
    { id: 'purple', name: 'Royal Purple', color: '#a855f7', bg: '#0a0e1a' },
    { id: 'cyan', name: 'Neon Cyan', color: '#00ffff', bg: '#0a0e1a' },
    { id: 'orange', name: 'Sunset Orange', color: '#ff9500', bg: '#0a0e1a' },
    { id: 'red', name: 'Emergency Red', color: '#ff3b30', bg: '#0a0e1a' },
    { id: 'light', name: 'Light Mode', color: '#00aa33', bg: '#f5f5f7' }
  ];

  const [currentTheme, setCurrentTheme] = useState(
    localStorage.getItem('drone_theme') || 'dark'
  );
  
  const [customColors, setCustomColors] = useState({
    primary: localStorage.getItem('drone_custom_primary') || '#00ff41',
    bgPrimary: localStorage.getItem('drone_custom_bg_primary') || '#0a0e1a',
    bgSecondary: localStorage.getItem('drone_custom_bg_secondary') || '#0f1419',
    borderWidth: localStorage.getItem('drone_border_width') || '2'
  });

  const [useCustom, setUseCustom] = useState(
    localStorage.getItem('drone_use_custom_theme') === 'true'
  );

  useEffect(() => {
    applyTheme();
  }, [currentTheme, customColors, useCustom]);

  const applyTheme = () => {
    const root = document.documentElement;
    
    if (useCustom) {
      // Apply custom colors
      root.removeAttribute('data-theme');
      root.style.setProperty('--primary-color', customColors.primary);
      
      // Calculate RGB values
      const hex = customColors.primary.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      root.style.setProperty('--primary-rgb', `${r}, ${g}, ${b}`);
      
      root.style.setProperty('--bg-primary', customColors.bgPrimary);
      root.style.setProperty('--bg-secondary', customColors.bgSecondary);
      root.style.setProperty('--panel-border-width', `${customColors.borderWidth}px`);
      
      // Save to localStorage
      localStorage.setItem('drone_custom_primary', customColors.primary);
      localStorage.setItem('drone_custom_bg_primary', customColors.bgPrimary);
      localStorage.setItem('drone_custom_bg_secondary', customColors.bgSecondary);
      localStorage.setItem('drone_border_width', customColors.borderWidth);
      localStorage.setItem('drone_use_custom_theme', 'true');
    } else {
      // Apply preset theme
      root.setAttribute('data-theme', currentTheme);
      root.style.removeProperty('--primary-color');
      root.style.removeProperty('--primary-rgb');
      root.style.removeProperty('--bg-primary');
      root.style.removeProperty('--bg-secondary');
      root.style.removeProperty('--panel-border-width');
      
      localStorage.setItem('drone_theme', currentTheme);
      localStorage.setItem('drone_use_custom_theme', 'false');
    }
  };

  const handlePresetChange = (presetId) => {
    setCurrentTheme(presetId);
    setUseCustom(false);
  };

  const handleCustomColorChange = (key, value) => {
    setCustomColors(prev => ({
      ...prev,
      [key]: value
    }));
    setUseCustom(true);
  };

  const resetToDefault = () => {
    setCurrentTheme('dark');
    setCustomColors({
      primary: '#00ff41',
      bgPrimary: '#0a0e1a',
      bgSecondary: '#0f1419',
      borderWidth: '2'
    });
    setUseCustom(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Palette size={24} style={{ color: 'var(--primary-color)' }} />
        <h2 style={styles.title}>Theme & Appearance</h2>
      </div>
      <p style={styles.subtitle}>Customize your drone control interface</p>

      {/* Preset Themes */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Preset Themes</h3>
        <div style={styles.presetGrid}>
          {presets.map(preset => (
            <button
              key={preset.id}
              onClick={() => handlePresetChange(preset.id)}
              style={{
                ...styles.presetCard,
                border: !useCustom && currentTheme === preset.id 
                  ? `2px solid ${preset.color}` 
                  : '2px solid rgba(255, 255, 255, 0.1)',
                background: preset.bg
              }}
            >
              {!useCustom && currentTheme === preset.id && (
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '24px',
                  height: '24px',
                  background: preset.color,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Check size={16} color="#000" />
                </div>
              )}
              <div 
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: preset.color,
                  marginBottom: '12px',
                  boxShadow: `0 0 20px ${preset.color}50`
                }}
              />
              <span style={{ color: preset.color, fontWeight: 600, fontSize: '13px' }}>
                {preset.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Colors */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Custom Colors</h3>
        
        <div style={styles.colorGrid}>
          <div style={styles.colorControl}>
            <label style={styles.label}>
              <span>Primary Accent Color</span>
              <span style={styles.colorValue}>{customColors.primary}</span>
            </label>
            <div style={styles.colorInputWrapper}>
              <input
                type="color"
                value={customColors.primary}
                onChange={(e) => handleCustomColorChange('primary', e.target.value)}
                style={styles.colorInput}
              />
              <div 
                style={{
                  ...styles.colorPreview,
                  background: customColors.primary,
                  boxShadow: `0 0 20px ${customColors.primary}50`
                }}
              />
            </div>
          </div>

          <div style={styles.colorControl}>
            <label style={styles.label}>
              <span>Background Primary</span>
              <span style={styles.colorValue}>{customColors.bgPrimary}</span>
            </label>
            <div style={styles.colorInputWrapper}>
              <input
                type="color"
                value={customColors.bgPrimary}
                onChange={(e) => handleCustomColorChange('bgPrimary', e.target.value)}
                style={styles.colorInput}
              />
              <div 
                style={{
                  ...styles.colorPreview,
                  background: customColors.bgPrimary
                }}
              />
            </div>
          </div>

          <div style={styles.colorControl}>
            <label style={styles.label}>
              <span>Background Secondary</span>
              <span style={styles.colorValue}>{customColors.bgSecondary}</span>
            </label>
            <div style={styles.colorInputWrapper}>
              <input
                type="color"
                value={customColors.bgSecondary}
                onChange={(e) => handleCustomColorChange('bgSecondary', e.target.value)}
                style={styles.colorInput}
              />
              <div 
                style={{
                  ...styles.colorPreview,
                  background: customColors.bgSecondary
                }}
              />
            </div>
          </div>

          <div style={styles.colorControl}>
            <label style={styles.label}>
              <span>Panel Border Width</span>
              <span style={styles.colorValue}>{customColors.borderWidth}px</span>
            </label>
            <input
              type="range"
              min="0"
              max="5"
              step="1"
              value={customColors.borderWidth}
              onChange={(e) => handleCustomColorChange('borderWidth', e.target.value)}
              style={styles.slider}
            />
          </div>
        </div>

        {useCustom && (
          <div style={styles.customBadge}>
            <Check size={14} />
            <span>Custom theme active</span>
          </div>
        )}
      </div>

      {/* Reset Button */}
      <button onClick={resetToDefault} style={styles.resetBtn}>
        Reset to Default (Matrix Green)
      </button>
    </div>
  );
};

const styles = {
  container: {
    padding: '24px',
    maxWidth: '1200px'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px'
  },
  title: {
    fontSize: '28px',
    fontWeight: 700,
    color: 'var(--primary-color)',
    margin: 0
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    marginBottom: '32px'
  },
  section: {
    marginBottom: '32px',
    padding: '24px',
    background: 'var(--bg-panel)',
    border: '1px solid var(--border-primary)',
    borderRadius: '12px'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: 'var(--text-primary)',
    marginBottom: '20px'
  },
  presetGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: '16px'
  },
  presetCard: {
    position: 'relative',
    padding: '20px',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    background: 'transparent'
  },
  colorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px'
  },
  colorControl: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  label: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  colorValue: {
    fontFamily: 'monospace',
    color: 'var(--primary-color)'
  },
  colorInputWrapper: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
  },
  colorInput: {
    width: '100%',
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
  slider: {
    width: '100%',
    height: '8px',
    accentColor: 'var(--primary-color)',
    cursor: 'pointer'
  },
  customBadge: {
    marginTop: '20px',
    padding: '12px 20px',
    background: 'rgba(var(--primary-rgb), 0.1)',
    border: '1px solid var(--primary-color)',
    borderRadius: '8px',
    color: 'var(--primary-color)',
    fontSize: '13px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: 'fit-content'
  },
  resetBtn: {
    padding: '12px 24px',
    background: 'rgba(255, 68, 68, 0.1)',
    border: '1px solid #ff4444',
    borderRadius: '8px',
    color: '#ff4444',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s'
  }
};

export default ThemeManager;
