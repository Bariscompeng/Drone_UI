import React from 'react';
import MosaicLayout from '../GridLayout/MosaicLayout';
import RGBCamera from '../Panels/RGBCamera';
import ThermalCamera from '../Panels/ThermalCamera';
import LiDAR3D from '../Panels/LiDAR3D';
import GPSMap from '../Panels/GPSMap';
import VehicleIncline from '../Panels/VehicleIncline';
import SystemStatus from '../Panels/SystemStatus';
import ArtificialHorizon from '../Panels/ArtificialHorizon';

const Dashboard = ({ panels, onPanelClose, onPanelSettings, onLayoutChange, ros }) => {
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
      case 'horizon':
        return <ArtificialHorizon ros={ros} topic={panel.topic} />;
      default:
        return <div>Unknown panel type</div>;
    }
  };

  const renderPanel = (panel) => {
    return (
      <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
        {renderPanelContent(panel)}
      </div>
    );
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <MosaicLayout
        panels={panels}
        renderPanel={renderPanel}
        onPanelClose={onPanelClose}
        onPanelSettings={onPanelSettings}
        onLayoutChange={onLayoutChange}
      />
    </div>
  );
};

export default Dashboard;
