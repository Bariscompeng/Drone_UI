import React, { useState, useEffect } from 'react';
import { useROSTopic } from '../../hooks/useROS';

const ArtificialHorizon = ({ ros, topic = '/imu/data' }) => {
  const { data } = useROSTopic(ros, topic, 'sensor_msgs/Imu');
  const [angles, setAngles] = useState({ pitch: 0, roll: 0 });

  useEffect(() => {
    if (data && data.orientation) {
      const { x, y, z, w } = data.orientation;
      
      // Quaternion to Euler
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
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle, rgba(20, 20, 30, 1) 0%, rgba(10, 10, 15, 1) 100%)',
      position: 'relative',
      overflow: 'hidden'
    },
    instrument: {
      position: 'relative',
      width: 'min(80vw, 80vh, 400px)',
      height: 'min(80vw, 80vh, 400px)',
      maxWidth: '400px',
      maxHeight: '400px',
      borderRadius: '50%',
      background: 'linear-gradient(145deg, #2a2a3a, #1a1a2a)',
      boxShadow: `
        inset 0 0 30px rgba(0, 0, 0, 0.8),
        0 10px 40px rgba(0, 0, 0, 0.5),
        0 0 0 8px #1a1a2a,
        0 0 0 12px #2a2a3a
      `,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    },
    horizon: {
      position: 'absolute',
      width: '200%',
      height: '200%',
      transition: 'transform 0.3s ease',
      transform: `rotate(${angles.roll}deg) translateY(${angles.pitch * 3}px)`
    },
    sky: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '50%',
      background: 'linear-gradient(to bottom, #4a9eff 0%, #87ceeb 100%)'
    },
    ground: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '100%',
      height: '50%',
      background: 'linear-gradient(to bottom, #8b7355 0%, #654321 100%)'
    },
    horizonLine: {
      position: 'absolute',
      top: '50%',
      left: 0,
      width: '100%',
      height: '3px',
      background: '#ffffff',
      boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
      transform: 'translateY(-50%)'
    },
    // Pitch ladder
    pitchLadder: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      pointerEvents: 'none'
    },
    // Center indicator (fixed)
    centerIndicator: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 10,
      pointerEvents: 'none'
    },
    wingLeft: {
      position: 'absolute',
      right: '50%',
      top: '50%',
      width: '80px',
      height: '4px',
      background: '#ffaa00',
      transform: 'translateY(-50%)',
      boxShadow: '0 0 10px rgba(255, 170, 0, 0.8)',
      borderRadius: '0 2px 2px 0'
    },
    wingRight: {
      position: 'absolute',
      left: '50%',
      top: '50%',
      width: '80px',
      height: '4px',
      background: '#ffaa00',
      transform: 'translateY(-50%)',
      boxShadow: '0 0 10px rgba(255, 170, 0, 0.8)',
      borderRadius: '2px 0 0 2px'
    },
    centerDot: {
      position: 'absolute',
      left: '50%',
      top: '50%',
      width: '12px',
      height: '12px',
      background: '#ffaa00',
      borderRadius: '50%',
      transform: 'translate(-50%, -50%)',
      boxShadow: '0 0 15px rgba(255, 170, 0, 1)',
      border: '2px solid #000'
    },
    // Roll indicator
    rollScale: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      top: 0,
      left: 0,
      borderRadius: '50%'
    },
    rollMarker: (angle) => ({
      position: 'absolute',
      top: '8%',
      left: '50%',
      transform: `translateX(-50%) rotate(${angle}deg)`,
      transformOrigin: '50% 180px',
      width: '2px',
      height: angle % 30 === 0 ? '20px' : '10px',
      background: '#ffffff',
      borderRadius: '1px'
    }),
    rollPointer: {
      position: 'absolute',
      top: '5%',
      left: '50%',
      transform: 'translateX(-50%) rotate(180deg)',
      width: 0,
      height: 0,
      borderLeft: '8px solid transparent',
      borderRight: '8px solid transparent',
      borderTop: '12px solid #ffaa00',
      boxShadow: '0 0 10px rgba(255, 170, 0, 0.8)',
      zIndex: 5
    },
    // Angle displays
    angleDisplay: {
      position: 'absolute',
      bottom: '10px',
      display: 'flex',
      gap: '30px',
      fontSize: '12px',
      fontWeight: 700,
      color: '#00ff41',
      textShadow: '0 0 10px rgba(0, 255, 65, 0.8)',
      zIndex: 10,
      background: 'rgba(0, 0, 0, 0.7)',
      padding: '8px 16px',
      borderRadius: '8px',
      border: '1px solid rgba(0, 255, 65, 0.3)',
      backdropFilter: 'blur(4px)'
    },
    // Pitch marks
    pitchMark: (degrees) => ({
      position: 'absolute',
      left: '50%',
      top: `calc(50% - ${degrees * 3}px)`,
      transform: 'translateX(-50%)',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      color: '#ffffff',
      fontSize: '12px',
      fontWeight: 600,
      textShadow: '0 0 5px rgba(0, 0, 0, 0.8)',
      whiteSpace: 'nowrap'
    }),
    pitchLine: (width) => ({
      width: width,
      height: '2px',
      background: '#ffffff',
      boxShadow: '0 0 5px rgba(255, 255, 255, 0.5)'
    })
  };

  // Render pitch ladder
  const renderPitchLadder = () => {
    const marks = [];
    for (let i = -90; i <= 90; i += 10) {
      if (i === 0) continue;
      const width = i % 20 === 0 ? '60px' : '40px';
      marks.push(
        <div key={i} style={styles.pitchMark(i)}>
          {i > 0 && <span>{i}°</span>}
          <div style={styles.pitchLine(width)} />
          {i < 0 && <span>{Math.abs(i)}°</span>}
        </div>
      );
    }
    return marks;
  };

  // Render roll scale
  const renderRollScale = () => {
    const marks = [];
    for (let i = -60; i <= 60; i += 10) {
      marks.push(<div key={i} style={styles.rollMarker(i)} />);
    }
    return marks;
  };

  return (
    <div style={styles.container}>
      <div style={styles.instrument}>
        {/* Roll scale */}
        <div style={styles.rollScale}>
          {renderRollScale()}
        </div>

        {/* Horizon */}
        <div style={styles.horizon}>
          {/* Sky */}
          <div style={styles.sky}>
            <div style={styles.pitchLadder}>
              {renderPitchLadder()}
            </div>
          </div>
          
          {/* Ground */}
          <div style={styles.ground} />
          
          {/* Horizon line */}
          <div style={styles.horizonLine} />
        </div>

        {/* Center indicator (wings) */}
        <div style={styles.centerIndicator}>
          <div style={styles.wingLeft} />
          <div style={styles.wingRight} />
          <div style={styles.centerDot} />
        </div>

        {/* Roll pointer */}
        <div style={{ ...styles.rollPointer, transform: `translateX(-50%) rotate(${-angles.roll + 180}deg)`, transformOrigin: '50% 180px' }} />
      </div>

      {/* Angle display */}
      <div style={styles.angleDisplay}>
        <div>
          <span style={{ color: '#8b92a0', fontSize: '10px' }}>PITCH </span>
          <span>{angles.pitch >= 0 ? '+' : ''}{angles.pitch.toFixed(1)}°</span>
        </div>
        <div>
          <span style={{ color: '#8b92a0', fontSize: '10px' }}>ROLL </span>
          <span>{angles.roll >= 0 ? '+' : ''}{angles.roll.toFixed(1)}°</span>
        </div>
      </div>
    </div>
  );
};

export default ArtificialHorizon;
