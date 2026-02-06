import React from 'react';
import { Settings, X } from 'lucide-react';

const Panel = ({ 
  panel, 
  children, 
  onSettings, 
  onClose,
  style = {} 
}) => {
  // Panel rengi - ayarlardan seçilen veya varsayılan kırmızı
  const panelColor = panel.color || '#ff3333';

  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#0a0a0a',
        borderRadius: '8px',
        overflow: 'hidden',
        border: `1px solid ${panelColor}40`,
        boxShadow: `0 4px 20px rgba(0, 0, 0, 0.5), 0 0 20px ${panelColor}15`,
        ...style
      }}
    >
      {/* Header */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: 'linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%)',
          borderBottom: `2px solid ${panelColor}`
        }}
      >
        <span 
          style={{
            fontSize: '13px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: panelColor,
            textShadow: `0 0 10px ${panelColor}80`
          }}
        >
          {panel.title}
        </span>
        <div style={{ display: 'flex', gap: '4px' }}>
          {onSettings && (
            <button
              onClick={() => onSettings(panel)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#666',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = panelColor}
              onMouseLeave={(e) => e.target.style.color = '#666'}
            >
              <Settings size={14} />
            </button>
          )}
          {onClose && (
            <button
              onClick={() => onClose(panel.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#666',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#ff4444'}
              onMouseLeave={(e) => e.target.style.color = '#666'}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div 
        style={{
          flex: 1,
          overflow: 'hidden',
          position: 'relative',
          background: '#0a0a0a'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default Panel;
