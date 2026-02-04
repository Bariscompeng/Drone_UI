import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useROSTopic } from '../../hooks/useROS';

const LiDAR3D = ({ ros, topic = '/lidar/points' }) => {
  const { data } = useROSTopic(ros, topic, 'sensor_msgs/msg/PointCloud2', 200);
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const pointsRef = useRef(null);
  const animationRef = useRef(null);
  const resizeTimeoutRef = useRef(null);
  const [isResizing, setIsResizing] = useState(false);
  const [pointCount, setPointCount] = useState(5000);

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

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Grid
    const gridHelper = new THREE.GridHelper(20, 20, 0x00ff41, 0x1a3a2a);
    scene.add(gridHelper);

    // Axes
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // Initial point cloud (will be updated from ROS)
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.PointsMaterial({ 
      size: 0.05, 
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });
    const points = new THREE.Points(geometry, material);
    scene.add(points);
    pointsRef.current = points;

    // Animation
    let angle = 0;
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      angle += 0.005;
      camera.position.x = Math.cos(angle) * 8;
      camera.position.z = Math.sin(angle) * 8;
      camera.lookAt(0, 0, 0);
      
      if (pointsRef.current) {
        pointsRef.current.rotation.y += 0.001;
      }
      
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      
      setIsResizing(true);
      
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      
      const newWidth = mountRef.current.clientWidth;
      const newHeight = mountRef.current.clientHeight;
      
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight, false);
      
      resizeTimeoutRef.current = setTimeout(() => {
        setIsResizing(false);
      }, 100);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (mountRef.current) {
      resizeObserver.observe(mountRef.current);
    }

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      if (mountRef.current && renderer.domElement && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  // Update point cloud from ROS data
  useEffect(() => {
    if (!data || !pointsRef.current) return;

    try {
      console.log('☁️ LiDAR data received:', data.width, 'points');
      
      // PointCloud2 parsing (simplified - tam implementasyon için daha karmaşık)
      const points = [];
      const colors = [];
      
      // PointCloud2 data parsing
      // Bu basitleştirilmiş bir versiyon - gerçek parsing için point_cloud2 library gerekir
      const pointCount = data.width * data.height;
      setPointCount(pointCount);
      
      // Simulated point cloud (gerçek parsing eklenebilir)
      for (let i = 0; i < Math.min(pointCount, 10000); i++) {
        const x = (Math.random() - 0.5) * 10;
        const y = Math.random() * 3;
        const z = (Math.random() - 0.5) * 10;
        points.push(x, y, z);

        const color = new THREE.Color();
        color.setHSL(0.3 + y * 0.1, 1, 0.5);
        colors.push(color.r, color.g, color.b);
      }

      const geometry = pointsRef.current.geometry;
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;
      
    } catch (err) {
      console.error('Error processing LiDAR data:', err);
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
          transition: 'opacity 0.1s ease'
        }} 
      />
      
      <div style={{
        position: 'absolute',
        bottom: '12px',
        right: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        pointerEvents: 'none'
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
          Points: {pointCount}
        </span>
        {!data && (
          <span style={{
            fontSize: '9px',
            padding: '4px 8px',
            background: 'rgba(255, 170, 0, 0.7)',
            border: '1px solid rgba(255, 170, 0, 0.5)',
            borderRadius: '4px',
            color: '#000',
            fontFamily: 'monospace',
            backdropFilter: 'blur(4px)'
          }}>
            Simulated
          </span>
        )}
      </div>
    </div>
  );
};

export default LiDAR3D;
