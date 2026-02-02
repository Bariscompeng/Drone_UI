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
  const [mosaicLayout, setMosaicLayout] = useState(null);
  const { ros, connected } = useROS();

  const DEFAULT_PANELS = [
    { id: 1, type: 'camera', title: 'RGB CAMERA', topic: '/camera/rgb/image_raw' },
    { id: 2, type: 'thermal', title: 'THERMAL CAMERA', topic: '/camera/thermal/image_raw' },
    { id: 3, type: 'lidar', title: 'LIDAR 3D', topic: '/velodyne_points' },
    { id: 4, type: 'incline', title: 'VEHICLE INCLINE', topic: '/imu/data' },
    { id: 5, type: 'gps', title: 'GPS MAP', topic: '/gps/fix' },
    { id: 6, type: 'system', title: 'SYSTEM STATUS', topic: '' }
  ];

  const [panels, setPanels] = useState(DEFAULT_PANELS);

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

  // İlk yükleme - localStorage kontrol et
  useEffect(() => {
    try {
      const savedPanels = localStorage.getItem('droneUI_panels');
      const savedLayout = localStorage.getItem('droneUI_mosaicLayout');
      
      if (savedPanels) {
        const parsed = JSON.parse(savedPanels);
        // Validate panels
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPanels(parsed);
        } else {
          // Reset to default if invalid
          localStorage.removeItem('droneUI_panels');
          localStorage.removeItem('droneUI_mosaicLayout');
        }
      }
      
      if (savedLayout) {
        setMosaicLayout(JSON.parse(savedLayout));
      }
    } catch (e) {
      console.error('Failed to load saved data, resetting...', e);
      localStorage.removeItem('droneUI_panels');
      localStorage.removeItem('droneUI_mosaicLayout');
      setPanels(DEFAULT_PANELS);
    }
  }, []);

  const handleLayoutChange = (newLayout) => {
    setMosaicLayout(newLayout);
    try {
      localStorage.setItem('droneUI_mosaicLayout', JSON.stringify(newLayout));
    } catch (e) {
      console.error('Failed to save layout:', e);
    }
  };

  const handleAddPanel = (panelData) => {
    if (panels.length >= 6) {
      alert('Maximum 6 panels allowed!');
      return;
    }

    const newPanel = {
      id: Date.now(),
      type: panelData.type,
      title: panelData.title,
      topic: panelData.topic
    };

    const newPanels = [...panels, newPanel];
    setPanels(newPanels);
    
    try {
      localStorage.setItem('droneUI_panels', JSON.stringify(newPanels));
    } catch (e) {
      console.error('Failed to save panels:', e);
    }
    
    setShowAddModal(false);
  };

  const handlePanelClose = (panelId) => {
    const newPanels = panels.filter(p => p.id !== panelId);
    setPanels(newPanels);
    
    try {
      localStorage.setItem('droneUI_panels', JSON.stringify(newPanels));
    } catch (e) {
      console.error('Failed to save panels:', e);
    }
  };

  const handlePanelSettings = (panel) => {
    setSettingsPanel(panel);
  };

  const handleSavePanelSettings = (updatedPanel) => {
    const newPanels = panels.map(p => 
      p.id === updatedPanel.id ? updatedPanel : p
    );
    setPanels(newPanels);
    
    try {
      localStorage.setItem('droneUI_panels', JSON.stringify(newPanels));
    } catch (e) {
      console.error('Failed to save panels:', e);
    }
    
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
            onPanelClose={handlePanelClose}
            onPanelSettings={handlePanelSettings}
            onLayoutChange={handleLayoutChange}
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
