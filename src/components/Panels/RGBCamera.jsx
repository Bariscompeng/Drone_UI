import React, { useState, useRef, useEffect } from 'react';

/**
 * RGBCamera — web_video_server MJPEG stream kullanır.
 * Rosbridge üzerinden raw Image almak yerine doğrudan HTTP MJPEG stream ile
 * çok daha yüksek FPS elde edilir.
 *
 * web_video_server'ın çalışıyor olması gerekir:
 *   ros2 run web_video_server web_video_server
 *   → http://ROBOT_IP:8080/stream?topic=TOPIC&type=mjpeg
 */

// Robot IP'yi rosbridge URL'inden otomatik al
const getRobotIP = () => {
  const rosUrl = localStorage.getItem('ros_url') || 'ws://localhost:9090';
  try {
    // ws://192.168.1.117:9090  →  192.168.1.117
    const match = rosUrl.match(/ws[s]?:\/\/([^:/]+)/);
    return match ? match[1] : 'localhost';
  } catch {
    return 'localhost';
  }
};

const WEB_VIDEO_PORT = 8080;

const RGBCamera = ({ ros, topic = '/image_raw' }) => {
  const robotIP = getRobotIP();
  const streamUrl = `http://${robotIP}:${WEB_VIDEO_PORT}/stream?topic=${topic}&type=mjpeg`;

  const imgRef = useRef(null);
  const [status, setStatus] = useState('connecting'); // connecting | ok | error
  const [fps, setFps] = useState(0);
  const fpsRef = useRef({ count: 0, lastTime: Date.now() });

  // FPS sayacı — her image load event'inde tetiklenir
  const handleLoad = () => {
    setStatus('ok');
    fpsRef.current.count++;
    const now = Date.now();
    if (now - fpsRef.current.lastTime >= 1000) {
      setFps(fpsRef.current.count);
      fpsRef.current.count = 0;
      fpsRef.current.lastTime = now;
    }
  };

  const handleError = () => {
    setStatus('error');
  };

  // Topic veya bağlantı değişince stream URL'ini yenile
  useEffect(() => {
    setStatus('connecting');
    setFps(0);
    fpsRef.current = { count: 0, lastTime: Date.now() };
  }, [topic, robotIP]);

  const styles = {
    container: {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#000',
      position: 'relative',
      overflow: 'hidden'
    },
    img: {
      maxWidth: '100%',
      maxHeight: '100%',
      objectFit: 'contain',
      display: status === 'ok' ? 'block' : 'none'
    },
    overlay: {
      position: 'absolute',
      top: '10px',
      right: '10px',
      display: 'flex',
      flexDirection: 'column',
      gap: '5px',
      alignItems: 'flex-end',
      pointerEvents: 'none',
      zIndex: 10
    },
    badge: (color = '#00ff41') => ({
      fontSize: '10px',
      padding: '3px 8px',
      background: 'rgba(0,0,0,0.75)',
      border: `1px solid ${color}60`,
      borderRadius: '4px',
      color,
      fontFamily: 'monospace',
      backdropFilter: 'blur(4px)',
      whiteSpace: 'nowrap'
    }),
    noFeed: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px',
      color: '#ff8800',
      padding: '20px',
      textAlign: 'center'
    }
  };

  return (
    <div style={styles.container}>
      {/* MJPEG stream — tarayıcı built-in MJPEG desteğiyle doğrudan oynatır */}
      <img
        ref={imgRef}
        src={streamUrl}
        alt="RGB Camera"
        style={styles.img}
        onLoad={handleLoad}
        onError={handleError}
      />

      {/* Bağlanıyor... */}
      {status === 'connecting' && (
        <div style={styles.noFeed}>
          <div style={{ fontSize: '40px' }}>📷</div>
          <div style={{ fontSize: '14px', fontWeight: 600 }}>Kamera bağlanıyor...</div>
          <div style={{ fontSize: '10px', color: '#666', fontFamily: 'monospace', wordBreak: 'break-all', maxWidth: '90%' }}>
            {streamUrl}
          </div>
          <div style={{ fontSize: '10px', color: '#8b92a0', fontFamily: 'monospace' }}>
            ROS: {ros ? '✅ Connected' : '❌ Not connected'}
          </div>
        </div>
      )}

      {/* Hata */}
      {status === 'error' && (
        <div style={styles.noFeed}>
          <div style={{ fontSize: '40px' }}>⚠️</div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#ff4444' }}>
            web_video_server bağlantısı kurulamadı
          </div>
          <div style={{ fontSize: '10px', color: '#888', fontFamily: 'monospace', wordBreak: 'break-all', maxWidth: '90%' }}>
            {streamUrl}
          </div>
          <div style={{ fontSize: '11px', color: '#ff8800', marginTop: '8px' }}>
            Terminalden şunu çalıştır:<br />
            <code style={{ background: '#111', padding: '4px 8px', borderRadius: '4px' }}>
              ros2 run web_video_server web_video_server
            </code>
          </div>
        </div>
      )}

      {/* Bilgi overlay */}
      {status === 'ok' && (
        <div style={styles.overlay}>
          <span style={styles.badge('#00ff41')}>{fps} FPS</span>
          <span style={styles.badge('#00aaff')}>{topic}</span>
          <span style={styles.badge('#00ff41')}>MJPEG</span>
        </div>
      )}
    </div>
  );
};

export default RGBCamera;
