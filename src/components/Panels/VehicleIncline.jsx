import React, { useState, useEffect } from 'react';
import { useROSTopic } from '../../hooks/useROS';

/**
 * Livox IMU orientation quaternion her zaman 0,0,0,1 gelir (hesaplanmaz).
 * Pitch ve roll, linear_acceleration'dan hesaplanır:
 *   pitch = atan2(-ax, sqrt(ay² + az²))
 *   roll  = atan2(ay, az)
 */
const VehicleIncline = ({ ros, topic = '/livox/imu' }) => {
  const { data } = useROSTopic(ros, topic, 'sensor_msgs/msg/Imu');
  const [angles, setAngles] = useState({ pitch: 0, roll: 0 });

  useEffect(() => {
    if (!data) return;

    // Önce orientation dene (gerçek quaternion varsa kullan)
    const { x, y, z, w } = data.orientation || {};
    const hasRealOrientation = w !== undefined && !(x === 0 && y === 0 && z === 0 && w === 1);

    if (hasRealOrientation) {
      const sinr_cosp = 2 * (w * x + y * z);
      const cosr_cosp = 1 - 2 * (x * x + y * y);
      const roll = Math.atan2(sinr_cosp, cosr_cosp) * (180 / Math.PI);
      const sinp = 2 * (w * y - z * x);
      const pitch = Math.abs(sinp) >= 1
        ? Math.sign(sinp) * 90
        : Math.asin(sinp) * (180 / Math.PI);
      setAngles({ pitch, roll });
      return;
    }

    // Orientation yoksa/identity ise → ivmeden hesapla
    const acc = data.linear_acceleration;
    if (!acc) return;

    const ax = acc.x ?? 0;
    const ay = acc.y ?? 0;
    const az = acc.z ?? 0;

    // Tümü sıfırsa veri gelmemiştir, atla
    if (ax === 0 && ay === 0 && az === 0) return;

    const pitch = Math.atan2(-ax, Math.sqrt(ay * ay + az * az)) * (180 / Math.PI);
    const roll  = Math.atan2(ay, az) * (180 / Math.PI);

    setAngles({ pitch, roll });
  }, [data]);

  const styles = {
    container: {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#0a0a0a',
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
      top: 0, left: 0,
      width: '100%', height: '100%',
      backgroundImage: `
        repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(0, 255, 65, 0.05) 20px, rgba(0, 255, 65, 0.05) 21px),
        repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(0, 255, 65, 0.05) 20px, rgba(0, 255, 65, 0.05) 21px)
      `,
      pointerEvents: 'none'
    },
    sourceTag: {
      position: 'absolute',
      bottom: '6px',
      right: '8px',
      fontSize: '9px',
      color: 'rgba(0,255,65,0.4)',
      fontFamily: 'monospace',
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

      <div style={styles.sourceTag}>{topic} · accel</div>
    </div>
  );
};

export default VehicleIncline;
