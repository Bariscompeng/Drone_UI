import React, { useEffect, useRef, useState } from 'react';
import { useROSTopic } from '../../hooks/useROS';

const RGBCamera = ({ ros, topic = '/usb_cam/image_raw' }) => {
  const { data, lastUpdate } = useROSTopic(ros, topic, 'sensor_msgs/msg/Image', 100);
  const canvasRef = useRef(null);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ width: 0, height: 0, fps: 0, encoding: '' });
  const fpsCounterRef = useRef({ count: 0, lastTime: Date.now() });

  useEffect(() => {
    if (!data) return;

    try {
      // FPS hesapla
      const now = Date.now();
      fpsCounterRef.current.count++;
      if (now - fpsCounterRef.current.lastTime > 1000) {
        const fps = fpsCounterRef.current.count;
        setStats(prev => ({ ...prev, fps }));
        fpsCounterRef.current.count = 0;
        fpsCounterRef.current.lastTime = now;
      }

      const { width, height, encoding, data: imageBytes } = data;
      
      console.log('🖼️ Processing image:', { 
        width, 
        height, 
        encoding, 
        bytesType: typeof imageBytes,
        isArray: Array.isArray(imageBytes),
        isUint8Array: imageBytes instanceof Uint8Array,
        bytesLength: imageBytes?.length,
        firstBytes: imageBytes?.slice ? Array.from(imageBytes.slice(0, 10)) : 'N/A'
      });
      
      setStats({ width, height, fps: stats.fps, encoding });

      const canvas = canvasRef.current;
      if (!canvas) {
        console.warn('⚠️ Canvas ref not available');
        return;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      // Clear canvas first (debug için)
      ctx.fillStyle = '#FF00FF'; // Magenta - eğer bu renk görünürse canvas çalışıyor demektir
      ctx.fillRect(0, 0, 50, 50);

      // Data'yı Uint8Array'e çevir (eğer değilse)
      let bytes;
      if (typeof imageBytes === 'string') {
        // Base64 encoded
        console.log('📦 Decoding base64 string');
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
        console.error('❌ Unknown data type:', typeof imageBytes);
        setError('Unknown image data type');
        return;
      }

      console.log('✅ Bytes ready:', bytes.length, 'expected:', width * height * 3);

      if (encoding === 'rgb8') {
        console.log('🎨 Rendering RGB8 image');
        const imgData = ctx.createImageData(width, height);
        
        for (let i = 0; i < width * height; i++) {
          const srcIdx = i * 3;
          const dstIdx = i * 4;
          
          imgData.data[dstIdx + 0] = bytes[srcIdx + 0]; // R
          imgData.data[dstIdx + 1] = bytes[srcIdx + 1]; // G
          imgData.data[dstIdx + 2] = bytes[srcIdx + 2]; // B
          imgData.data[dstIdx + 3] = 255; // Alpha
        }
        
        ctx.putImageData(imgData, 0, 0);
        console.log('✅ Image rendered successfully');
      } else if (encoding === 'bgr8') {
        console.log('🎨 Rendering BGR8 image');
        const imgData = ctx.createImageData(width, height);
        
        for (let i = 0; i < width * height; i++) {
          const srcIdx = i * 3;
          const dstIdx = i * 4;
          
          imgData.data[dstIdx + 0] = bytes[srcIdx + 2]; // R
          imgData.data[dstIdx + 1] = bytes[srcIdx + 1]; // G
          imgData.data[dstIdx + 2] = bytes[srcIdx + 0]; // B
          imgData.data[dstIdx + 3] = 255; // Alpha
        }
        
        ctx.putImageData(imgData, 0, 0);
        console.log('✅ Image rendered successfully');
      } else {
        console.warn('⚠️ Unsupported encoding:', encoding);
        setError(`Unsupported encoding: ${encoding}`);
      }
      
      setError(null);
    } catch (err) {
      console.error('❌ Error rendering image:', err);
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
      background: '#1a1a1a', // Hafif gri - tamamen siyah değil
      position: 'relative',
      overflow: 'hidden'
    },
    canvas: {
      maxWidth: '100%',
      maxHeight: '100%',
      objectFit: 'contain',
      imageRendering: 'auto',
      background: '#000', // Canvas'ın kendi arka planı
      display: 'block' // Inline elementten kaçın
    },
    noFeed: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px',
      color: '#ff8800',
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
      border: '1px solid rgba(0, 255, 65, 0.5)',
      borderRadius: '4px',
      color: '#00ff41',
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
      borderRadius: '6px',
      maxWidth: '90%'
    },
    debugInfo: {
      fontSize: '10px',
      color: '#8b92a0',
      marginTop: '8px',
      fontFamily: 'monospace',
      maxWidth: '300px',
      wordBreak: 'break-word'
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
            {lastUpdate && (
              <span style={styles.badge}>
                {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
          
          {error && (
            <div style={{ ...styles.error, position: 'absolute', bottom: '20px' }}>
              {error}
            </div>
          )}
        </>
      ) : (
        <div style={styles.noFeed}>
          <div style={styles.icon}>📷</div>
          <div style={styles.text}>
            Waiting for camera feed...
          </div>
          <div style={styles.debugInfo}>
            Topic: {topic}<br/>
            ROS: {ros ? '✅ Connected' : '❌ Not connected'}
          </div>
        </div>
      )}
    </div>
  );
};

export default RGBCamera;
