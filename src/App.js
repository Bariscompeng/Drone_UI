import React, { useState, useEffect } from 'react';
import StatusBar from './components/Layout/StatusBar';
import Sidebar from './components/Layout/Sidebar';
import EmergencyStop from './components/Layout/EmergencyStop';
import Dashboard from './components/Pages/Dashboard';
import Logs from './components/Pages/Logs';
import Settings from './components/Pages/Settings';
import PanelSettings from './components/Modals/PanelSettings';
import AddPanelModal from './components/Modals/AddPanelModal';
import { useROS } from './hooks/useROS';
import './styles/global.css';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [settingsPanel, setSettingsPanel] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const { ros, connected } = useROS();

  const [panels, setPanels] = useState([
    { id: 1, type: 'camera', title: 'RGB CAMERA', topic: '/camera/rgb/image_raw' },
    { id: 2, type: 'thermal', title: 'THERMAL CAMERA', topic: '/camera/thermal/image_raw' },
    { id: 3, type: 'lidar', title: 'LIDAR 3D', topic: '/velodyne_points' },
    { id: 4, type: 'incline', title: 'VEHICLE INCLINE', topic: '/imu/data' },
    { id: 5, type: 'gps', title: 'GPS MAP', topic: '/gps/fix' },
    { id: 6, type: 'system', title: 'SYSTEM STATUS', topic: '' }
  ]);

  // Daha iyi başlangıç layout - Foxglove tarzı
  const [layouts, setLayouts] = useState([
    { i: '1', x: 0, y: 0, w: 6, h: 6, minW: 3, minH: 4 },   // RGB Camera - Sol üst, büyük
    { i: '2', x: 6, y: 0, w: 6, h: 6, minW: 3, minH: 4 },   // Thermal - Sağ üst, büyük
    { i: '3', x: 0, y: 6, w: 8, h: 7, minW: 4, minH: 5 },   // LiDAR - Sol alt, geniş
    { i: '4', x: 8, y: 6, w: 4, h: 7, minW: 3, minH: 4 },   // Incline - Sağ alt üst
    { i: '5', x: 0, y: 13, w: 8, h: 6, minW: 4, minH: 4 },  // GPS - Alt, geniş
    { i: '6', x: 8, y: 13, w: 4, h: 6, minW: 3, minH: 4 }   // System - Alt sağ
  ]);

  const [systemStatus, setSystemStatus] = useState({
    connected: false,
    battery: 87,
    speed: 12.5
  });

  useEffect(() => {
    setSystemStatus(prev => ({ ...prev, connected }));
  }, [connected]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStatus(prev => ({
        ...prev,
        battery: Math.max(0, Math.min(100, prev.battery + (Math.random() - 0.5) * 2)),
        speed: Math.max(0, prev.speed + (Math.random() - 0.5) * 3)
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const savedLayout = localStorage.getItem('droneUI_layout');
    const savedPanels = localStorage.getItem('droneUI_panels');
    
    if (savedLayout) {
      try {
        setLayouts(JSON.parse(savedLayout));
      } catch (e) {
        console.error('Failed to load saved layout:', e);
      }
    }
    
    if (savedPanels) {
      try {
        setPanels(JSON.parse(savedPanels));
      } catch (e) {
        console.error('Failed to load saved panels:', e);
      }
    }
  }, []);

  const handleLayoutChange = (newLayout) => {
    setLayouts(newLayout);
    localStorage.setItem('droneUI_layout', JSON.stringify(newLayout));
  };

  const handleAddPanel = (panelData) => {
    const newPanel = {
      id: Date.now(),
      type: panelData.type,
      title: panelData.title,
      topic: panelData.topic
    };

    const maxY = layouts.length > 0 ? Math.max(...layouts.map(l => l.y + l.h)) : 0;
    
    const newLayout = {
      i: newPanel.id.toString(),
      x: 0,
      y: maxY,
      w: 6,
      h: 6,
      minW: 3,
      minH: 4
    };

    const newPanels = [...panels, newPanel];
    const newLayouts = [...layouts, newLayout];

    setPanels(newPanels);
    setLayouts(newLayouts);
    
    localStorage.setItem('droneUI_panels', JSON.stringify(newPanels));
    localStorage.setItem('droneUI_layout', JSON.stringify(newLayouts));
    
    setShowAddModal(false);
  };

  const handlePanelClose = (panelId) => {
    const newPanels = panels.filter(p => p.id !== panelId);
    const newLayouts = layouts.filter(l => l.i !== panelId.toString());
    
    setPanels(newPanels);
    setLayouts(newLayouts);
    
    localStorage.setItem('droneUI_panels', JSON.stringify(newPanels));
    localStorage.setItem('droneUI_layout', JSON.stringify(newLayouts));
  };

  const handlePanelSettings = (panel) => {
    setSettingsPanel(panel);
  };

  const handleSavePanelSettings = (updatedPanel) => {
    const newPanels = panels.map(p => 
      p.id === updatedPanel.id ? updatedPanel : p
    );
    setPanels(newPanels);
    localStorage.setItem('droneUI_panels', JSON.stringify(newPanels));
    setSettingsPanel(null);
  };

  const handleEmergencyStop = (isActivated) => {
    if (isActivated) {
      console.log('🚨 EMERGENCY STOP ACTIVATED');
    } else {
      console.log('✓ Emergency stop deactivated');
    }
  };

  return (
    <div className="app">
      <StatusBar 
        systemStatus={systemStatus}
        onAddPanel={() => setShowAddModal(true)}
      />

      <Sidebar 
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      <main className="main-content">
        {currentPage === 'dashboard' && (
          <Dashboard
            panels={panels}
            layouts={layouts}
            onLayoutChange={handleLayoutChange}
            onPanelClose={handlePanelClose}
            onPanelSettings={handlePanelSettings}
            ros={ros}
          />
        )}
        {currentPage === 'logs' && <Logs />}
        {currentPage === 'settings' && <Settings />}
      </main>

      <EmergencyStop onEmergencyStop={handleEmergencyStop} />

      {settingsPanel && (
        <PanelSettings
          panel={settingsPanel}
          onClose={() => setSettingsPanel(null)}
          onSave={handleSavePanelSettings}
        />
      )}

      {showAddModal && (
        <AddPanelModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddPanel}
        />
      )}
    </div>
  );
}

export default App;
