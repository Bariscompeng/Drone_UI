import React, { useState } from 'react';
import { RotateCcw, Trash2, Wifi, WifiOff, Palette } from 'lucide-react';

const Settings = ({ ros, connected, error }) => {
  const [rosUrl, setRosUrl] = useState(localStorage.getItem('ros_url') || 'ws://192.168.1.117:9090');
  const [autoReconnect, setAutoReconnect] = useState(
    localStorage.getItem('ros_auto_reconnect') !== 'false'
  );
  const [panelColor, setPanelColor] = useState(
    localStorage.getItem('panel_color') || '#ff3333'
  );

  const presetColors = [
    { name: 'Red',    color: '#ff3333' },
    { name: 'Green',  color: '#00ff41' },
    { name: 'Blue',   color: '#00aaff' },
    { name: 'Purple', color: '#a855f7' },
    { name: 'Cyan',   color: '#00ffff' },
    { name: 'Orange', color: '#ff9500' },
    { name: 'Pink',   color: '#ff2d55' },
    { name: 'Yellow', color: '#ffcc00' },
  ];

  const handleResetLayout = () => {
    if (window.confirm('Reset all panels to default layout? This cannot be undone.')) {
      localStorage.removeItem('droneUI_panels');
      localStorage.removeItem('droneUI_mosaicLayout');
      window.location.reload();
    }
  };

  const handleClearCache = () => {
    if (window.confirm('Clear all application cache? This will reset everything.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleSaveRosSettings = () => {
    localStorage.setItem('ros_url', rosUrl);
    localStorage.setItem('ros_auto_reconnect', autoReconnect.toString());
    alert('ROS settings saved! Please reload the page for changes to take effect.');
  };

  const handleSavePanelColor = () => {
    localStorage.setItem('panel_color', panelColor);
    window.location.reload();
  };

  /* ─── Styles ─── */
  const s = {
    container: {
      width: '100%',
      height: '100%',
      padding: '40px',
      overflow: 'auto',
      background: 'transparent',
      boxSizing: 'border-box',
    },
    header: { marginBottom: '40px' },
    title: {
      fontSize: '32px',
      fontWeight: 700,
      color: '#00ff41',
      marginBottom: '8px',
      textShadow: '0 0 20px rgba(0, 255, 65, 0.3)',
    },
    subtitle: { fontSize: '14px', color: '#8b92a0' },

    /* Section card */
    section: {
      marginBottom: '28px',
      background: 'rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(0, 255, 65, 0.2)',
      borderRadius: '12px',
      padding: '24px',
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: 700,
      color: '#e0e0e0',
      marginBottom: '6px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    sectionDesc: {
      fontSize: '13px',
      color: '#8b92a0',
      marginBottom: '20px',
      lineHeight: '1.6',
    },

    /* Color swatches — tall rectangles like in screenshot */
    swatchGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(8, 1fr)',
      gap: '8px',
      marginBottom: '24px',
    },
    swatch: (color, selected) => ({
      height: '80px',
      borderRadius: '8px',
      background: color,
      border: selected ? `3px solid #fff` : '2px solid rgba(255,255,255,0.15)',
      boxShadow: selected ? `0 0 18px ${color}90` : 'none',
      cursor: 'pointer',
      transform: selected ? 'scale(1.05)' : 'scale(1)',
      transition: 'all 0.18s ease',
      outline: 'none',
    }),

    /* Preview block */
    previewLabel: {
      display: 'block',
      fontSize: '11px',
      fontWeight: 700,
      color: '#8b92a0',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      marginBottom: '10px',
    },
    previewPanel: (color) => ({
      border: `2px solid ${color}`,
      borderRadius: '10px',
      overflow: 'hidden',
      background: '#0a0a0a',
      marginBottom: '20px',
    }),
    previewHeader: (color) => ({
      padding: '12px 16px',
      fontWeight: 700,
      fontSize: '12px',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      color: color,
      textShadow: `0 0 10px ${color}60`,
      background: 'linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%)',
      borderBottom: `2px solid ${color}`,
    }),
    previewBody: {
      padding: '24px',
      textAlign: 'center',
      color: '#444',
      fontSize: '13px',
    },

    /* Buttons */
    buttonGroup: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
    btn: (color = '#00ff41') => ({
      padding: '11px 22px',
      background: `${color}18`,
      border: `1px solid ${color}55`,
      borderRadius: '8px',
      color: color,
      fontWeight: 600,
      fontSize: '13px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'background 0.18s, transform 0.12s',
    }),
    btnDanger: {
      padding: '11px 22px',
      background: 'rgba(255,68,68,0.1)',
      border: '1px solid rgba(255,68,68,0.35)',
      borderRadius: '8px',
      color: '#ff4444',
      fontWeight: 600,
      fontSize: '13px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },

    /* ROS form */
    formGroup: { marginBottom: '16px' },
    label: {
      display: 'block',
      fontSize: '11px',
      fontWeight: 700,
      color: '#8b92a0',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '8px',
    },
    input: {
      width: '100%',
      padding: '12px',
      background: 'rgba(0,0,0,0.3)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '6px',
      color: '#e0e0e0',
      fontSize: '14px',
      fontFamily: 'inherit',
      boxSizing: 'border-box',
    },
    checkboxRow: { display: 'flex', alignItems: 'center', gap: '12px' },
    checkbox: { width: '18px', height: '18px', cursor: 'pointer', accentColor: '#00ff41' },
    statusBadge: (ok) => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '5px 14px',
      background: ok ? 'rgba(0,255,65,0.1)' : 'rgba(255,68,68,0.1)',
      border: `1px solid ${ok ? 'rgba(0,255,65,0.3)' : 'rgba(255,68,68,0.3)'}`,
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 600,
      color: ok ? '#00ff41' : '#ff4444',
    }),
    infoBox: {
      background: 'rgba(0,255,65,0.04)',
      border: '1px solid rgba(0,255,65,0.18)',
      borderRadius: '8px',
      padding: '16px',
      marginTop: '20px',
      fontSize: '12px',
      color: '#8b92a0',
      lineHeight: '1.9',
    },
    infoTitle: { fontSize: '13px', fontWeight: 700, color: '#00ff41', marginBottom: '8px' },
    code: {
      background: 'rgba(0,0,0,0.5)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '4px',
      padding: '2px 6px',
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#00ff41',
    },
  };

  return (
    <div style={s.container}>
      <div style={s.header}>
        <h1 style={s.title}>Settings</h1>
        <p style={s.subtitle}>Configure your drone control interface</p>
      </div>

      {/* ── Panel Appearance ── */}
      <div style={s.section}>
        <div style={s.sectionTitle}>
          <Palette size={20} style={{ color: panelColor }} />
          <span>Panel Appearance</span>
        </div>
        <p style={s.sectionDesc}>Customize the color theme for all panels in the dashboard.</p>

        {/* Large color swatches */}
        <div style={s.swatchGrid}>
          {presetColors.map(p => (
            <button
              key={p.color}
              title={p.name}
              style={s.swatch(p.color, panelColor === p.color)}
              onClick={() => setPanelColor(p.color)}
            />
          ))}
        </div>

        {/* Preview */}
        <label style={s.previewLabel}>Preview</label>
        <div style={s.previewPanel(panelColor)}>
          <div style={s.previewHeader(panelColor)}>Sample Panel</div>
          <div style={s.previewBody}>Panel content preview</div>
        </div>

        <div style={s.buttonGroup}>
          <button
            style={s.btn(panelColor)}
            onClick={handleSavePanelColor}
            onMouseEnter={e => e.currentTarget.style.background = `${panelColor}30`}
            onMouseLeave={e => e.currentTarget.style.background = `${panelColor}18`}
          >
            <Palette size={15} />
            Apply Color to All Panels
          </button>
        </div>
      </div>

      {/* ── ROS Connection ── */}
      <div style={s.section}>
        <div style={s.sectionTitle}>
          {connected ? <Wifi size={20} /> : <WifiOff size={20} />}
          <span>ROS Connection</span>
          <div style={s.statusBadge(connected)}>
            {connected ? '● Connected' : '○ Disconnected'}
          </div>
        </div>
        <p style={s.sectionDesc}>Configure ROS bridge connection to your Jetson or ROS master.</p>

        <div style={s.formGroup}>
          <label style={s.label}>ROS Bridge URL</label>
          <input
            type="text"
            style={s.input}
            value={rosUrl}
            onChange={e => setRosUrl(e.target.value)}
            placeholder="ws://192.168.1.117:9090"
          />
        </div>

        <div style={{ ...s.formGroup }}>
          <div style={s.checkboxRow}>
            <input
              type="checkbox"
              style={s.checkbox}
              checked={autoReconnect}
              onChange={e => setAutoReconnect(e.target.checked)}
              id="auto-reconnect"
            />
            <label htmlFor="auto-reconnect" style={{ fontSize: '13px', color: '#e0e0e0', cursor: 'pointer' }}>
              Auto-reconnect on connection loss
            </label>
          </div>
        </div>

        <div style={s.buttonGroup}>
          <button
            style={s.btn('#00ff41')}
            onClick={handleSaveRosSettings}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,255,65,0.22)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,255,65,0.1)'}
          >
            Save Settings
          </button>
          <button
            style={s.btn('#00ff41')}
            onClick={() => window.location.reload()}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,255,65,0.22)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,255,65,0.1)'}
          >
            <RotateCcw size={15} />
            Reconnect
          </button>
        </div>

        {error && (
          <div style={{ ...s.infoBox, background: 'rgba(255,68,68,0.05)', border: '1px solid rgba(255,68,68,0.2)', marginTop: '16px' }}>
            <div style={{ ...s.infoTitle, color: '#ff4444' }}>Connection Error:</div>
            {error}
          </div>
        )}

        <div style={s.infoBox}>
          <div style={s.infoTitle}>Setup Instructions:</div>
          1. On your Jetson, install rosbridge: <code style={s.code}>sudo apt install ros-$ROS_DISTRO-rosbridge-suite</code><br />
          2. Launch rosbridge: <code style={s.code}>roslaunch rosbridge_server rosbridge_websocket.launch</code><br />
          3. Make sure port 9090 is accessible from this computer<br />
          4. Enter your Jetson's IP above and save
        </div>
      </div>

      {/* ── Danger Zone ── */}
      <div style={{ ...s.section, border: '1px solid rgba(255,68,68,0.2)' }}>
        <div style={s.sectionTitle}>
          <Trash2 size={20} style={{ color: '#ff4444' }} />
          <span>Danger Zone</span>
        </div>
        <p style={s.sectionDesc}>These actions are irreversible. Use with caution.</p>

        <div style={s.buttonGroup}>
          <button style={s.btnDanger} onClick={handleResetLayout}>
            <RotateCcw size={15} />
            Reset Layout
          </button>
          <button style={s.btnDanger} onClick={handleClearCache}>
            <Trash2 size={15} />
            Clear All Cache
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
