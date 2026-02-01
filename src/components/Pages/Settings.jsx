import React, { useState } from 'react';
import { HardDrive, Save, RotateCcw, Network, Database } from 'lucide-react';

const Settings = () => {
  const [sshConfig, setSshConfig] = useState({
    host: '192.168.1.100',
    port: '22',
    username: 'jetson',
    password: ''
  });

  const [rosConfig, setRosConfig] = useState({
    masterUri: 'http://192.168.1.100:11311',
    rosIp: '192.168.1.101'
  });

  const [isSSHConnected, setIsSSHConnected] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSSHConnect = () => {
    setIsSSHConnected(!isSSHConnected);
    // Bu kısımda gerçek SSH bağlantısı yapılacak
  };

  const handleSaveLayout = () => {
    setIsSaving(true);
    setTimeout(() => {
      alert('Layout saved successfully!');
      setIsSaving(false);
    }, 1000);
  };

  const handleResetLayout = () => {
    if (window.confirm('Are you sure you want to reset to default layout?')) {
      alert('Layout reset to default!');
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        
        {/* SSH Configuration */}
        <div className="settings-section">
          <h3 className="section-title">
            <HardDrive size={18} />
            SSH Connection to Jetson
          </h3>
          <p className="section-description">
            Connect to your Jetson device via SSH for direct system access.
          </p>
          
          <div className="settings-form">
            <div className="form-row">
              <div className="form-group">
                <label>Host / IP Address</label>
                <input
                  type="text"
                  value={sshConfig.host}
                  onChange={(e) => setSshConfig({...sshConfig, host: e.target.value})}
                  placeholder="192.168.1.100"
                />
              </div>
              
              <div className="form-group">
                <label>Port</label>
                <input
                  type="text"
                  value={sshConfig.port}
                  onChange={(e) => setSshConfig({...sshConfig, port: e.target.value})}
                  placeholder="22"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={sshConfig.username}
                  onChange={(e) => setSshConfig({...sshConfig, username: e.target.value})}
                  placeholder="jetson"
                />
              </div>
              
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={sshConfig.password}
                  onChange={(e) => setSshConfig({...sshConfig, password: e.target.value})}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              className={`connect-btn ${isSSHConnected ? 'connected' : ''}`}
              onClick={handleSSHConnect}
            >
              {isSSHConnected ? '✓ Connected - Click to Disconnect' : 'Connect SSH'}
            </button>
          </div>
        </div>

        {/* ROS Configuration */}
        <div className="settings-section">
          <h3 className="section-title">
            <Network size={18} />
            ROS Configuration
          </h3>
          <p className="section-description">
            Configure ROS Master and network settings for topic communication.
          </p>
          
          <div className="settings-form">
            <div className="form-group">
              <label>ROS Master URI</label>
              <input
                type="text"
                value={rosConfig.masterUri}
                onChange={(e) => setRosConfig({...rosConfig, masterUri: e.target.value})}
                placeholder="http://192.168.1.100:11311"
              />
              <span className="help-text">WebSocket URL: ws://192.168.1.100:9090</span>
            </div>
            
            <div className="form-group">
              <label>ROS IP</label>
              <input
                type="text"
                value={rosConfig.rosIp}
                onChange={(e) => setRosConfig({...rosConfig, rosIp: e.target.value})}
                placeholder="192.168.1.101"
              />
              <span className="help-text">Your computer's IP address</span>
            </div>

            <button className="save-btn">
              <Database size={16} />
              Save ROS Config
            </button>
          </div>
        </div>

        {/* Layout Presets */}
        <div className="settings-section">
          <h3 className="section-title">
            <Save size={18} />
            Layout Management
          </h3>
          <p className="section-description">
            Save your current panel layout or reset to default configuration.
          </p>
          
          <div className="preset-buttons">
            <button className="preset-btn" onClick={handleSaveLayout} disabled={isSaving}>
              <Save size={16} />
              {isSaving ? 'Saving...' : 'Save Current Layout'}
            </button>
            
            <button className="preset-btn danger" onClick={handleResetLayout}>
              <RotateCcw size={16} />
              Reset to Default
            </button>
          </div>
        </div>

        {/* System Info */}
        <div className="settings-section">
          <h3 className="section-title">
            System Information
          </h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Version</span>
              <span className="info-value">1.0.0</span>
            </div>
            <div className="info-item">
              <span className="info-label">Node.js</span>
              <span className="info-value">v18.x</span>
            </div>
            <div className="info-item">
              <span className="info-label">React</span>
              <span className="info-value">18.2.0</span>
            </div>
            <div className="info-item">
              <span className="info-label">ROS Version</span>
              <span className="info-value">Noetic / Humble</span>
            </div>
          </div>
        </div>

      </div>

      <style jsx>{`
        .settings-page {
          width: 100%;
          height: 100%;
          overflow-y: auto;
          padding: 20px;
        }

        .settings-container {
          max-width: 900px;
          margin: 0 auto;
        }

        .settings-section {
          background: linear-gradient(145deg, #161b26 0%, #0f1419 100%);
          border: 1px solid rgba(0, 255, 65, 0.2);
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 16px;
          color: #00ff41;
          margin-bottom: 8px;
        }

        .section-description {
          color: #8b92a0;
          font-size: 13px;
          margin-bottom: 24px;
          line-height: 1.5;
        }

        .settings-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
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

        .form-group input {
          padding: 12px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          color: #e0e0e0;
          font-size: 14px;
          font-family: 'JetBrains Mono', monospace;
          transition: all 0.2s;
        }

        .form-group input:focus {
          outline: none;
          border-color: #00ff41;
          box-shadow: 0 0 0 3px rgba(0, 255, 65, 0.1);
        }

        .help-text {
          font-size: 11px;
          color: #5a6270;
          font-style: italic;
        }

        .connect-btn {
          padding: 14px 24px;
          background: #00ff41;
          color: #0a0e1a;
          border: none;
          border-radius: 6px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 8px;
        }

        .connect-btn:hover {
          background: #00dd37;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 255, 65, 0.3);
        }

        .connect-btn.connected {
          background: #ff4444;
        }

        .connect-btn.connected:hover {
          background: #cc0000;
        }

        .save-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 24px;
          background: rgba(0, 255, 65, 0.1);
          color: #00ff41;
          border: 1px solid #00ff41;
          border-radius: 6px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 8px;
        }

        .save-btn:hover {
          background: rgba(0, 255, 65, 0.2);
          transform: translateY(-2px);
        }

        .preset-buttons {
          display: flex;
          gap: 12px;
        }

        .preset-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.05);
          color: #e0e0e0;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .preset-btn:hover {
          background: rgba(0, 255, 65, 0.1);
          border-color: #00ff41;
          color: #00ff41;
        }

        .preset-btn.danger:hover {
          background: rgba(255, 68, 68, 0.1);
          border-color: #ff4444;
          color: #ff4444;
        }

        .preset-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          padding: 12px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .info-label {
          color: #8b92a0;
          font-size: 12px;
        }

        .info-value {
          color: #00ff41;
          font-size: 12px;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }

          .preset-buttons {
            flex-direction: column;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Settings;
