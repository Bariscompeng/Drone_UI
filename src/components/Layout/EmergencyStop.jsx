import React, { useState } from 'react';
import { Power } from 'lucide-react';

const EmergencyStop = ({ onEmergencyStop }) => {
  const [isActivated, setIsActivated] = useState(false);

  const handleClick = () => {
    const newState = !isActivated;
    setIsActivated(newState);
    if (onEmergencyStop) {
      onEmergencyStop(newState);
    }
  };

  const styles = {
    container: {
      position: 'fixed',
      left: '20px',
      bottom: '20px',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px'
    },
    button: {
      width: '120px',
      height: '120px',
      borderRadius: '50%',
      border: 'none',
      background: isActivated 
        ? 'linear-gradient(145deg, #cc0000, #ff0000)'
        : 'linear-gradient(145deg, #ff3333, #ff4444)',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      transition: 'all 0.3s ease',
      boxShadow: isActivated
        ? '0 0 40px rgba(255, 0, 0, 0.8), inset 0 -5px 20px rgba(0, 0, 0, 0.5)'
        : '0 10px 40px rgba(255, 68, 68, 0.6), inset 0 -5px 20px rgba(0, 0, 0, 0.3)',
      position: 'relative',
      overflow: 'hidden'
    },
    icon: {
      color: '#ffffff',
      filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))',
      zIndex: 2
    },
    label: {
      color: '#ffffff',
      fontSize: '11px',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
      textAlign: 'center',
      lineHeight: '1.2',
      zIndex: 2
    },
    pulse: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      background: 'rgba(255, 255, 255, 0.3)',
      transform: 'translate(-50%, -50%)',
      animation: isActivated ? 'pulse 1.5s ease-out infinite' : 'none',
      zIndex: 1
    },
    statusText: {
      fontSize: '10px',
      fontWeight: 600,
      color: isActivated ? '#ff4444' : '#8b92a0',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      textAlign: 'center',
      padding: '4px 12px',
      background: 'rgba(0, 0, 0, 0.5)',
      borderRadius: '12px',
      backdropFilter: 'blur(4px)',
      border: `1px solid ${isActivated ? 'rgba(255, 68, 68, 0.5)' : 'rgba(139, 146, 160, 0.3)'}`,
      animation: isActivated ? 'blink 1s infinite' : 'none'
    },
    // Glow ring
    glowRing: {
      position: 'absolute',
      top: '-10px',
      left: '-10px',
      right: '-10px',
      bottom: '-10px',
      borderRadius: '50%',
      border: '3px solid rgba(255, 68, 68, 0.3)',
      pointerEvents: 'none',
      animation: isActivated ? 'glow 2s ease-in-out infinite' : 'none'
    }
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes pulse {
            0% {
              transform: translate(-50%, -50%) scale(1);
              opacity: 0.8;
            }
            100% {
              transform: translate(-50%, -50%) scale(1.5);
              opacity: 0;
            }
          }
          
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          
          @keyframes glow {
            0%, 100% {
              opacity: 0.5;
              transform: scale(1);
            }
            50% {
              opacity: 1;
              transform: scale(1.1);
            }
          }
        `}
      </style>
      
      <button
        style={styles.button}
        onClick={handleClick}
        onMouseEnter={(e) => {
          if (!isActivated) {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 15px 50px rgba(255, 68, 68, 0.8), inset 0 -5px 20px rgba(0, 0, 0, 0.3)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActivated) {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 10px 40px rgba(255, 68, 68, 0.6), inset 0 -5px 20px rgba(0, 0, 0, 0.3)';
          }
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = 'scale(0.95)';
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = isActivated ? 'scale(1)' : 'scale(1.05)';
        }}
      >
        <div style={styles.glowRing} />
        <div style={styles.pulse} />
        <Power size={32} style={styles.icon} />
        <span style={styles.label}>
          {isActivated ? 'STOP\nACTIVE' : 'EMERGENCY\nSTOP'}
        </span>
      </button>
      
      <div style={styles.statusText}>
        {isActivated ? '🚨 ACTIVATED' : 'Ready'}
      </div>
    </div>
  );
};

export default EmergencyStop;
