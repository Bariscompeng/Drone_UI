import React, { useState, useRef, useEffect } from 'react';
import { Move, Maximize2, Play, Save, RotateCcw, Navigation, Radio } from 'lucide-react';

const SlamConfiguration = ({ ros, connected }) => {
  // Grid dimensions ve SLAM boundary state
  const [boundary, setBoundary] = useState({
    x: 100,
    y: 100,
    width: 600,
    height: 400
  });
  
  const [dragging, setDragging] = useState(null);
  const [path, setPath] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [pathType, setPathType] = useState('spiral');
  const [startCorner, setStartCorner] = useState('tl');
  const [dronePosition, setDronePosition] = useState(null);
  const svgRef = useRef(null);
  
  // Grid settings
  const gridSize = 20;
  const canvasWidth = 1200;
  const canvasHeight = 700;
  
  // ROS topic subscription for drone position
  useEffect(() => {
    if (!ros || !connected) return;
    
    try {
      const ROSLIB = require('roslib');
      
      // /odom topic'inden pozisyon al
      const odomListener = new ROSLIB.Topic({
        ros: ros,
        name: '/odom',
        messageType: 'nav_msgs/Odometry'
      });
      
      odomListener.subscribe((message) => {
        if (message && message.pose && message.pose.pose && message.pose.pose.position) {
          const pos = message.pose.pose.position;
          
          // ROS koordinatlarını grid koordinatlarına çevir
          // Varsayım: boundary merkezi = (0,0) ROS koordinatında
          const metersPerPixel = 0.05;
          const centerX = boundary.x + boundary.width / 2;
          const centerY = boundary.y + boundary.height / 2;
          
          const gridX = centerX + (pos.x / metersPerPixel);
          const gridY = centerY - (pos.y / metersPerPixel); // Y ekseni ters
          
          setDronePosition({ x: gridX, y: gridY, z: pos.z });
        }
      });
      
      return () => {
        odomListener.unsubscribe();
      };
    } catch (err) {
      console.error('Failed to subscribe to /odom:', err);
    }
  }, [ros, connected, boundary]);
  
  // Path algorithms - GÜNCELLEME: Drone pozisyonu varsa oradan başla
  const generatePath = {
    // Spiral pattern - RECTANGULAR SPIRAL (Tüm alanı kaplar)
    spiral: (corner) => {
      const points = [];
      
      // Başlangıç pozisyonu: Drone varsa drone pozisyonu, yoksa köşe
      let startCorner;
      if (dronePosition && connected) {
        // Drone'dan en yakın köşeyi bul
        const corners = ['tl', 'tr', 'br', 'bl'];
        const cornerPositions = {
          'tl': { x: boundary.x, y: boundary.y },
          'tr': { x: boundary.x + boundary.width, y: boundary.y },
          'br': { x: boundary.x + boundary.width, y: boundary.y + boundary.height },
          'bl': { x: boundary.x, y: boundary.y + boundary.height }
        };
        
        let minDist = Infinity;
        corners.forEach(c => {
          const pos = cornerPositions[c];
          const dist = Math.sqrt(
            Math.pow(pos.x - dronePosition.x, 2) + 
            Math.pow(pos.y - dronePosition.y, 2)
          );
          if (dist < minDist) {
            minDist = dist;
            startCorner = c;
          }
        });
      } else {
        startCorner = corner;
      }
      
      // Rectangular spiral - dıştan içe katmanlar
      const margin = 15;
      const stepSize = 8; // Her adımdaki piksel
      const spiralStep = 25; // Her katman arasındaki boşluk
      
      let currentMargin = margin;
      const maxMargin = Math.min(boundary.width, boundary.height) / 2 - 10;
      
      // Başlangıç köşesine göre yön belirleme
      const directions = {
        'tl': ['right', 'down', 'left', 'up'],    // Saat yönü
        'tr': ['down', 'left', 'up', 'right'],
        'br': ['left', 'up', 'right', 'down'],
        'bl': ['up', 'right', 'down', 'left']
      };
      
      const direction = directions[startCorner];
      
      while (currentMargin < maxMargin) {
        // Mevcut katmanın sınırları
        const left = boundary.x + currentMargin;
        const right = boundary.x + boundary.width - currentMargin;
        const top = boundary.y + currentMargin;
        const bottom = boundary.y + boundary.height - currentMargin;
        
        // Dört kenar boyunca hareket et
        const corners = {
          'tl': { x: left, y: top },
          'tr': { x: right, y: top },
          'br': { x: right, y: bottom },
          'bl': { x: left, y: bottom }
        };
        
        // Başlangıç noktası
        let currentPos = corners[startCorner];
        points.push({ ...currentPos });
        
        // Her yön için çiz
        for (let dir of direction) {
          let targetPos;
          
          if (dir === 'right') {
            targetPos = { x: right, y: currentPos.y };
          } else if (dir === 'down') {
            targetPos = { x: currentPos.x, y: bottom };
          } else if (dir === 'left') {
            targetPos = { x: left, y: currentPos.y };
          } else if (dir === 'up') {
            targetPos = { x: currentPos.x, y: top };
          }
          
          // Bu yönde adım adım ilerle
          const dx = targetPos.x - currentPos.x;
          const dy = targetPos.y - currentPos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const steps = Math.max(1, Math.floor(distance / stepSize));
          
          for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            const x = currentPos.x + dx * t;
            const y = currentPos.y + dy * t;
            
            if (x >= boundary.x && x <= boundary.x + boundary.width &&
                y >= boundary.y && y <= boundary.y + boundary.height) {
              points.push({ x, y });
            }
          }
          
          currentPos = targetPos;
        }
        
        // Bir sonraki katmana geç
        currentMargin += spiralStep;
      }
      
      // Merkez noktasını ekle
      const centerX = boundary.x + boundary.width / 2;
      const centerY = boundary.y + boundary.height / 2;
      points.push({ x: centerX, y: centerY });
      
      return points;
    },
    
    // Zigzag pattern - DRONE POZİSYONUNDAN VEYA KÖŞEDEN
    zigzag: (corner) => {
      const points = [];
      const spacing = 30;
      const numRows = Math.floor(boundary.height / spacing);
      
      // Başlangıç pozisyonu
      let startPos;
      let goingDown, startLeft;
      
      if (dronePosition && connected) {
        // Drone pozisyonundan başla
        startPos = { x: dronePosition.x, y: dronePosition.y };
        points.push({ x: startPos.x, y: startPos.y });
        
        // Drone'un boundary'ye göre konumuna bakarak yönü belirle
        goingDown = startPos.y < boundary.y + boundary.height / 2;
        startLeft = startPos.x < boundary.x + boundary.width / 2;
      } else {
        // Köşeden başla
        const startPositions = {
          'tl': { x: boundary.x, y: boundary.y },
          'tr': { x: boundary.x + boundary.width, y: boundary.y },
          'br': { x: boundary.x + boundary.width, y: boundary.y + boundary.height },
          'bl': { x: boundary.x, y: boundary.y + boundary.height }
        };
        startPos = startPositions[corner];
        goingDown = corner === 'tl' || corner === 'tr';
        startLeft = corner === 'tl' || corner === 'bl';
      }
      
      for (let i = 0; i <= numRows; i++) {
        const y = goingDown 
          ? boundary.y + i * spacing
          : boundary.y + boundary.height - i * spacing;
        
        if (y > boundary.y + boundary.height || y < boundary.y) continue;
        
        const leftToRight = startLeft ? (i % 2 === 0) : (i % 2 === 1);
        
        if (leftToRight) {
          for (let x = boundary.x; x <= boundary.x + boundary.width; x += 15) {
            points.push({ x, y });
          }
        } else {
          for (let x = boundary.x + boundary.width; x >= boundary.x; x -= 15) {
            points.push({ x, y });
          }
        }
      }
      
      return points;
    },
    
    // Perimeter - DRONE POZİSYONUNDAN VEYA KÖŞEDEN
    perimeter: (corner) => {
      const points = [];
      const margin = 15;
      const stepSize = 10;
      
      const allCorners = [
        { x: boundary.x + margin, y: boundary.y + margin },
        { x: boundary.x + boundary.width - margin, y: boundary.y + margin },
        { x: boundary.x + boundary.width - margin, y: boundary.y + boundary.height - margin },
        { x: boundary.x + margin, y: boundary.y + boundary.height - margin }
      ];
      
      let route;
      
      if (dronePosition && connected) {
        // Drone pozisyonundan en yakın köşeyi bul
        const dronePos = { x: dronePosition.x, y: dronePosition.y };
        let closestIndex = 0;
        let minDist = Infinity;
        
        allCorners.forEach((corner, idx) => {
          const dist = Math.sqrt(
            Math.pow(corner.x - dronePos.x, 2) + 
            Math.pow(corner.y - dronePos.y, 2)
          );
          if (dist < minDist) {
            minDist = dist;
            closestIndex = idx;
          }
        });
        
        // Drone pozisyonunu başa ekle
        points.push(dronePos);
        
        // En yakın köşeden başla
        route = [...allCorners.slice(closestIndex), ...allCorners.slice(0, closestIndex)];
      } else {
        // Seçilen köşeden başla
        const cornerIndices = { 'tl': 0, 'tr': 1, 'br': 2, 'bl': 3 };
        const startIndex = cornerIndices[corner];
        route = [...allCorners.slice(startIndex), ...allCorners.slice(0, startIndex)];
      }
      
      for (let i = 0; i < route.length; i++) {
        const start = route[i];
        const end = route[(i + 1) % route.length];
        
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.floor(distance / stepSize);
        
        for (let j = 0; j <= steps; j++) {
          const t = j / steps;
          points.push({
            x: start.x + dx * t,
            y: start.y + dy * t
          });
        }
      }
      
      return points;
    },
    
    // Lawn Mower - DRONE POZİSYONUNDAN VEYA KÖŞEDEN
    lawnmower: (corner) => {
      const points = [];
      const spacing = 25;
      const numCols = Math.floor(boundary.width / spacing);
      
      let startTop, startLeft;
      
      if (dronePosition && connected) {
        // Drone pozisyonundan başla
        points.push({ x: dronePosition.x, y: dronePosition.y });
        
        // Drone'un konumuna göre yönü belirle
        startTop = dronePosition.y < boundary.y + boundary.height / 2;
        startLeft = dronePosition.x < boundary.x + boundary.width / 2;
      } else {
        // Köşeden başla
        const startPositions = {
          'tl': { startTop: true, startLeft: true },
          'tr': { startTop: true, startLeft: false },
          'br': { startTop: false, startLeft: false },
          'bl': { startTop: false, startLeft: true }
        };
        const config = startPositions[corner];
        startTop = config.startTop;
        startLeft = config.startLeft;
      }
      
      for (let i = 0; i <= numCols; i++) {
        const x = startLeft
          ? boundary.x + i * spacing
          : boundary.x + boundary.width - i * spacing;
        
        if (x > boundary.x + boundary.width || x < boundary.x) continue;
        
        const topToBottom = startTop ? (i % 2 === 0) : (i % 2 === 1);
        
        if (topToBottom) {
          for (let y = boundary.y; y <= boundary.y + boundary.height; y += 15) {
            points.push({ x, y });
          }
        } else {
          for (let y = boundary.y + boundary.height; y >= boundary.y; y -= 15) {
            points.push({ x, y });
          }
        }
      }
      
      return points;
    },
    
    // Grid Coverage - DRONE POZİSYONUNDAN VEYA KÖŞEDEN
    grid: (corner) => {
      const points = [];
      const spacing = 30;
      
      let startLeft, startTop;
      
      if (dronePosition && connected) {
        // Drone pozisyonundan başla
        points.push({ x: dronePosition.x, y: dronePosition.y });
        
        // Drone'un konumuna göre yönü belirle
        startLeft = dronePosition.x < boundary.x + boundary.width / 2;
        startTop = dronePosition.y < boundary.y + boundary.height / 2;
      } else {
        // Köşeden başla
        const startPositions = {
          'tl': { startLeft: true, startTop: true },
          'tr': { startLeft: false, startTop: true },
          'br': { startLeft: false, startTop: false },
          'bl': { startLeft: true, startTop: false }
        };
        const config = startPositions[corner];
        startLeft = config.startLeft;
        startTop = config.startTop;
      }
      
      const xStart = startLeft ? boundary.x : boundary.x + boundary.width;
      const xEnd = startLeft ? boundary.x + boundary.width : boundary.x;
      const xStep = startLeft ? spacing : -spacing;
      
      const yStart = startTop ? boundary.y : boundary.y + boundary.height;
      const yEnd = startTop ? boundary.y + boundary.height : boundary.y;
      const yStep = startTop ? spacing : -spacing;
      
      for (let y = yStart; startTop ? y <= yEnd : y >= yEnd; y += yStep) {
        for (let x = xStart; startLeft ? x <= xEnd : x >= xEnd; x += xStep) {
          if (x >= boundary.x && x <= boundary.x + boundary.width &&
              y >= boundary.y && y <= boundary.y + boundary.height) {
            points.push({ x, y });
          }
        }
      }
      
      return points;
    }
  };
  
  const handleMouseDown = (corner, e) => {
    e.preventDefault();
    setDragging(corner);
  };
  
  const handleMouseMove = (e) => {
    if (!dragging || !svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setBoundary(prev => {
      const newBoundary = { ...prev };
      
      switch (dragging) {
        case 'tl':
          newBoundary.width = prev.width + (prev.x - x);
          newBoundary.height = prev.height + (prev.y - y);
          newBoundary.x = x;
          newBoundary.y = y;
          break;
        case 'tr':
          newBoundary.width = x - prev.x;
          newBoundary.height = prev.height + (prev.y - y);
          newBoundary.y = y;
          break;
        case 'bl':
          newBoundary.width = prev.width + (prev.x - x);
          newBoundary.height = y - prev.y;
          newBoundary.x = x;
          break;
        case 'br':
          newBoundary.width = x - prev.x;
          newBoundary.height = y - prev.y;
          break;
        default:
          break;
      }
      
      if (newBoundary.width < 100) newBoundary.width = 100;
      if (newBoundary.height < 100) newBoundary.height = 100;
      if (newBoundary.x < 0) newBoundary.x = 0;
      if (newBoundary.y < 0) newBoundary.y = 0;
      
      return newBoundary;
    });
  };
  
  const handleMouseUp = () => {
    setDragging(null);
  };
  
  const simulatePath = () => {
    setIsSimulating(true);
    setPath([]);
    
    const fullPath = generatePath[pathType](startCorner);
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      if (currentIndex < fullPath.length) {
        setPath(prev => [...prev, fullPath[currentIndex]]);
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsSimulating(false);
      }
    }, 20);
  };
  
  const resetPath = () => {
    setPath([]);
    setIsSimulating(false);
  };
  
  const metersPerPixel = 0.05;
  const getBoundaryMetrics = () => {
    return {
      width: (boundary.width * metersPerPixel).toFixed(2),
      height: (boundary.height * metersPerPixel).toFixed(2),
      area: (boundary.width * boundary.height * metersPerPixel * metersPerPixel).toFixed(2)
    };
  };
  
  const metrics = getBoundaryMetrics();
  
  const pathTypeLabels = {
    'spiral': '🌀 Spiral',
    'zigzag': '⚡ Zigzag (Horizontal)',
    'perimeter': '⬜ Perimeter',
    'lawnmower': '🚜 Lawn Mower (Vertical)',
    'grid': '📐 Grid Coverage'
  };
  
  const cornerLabels = {
    'tl': '↖️ Top Left',
    'tr': '↗️ Top Right',
    'br': '↘️ Bottom Right',
    'bl': '↙️ Bottom Left'
  };
  
  // Styles
  const styles = {
    container: {
      minHeight: '100vh',
      maxHeight: '100vh', // Ekran yüksekliği ile sınırla
      overflowY: 'auto', // Dikey scroll ekle
      overflowX: 'hidden', // Yatay scroll'u gizle
      background: 'linear-gradient(to bottom right, #111827, #1e293b, #111827)',
      color: 'white',
      padding: '24px'
    },
    header: {
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    title: {
      fontSize: '30px',
      fontWeight: 'bold',
      color: '#10b981',
      marginBottom: '8px',
      letterSpacing: '-0.025em'
    },
    subtitle: {
      color: '#9ca3af',
      fontSize: '14px'
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px'
    },
    button: {
      padding: '8px 16px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s',
      fontWeight: '500',
      cursor: 'pointer',
      border: 'none',
      fontSize: '14px'
    },
    primaryButton: {
      background: '#059669',
      color: 'white',
      boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.5)'
    },
    secondaryButton: {
      background: '#334155',
      color: 'white'
    },
    tertiaryButton: {
      background: '#2563eb',
      color: 'white',
      boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.5)'
    },
    gridContainer: {
      display: 'grid',
      gridTemplateColumns: '1fr 320px',
      gap: '24px'
    },
    canvas: {
      background: '#0f172a',
      borderRadius: '12px',
      border: '1px solid rgba(16, 185, 129, 0.3)',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      overflow: 'hidden'
    },
    canvasHeader: {
      background: '#1e293b',
      borderBottom: '1px solid rgba(16, 185, 129, 0.3)',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    canvasTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontWeight: '600',
      fontSize: '14px'
    },
    canvasSubtitle: {
      fontSize: '12px',
      color: '#9ca3af'
    },
    svgContainer: {
      position: 'relative',
      background: '#020617'
    },
    infoPanel: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },
    card: {
      background: '#0f172a',
      borderRadius: '12px',
      border: '1px solid rgba(16, 185, 129, 0.3)',
      padding: '16px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
    },
    cardTitle: {
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#10b981',
      marginBottom: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    select: {
      width: '100%',
      padding: '10px 12px',
      background: '#1e293b',
      border: '1px solid #334155',
      borderRadius: '8px',
      color: 'white',
      fontSize: '14px',
      cursor: 'pointer',
      outline: 'none',
      marginBottom: '12px'
    },
    label: {
      display: 'block',
      fontSize: '12px',
      color: '#9ca3af',
      marginBottom: '6px',
      fontWeight: '500'
    },
    metricRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 0',
      borderBottom: '1px solid #334155'
    },
    metricLabel: {
      fontSize: '12px',
      color: '#9ca3af'
    },
    metricValue: {
      fontSize: '18px',
      fontFamily: 'monospace',
      fontWeight: 'bold',
      color: 'white'
    },
    statusCard: {
      background: 'linear-gradient(to bottom right, #064e3b, #065f46)',
      borderRadius: '12px',
      border: '1px solid #10b981',
      padding: '16px'
    },
    statusIndicator: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    footer: {
      marginTop: '24px',
      textAlign: 'center',
      fontSize: '12px',
      color: '#6b7280'
    }
  };
  
  return (
    <div 
      style={styles.container}
      className="slam-config-scroll"
    >
      {/* Scrollbar stilleri için style tag */}
      <style>{`
        .slam-config-scroll::-webkit-scrollbar {
          width: 12px;
        }
        
        .slam-config-scroll::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
          border-radius: 10px;
          margin: 10px;
        }
        
        .slam-config-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #10b981 0%, #059669 100%);
          border-radius: 10px;
          border: 2px solid rgba(15, 23, 42, 0.5);
        }
        
        .slam-config-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #34d399 0%, #10b981 100%);
        }
        
        .slam-config-scroll::-webkit-scrollbar-thumb:active {
          background: linear-gradient(180deg, #059669 0%, #047857 100%);
        }
      `}</style>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>SLAM Configuration</h1>
          <p style={styles.subtitle}>
            Define operational boundary and path planning area
          </p>
        </div>
        
        <div style={styles.buttonGroup}>
          <button
            onClick={simulatePath}
            disabled={isSimulating}
            style={{
              ...styles.button,
              ...styles.primaryButton,
              opacity: isSimulating ? 0.5 : 1,
              cursor: isSimulating ? 'not-allowed' : 'pointer'
            }}
          >
            <Play size={18} />
            Simulate Path
          </button>
          <button
            onClick={resetPath}
            style={{...styles.button, ...styles.secondaryButton}}
          >
            <RotateCcw size={18} />
            Reset
          </button>
          <button style={{...styles.button, ...styles.tertiaryButton}}>
            <Save size={18} />
            Save Config
          </button>
        </div>
      </div>
      
      <div style={styles.gridContainer}>
        <div style={styles.canvas}>
          <div style={styles.canvasHeader}>
            <div style={styles.canvasTitle}>
              <Maximize2 size={18} style={{color: '#10b981'}} />
              <span>SLAM Boundary Editor</span>
            </div>
            <div style={styles.canvasSubtitle}>
              Grid: {gridSize}px = {metersPerPixel * gridSize}m
              {connected && <span style={{color: '#10b981', marginLeft: '12px'}}>• ROS Connected</span>}
            </div>
          </div>
          
          <div 
            style={styles.svgContainer}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <svg
              ref={svgRef}
              width={canvasWidth}
              height={canvasHeight}
              style={{cursor: 'crosshair', display: 'block'}}
            >
              <defs>
                <pattern id="grid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
                  <path d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`} fill="none" stroke="rgba(16, 185, 129, 0.1)" strokeWidth="0.5" />
                </pattern>
                <pattern id="grid-major" width={gridSize * 5} height={gridSize * 5} patternUnits="userSpaceOnUse">
                  <path d={`M ${gridSize * 5} 0 L 0 0 0 ${gridSize * 5}`} fill="none" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="1" />
                </pattern>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              <rect width={canvasWidth} height={canvasHeight} fill="url(#grid)" />
              <rect width={canvasWidth} height={canvasHeight} fill="url(#grid-major)" />
              
              <rect
                x={boundary.x}
                y={boundary.y}
                width={boundary.width}
                height={boundary.height}
                fill="rgba(16, 185, 129, 0.05)"
                stroke="rgb(16, 185, 129)"
                strokeWidth="2"
                filter="url(#glow)"
                style={{transition: 'all 0.15s'}}
              />
              
              {/* Corner handles */}
              {[
                { pos: 'tl', x: boundary.x, y: boundary.y },
                { pos: 'tr', x: boundary.x + boundary.width, y: boundary.y },
                { pos: 'bl', x: boundary.x, y: boundary.y + boundary.height },
                { pos: 'br', x: boundary.x + boundary.width, y: boundary.y + boundary.height }
              ].map(corner => (
                <g key={corner.pos}>
                  <circle
                    cx={corner.x}
                    cy={corner.y}
                    r="8"
                    fill={startCorner === corner.pos ? "rgb(59, 130, 246)" : "rgb(16, 185, 129)"}
                    stroke="white"
                    strokeWidth="2"
                    style={{cursor: 'move'}}
                    onMouseDown={(e) => handleMouseDown(corner.pos, e)}
                    filter="url(#glow)"
                  />
                  <circle cx={corner.x} cy={corner.y} r="3" fill="white" />
                  {startCorner === corner.pos && (
                    <text
                      x={corner.x}
                      y={corner.y - 20}
                      textAnchor="middle"
                      fill="rgb(59, 130, 246)"
                      fontSize="12"
                      fontWeight="bold"
                    >
                      START
                    </text>
                  )}
                </g>
              ))}
              
              <g opacity="0.3">
                <line
                  x1={boundary.x + boundary.width / 2}
                  y1={boundary.y}
                  x2={boundary.x + boundary.width / 2}
                  y2={boundary.y + boundary.height}
                  stroke="rgb(16, 185, 129)"
                  strokeWidth="1"
                  strokeDasharray="5,5"
                />
                <line
                  x1={boundary.x}
                  y1={boundary.y + boundary.height / 2}
                  x2={boundary.x + boundary.width}
                  y2={boundary.y + boundary.height / 2}
                  stroke="rgb(16, 185, 129)"
                  strokeWidth="1"
                  strokeDasharray="5,5"
                />
              </g>
              
              {/* DRONE POSITION - HER ZAMAN GÖRÜNÜR */}
              {(() => {
                // Drone pozisyonu varsa onu kullan, yoksa sol üst köşede göster (boundary dışında)
                const isConnected = dronePosition && connected;
                const displayX = isConnected ? dronePosition.x : 50; // Grid sol üst köşe
                const displayY = isConnected ? dronePosition.y : 50;
                
                // Bağlantı durumuna göre renkler
                const droneColor = isConnected ? "rgb(251, 191, 36)" : "rgb(156, 163, 175)";
                const droneColorTransparent = isConnected ? "rgba(251, 191, 36, 0.2)" : "rgba(156, 163, 175, 0.2)";
                
                return (
                  <g>
                    {/* Drone outer circle */}
                    <circle
                      cx={displayX}
                      cy={displayY}
                      r="20"
                      fill={droneColorTransparent}
                      stroke={droneColor}
                      strokeWidth="2"
                      filter="url(#glow)"
                    >
                      {isConnected && (
                        <animate
                          attributeName="r"
                          values="20;25;20"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      )}
                    </circle>
                    
                    {/* Drone icon */}
                    <circle
                      cx={displayX}
                      cy={displayY}
                      r="12"
                      fill={droneColor}
                    />
                    
                    {/* Drone propellers */}
                    <line
                      x1={displayX - 15}
                      y1={displayY - 15}
                      x2={displayX + 15}
                      y2={displayY + 15}
                      stroke={droneColor}
                      strokeWidth="3"
                    />
                    <line
                      x1={displayX + 15}
                      y1={displayY - 15}
                      x2={displayX - 15}
                      y2={displayY + 15}
                      stroke={droneColor}
                      strokeWidth="3"
                    />
                    
                    {/* Label - Bağlantı durumuna göre */}
                    <text
                      x={displayX}
                      y={displayY - 35}
                      textAnchor="middle"
                      fill={droneColor}
                      fontSize="12"
                      fontWeight="bold"
                    >
                      {isConnected ? 'DRONE' : 'NO CONNECT'}
                    </text>
                    
                    {/* Bağlantı yoksa ek uyarı */}
                    {!isConnected && (
                      <text
                        x={displayX}
                        y={displayY + 45}
                        textAnchor="middle"
                        fill="rgb(239, 68, 68)"
                        fontSize="10"
                        fontWeight="bold"
                      >
                        ROS /odom
                      </text>
                    )}
                  </g>
                );
              })()}
              
              {/* Path visualization */}
              {Array.isArray(path) && path.length > 1 && (
                <>
                  <polyline
                    points={path.filter(p => p && typeof p.x === 'number' && typeof p.y === 'number').map(p => `${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke="rgb(59, 130, 246)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.8"
                  />
                  
                  {path.filter(p => p && typeof p.x === 'number' && typeof p.y === 'number').map((point, idx) => (
                    <circle
                      key={idx}
                      cx={point.x}
                      cy={point.y}
                      r="2"
                      fill="rgb(59, 130, 246)"
                      opacity={0.6}
                    />
                  ))}
                  
                  {path.length > 0 && path[path.length - 1] && (
                    <g>
                      <circle
                        cx={path[path.length - 1].x}
                        cy={path[path.length - 1].y}
                        r="6"
                        fill="rgb(59, 130, 246)"
                        filter="url(#glow)"
                      >
                        <animate attributeName="r" values="6;9;6" dur="1s" repeatCount="indefinite" />
                      </circle>
                    </g>
                  )}
                </>
              )}
              
              <text
                x={boundary.x + boundary.width / 2}
                y={boundary.y - 10}
                textAnchor="middle"
                fill="rgb(16, 185, 129)"
                fontSize="12"
                fontWeight="bold"
              >
                {metrics.width}m
              </text>
              
              <text
                x={boundary.x - 30}
                y={boundary.y + boundary.height / 2}
                textAnchor="middle"
                fill="rgb(16, 185, 129)"
                fontSize="12"
                fontWeight="bold"
                transform={`rotate(-90 ${boundary.x - 30} ${boundary.y + boundary.height / 2})`}
              >
                {metrics.height}m
              </text>
            </svg>
          </div>
        </div>
        
        {/* Info panel */}
        <div style={styles.infoPanel}>
          {/* Drone Status - HER ZAMAN GÖRÜNÜR */}
          <div style={{...styles.card, borderColor: dronePosition && connected ? 'rgba(251, 191, 36, 0.5)' : 'rgba(156, 163, 175, 0.5)'}}>
            <h3 style={{...styles.cardTitle, color: dronePosition && connected ? '#fbbf24' : '#9ca3af'}}>
              <Radio size={16} />
              DRONE POSITION
            </h3>
            
            {dronePosition && connected ? (
              <div>
                <div style={styles.metricRow}>
                  <span style={styles.metricLabel}>X (meters)</span>
                  <span style={{...styles.metricValue, color: '#fbbf24'}}>
                    {((dronePosition.x - (boundary.x + boundary.width / 2)) * metersPerPixel).toFixed(2)}m
                  </span>
                </div>
                <div style={styles.metricRow}>
                  <span style={styles.metricLabel}>Y (meters)</span>
                  <span style={{...styles.metricValue, color: '#fbbf24'}}>
                    {(((boundary.y + boundary.height / 2) - dronePosition.y) * metersPerPixel).toFixed(2)}m
                  </span>
                </div>
                <div style={{...styles.metricRow, borderBottom: 'none'}}>
                  <span style={styles.metricLabel}>Altitude</span>
                  <span style={{...styles.metricValue, color: '#fbbf24'}}>
                    {dronePosition.z ? dronePosition.z.toFixed(2) : '0.00'}m
                  </span>
                </div>
              </div>
            ) : (
              <div style={{
                padding: '20px',
                textAlign: 'center',
                background: 'rgba(239, 68, 68, 0.1)',
                borderRadius: '8px',
                border: '1px dashed rgba(239, 68, 68, 0.3)'
              }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#ef4444',
                  marginBottom: '8px'
                }}>
                  NO CONNECTION
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#9ca3af',
                  lineHeight: '1.6'
                }}>
                  {!connected ? (
                    <>ROS not connected<br/>Check ROS connection</>
                  ) : (
                    <>Topic: /odom not found<br/>Check ROS topics</>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Path Configuration */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>
              <Navigation size={16} />
              PATH CONFIGURATION
            </h3>
            
            <div>
              <label style={styles.label}>Path Algorithm</label>
              <select
                value={pathType}
                onChange={(e) => setPathType(e.target.value)}
                style={styles.select}
              >
                {Object.entries(pathTypeLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              
              <label style={styles.label}>Start Corner</label>
              <select
                value={startCorner}
                onChange={(e) => setStartCorner(e.target.value)}
                style={styles.select}
              >
                {Object.entries(cornerLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Boundary metrics */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>
              <Move size={16} />
              BOUNDARY METRICS
            </h3>
            
            <div>
              <div style={styles.metricRow}>
                <span style={styles.metricLabel}>Width</span>
                <span style={styles.metricValue}>{metrics.width}m</span>
              </div>
              <div style={styles.metricRow}>
                <span style={styles.metricLabel}>Height</span>
                <span style={styles.metricValue}>{metrics.height}m</span>
              </div>
              <div style={styles.metricRow}>
                <span style={styles.metricLabel}>Area</span>
                <span style={{...styles.metricValue, color: '#10b981'}}>{metrics.area}m²</span>
              </div>
              <div style={{...styles.metricRow, borderBottom: 'none'}}>
                <span style={styles.metricLabel}>Grid Resolution</span>
                <span style={{fontSize: '14px', fontFamily: 'monospace', color: 'white'}}>{metersPerPixel}m/px</span>
              </div>
            </div>
          </div>
          
          {/* Path info */}
          <div style={{...styles.card, borderColor: 'rgba(59, 130, 246, 0.3)'}}>
            <h3 style={{...styles.cardTitle, color: '#3b82f6'}}>PATH INFO</h3>
            
            <div>
              <div style={styles.metricRow}>
                <span style={styles.metricLabel}>Waypoints</span>
                <span style={styles.metricValue}>{path.length}</span>
              </div>
              <div style={styles.metricRow}>
                <span style={styles.metricLabel}>Status</span>
                <span style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: isSimulating ? '#fbbf24' : path.length > 0 ? '#10b981' : '#9ca3af'
                }}>
                  {isSimulating ? 'SIMULATING' : path.length > 0 ? 'COMPLETE' : 'IDLE'}
                </span>
              </div>
              {path.length > 0 && (
                <div style={{...styles.metricRow, borderBottom: 'none'}}>
                  <span style={styles.metricLabel}>Path Length</span>
                  <span style={{fontSize: '14px', fontFamily: 'monospace', color: '#3b82f6'}}>
                    {(path.length * 0.1).toFixed(1)}m
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Status indicator */}
          <div style={styles.statusCard}>
            <div style={styles.statusIndicator}>
              <div style={{position: 'relative', width: '12px', height: '12px'}}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  background: connected ? '#10b981' : '#ef4444',
                  borderRadius: '50%',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}></div>
              </div>
              <div>
                <div style={{fontSize: '12px', fontWeight: 'bold', color: '#6ee7b7'}}>
                  {connected ? 'ROS CONNECTED' : 'ROS DISCONNECTED'}
                </div>
                <div style={{fontSize: '12px', color: 'rgba(110, 231, 183, 0.7)'}}>
                  Configuration Active
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div style={styles.footer}>
        Selected: {pathTypeLabels[pathType]} 
        {' from '}
        {dronePosition && connected ? 'Drone Position' : cornerLabels[startCorner]}
        {' • '}
        {dronePosition && connected ? 'Drone tracked' : 'Drone disconnected'}
      </div>
    </div>
  );
};

export default SlamConfiguration;
