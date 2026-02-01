import React from 'react';
import ResponsiveGrid from '../GridLayout/ResponsiveGrid';
import Panel from '../Panels/Panel';
import RGBCamera from '../Panels/RGBCamera';
import ThermalCamera from '../Panels/ThermalCamera';
import LiDAR3D from '../Panels/LiDAR3D';
import GPSMap from '../Panels/GPSMap';
import VehicleIncline from '../Panels/VehicleIncline';
import SystemStatus from '../Panels/SystemStatus';

const Dashboard = ({ panels, layouts, onLayoutChange, onPanelClose, onPanelSettings, ros }) => {
  const renderPanelContent = (panel) => {
    switch (panel.type) {
      case 'camera':
        return <RGBCamera topic={panel.topic} />;
      case 'thermal':
        return <ThermalCamera topic={panel.topic} />;
      case 'lidar':
        return <LiDAR3D topic={panel.topic} />;
      case 'gps':
        return <GPSMap ros={ros} topic={panel.topic} />;
      case 'incline':
        return <VehicleIncline ros={ros} topic={panel.topic} />;
      case 'system':
        return <SystemStatus />;
      default:
        return <div>Unknown panel type</div>;
    }
  };

  const styles = {
    dashboard: {
      width: '100%',
      height: '100%',
      overflow: 'auto',
      position: 'relative'
    }
  };

  return (
    <div style={styles.dashboard}>
      <ResponsiveGrid
        layouts={layouts}
        onLayoutChange={onLayoutChange}
      >
        {panels.map(panel => (
          <div key={panel.id.toString()}>
            <Panel
              title={panel.title}
              onClose={() => onPanelClose(panel.id)}
              onSettings={() => onPanelSettings(panel)}
            >
              {renderPanelContent(panel)}
            </Panel>
          </div>
        ))}
      </ResponsiveGrid>
    </div>
  );
};

export default Dashboard;
