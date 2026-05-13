import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// ─── Color Presets ────────────────────────────────────────────────────────────
const COLOR_MODES = [
  { id: 'height',    label: 'Yükseklik' },
  { id: 'distance',  label: 'Mesafe'    },
  { id: 'intensity', label: 'Sabit Renk' },
];

const DEFAULT_SETTINGS = {
  topic:          '/livox/lidar',
  messageType:    'auto',        // 'auto' | 'livox' | 'pc2'
  colorMode:      'height',
  groundColor:    '#00ff41',   // zemin / yakın noktalar
  midColor:       '#ffaa00',   // orta mesafe
  farColor:       '#ff3333',   // uzak noktalar
  pointSize:      0.06,
  maxPoints:      30000,
  minHeight:      -2,
  maxHeight:      4,
  showGrid:       true,
  showAxes:       true,
  bgColor:        '#060a10',
  autoRotate:     false,
};

const TOPICS = [
  '/livox/lidar',
  '/velodyne_points',
  '/lidar/points',
  '/ouster/points',
  '/scan',
  '/cloud_in',
  '/points_raw',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function lerpColor(c1, c2, t) {
  const a = new THREE.Color(c1);
  const b = new THREE.Color(c2);
  return a.lerp(b, t);
}

function getHeightColor(y, minH, maxH, groundCol, midCol, farCol) {
  const t = Math.max(0, Math.min(1, (y - minH) / (maxH - minH)));
  const col = new THREE.Color();
  if (t < 0.5) {
    col.copy(new THREE.Color(groundCol)).lerp(new THREE.Color(midCol), t * 2);
  } else {
    col.copy(new THREE.Color(midCol)).lerp(new THREE.Color(farCol), (t - 0.5) * 2);
  }
  return col;
}

function getDistColor(dist, maxDist, groundCol, midCol, farCol) {
  const t = Math.max(0, Math.min(1, dist / maxDist));
  const col = new THREE.Color();
  if (t < 0.5) {
    col.copy(new THREE.Color(groundCol)).lerp(new THREE.Color(midCol), t * 2);
  } else {
    col.copy(new THREE.Color(midCol)).lerp(new THREE.Color(farCol), (t - 0.5) * 2);
  }
  return col;
}

// ─── Simulated Point Cloud Generator ─────────────────────────────────────────
function generateSimulatedPoints(count = 8000) {
  const pts = [];
  for (let i = 0; i < count; i++) {
    const angle  = Math.random() * Math.PI * 2;
    const radius = 1 + Math.random() * 14;
    const x      = Math.cos(angle) * radius;
    const z      = Math.sin(angle) * radius;
    // ground plane + some obstacles
    let y = -1.2 + Math.random() * 0.3;
    if (radius < 4 && Math.random() > 0.6) y += Math.random() * 3;
    if (radius > 6 && radius < 9 && Math.abs(angle - 1) < 0.8) y += Math.random() * 2;
    pts.push(x, y, z);
  }
  return pts;
}

// ─── Real Point Cloud Parsers ────────────────────────────────────────────────
// ROS REP-103 (x forward, y left, z up) → Three.js (x right, y up, z toward cam)
//   three.x = -ros.y    three.y =  ros.z    three.z = -ros.x

// Parse Livox CustomMsg — points arrive as JSON array
function parseLivoxCustom(msg, maxPoints) {
  const pts = msg.points || [];
  const total = pts.length;
  if (total === 0) return null;
  const stride   = Math.max(1, Math.floor(total / maxPoints));
  const outCount = Math.min(Math.ceil(total / stride), maxPoints);
  const positions = new Float32Array(outCount * 3);
  let out = 0;
  for (let i = 0; i < total && out < outCount; i += stride) {
    const p = pts[i];
    if (!p) continue;
    positions[out * 3]     = -p.y;
    positions[out * 3 + 1] =  p.z;
    positions[out * 3 + 2] = -p.x;
    out++;
  }
  return { positions, count: out, total };
}

// Parse sensor_msgs/PointCloud2 — data can be base64 string OR Uint8Array (cbor)
function parsePointCloud2(msg, maxPoints) {
  if (!msg.data) return null;

  let bytes;
  if (typeof msg.data === 'string') {
    const bin = atob(msg.data);
    bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  } else if (msg.data instanceof Uint8Array) {
    bytes = msg.data;
  } else if (msg.data.buffer) {
    bytes = new Uint8Array(msg.data.buffer, msg.data.byteOffset || 0, msg.data.byteLength);
  } else {
    return null;
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  const pointStep = msg.point_step;
  const isLE = !msg.is_bigendian;
  const total = (msg.width || 0) * (msg.height || 0);
  if (total === 0 || !pointStep) return null;

  const offs = {};
  (msg.fields || []).forEach(f => { offs[f.name] = f.offset; });
  const xOff = offs.x ?? 0;
  const yOff = offs.y ?? 4;
  const zOff = offs.z ?? 8;

  const stride   = Math.max(1, Math.floor(total / maxPoints));
  const outCount = Math.min(Math.ceil(total / stride), maxPoints);
  const positions = new Float32Array(outCount * 3);
  let out = 0;
  for (let i = 0; i < total && out < outCount; i += stride) {
    const base = i * pointStep;
    if (base + zOff + 4 > bytes.byteLength) break;
    const x = view.getFloat32(base + xOff, isLE);
    const y = view.getFloat32(base + yOff, isLE);
    const z = view.getFloat32(base + zOff, isLE);
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) continue;
    positions[out * 3]     = -y;
    positions[out * 3 + 1] =  z;
    positions[out * 3 + 2] = -x;
    out++;
  }
  return { positions, count: out, total };
}

// Colorize a positions buffer according to settings
function colorizePoints(positions, count, settings) {
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const tx = positions[i * 3];
    const ty = positions[i * 3 + 1];  // three.y = ros.z = height
    const tz = positions[i * 3 + 2];
    const dist = Math.sqrt(tx * tx + tz * tz);
    let col;
    if (settings.colorMode === 'height') {
      col = getHeightColor(ty, settings.minHeight, settings.maxHeight,
                           settings.groundColor, settings.midColor, settings.farColor);
    } else if (settings.colorMode === 'distance') {
      col = getDistColor(dist, 20,
                         settings.groundColor, settings.midColor, settings.farColor);
    } else {
      col = new THREE.Color(settings.groundColor);
    }
    colors[i * 3]     = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;
  }
  return colors;
}

// ─── Main Component ────────────────────────────────────────────────────────────
const LidarVisualization = ({ ros, connected }) => {
  const mountRef       = useRef(null);
  const sceneRef       = useRef(null);
  const rendererRef    = useRef(null);
  const cameraRef      = useRef(null);
  const controlsRef    = useRef(null);
  const pointsRef      = useRef(null);
  const gridRef        = useRef(null);
  const axesRef        = useRef(null);
  const animFrameRef   = useRef(null);
  const resizeObsRef   = useRef(null);
  const rosTopicRef    = useRef(null);

  const [settings, setSettings]         = useState(DEFAULT_SETTINGS);
  const settingsRef                     = useRef(DEFAULT_SETTINGS);
  useEffect(() => { settingsRef.current = settings; }, [settings]);

  const [pointCount, setPointCount]     = useState(0);
  const [fps, setFps]                   = useState(0);
  const [isSimulated, setIsSimulated]   = useState(true);
  const [customTopic, setCustomTopic]   = useState('');
  const [useCustom, setUseCustom]       = useState(false);

  const fpsCountRef  = useRef(0);
  const fpsTimerRef  = useRef(Date.now());

  // ── Build / rebuild scene ────────────────────────────────────────────────────
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(settings.bgColor);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(60, el.clientWidth / el.clientHeight, 0.1, 1000);
    camera.position.set(0, 8, 14);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(el.clientWidth, el.clientHeight);
    el.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance   = 2;
    controls.maxDistance   = 80;
    controlsRef.current    = controls;

    // Grid
    const grid = new THREE.GridHelper(40, 40, 0x1a2a1a, 0x0d1a0d);
    scene.add(grid);
    gridRef.current = grid;

    // Axes
    const axes = new THREE.AxesHelper(3);
    scene.add(axes);
    axesRef.current = axes;

    // Initial point cloud
    const geo = new THREE.BufferGeometry();
    const mat = new THREE.PointsMaterial({
      size:         settings.pointSize,
      vertexColors: true,
      sizeAttenuation: true,
    });
    const pts = new THREE.Points(geo, mat);
    scene.add(pts);
    pointsRef.current = pts;

    // FPS + animate
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
      fpsCountRef.current++;
      const now = Date.now();
      if (now - fpsTimerRef.current >= 1000) {
        setFps(fpsCountRef.current);
        fpsCountRef.current = 0;
        fpsTimerRef.current = now;
      }
    };
    animate();

    // Resize
    const onResize = () => {
      if (!el) return;
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    resizeObsRef.current = new ResizeObserver(onResize);
    resizeObsRef.current.observe(el);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      resizeObsRef.current?.disconnect();
      controls.dispose();
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Sync scene settings ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!sceneRef.current) return;
    sceneRef.current.background = new THREE.Color(settings.bgColor);
    if (gridRef.current)  gridRef.current.visible  = settings.showGrid;
    if (axesRef.current)  axesRef.current.visible  = settings.showAxes;
    if (pointsRef.current) pointsRef.current.material.size = settings.pointSize;
    if (controlsRef.current) controlsRef.current.autoRotate = settings.autoRotate;
  }, [settings]);

  // ── Re-color existing points when color settings change ───────────────────
  const recolorPoints = useCallback(() => {
    if (!pointsRef.current) return;
    const geo       = pointsRef.current.geometry;
    const positions = geo.attributes.position?.array;
    if (!positions) return;

    const count  = positions.length / 3;
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const x = positions[i * 3];
      const y = positions[i * 3 + 1];
      const z = positions[i * 3 + 2];
      const dist = Math.sqrt(x * x + z * z);
      let col;
      if (settings.colorMode === 'height') {
        col = getHeightColor(y, settings.minHeight, settings.maxHeight,
                              settings.groundColor, settings.midColor, settings.farColor);
      } else if (settings.colorMode === 'distance') {
        col = getDistColor(dist, 20, settings.groundColor, settings.midColor, settings.farColor);
      } else {
        col = new THREE.Color(settings.groundColor);
      }
      colors[i * 3]     = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.attributes.color.needsUpdate = true;
  }, [settings]);

  useEffect(() => { recolorPoints(); }, [recolorPoints]);

  // ── Simulated cloud loop ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isSimulated || !pointsRef.current) return;
    const interval = setInterval(() => {
      const rawPts  = generateSimulatedPoints(settings.maxPoints);
      const count   = rawPts.length / 3;
      const colArr  = new Float32Array(count * 3);

      for (let i = 0; i < count; i++) {
        const x    = rawPts[i * 3];
        const y    = rawPts[i * 3 + 1];
        const z    = rawPts[i * 3 + 2];
        const dist = Math.sqrt(x * x + z * z);
        let col;
        if (settings.colorMode === 'height') {
          col = getHeightColor(y, settings.minHeight, settings.maxHeight,
                                settings.groundColor, settings.midColor, settings.farColor);
        } else if (settings.colorMode === 'distance') {
          col = getDistColor(dist, 20, settings.groundColor, settings.midColor, settings.farColor);
        } else {
          col = new THREE.Color(settings.groundColor);
        }
        colArr[i * 3]     = col.r;
        colArr[i * 3 + 1] = col.g;
        colArr[i * 3 + 2] = col.b;
      }

      const geo = pointsRef.current.geometry;
      geo.setAttribute('position', new THREE.Float32BufferAttribute(rawPts, 3));
      geo.setAttribute('color',    new THREE.Float32BufferAttribute(colArr, 3));
      geo.attributes.position.needsUpdate = true;
      geo.attributes.color.needsUpdate    = true;
      geo.computeBoundingSphere();
      setPointCount(count);
    }, 200);
    return () => clearInterval(interval);
  }, [isSimulated, settings]);

  // ── ROS topic subscription ────────────────────────────────────────────────────
  useEffect(() => {
    if (!ros || !connected) { setIsSimulated(true); return; }

    const ROSLIB = require('roslib');
    const topicName = useCustom ? customTopic : settings.topic;
    if (!topicName) return;

    // Choose message type
    let msgType;
    if (settings.messageType === 'livox') {
      msgType = 'livox_ros_driver2/CustomMsg';
    } else if (settings.messageType === 'pc2') {
      msgType = 'sensor_msgs/PointCloud2';
    } else {
      // auto: /livox/* → CustomMsg, else PointCloud2
      msgType = topicName.includes('/livox/')
        ? 'livox_ros_driver2/CustomMsg'
        : 'sensor_msgs/PointCloud2';
    }

    if (rosTopicRef.current) {
      try { rosTopicRef.current.unsubscribe(); } catch (e) { /* noop */ }
    }

    console.log(`📡 Subscribing to ${topicName} as ${msgType}`);
    const topic = new ROSLIB.Topic({
      ros,
      name:         topicName,
      messageType:  msgType,
      throttle_rate: 50,     // max ~20 Hz
      queue_length:  1,
      queue_size:    1,
      compression:  'cbor',  // binary CBOR, çok daha hızlı decode
    });

    topic.subscribe((msg) => {
      if (!pointsRef.current) return;
      try {
        const s = settingsRef.current;
        const parsed = msgType.startsWith('livox_')
          ? parseLivoxCustom(msg, s.maxPoints)
          : parsePointCloud2(msg, s.maxPoints);
        if (!parsed || parsed.count === 0) return;

        const colors = colorizePoints(parsed.positions, parsed.count, s);
        const geo = pointsRef.current.geometry;
        geo.setAttribute('position', new THREE.BufferAttribute(parsed.positions, 3));
        geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
        geo.attributes.position.needsUpdate = true;
        geo.attributes.color.needsUpdate    = true;
        geo.computeBoundingSphere();
        setPointCount(parsed.total);
        setIsSimulated(false);
      } catch (e) {
        console.error('LiDAR parse error', e);
      }
    });

    rosTopicRef.current = topic;
    return () => { try { topic.unsubscribe(); } catch (e) { /* noop */ } };
  }, [ros, connected, settings.topic, settings.messageType, customTopic, useCustom]);

  // ── Settings updater ──────────────────────────────────────────────────────────
  const update = (key, val) => setSettings(prev => ({ ...prev, [key]: val }));

  const resetCamera = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    cameraRef.current.position.set(0, 8, 14);
    cameraRef.current.lookAt(0, 0, 0);
    controlsRef.current.reset();
  };

  // ── Styles ─────────────────────────────────────────────────────────────────────
  const S = {
    page: {
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      background: '#060a10', overflow: 'hidden',
    },
    // ── Header ──
    header: {
      flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 24px',
      background: 'rgba(0,0,0,0.6)',
      borderBottom: '1px solid rgba(0,255,65,0.15)',
    },
    headerLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
    dot: (active) => ({
      width: 8, height: 8, borderRadius: '50%',
      background: active ? '#00ff41' : '#ff4444',
      boxShadow: active ? '0 0 8px #00ff41' : '0 0 8px #ff4444',
    }),
    title: { fontSize: 18, fontWeight: 700, color: '#00ff41', letterSpacing: 1,
             textShadow: '0 0 16px rgba(0,255,65,0.4)', fontFamily: 'monospace' },
    badge: (ok) => ({
      padding: '3px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 600, fontFamily: 'monospace',
      background: ok ? 'rgba(0,255,65,0.12)' : 'rgba(255,68,68,0.12)',
      border: `1px solid ${ok ? 'rgba(0,255,65,0.4)' : 'rgba(255,68,68,0.4)'}`,
      color: ok ? '#00ff41' : '#ff4444',
    }),
    statRow: { display: 'flex', gap: 16, alignItems: 'center' },
    stat: { fontSize: 11, color: '#8b92a0', fontFamily: 'monospace' },
    statVal: { color: '#e0e0e0', fontWeight: 600 },
    // ── Viewer ──
    viewer: {
      flex: 1, minHeight: 0, position: 'relative',
      background: '#060a10',
    },
    mount: { width: '100%', height: '100%' },
    overlay: {
      position: 'absolute', bottom: 12, right: 12,
      display: 'flex', flexDirection: 'column', gap: 4,
      pointerEvents: 'none',
    },
    chip: {
      fontSize: 10, padding: '3px 8px',
      background: 'rgba(0,0,0,0.7)',
      border: '1px solid rgba(0,255,65,0.25)',
      borderRadius: 4, color: '#00ff41',
      fontFamily: 'monospace', backdropFilter: 'blur(4px)',
    },
    simChip: {
      fontSize: 10, padding: '3px 8px',
      background: 'rgba(255,170,0,0.7)',
      border: '1px solid rgba(255,170,0,0.5)',
      borderRadius: 4, color: '#000', fontFamily: 'monospace',
    },
    controlsBanner: {
      position: 'absolute', bottom: 12, left: 12,
      fontSize: 10, color: 'rgba(255,255,255,0.3)',
      fontFamily: 'monospace', lineHeight: 1.8,
      pointerEvents: 'none',
    },
    // ── Settings panel ──
    settings: {
      flexShrink: 0,
      background: 'rgba(6,10,16,0.97)',
      borderTop: '1px solid rgba(0,255,65,0.15)',
      padding: '16px 24px',
      overflowX: 'auto',
    },
    settingsInner: {
      display: 'flex', gap: 24, alignItems: 'flex-start',
      minWidth: 'max-content',
    },
    section: {
      background: 'rgba(0,0,0,0.35)',
      border: '1px solid rgba(0,255,65,0.12)',
      borderRadius: 8, padding: '12px 16px',
      display: 'flex', flexDirection: 'column', gap: 10,
    },
    sectionTitle: {
      fontSize: 10, fontWeight: 700, color: '#00ff41',
      textTransform: 'uppercase', letterSpacing: 1.2,
      marginBottom: 2, fontFamily: 'monospace',
    },
    row: { display: 'flex', alignItems: 'center', gap: 8 },
    label: { fontSize: 11, color: '#8b92a0', minWidth: 80, fontFamily: 'monospace' },
    select: {
      padding: '5px 8px', background: 'rgba(0,0,0,0.5)',
      border: '1px solid rgba(255,255,255,0.1)', borderRadius: 5,
      color: '#e0e0e0', fontSize: 11, fontFamily: 'monospace', cursor: 'pointer',
    },
    input: {
      padding: '5px 8px', background: 'rgba(0,0,0,0.5)',
      border: '1px solid rgba(255,255,255,0.1)', borderRadius: 5,
      color: '#e0e0e0', fontSize: 11, fontFamily: 'monospace',
    },
    range: { width: 120, cursor: 'pointer', accentColor: '#00ff41' },
    colorBox: (c) => ({
      width: 28, height: 28, borderRadius: 4, cursor: 'pointer',
      border: '2px solid rgba(255,255,255,0.2)',
      background: c, display: 'flex', alignItems: 'center',
      justifyContent: 'center', position: 'relative', overflow: 'hidden',
    }),
    colorInput: {
      position: 'absolute', inset: 0, opacity: 0,
      cursor: 'pointer', width: '100%', height: '100%',
    },
    toggleBtn: (on) => ({
      padding: '4px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 11,
      fontFamily: 'monospace', fontWeight: 600, transition: 'all 0.2s',
      background: on ? 'rgba(0,255,65,0.15)' : 'rgba(255,255,255,0.05)',
      border: `1px solid ${on ? 'rgba(0,255,65,0.5)' : 'rgba(255,255,255,0.1)'}`,
      color: on ? '#00ff41' : '#8b92a0',
    }),
    resetBtn: {
      padding: '6px 16px', borderRadius: 5, cursor: 'pointer',
      fontSize: 11, fontFamily: 'monospace', fontWeight: 600,
      background: 'rgba(0,170,255,0.1)',
      border: '1px solid rgba(0,170,255,0.35)',
      color: '#00aaff', transition: 'all 0.2s',
    },
    modeBtn: (on) => ({
      padding: '4px 10px', borderRadius: 4, cursor: 'pointer',
      fontSize: 11, fontFamily: 'monospace', transition: 'all 0.2s',
      background: on ? 'rgba(0,255,65,0.2)' : 'rgba(255,255,255,0.04)',
      border: `1px solid ${on ? '#00ff41' : 'rgba(255,255,255,0.08)'}`,
      color: on ? '#00ff41' : '#8b92a0',
    }),
  };

  return (
    <div style={S.page}>

      {/* ── Header ── */}
      <div style={S.header}>
        <div style={S.headerLeft}>
          <div style={S.dot(!isSimulated && connected)} />
          <span style={S.title}>📡 LiDAR VISUALIZATION</span>
          <span style={S.badge(!isSimulated && connected)}>
            {!isSimulated && connected ? 'LIVE' : 'SİMÜLASYON'}
          </span>
        </div>
        <div style={S.statRow}>
          <span style={S.stat}>NOKTA: <span style={S.statVal}>{pointCount.toLocaleString()}</span></span>
          <span style={S.stat}>FPS: <span style={S.statVal}>{fps}</span></span>
          <span style={S.stat}>TOPIC: <span style={S.statVal}>{useCustom ? customTopic : settings.topic}</span></span>
          <span style={S.stat}>ROS: <span style={S.statVal}>{connected ? '✓ BAĞLI' : '✗ BAĞLI DEĞİL'}</span></span>
        </div>
      </div>

      {/* ── 3D Viewer ── */}
      <div style={S.viewer}>
        <div ref={mountRef} style={S.mount} />

        <div style={S.overlay}>
          <span style={S.chip}>Nokta: {pointCount.toLocaleString()}</span>
          <span style={S.chip}>FPS: {fps}</span>
          {isSimulated && <span style={S.simChip}>⚠ Simülasyon</span>}
        </div>

        <div style={S.controlsBanner}>
          Sol tık → Döndür &nbsp;|&nbsp; Sağ tık → Kaydır &nbsp;|&nbsp; Scroll → Zoom
        </div>
      </div>

      {/* ── Settings Panel ── */}
      <div style={S.settings}>
        <div style={S.settingsInner}>

          {/* Topic */}
          <div style={S.section}>
            <div style={S.sectionTitle}>🔗 ROS Topic</div>
            <div style={S.row}>
              <span style={S.label}>Topic</span>
              {useCustom ? (
                <input
                  style={{ ...S.input, width: 200 }}
                  value={customTopic}
                  onChange={e => setCustomTopic(e.target.value)}
                  placeholder="/my/lidar/points"
                />
              ) : (
                <select style={S.select} value={settings.topic}
                  onChange={e => update('topic', e.target.value)}>
                  {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              )}
            </div>
            <div style={S.row}>
              <button style={S.toggleBtn(useCustom)} onClick={() => setUseCustom(p => !p)}>
                {useCustom ? '✓ Özel' : 'Özel Gir'}
              </button>
            </div>
          </div>

          {/* Mesaj Tipi */}
          <div style={S.section}>
            <div style={S.sectionTitle}>📦 Mesaj Tipi</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[
                { id: 'auto',  label: 'Otomatik'  },
                { id: 'livox', label: 'Livox'     },
                { id: 'pc2',   label: 'PointCloud2' },
              ].map(m => (
                <button key={m.id} style={S.modeBtn(settings.messageType === m.id)}
                  onClick={() => update('messageType', m.id)}>
                  {m.label}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 10, color: '#8b92a0', fontFamily: 'monospace', lineHeight: 1.6 }}>
              {settings.messageType === 'auto'
                ? '/livox/* → CustomMsg,\n diğer → PointCloud2'
                : settings.messageType === 'livox'
                ? 'livox_ros_driver2/\n   CustomMsg'
                : 'sensor_msgs/\n   PointCloud2'}
            </div>
          </div>

          {/* Renk Modu */}
          <div style={S.section}>
            <div style={S.sectionTitle}>🎨 Renk Modu</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {COLOR_MODES.map(m => (
                <button key={m.id} style={S.modeBtn(settings.colorMode === m.id)}
                  onClick={() => update('colorMode', m.id)}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Renk Ayarları */}
          <div style={S.section}>
            <div style={S.sectionTitle}>🌈 Renk Ayarları</div>
            <div style={S.row}>
              <span style={S.label}>
                {settings.colorMode === 'distance' ? 'Yakın' : settings.colorMode === 'height' ? 'Zemin' : 'Nokta'}
              </span>
              <div style={S.colorBox(settings.groundColor)}>
                <input type="color" style={S.colorInput} value={settings.groundColor}
                  onChange={e => update('groundColor', e.target.value)} />
              </div>
              <span style={{ ...S.stat, fontSize: 10 }}>{settings.groundColor}</span>
            </div>
            {settings.colorMode !== 'intensity' && (
              <>
                <div style={S.row}>
                  <span style={S.label}>Orta</span>
                  <div style={S.colorBox(settings.midColor)}>
                    <input type="color" style={S.colorInput} value={settings.midColor}
                      onChange={e => update('midColor', e.target.value)} />
                  </div>
                  <span style={{ ...S.stat, fontSize: 10 }}>{settings.midColor}</span>
                </div>
                <div style={S.row}>
                  <span style={S.label}>
                    {settings.colorMode === 'distance' ? 'Uzak' : 'Yüksek'}
                  </span>
                  <div style={S.colorBox(settings.farColor)}>
                    <input type="color" style={S.colorInput} value={settings.farColor}
                      onChange={e => update('farColor', e.target.value)} />
                  </div>
                  <span style={{ ...S.stat, fontSize: 10 }}>{settings.farColor}</span>
                </div>
              </>
            )}
          </div>

          {/* Nokta Boyutu */}
          <div style={S.section}>
            <div style={S.sectionTitle}>⚙ Nokta Boyutu</div>
            <div style={S.row}>
              <span style={S.label}>Boyut</span>
              <input type="range" style={S.range} min={0.01} max={0.3} step={0.005}
                value={settings.pointSize}
                onChange={e => update('pointSize', parseFloat(e.target.value))} />
              <span style={{ ...S.stat, minWidth: 36 }}>{settings.pointSize.toFixed(3)}</span>
            </div>
            <div style={S.row}>
              <span style={S.label}>Max Nokta</span>
              <input type="range" style={S.range} min={1000} max={80000} step={1000}
                value={settings.maxPoints}
                onChange={e => update('maxPoints', parseInt(e.target.value))} />
              <span style={{ ...S.stat, minWidth: 46 }}>{settings.maxPoints.toLocaleString()}</span>
            </div>
          </div>

          {/* Yükseklik Aralığı (sadece height modunda) */}
          {settings.colorMode === 'height' && (
            <div style={S.section}>
              <div style={S.sectionTitle}>📐 Yükseklik Aralığı</div>
              <div style={S.row}>
                <span style={S.label}>Min Y</span>
                <input type="range" style={S.range} min={-10} max={0} step={0.5}
                  value={settings.minHeight}
                  onChange={e => update('minHeight', parseFloat(e.target.value))} />
                <span style={{ ...S.stat, minWidth: 30 }}>{settings.minHeight}m</span>
              </div>
              <div style={S.row}>
                <span style={S.label}>Max Y</span>
                <input type="range" style={S.range} min={0} max={20} step={0.5}
                  value={settings.maxHeight}
                  onChange={e => update('maxHeight', parseFloat(e.target.value))} />
                <span style={{ ...S.stat, minWidth: 30 }}>{settings.maxHeight}m</span>
              </div>
            </div>
          )}

          {/* Görünüm */}
          <div style={S.section}>
            <div style={S.sectionTitle}>👁 Görünüm</div>
            <div style={S.row}>
              <span style={S.label}>Grid</span>
              <button style={S.toggleBtn(settings.showGrid)}
                onClick={() => update('showGrid', !settings.showGrid)}>
                {settings.showGrid ? 'Açık' : 'Kapalı'}
              </button>
            </div>
            <div style={S.row}>
              <span style={S.label}>Eksenler</span>
              <button style={S.toggleBtn(settings.showAxes)}
                onClick={() => update('showAxes', !settings.showAxes)}>
                {settings.showAxes ? 'Açık' : 'Kapalı'}
              </button>
            </div>
            <div style={S.row}>
              <span style={S.label}>Oto Dön</span>
              <button style={S.toggleBtn(settings.autoRotate)}
                onClick={() => update('autoRotate', !settings.autoRotate)}>
                {settings.autoRotate ? 'Açık' : 'Kapalı'}
              </button>
            </div>
            <div style={S.row}>
              <span style={S.label}>Arkaplan</span>
              <div style={S.colorBox(settings.bgColor)}>
                <input type="color" style={S.colorInput} value={settings.bgColor}
                  onChange={e => update('bgColor', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Kamera */}
          <div style={S.section}>
            <div style={S.sectionTitle}>📷 Kamera</div>
            <button style={S.resetBtn} onClick={resetCamera}>
              ↺ Sıfırla
            </button>
            <div style={{ fontSize: 10, color: '#8b92a0', fontFamily: 'monospace',
                          lineHeight: 1.7, marginTop: 4 }}>
              Sol tık: Döndür<br />
              Sağ tık: Kaydır<br />
              Scroll: Zoom
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LidarVisualization;
