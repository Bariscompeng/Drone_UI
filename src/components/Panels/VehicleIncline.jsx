import React, { useState, useEffect } from 'react';
import { useROSTopic } from '../../hooks/useROS';

const VehicleIncline = ({ ros, topic = '/imu/data' }) => {
  const { data } = useROSTopic(ros, topic, 'sensor_msgs/Imu');
  const [angles, setAngles] = useState({ pitch: 2.1, roll: 1.6 });

  useEffect(() => {
    if (data && data.orientation) {
      const { x, y, z, w } = data.orientation;
      
      const sinr_cosp = 2 * (w * x + y * z);
      const cosr_cosp = 1 - 2 * (x * x + y * y);
      const roll = Math.atan2(sinr_cosp, cosr_cosp) * (180 / Math.PI);
      
      const sinp = 2 * (w * y - z * x);
      const pitch = Math.abs(sinp) >= 1 
        ? Math.sign(sinp) * 90
        : Math.asin(sinp) * (180 / Math.PI);
      
      setAngles({ pitch, roll });
    }
  }, [data]);

  const styles = {
    container: {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(145deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.2) 100%)',
      overflow: 'hidden'
    },
    row: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      gap: '16px',
      position: 'relative'
    },
    divider: {
      height: '2px',
      background: 'linear-gradient(to right, transparent, rgba(0, 255, 65, 0.3), transparent)',
      margin: '0 20px'
    },
    label: {
      fontSize: '11px',
      color: '#00ff41',
      fontWeight: 700,
      letterSpacing: '2px',
      textTransform: 'uppercase',
      textShadow: '0 0 10px rgba(0, 255, 65, 0.5)'
    },
    value: {
      fontSize: '42px',
      fontWeight: 700,
      color: '#00ff41',
      textShadow: '0 0 30px rgba(0, 255, 65, 0.8)',
      minWidth: '180px',
      textAlign: 'center',
      fontFamily: 'JetBrains Mono, monospace',
      letterSpacing: '2px'
    },
    vehicleContainer: {
      width: '140px',
      height: '140px',
      perspective: '800px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    },
    vehicleBody: (rotation) => ({
      width: '100px',
      height: '50px',
      background: 'linear-gradient(145deg, #00ff41, #00cc35)',
      borderRadius: '10px',
      boxShadow: `
        0 15px 40px rgba(0, 255, 65, 0.4),
        inset 0 2px 10px rgba(255, 255, 255, 0.2)
      `,
      transition: 'transform 0.3s ease',
      transform: rotation,
      border: '3px solid #00ff41',
      position: 'relative'
    }),
    vehicleDetail: {
      position: 'absolute',
      width: '20px',
      height: '20px',
      background: 'rgba(0, 0, 0, 0.3)',
      borderRadius: '50%',
      border: '2px solid #00ff41'
    },
    grid: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundImage: `
        repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(0, 255, 65, 0.05) 20px, rgba(0, 255, 65, 0.05) 21px),
        repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(0, 255, 65, 0.05) 20px, rgba(0, 255, 65, 0.05) 21px)
      `,
      pointerEvents: 'none'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.grid} />
      
      <div style={styles.row}>
        <span style={styles.label}>PITCH ANGLE</span>
        <span style={styles.value}>
          {angles.pitch >= 0 ? '+' : ''}{angles.pitch.toFixed(1)}°
        </span>
        <div style={styles.vehicleContainer}>
          <div style={styles.vehicleBody(`rotateX(${angles.pitch}deg)`)}>
            <div style={{ ...styles.vehicleDetail, top: '50%', left: '10px', transform: 'translateY(-50%)' }} />
            <div style={{ ...styles.vehicleDetail, top: '50%', right: '10px', transform: 'translateY(-50%)' }} />
          </div>
        </div>
      </div>

      <div style={styles.divider} />

      <div style={styles.row}>
        <span style={styles.label}>ROLL ANGLE</span>
        <span style={styles.value}>
          {angles.roll >= 0 ? '+' : ''}{angles.roll.toFixed(1)}°
        </span>
        <div style={styles.vehicleContainer}>
          <div style={styles.vehicleBody(`rotateY(${angles.roll}deg)`)}>
            <div style={{ ...styles.vehicleDetail, top: '10px', left: '50%', transform: 'translateX(-50%)' }} />
            <div style={{ ...styles.vehicleDetail, bottom: '10px', left: '50%', transform: 'translateX(-50%)' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleIncline;
