import React, { useState, useEffect } from 'react';
import { useROSTopic } from '../../hooks/useROS';
import { MapPin } from 'lucide-react';

const GPSMap = ({ ros, topic = '/gps/fix' }) => {
  const { data } = useROSTopic(ros, topic, 'sensor_msgs/msg/NavSatFix', 500);
  const [position, setPosition] = useState({ lat: 39.933400, lon: 32.859700 }); // Ankara default
  const [mapType, setMapType] = useState('satellite');

  useEffect(() => {
    if (data && data.latitude && data.longitude) {
      console.log('📍 GPS data received:', data.latitude, data.longitude);
      setPosition({
        lat: data.latitude,
        lon: data.longitude
      });
    }
  }, [data]);

  const getMapUrl = () => {
    const { lat, lon } = position;
    const zoom = 18;
    
    if (mapType === 'satellite') {
      // Google Maps Satellite
      return `https://www.google.com/maps/embed/v1/view?key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg&center=${lat},${lon}&zoom=${zoom}&maptype=satellite`;
    } else {
      // OpenStreetMap
      return `https://www.openstreetmap.org/export/embed.html?bbox=${lon-0.001},${lat-0.001},${lon+0.001},${lat+0.001}&layer=mapnik&marker=${lat},${lon}`;
    }
  };

  const styles = {
    container: {
      width: '100%',
      height: '100%',
      position: 'relative',
      background: '#0a1a0a',
      overflow: 'hidden'
    },
    mapContainer: {
      width: '100%',
      height: '100%',
      position: 'relative'
    },
    iframe: {
      width: '100%',
      height: '100%',
      border: 'none',
      filter: 'brightness(0.9) contrast(1.1)'
    },
    controls: {
      position: 'absolute',
      top: '12px',
      right: '12px',
      display: 'flex',
      gap: '8px',
      zIndex: 10
    },
    button: (active) => ({
      padding: '8px 16px',
      background: active ? '#00ff41' : 'rgba(0, 0, 0, 0.7)',
      color: active ? '#0a0e1a' : '#00ff41',
      border: `1px solid ${active ? '#00ff41' : 'rgba(0, 255, 65, 0.3)'}`,
      borderRadius: '6px',
      fontSize: '11px',
      fontWeight: 600,
      cursor: 'pointer',
      backdropFilter: 'blur(4px)',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      transition: 'all 0.2s'
    }),
    info: {
      position: 'absolute',
      bottom: '12px',
      left: '12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      zIndex: 10
    },
    badge: {
      fontSize: '11px',
      padding: '6px 10px',
      background: 'rgba(0, 0, 0, 0.8)',
      border: '1px solid rgba(0, 255, 65, 0.3)',
      borderRadius: '6px',
      color: '#00ff41',
      fontFamily: 'monospace',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    marker: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -100%)',
      zIndex: 5,
      filter: 'drop-shadow(0 4px 8px rgba(0, 255, 65, 0.6))',
      pointerEvents: 'none'
    },
    noData: {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      color: '#00ff41'
    }
  };

  return (
    <div style={styles.container}>
      {data ? (
        <div style={styles.mapContainer}>
          <iframe
            src={getMapUrl()}
            style={styles.iframe}
            loading="lazy"
            title="GPS Map"
          />
          
          <div style={styles.controls}>
            <button
              style={styles.button(mapType === 'map')}
              onClick={() => setMapType('map')}
              onMouseEnter={(e) => {
                if (mapType !== 'map') e.target.style.background = 'rgba(0, 255, 65, 0.2)';
              }}
              onMouseLeave={(e) => {
                if (mapType !== 'map') e.target.style.background = 'rgba(0, 0, 0, 0.7)';
              }}
            >
              Map
            </button>
            <button
              style={styles.button(mapType === 'satellite')}
              onClick={() => setMapType('satellite')}
              onMouseEnter={(e) => {
                if (mapType !== 'satellite') e.target.style.background = 'rgba(0, 255, 65, 0.2)';
              }}
              onMouseLeave={(e) => {
                if (mapType !== 'satellite') e.target.style.background = 'rgba(0, 0, 0, 0.7)';
              }}
            >
              Satellite
            </button>
          </div>

          <div style={styles.info}>
            <div style={styles.badge}>
              Lat: {position.lat.toFixed(6)}
            </div>
            <div style={styles.badge}>
              Lon: {position.lon.toFixed(6)}
            </div>
            <div style={styles.badge}>
              <MapPin size={14} />
              {topic}
            </div>
          </div>
        </div>
      ) : (
        <div style={styles.noData}>
          <MapPin size={48} />
          <div style={{ fontSize: '14px', fontWeight: 600 }}>
            Waiting for GPS data...
          </div>
          <div style={{ fontSize: '11px', color: '#8b92a0', fontFamily: 'monospace' }}>
            Topic: {topic}<br/>
            ROS: {ros ? '✅ Connected' : '❌ Not connected'}
          </div>
        </div>
      )}
    </div>
  );
};

export default GPSMap;
