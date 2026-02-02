import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const LiDAR3D = ({ topic = '/velodyne_points' }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e1a);
    sceneRef.current = scene;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Grid
    const gridHelper = new THREE.GridHelper(20, 20, 0x00ff41, 0x1a3a2a);
    scene.add(gridHelper);

    // Axes
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // Point cloud simulation
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];

    for (let i = 0; i < 5000; i++) {
      const x = (Math.random() - 0.5) * 10;
      const y = Math.random() * 3;
      const z = (Math.random() - 0.5) * 10;
      positions.push(x, y, z);

      const color = new THREE.Color();
      color.setHSL(0.3 + y * 0.1, 1, 0.5);
      colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({ 
      size: 0.05, 
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Animation
    let angle = 0;
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      angle += 0.005;
      camera.position.x = Math.cos(angle) * 8;
      camera.position.z = Math.sin(angle) * 8;
      camera.lookAt(0, 0, 0);
      
      points.rotation.y += 0.001;
      
      renderer.render(scene, camera);
    };
    animate();

    // KRITIK: Resize handler - panel büyüdükçe canvas de büyüsün
    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      
      const newWidth = mountRef.current.clientWidth;
      const newHeight = mountRef.current.clientHeight;
      
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    // ResizeObserver - panel boyutu değiştiğinde tetiklenir
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(mountRef.current);

    // Window resize
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      
      <div style={{
        position: 'absolute',
        bottom: '12px',
        right: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <span style={{
          fontSize: '9px',
          padding: '4px 8px',
          background: 'rgba(0, 0, 0, 0.7)',
          border: '1px solid rgba(0, 255, 65, 0.3)',
          borderRadius: '4px',
          color: '#00ff41',
          fontFamily: 'monospace',
          backdropFilter: 'blur(4px)'
        }}>
          Topic: {topic}
        </span>
        <span style={{
          fontSize: '9px',
          padding: '4px 8px',
          background: 'rgba(0, 0, 0, 0.7)',
          border: '1px solid rgba(0, 255, 65, 0.3)',
          borderRadius: '4px',
          color: '#00ff41',
          fontFamily: 'monospace',
          backdropFilter: 'blur(4px)'
        }}>
          Points: 5000
        </span>
      </div>
    </div>
  );
};

export default LiDAR3D;
