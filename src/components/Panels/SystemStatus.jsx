import React, { useState, useEffect } from 'react';
import { Cpu, HardDrive, Activity } from 'lucide-react';

const SystemStatus = () => {
  const [stats, setStats] = useState({
    cpu: 43.0,
    memory: 60.5,
    disk: 77.2,
    temperature: 51.4
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats({
        cpu: 40 + Math.random() * 20,
        memory: 60 + Math.random() * 10,
        disk: 75 + Math.random() * 8,
        temperature: 45 + Math.random() * 15
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (value, thresholds = { warning: 70, danger: 85 }) => {
    if (value >= thresholds.danger) return '#ff4444';
    if (value >= thresholds.warning) return '#ffaa00';
    return '#00ff41';
  };

  const styles = {
    container: {
      width: '100%',
      height: '100%',
      padding: '16px',
      background: 'transparent',
      overflow: 'auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
      width: '100%',
      maxWidth: '600px'
    },
    card: {
      background: 'rgba(0, 0, 0, 0.3)',
      padding: '16px',
      borderRadius: '8px',
      border: '1px solid rgba(0, 255, 65, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      transition: 'all 0.3s'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: '#8b92a0',
      fontSize: '10px',
      fontWeight: 700,
      letterSpacing: '1px',
      textTransform: 'uppercase'
    },
    value: (color) => ({
      fontSize: '28px',
      fontWeight: 700,
      color: color,
      textShadow: `0 0 10px ${color}`
    }),
    progressBar: {
      width: '100%',
      height: '8px',
      background: 'rgba(0, 0, 0, 0.3)',
      borderRadius: '4px',
      overflow: 'hidden',
      position: 'relative'
    },
    progressFill: (width, color) => ({
      height: '100%',
      width: `${width}%`,
      background: color,
      borderRadius: '4px',
      transition: 'width 0.3s ease',
      boxShadow: `0 0 10px ${color}`,
      position: 'relative'
    })
  };

  return (
    <div style={styles.container}>
      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.header}>
            <Cpu size={14} />
            <span>CPU USAGE</span>
          </div>
          <div style={styles.value(getStatusColor(stats.cpu))}>
            {stats.cpu.toFixed(1)}%
          </div>
          <div style={styles.progressBar}>
            <div style={styles.progressFill(stats.cpu, getStatusColor(stats.cpu))} />
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.header}>
            <Activity size={14} />
            <span>MEMORY</span>
          </div>
          <div style={styles.value(getStatusColor(stats.memory))}>
            {stats.memory.toFixed(1)}%
          </div>
          <div style={styles.progressBar}>
            <div style={styles.progressFill(stats.memory, getStatusColor(stats.memory))} />
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.header}>
            <HardDrive size={14} />
            <span>DISK USAGE</span>
          </div>
          <div style={styles.value(getStatusColor(stats.disk))}>
            {stats.disk.toFixed(1)}%
          </div>
          <div style={styles.progressBar}>
            <div style={styles.progressFill(stats.disk, getStatusColor(stats.disk))} />
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.header}>
            <span style={{ fontSize: '14px' }}>🌡️</span>
            <span>TEMPERATURE</span>
          </div>
          <div style={styles.value(getStatusColor(stats.temperature, { warning: 60, danger: 75 }))}>
            {stats.temperature.toFixed(1)}°C
          </div>
          <div style={styles.progressBar}>
            <div style={styles.progressFill(
              (stats.temperature / 100) * 100, 
              getStatusColor(stats.temperature, { warning: 60, danger: 75 })
            )} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemStatus;
