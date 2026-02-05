import React, { useState, useEffect, useCallback } from 'react';
import { Gamepad2, MoveVertical } from 'lucide-react';
import ROSLIB from 'roslib';

const TeleopCompact = ({ ros, connected, isEmbedded }) => {
  const [cmdVelTopic, setCmdVelTopic] = useState(
    localStorage.getItem('teleop_cmd_vel_topic') || '/cmd_vel'
  );
  const [linearSpeed, setLinearSpeed] = useState(
    parseFloat(localStorage.getItem('teleop_linear_speed')) || 0.5
  );
  const [verticalSpeed, setVerticalSpeed] = useState(
    parseFloat(localStorage.getItem('teleop_vertical_speed')) || 0.5
  );
  const [angularSpeed, setAngularSpeed] = useState(
    parseFloat(localStorage.getItem('teleop_angular_speed')) || 0.5
  );
  const [teleopEnabled, setTeleopEnabled] = useState(false);
  const [activeDirections, setActiveDirections] = useState({
    forward: false,    // W - Linear X+
    backward: false,   // S - Linear X-
    left: false,       // A - Angular Z+
    right: false,      // D - Angular Z-
    up: false,         // R - Linear Z+ (havalanma)
    down: false,       // F - Linear Z- (alçalma)
    rotateLeft: false, // Q - Angular Z+
    rotateRight: false // E - Angular Z-
  });
  const [currentVelocity, setCurrentVelocity] = useState({ 
    linearX: 0, 
    linearZ: 0, 
    angular: 0 
  });
  const [cmdVelPublisher, setCmdVelPublisher] = useState(null);

  // Initialize cmd_vel publisher
  useEffect(() => {
    if (!ros || !connected) {
      setCmdVelPublisher(null);
      return;
    }

    const publisher = new ROSLIB.Topic({
      ros: ros,
      name: cmdVelTopic,
      messageType: 'geometry_msgs/Twist'
    });

    setCmdVelPublisher(publisher);
    console.log('📡 cmd_vel publisher created:', cmdVelTopic);

    return () => {
      const stopMsg = new ROSLIB.Message({
        linear: { x: 0, y: 0, z: 0 },
        angular: { x: 0, y: 0, z: 0 }
      });
      publisher.publish(stopMsg);
    };
  }, [ros, connected, cmdVelTopic]);

  // Toggle direction on/off
  const toggleDirection = (direction) => {
    if (!teleopEnabled) return;

    setActiveDirections(prev => {
      const newState = { ...prev };
      
      // Forward/Backward (Linear X)
      if (direction === 'forward' && !prev.forward) {
        newState.backward = false;
        newState.forward = true;
      } else if (direction === 'backward' && !prev.backward) {
        newState.forward = false;
        newState.backward = true;
      } else if (direction === 'forward' || direction === 'backward') {
        newState[direction] = !prev[direction];
      }
      // Up/Down (Linear Z)
      else if (direction === 'up' && !prev.up) {
        newState.down = false;
        newState.up = true;
      } else if (direction === 'down' && !prev.down) {
        newState.up = false;
        newState.down = true;
      } else if (direction === 'up' || direction === 'down') {
        newState[direction] = !prev[direction];
      }
      // Left/Right turn (Angular Z)
      else if (direction === 'left' && !prev.left) {
        newState.right = false;
        newState.left = true;
      } else if (direction === 'right' && !prev.right) {
        newState.left = false;
        newState.right = true;
      } else if (direction === 'left' || direction === 'right') {
        newState[direction] = !prev[direction];
      }
      // Rotate Q/E (also Angular Z)
      else if (direction === 'rotateLeft' && !prev.rotateLeft) {
        newState.rotateRight = false;
        newState.rotateLeft = true;
      } else if (direction === 'rotateRight' && !prev.rotateRight) {
        newState.rotateLeft = false;
        newState.rotateRight = true;
      } else {
        newState[direction] = !prev[direction];
      }
      
      return newState;
    });
  };

  // Keyboard controls
  const handleKeyDown = useCallback((e) => {
    if (!teleopEnabled) return;
    
    const key = e.key.toLowerCase();
    
    if (['w', 'a', 's', 'd', 'q', 'e', 'r', 'f', ' '].includes(key)) {
      e.preventDefault();
      
      if (key === ' ') {
        // Space = stop all
        setActiveDirections({
          forward: false,
          backward: false,
          left: false,
          right: false,
          up: false,
          down: false,
          rotateLeft: false,
          rotateRight: false
        });
      } else {
        // Map keys to directions
        const keyMap = {
          'w': 'forward',
          's': 'backward',
          'a': 'left',
          'd': 'right',
          'r': 'up',      // R = Rise (havalanma)
          'f': 'down',    // F = Fall (alçalma)
          'q': 'rotateLeft',
          'e': 'rotateRight'
        };
        
        const direction = keyMap[key];
        if (direction) {
          toggleDirection(direction);
        }
      }
    }
  }, [teleopEnabled]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Calculate and publish velocity based on active directions
  useEffect(() => {
    let linearX = 0;  // Forward/Backward
    let linearZ = 0;  // Up/Down
    let angular = 0;  // Yaw rotation

    // Linear X (ileri/geri)
    if (activeDirections.forward) linearX += linearSpeed;
    if (activeDirections.backward) linearX -= linearSpeed;
    
    // Linear Z (yukarı/aşağı)
    if (activeDirections.up) linearZ += verticalSpeed;
    if (activeDirections.down) linearZ -= verticalSpeed;
    
    // Angular Z (dönüş)
    if (activeDirections.left) angular += angularSpeed;
    if (activeDirections.right) angular -= angularSpeed;
    if (activeDirections.rotateLeft) angular += angularSpeed;
    if (activeDirections.rotateRight) angular -= angularSpeed;

    setCurrentVelocity({ linearX, linearZ, angular });

    // Publish to ROS
    if (cmdVelPublisher && teleopEnabled) {
      const twist = new ROSLIB.Message({
        linear: { x: linearX, y: 0, z: linearZ },  // X=ileri/geri, Z=yukarı/aşağı
        angular: { x: 0, y: 0, z: angular }        // Z=yaw
      });
      cmdVelPublisher.publish(twist);
    }
  }, [activeDirections, linearSpeed, verticalSpeed, angularSpeed, cmdVelPublisher, teleopEnabled]);

  const stopAll = () => {
    setActiveDirections({
      forward: false,
      backward: false,
      left: false,
      right: false,
      up: false,
      down: false,
      rotateLeft: false,
      rotateRight: false
    });
    setCurrentVelocity({ linearX: 0, linearZ: 0, angular: 0 });
    
    if (cmdVelPublisher) {
      const stopMsg = new ROSLIB.Message({
        linear: { x: 0, y: 0, z: 0 },
        angular: { x: 0, y: 0, z: 0 }
      });
      cmdVelPublisher.publish(stopMsg);
    }
  };

  const handleSaveSettings = () => {
    localStorage.setItem('teleop_cmd_vel_topic', cmdVelTopic);
    localStorage.setItem('teleop_linear_speed', linearSpeed.toString());
    localStorage.setItem('teleop_vertical_speed', verticalSpeed.toString());
    localStorage.setItem('teleop_angular_speed', angularSpeed.toString());
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <Gamepad2 size={16} style={{ color: '#00ff41' }} />
        <span style={styles.headerText}>3D Teleop Control</span>
      </div>

      {/* Connection Warning */}
      {!connected && (
        <div style={styles.warning}>
          ⚠️ ROS not connected
        </div>
      )}

      {/* Enable/Disable Toggle */}
      <button
        style={{
          ...styles.enableBtn,
          background: teleopEnabled ? 'rgba(255, 68, 68, 0.2)' : 'rgba(0, 255, 65, 0.2)',
          borderColor: teleopEnabled ? '#ff4444' : '#00ff41',
          color: teleopEnabled ? '#ff4444' : '#00ff41'
        }}
        onClick={() => {
          if (teleopEnabled) {
            stopAll();
          }
          setTeleopEnabled(!teleopEnabled);
        }}
      >
        {teleopEnabled ? 'DISABLE' : 'ENABLE'}
      </button>

      {/* Mode Info */}
      <div style={styles.modeInfo}>
        <span style={{ fontSize: '9px', color: '#00aaff' }}>
          🔄 Toggle Mode • Full 3D Control (X, Z, Yaw)
        </span>
      </div>

      {/* Speed Controls */}
      <div style={styles.section}>
        <label style={styles.label}>
          Forward/Back: {linearSpeed.toFixed(1)} m/s
        </label>
        <input
          type="range"
          min="0.1"
          max="2.0"
          step="0.1"
          value={linearSpeed}
          onChange={(e) => setLinearSpeed(parseFloat(e.target.value))}
          style={styles.slider}
        />
      </div>

      <div style={styles.section}>
        <label style={styles.label}>
          Up/Down: {verticalSpeed.toFixed(1)} m/s
        </label>
        <input
          type="range"
          min="0.1"
          max="2.0"
          step="0.1"
          value={verticalSpeed}
          onChange={(e) => setVerticalSpeed(parseFloat(e.target.value))}
          style={styles.slider}
        />
      </div>

      <div style={styles.section}>
        <label style={styles.label}>
          Yaw Rotation: {angularSpeed.toFixed(1)} rad/s
        </label>
        <input
          type="range"
          min="0.1"
          max="2.0"
          step="0.1"
          value={angularSpeed}
          onChange={(e) => setAngularSpeed(parseFloat(e.target.value))}
          style={styles.slider}
        />
      </div>

      {/* Vertical Controls (Up/Down) */}
      <div style={styles.verticalControls}>
        <label style={{...styles.label, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px'}}>
          <MoveVertical size={12} />
          Altitude Control
        </label>
        <div style={styles.verticalButtons}>
          <ControlButton
            active={activeDirections.up}
            disabled={!teleopEnabled}
            onClick={() => toggleDirection('up')}
            style={{ flex: 1 }}
          >
            ⬆ UP 
          </ControlButton>
          <ControlButton
            active={activeDirections.down}
            disabled={!teleopEnabled}
            onClick={() => toggleDirection('down')}
            style={{ flex: 1 }}
          >
            ⬇ DOWN 
          </ControlButton>
        </div>
      </div>

      {/* Horizontal Control Buttons */}
      <div style={styles.dpad}>
        <div />
        <ControlButton
          active={activeDirections.forward}
          disabled={!teleopEnabled}
          onClick={() => toggleDirection('forward')}
        >
          ↑
        </ControlButton>
        <div />

        <ControlButton
          active={activeDirections.left}
          disabled={!teleopEnabled}
          onClick={() => toggleDirection('left')}
        >
          ←
        </ControlButton>
        <ControlButton
          disabled={!teleopEnabled}
          onClick={stopAll}
          style={{ background: 'rgba(255, 68, 68, 0.2)', borderColor: '#ff4444', fontSize: '9px' }}
        >
          STOP
        </ControlButton>
        <ControlButton
          active={activeDirections.right}
          disabled={!teleopEnabled}
          onClick={() => toggleDirection('right')}
        >
          →
        </ControlButton>

        <div />
        <ControlButton
          active={activeDirections.backward}
          disabled={!teleopEnabled}
          onClick={() => toggleDirection('backward')}
        >
          ↓
        </ControlButton>
        <div />
      </div>

      {/* Rotation Buttons */}
      <div style={styles.rotationRow}>
        <ControlButton
          active={activeDirections.rotateLeft}
          disabled={!teleopEnabled}
          onClick={() => toggleDirection('rotateLeft')}
          style={{ flex: 1 }}
        >
          ↺ Q
        </ControlButton>
        <ControlButton
          active={activeDirections.rotateRight}
          disabled={!teleopEnabled}
          onClick={() => toggleDirection('rotateRight')}
          style={{ flex: 1 }}
        >
          E ↻
        </ControlButton>
      </div>

      {/* Active Directions Indicator */}
      <div style={styles.activeIndicators}>
        {activeDirections.forward && <span style={styles.activeChip}>↑ Forward</span>}
        {activeDirections.backward && <span style={styles.activeChip}>↓ Backward</span>}
        {activeDirections.up && <span style={{...styles.activeChip, borderColor: '#00aaff', color: '#00aaff'}}>⬆ Up</span>}
        {activeDirections.down && <span style={{...styles.activeChip, borderColor: '#00aaff', color: '#00aaff'}}>⬇ Down</span>}
        {activeDirections.left && <span style={styles.activeChip}>← Turn-L</span>}
        {activeDirections.right && <span style={styles.activeChip}>→ Turn-R</span>}
        {activeDirections.rotateLeft && <span style={styles.activeChip}>↺ Rot-L</span>}
        {activeDirections.rotateRight && <span style={styles.activeChip}>↻ Rot-R</span>}
      </div>

      {/* Velocity Display */}
      <div style={styles.velocityBox}>
        <div style={styles.velocityItem}>
          <div style={styles.velocityLabel}>LINEAR X</div>
          <div style={{
            ...styles.velocityValue,
            color: currentVelocity.linearX !== 0 ? '#00ff41' : '#444'
          }}>
            {currentVelocity.linearX >= 0 ? '+' : ''}{currentVelocity.linearX.toFixed(2)}
          </div>
        </div>
        <div style={styles.velocityItem}>
          <div style={styles.velocityLabel}>LINEAR Z</div>
          <div style={{
            ...styles.velocityValue,
            color: currentVelocity.linearZ !== 0 ? '#00aaff' : '#444'
          }}>
            {currentVelocity.linearZ >= 0 ? '+' : ''}{currentVelocity.linearZ.toFixed(2)}
          </div>
        </div>
        <div style={{...styles.velocityItem, gridColumn: '1 / -1'}}>
          <div style={styles.velocityLabel}>YAW (ANGULAR Z)</div>
          <div style={{
            ...styles.velocityValue,
            color: currentVelocity.angular !== 0 ? '#ffaa00' : '#444'
          }}>
            {currentVelocity.angular >= 0 ? '+' : ''}{currentVelocity.angular.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div style={styles.shortcuts}>
        <div style={styles.shortcutsTitle}>⌨️ Keyboard (Toggle Mode)</div>
        <div style={styles.shortcutsContent}>
          <span><kbd style={styles.kbd}>W/S</kbd> Forward/Back</span>
          <span><kbd style={styles.kbd}>A/D</kbd> Turn Left/Right</span>
          <span><kbd style={styles.kbd}>R/F</kbd> Rise/Fall (Up/Down)</span>
          <span><kbd style={styles.kbd}>Q/E</kbd> Rotate Left/Right</span>
          <span style={{ gridColumn: '1 / -1' }}>
            <kbd style={styles.kbd}>Space</kbd> Emergency Stop All
          </span>
        </div>
      </div>

      {/* Topic Config */}
      <div style={styles.section}>
        <label style={styles.label}>CMD_VEL TOPIC</label>
        <input
          type="text"
          value={cmdVelTopic}
          onChange={(e) => setCmdVelTopic(e.target.value)}
          style={styles.input}
        />
        <button style={styles.saveBtn} onClick={handleSaveSettings}>
          Save Config
        </button>
      </div>
    </div>
  );
};

// Control Button Component
const ControlButton = ({ children, active, disabled, onClick, style = {} }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      ...styles.controlBtn,
      background: active ? 'rgba(0, 255, 65, 0.3)' : 'rgba(30, 35, 50, 0.8)',
      border: `2px solid ${active ? '#00ff41' : 'rgba(0, 255, 65, 0.2)'}`,
      color: active ? '#00ff41' : '#666',
      boxShadow: active ? '0 0 15px rgba(0, 255, 65, 0.3)' : 'none',
      opacity: disabled ? 0.5 : 1,
      ...style
    }}
  >
    {children}
  </button>
);

// Styles
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '8px',
    color: '#e0e0e0',
    fontSize: '12px'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    paddingBottom: '8px',
    borderBottom: '1px solid rgba(0, 255, 65, 0.2)'
  },
  headerText: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#00ff41'
  },
  warning: {
    background: 'rgba(255, 170, 0, 0.1)',
    border: '1px solid rgba(255, 170, 0, 0.3)',
    borderRadius: '6px',
    padding: '8px',
    color: '#ffaa00',
    fontSize: '10px',
    textAlign: 'center'
  },
  modeInfo: {
    background: 'rgba(0, 170, 255, 0.1)',
    border: '1px solid rgba(0, 170, 255, 0.3)',
    borderRadius: '6px',
    padding: '6px',
    textAlign: 'center'
  },
  enableBtn: {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s',
    width: '100%'
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '10px',
    color: '#8b92a0',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  slider: {
    width: '100%',
    accentColor: '#00ff41'
  },
  input: {
    width: '100%',
    padding: '8px',
    background: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(0, 255, 65, 0.2)',
    borderRadius: '6px',
    color: '#e0e0e0',
    fontSize: '11px',
    fontFamily: 'inherit'
  },
  verticalControls: {
    background: 'rgba(0, 170, 255, 0.1)',
    border: '1px solid rgba(0, 170, 255, 0.2)',
    borderRadius: '8px',
    padding: '10px'
  },
  verticalButtons: {
    display: 'flex',
    gap: '6px'
  },
  dpad: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gridTemplateRows: 'repeat(3, 1fr)',
    gap: '6px',
    padding: '8px 0'
  },
  rotationRow: {
    display: 'flex',
    gap: '6px'
  },
  controlBtn: {
    height: '40px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  activeIndicators: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
    minHeight: '24px',
    padding: '4px',
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '6px',
    justifyContent: 'center',
    alignItems: 'center'
  },
  activeChip: {
    padding: '2px 8px',
    background: 'rgba(0, 255, 65, 0.2)',
    border: '1px solid rgba(0, 255, 65, 0.4)',
    borderRadius: '4px',
    fontSize: '9px',
    color: '#00ff41',
    fontWeight: 'bold'
  },
  velocityBox: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '6px',
    padding: '8px'
  },
  velocityItem: {
    textAlign: 'center'
  },
  velocityLabel: {
    color: '#666',
    fontSize: '8px',
    letterSpacing: '0.5px',
    marginBottom: '2px'
  },
  velocityValue: {
    fontSize: '16px',
    fontWeight: 'bold',
    fontFamily: "'JetBrains Mono', monospace"
  },
  shortcuts: {
    background: 'rgba(0, 170, 255, 0.1)',
    border: '1px solid rgba(0, 170, 255, 0.3)',
    borderRadius: '6px',
    padding: '8px'
  },
  shortcutsTitle: {
    color: '#00aaff',
    fontSize: '10px',
    marginBottom: '6px'
  },
  shortcutsContent: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '4px',
    fontSize: '9px',
    color: '#888'
  },
  kbd: {
    background: 'rgba(0, 0, 0, 0.4)',
    border: '1px solid #444',
    borderRadius: '3px',
    padding: '2px 4px',
    fontSize: '8px',
    color: '#00ff41',
    marginRight: '4px'
  },
  saveBtn: {
    padding: '8px',
    background: 'rgba(0, 255, 65, 0.1)',
    border: '1px solid rgba(0, 255, 65, 0.3)',
    borderRadius: '6px',
    color: '#00ff41',
    fontWeight: 600,
    fontSize: '11px',
    cursor: 'pointer',
    marginTop: '4px'
  }
};

export default TeleopCompact;
