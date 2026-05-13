import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useROSTopic } from '../../hooks/useROS';

const LiDAR3D = ({ ros, topic = '/livox/lidar' }) => {
  // Auto-detect message type: /livox/* → Livox CustomMsg, else PointCloud2
  const messageType = topic.includes('/livox/')
    ? 'livox_ros_driver2/msg/CustomMsg'
    : 'sensor_msgs/msg/PointCloud2';
  const { data } = useROSTopic(ros, topic, messageType, 50);
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const pointsRef = useRef(null);
  const animationRef = useRef(null);
  const resizeTimeoutRef = useRef(null);
  const [isResizing, setIsResizing] = useState(false);
  const [pointCount, setPointCount] = useState(0);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e1a);
    sceneRef.current = scene;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 8, 12);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // OrbitControls — kullanıcı mouse ile döndürebilir, otomatik dönmez
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 1;
    controls.maxDistance = 100;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // Grid
    const gridHelper = new THREE.GridHelper(20, 20, 0x00ff41, 0x1a3a2a);
    scene.add(gridHelper);

    // Axes
    const axesHelper = new THREE.AxesHelper(3);
    scene.add(axesHelper);

    // Initial empty point cloud
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.9
    });
    const points = new THREE.Points(geometry, material);
    scene.add(points);
    pointsRef.current = points;

    // Animation — SADECE controls güncelle, kamera/nokta bulutu dönmez
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      setIsResizing(true);
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
      const newWidth = mountRef.current.clientWidth;
      const newHeight = mountRef.current.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight, false);
      resizeTimeoutRef.current = setTimeout(() => setIsResizing(false), 100);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(mountRef.current);
    window.addEventListener('resize', handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      controls.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (mountRef.current && renderer.domElement && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Point cloud parser — auto-handles Livox CustomMsg and PointCloud2
  useEffect(() => {
    if (!data || !pointsRef.current) return;

    try {
      const positions = [];
      const colors = [];
      let validCount = 0;

      // ── Livox CustomMsg: data.points is an array of {x, y, z, reflectivity} ──
      if (Array.isArray(data.points)) {
        const pts = data.points;
        const total = pts.length;
        const maxPoints = 50000;
        const step = Math.max(1, Math.floor(total / maxPoints));

        for (let i = 0; i < total; i += step) {
          const p = pts[i];
          if (!p) continue;
          const x = p.x, y = p.y, z = p.z;
          if (!isFinite(x) || !isFinite(y) || !isFinite(z)) continue;
          if (Math.abs(x) > 100 || Math.abs(y) > 100 || Math.abs(z) > 100) continue;

          // ROS (x forward, y left, z up) → three.js (x, z, -y)
          positions.push(x, z, -y);

          const intensity = Math.min(1, (p.reflectivity || 0) / 255);
          const color = new THREE.Color();
          const normalizedZ = Math.min(1, Math.max(0, (z + 2) / 5));
          color.setHSL(0.6 - normalizedZ * 0.4, 1.0, 0.3 + intensity * 0.4);
          colors.push(color.r, color.g, color.b);
          validCount++;
        }
      }
      // ── sensor_msgs/PointCloud2: base64 string OR Uint8Array (cbor) ──
      else if (data.data) {
        const fields = data.fields || [];
        const fieldMap = {};
        fields.forEach(f => { fieldMap[f.name] = f; });

        const xField = fieldMap['x'];
        const yField = fieldMap['y'];
        const zField = fieldMap['z'];
        const intensityField = fieldMap['intensity'] || fieldMap['i'];

        if (!xField || !yField || !zField) {
          console.warn('LiDAR: x/y/z alanları bulunamadı', fields);
          return;
        }

        let bytes;
        if (typeof data.data === 'string') {
          const binaryStr = atob(data.data);
          bytes = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
        } else if (data.data instanceof Uint8Array) {
          bytes = data.data;
        } else if (data.data.buffer) {
          bytes = new Uint8Array(data.data.buffer, data.data.byteOffset || 0, data.data.byteLength);
        } else {
          return;
        }
        const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        const isLittleEndian = !data.is_bigendian;

        const pointStep = data.point_step;
        const totalPoints = data.width * data.height;
        const maxPoints = 50000;
        const step = Math.max(1, Math.floor(totalPoints / maxPoints));

        for (let i = 0; i < totalPoints; i += step) {
          const offset = i * pointStep;
          if (offset + zField.offset + 4 > bytes.byteLength) break;
          const x = view.getFloat32(offset + xField.offset, isLittleEndian);
          const y = view.getFloat32(offset + yField.offset, isLittleEndian);
          const z = view.getFloat32(offset + zField.offset, isLittleEndian);

          if (!isFinite(x) || !isFinite(y) || !isFinite(z)) continue;
          if (Math.abs(x) > 100 || Math.abs(y) > 100 || Math.abs(z) > 100) continue;

          positions.push(x, z, -y);

          let intensity = 0.5;
          if (intensityField) {
            const rawIntensity = view.getFloat32(offset + intensityField.offset, isLittleEndian);
            intensity = Math.min(1, rawIntensity / 255);
          }

          const color = new THREE.Color();
          const normalizedZ = Math.min(1, Math.max(0, (z + 2) / 5));
          color.setHSL(0.6 - normalizedZ * 0.4, 1.0, 0.3 + intensity * 0.4);
          colors.push(color.r, color.g, color.b);
          validCount++;
        }
      } else {
        return;
      }

      const geometry = pointsRef.current.geometry;
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('color',    new THREE.Float32BufferAttribute(colors, 3));
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.color.needsUpdate    = true;
      geometry.computeBoundingSphere();

      setPointCount(validCount);
    } catch (err) {
      console.error('LiDAR parse hatası:', err);
    }
  }, [data]);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      background: '#0a0e1a'
    }}>
      <div
        ref={mountRef}
        style={{
          width: '100%',
          height: '100%',
          opacity: isResizing ? 0.95 : 1,
          transition: 'opacity 0.1s ease',
          cursor: 'grab'
        }}
      />

      {/* Sol üst: kontrol ipucu */}
      <div style={{
        position: 'absolute',
        top: '8px',
        left: '8px',
        fontSize: '9px',
        color: 'rgba(0,255,65,0.5)',
        fontFamily: 'monospace',
        pointerEvents: 'none',
        lineHeight: '1.6'
      }}>
        🖱 Sol tık: döndür &nbsp;|&nbsp; Sağ tık: kaydır &nbsp;|&nbsp; Scroll: zoom
      </div>

      {/* Sağ alt: bilgi */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        right: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        pointerEvents: 'none'
      }}>
        <span style={badgeStyle('#00ff41')}>Topic: {topic}</span>
        <span style={badgeStyle('#00ff41')}>Points: {pointCount}</span>
        {!data && <span style={badgeStyle('#ffaa00', '#000')}>Veri bekleniyor...</span>}
      </div>
    </div>
  );
};

const badgeStyle = (borderColor, color = '#00ff41') => ({
  fontSize: '9px',
  padding: '4px 8px',
  background: 'rgba(0,0,0,0.7)',
  border: `1px solid ${borderColor}40`,
  borderRadius: '4px',
  color,
  fontFamily: 'monospace',
  backdropFilter: 'blur(4px)'
});

export default LiDAR3D;
