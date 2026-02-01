import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const LiDAR3D = ({ topic = '/lidar/points' }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
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

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

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
      
      // Rotate point cloud slightly
      points.rotation.y += 0.001;
      
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
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
    <div className="lidar-view">
      <div ref={mountRef} className="lidar-canvas"></div>
      <div className="lidar-info">
        <span className="topic-badge">Topic: {topic}</span>
        <span className="points-badge">Points: 5000</span>
      </div>

      <style jsx>{`
        .lidar-view {
          width: 100%;
          height: 100%;
          position: relative;
          overflow: hidden;
        }

        .lidar-canvas {
          width: 100%;
          height: 100%;
        }

        .lidar-info {
          position: absolute;
          bottom: 12px;
          right: 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .topic-badge,
        .points-badge {
          font-size: 9px;
          padding: 4px 8px;
          background: rgba(0, 0, 0, 0.7);
          border: 1px solid rgba(0, 255, 65, 0.3);
          border-radius: 4px;
          color: #00ff41;
          font-family: monospace;
          backdrop-filter: blur(4px);
        }
      `}</style>
    </div>
  );
};

export default LiDAR3D;
