import React, { useState } from 'react';
import { RotateCcw, Trash2, Wifi, WifiOff } from 'lucide-react';

const Settings = ({ ros, connected, error }) => {
  const [rosUrl, setRosUrl] = useState(localStorage.getItem('ros_url') || 'ws://192.168.1.117:9090');
  const [autoReconnect, setAutoReconnect] = useState(
    localStorage.getItem('ros_auto_reconnect') !== 'false'
  );

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

  const styles = {
    container: {
      width: '100%',
      height: '100%',
      padding: '40px',
      overflow: 'auto',
      background: 'transparent'
    },
    header: {
      marginBottom: '40px'
    },
    title: {
      fontSize: '32px',
      fontWeight: 700,
      color: '#00ff41',
      marginBottom: '8px',
      textShadow: '0 0 20px rgba(0, 255, 65, 0.3)'
    },
    subtitle: {
      fontSize: '14px',
      color: '#8b92a0'
    },
    section: {
      marginBottom: '32px',
      background: 'rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(0, 255, 65, 0.2)',
      borderRadius: '12px',
      padding: '24px'
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: 700,
      color: '#e0e0e0',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    sectionDesc: {
      fontSize: '13px',
      color: '#8b92a0',
      marginBottom: '20px',
      lineHeight: '1.6'
    },
    formGroup: {
      marginBottom: '16px'
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
    checkboxContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    checkbox: {
      width: '20px',
      height: '20px',
      cursor: 'pointer'
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap'
    },
    button: {
      padding: '12px 24px',
      background: 'rgba(0, 255, 65, 0.1)',
      border: '1px solid rgba(0, 255, 65, 0.3)',
      borderRadius: '8px',
      color: '#00ff41',
      fontWeight: 600,
      fontSize: '14px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s'
    },
    buttonDanger: {
      padding: '12px 24px',
      background: 'rgba(255, 68, 68, 0.1)',
      border: '1px solid rgba(255, 68, 68, 0.3)',
      borderRadius: '8px',
      color: '#ff4444',
      fontWeight: 600,
      fontSize: '14px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s'
    },
    statusBadge: (isConnected) => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      background: isConnected ? 'rgba(0, 255, 65, 0.1)' : 'rgba(255, 68, 68, 0.1)',
      border: `1px solid ${isConnected ? 'rgba(0, 255, 65, 0.3)' : 'rgba(255, 68, 68, 0.3)'}`,
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 600,
      color: isConnected ? '#00ff41' : '#ff4444'
    }),
    info: {
      background: 'rgba(0, 255, 65, 0.05)',
      border: '1px solid rgba(0, 255, 65, 0.2)',
      borderRadius: '8px',
      padding: '16px',
      marginTop: '20px'
    },
    infoTitle: {
      fontSize: '13px',
      fontWeight: 700,
      color: '#00ff41',
      marginBottom: '8px'
    },
    infoText: {
      fontSize: '12px',
      color: '#8b92a0',
      lineHeight: '1.6'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Settings</h1>
        <p style={styles.subtitle}>Configure your drone control interface</p>
      </div>

      {/* ROS Connection Settings */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          {connected ? <Wifi size={20} /> : <WifiOff size={20} />}
          <span>ROS Connection</span>
          <div style={styles.statusBadge(connected)}>
            {connected ? '● Connected' : '○ Disconnected'}
          </div>
        </div>
        <p style={styles.sectionDesc}>
          Configure ROS bridge connection to your Jetson or ROS master.
        </p>

        <div style={styles.formGroup}>
          <label style={styles.label}>ROS Bridge URL</label>
          <input
            type="text"
            style={styles.input}
            value={rosUrl}
            onChange={(e) => setRosUrl(e.target.value)}
            placeholder="ws://192.168.1.117:9090"
          />
        </div>

        <div style={styles.formGroup}>
          <div style={styles.checkboxContainer}>
            <input
              type="checkbox"
              style={styles.checkbox}
              checked={autoReconnect}
              onChange={(e) => setAutoReconnect(e.target.checked)}
            />
            <label style={{ fontSize: '13px', color: '#e0e0e0' }}>
              Auto-reconnect on connection loss
            </label>
          </div>
        </div>

        <div style={styles.buttonGroup}>
          <button 
            style={styles.button}
            onClick={handleSaveRosSettings}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(0, 255, 65, 0.2)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(0, 255, 65, 0.1)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Save Settings
          </button>
          <button 
            style={styles.button}
            onClick={() => window.location.reload()}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(0, 255, 65, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(0, 255, 65, 0.1)';
            }}
          >
            <RotateCcw size={16} />
            Reconnect
          </button>
        </div>

        {error && (
          <div style={{ ...styles.info, background: 'rgba(255, 68, 68, 0.05)', border: '1px solid rgba(255, 68, 68, 0.2)', marginTop: '16px' }}>
            <div style={{ ...styles.infoTitle, color: '#ff4444' }}>Connection Error:</div>
            <div style={styles.infoText}>{error}</div>
          </div>
        )}

        <div style={styles.info}>
          <div style={styles.infoTitle}>Setup Instructions:</div>
          <div style={styles.infoText}>
            1. On your Jetson, install rosbridge: <code>sudo apt install ros-$ROS_DISTRO-rosbridge-suite</code><br/>
            2. Launch rosbridge: <code>roslaunch rosbridge_server rosbridge_websocket.launch</code><br/>
            3. Make sure port 9090 is accessible from this computer<br/>
            4. Enter your Jetson's IP above and save
          </div>
        </div>
      </div>

      {/* Layout Reset */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          <RotateCcw size={20} />
          <span>Reset Layout</span>
        </div>
        <p style={styles.sectionDesc}>
          Reset all panels to their default positions and configurations.
        </p>
        <div style={styles.buttonGroup}>
          <button 
            style={styles.button}
            onClick={handleResetLayout}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(0, 255, 65, 0.2)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(0, 255, 65, 0.1)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <RotateCcw size={16} />
            Reset to Default Layout
          </button>
        </div>
      </div>

      {/* Clear Cache */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          <Trash2 size={20} />
          <span>Clear Application Cache</span>
        </div>
        <p style={styles.sectionDesc}>
          Clear all locally stored data including panels, layouts, and preferences.
        </p>
        <div style={styles.buttonGroup}>
          <button 
            style={styles.buttonDanger}
            onClick={handleClearCache}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 68, 68, 0.2)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 68, 68, 0.1)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <Trash2 size={16} />
            Clear All Cache
          </button>
        </div>
      </div>

      {/* App Info */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          <span>ℹ️</span>
          <span>Application Info</span>
        </div>
        <div style={styles.infoText}>
          <strong style={{ color: '#e0e0e0' }}>Version:</strong> 1.0.0<br/>
          <strong style={{ color: '#e0e0e0' }}>ROS Bridge:</strong> {rosUrl}<br/>
          <strong style={{ color: '#e0e0e0' }}>Connection:</strong> {connected ? '✅ Active' : '❌ Inactive'}<br/>
          <strong style={{ color: '#e0e0e0' }}>Panel Types:</strong> 7<br/>
          <strong style={{ color: '#e0e0e0' }}>Max Panels:</strong> 10
        </div>
      </div>
    </div>
  );
};

export default Settings;
