import React, { useEffect, useRef, useState } from 'react';
import { useROSTopic } from '../../hooks/useROS';

const ThermalCamera = ({ ros, topic = '/camera/thermal/image_raw' }) => {
  const { data, lastUpdate } = useROSTopic(ros, topic, 'sensor_msgs/msg/Image', 100);
  const canvasRef = useRef(null);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ width: 0, height: 0, fps: 0, encoding: '' });
  const fpsCounterRef = useRef({ count: 0, lastTime: Date.now() });

  useEffect(() => {
    if (!data) return;

    try {
      const now = Date.now();
      fpsCounterRef.current.count++;
      if (now - fpsCounterRef.current.lastTime > 1000) {
        const fps = fpsCounterRef.current.count;
        setStats(prev => ({ ...prev, fps }));
        fpsCounterRef.current.count = 0;
        fpsCounterRef.current.lastTime = now;
      }

      const { width, height, encoding, data: imageBytes } = data;
      setStats({ width, height, fps: stats.fps, encoding });

      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // Data'yı Uint8Array'e çevir
      let bytes;
      if (typeof imageBytes === 'string') {
        const binaryString = atob(imageBytes);
        bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
      } else if (imageBytes instanceof Uint8Array) {
        bytes = imageBytes;
      } else if (Array.isArray(imageBytes)) {
        bytes = new Uint8Array(imageBytes);
      } else {
        setError('Unknown image data type');
        return;
      }

      // Thermal colormap
      const applyThermalColormap = (value) => {
        // Iron colormap (siyah -> kırmızı -> sarı -> beyaz)
        const normalized = value / 255;
        let r, g, b;
        
        if (normalized < 0.25) {
          r = 0;
          g = 0;
          b = normalized * 4 * 255;
        } else if (normalized < 0.5) {
          r = (normalized - 0.25) * 4 * 255;
          g = 0;
          b = 255;
        } else if (normalized < 0.75) {
          r = 255;
          g = (normalized - 0.5) * 4 * 255;
          b = 255 - (normalized - 0.5) * 4 * 255;
        } else {
          r = 255;
          g = 255;
          b = (normalized - 0.75) * 4 * 255;
        }
        
        return [Math.round(r), Math.round(g), Math.round(b)];
      };

      if (encoding === 'mono8' || encoding === 'mono16') {
        const imgData = ctx.createImageData(width, height);
        
        for (let i = 0; i < width * height; i++) {
          const gray = encoding === 'mono16' ? bytes[i * 2] : bytes[i];
          const [r, g, b] = applyThermalColormap(gray);
          
          imgData.data[i * 4 + 0] = r;
          imgData.data[i * 4 + 1] = g;
          imgData.data[i * 4 + 2] = b;
          imgData.data[i * 4 + 3] = 255;
        }
        
        ctx.putImageData(imgData, 0, 0);
      } else if (encoding === 'rgb8' || encoding === 'bgr8') {
        // RGB/BGR thermal image (bazı kameralar bunu kullanır)
        const imgData = ctx.createImageData(width, height);
        const isBGR = encoding === 'bgr8';
        
        for (let i = 0; i < width * height; i++) {
          const srcIdx = i * 3;
          const dstIdx = i * 4;
          
          if (isBGR) {
            imgData.data[dstIdx + 0] = bytes[srcIdx + 2];
            imgData.data[dstIdx + 1] = bytes[srcIdx + 1];
            imgData.data[dstIdx + 2] = bytes[srcIdx + 0];
          } else {
            imgData.data[dstIdx + 0] = bytes[srcIdx + 0];
            imgData.data[dstIdx + 1] = bytes[srcIdx + 1];
            imgData.data[dstIdx + 2] = bytes[srcIdx + 2];
          }
          imgData.data[dstIdx + 3] = 255;
        }
        
        ctx.putImageData(imgData, 0, 0);
      } else {
        setError(`Unsupported encoding: ${encoding}`);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error rendering thermal image:', err);
      setError(err.message);
    }
  }, [data]);

  const styles = {
    container: {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#1a0a0a',
      position: 'relative',
      overflow: 'hidden'
    },
    canvas: {
      maxWidth: '100%',
      maxHeight: '100%',
      objectFit: 'contain',
      imageRendering: 'auto',
      background: '#000',
      display: 'block'
    },
    noFeed: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px',
      color: '#ff4400',
      padding: '20px',
      textAlign: 'center'
    },
    icon: {
      fontSize: '48px'
    },
    text: {
      fontSize: '14px',
      fontWeight: 600
    },
    info: {
      position: 'absolute',
      top: '12px',
      right: '12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      alignItems: 'flex-end',
      pointerEvents: 'none',
      zIndex: 10
    },
    badge: {
      fontSize: '10px',
      padding: '4px 8px',
      background: 'rgba(0, 0, 0, 0.8)',
      border: '1px solid rgba(255, 68, 0, 0.5)',
      borderRadius: '4px',
      color: '#ff4400',
      fontFamily: 'monospace',
      backdropFilter: 'blur(4px)',
      whiteSpace: 'nowrap'
    },
    error: {
      color: '#ff4444',
      fontSize: '12px',
      padding: '8px 12px',
      background: 'rgba(255, 68, 68, 0.1)',
      border: '1px solid rgba(255, 68, 68, 0.3)',
      borderRadius: '6px'
    }
  };

  return (
    <div style={styles.container}>
      {data ? (
        <>
          <canvas ref={canvasRef} style={styles.canvas} />
          
          <div style={styles.info}>
            <span style={styles.badge}>
              {stats.width}x{stats.height}
            </span>
            <span style={styles.badge}>
              {stats.fps} FPS
            </span>
            <span style={styles.badge}>
              {stats.encoding}
            </span>
            <span style={styles.badge}>
              {topic}
            </span>
          </div>
          
          {error && (
            <div style={{ ...styles.error, position: 'absolute', bottom: '20px' }}>
              {error}
            </div>
          )}
        </>
      ) : (
        <div style={styles.noFeed}>
          <div style={styles.icon}>🔴</div>
          <div style={styles.text}>
            Waiting for thermal feed...
          </div>
          <div style={{ fontSize: '10px', color: '#8b92a0', fontFamily: 'monospace' }}>
            Topic: {topic}<br/>
            ROS: {ros ? '✅ Connected' : '❌ Not connected'}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThermalCamera;
