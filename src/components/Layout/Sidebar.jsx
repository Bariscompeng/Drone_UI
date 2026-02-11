import React, { useState } from 'react';
import { Camera, Terminal, Settings, Gamepad2, ChevronDown, ChevronUp, Maximize2 } from 'lucide-react';
//                                                                              ^^^^^^^^^ YENİ EKLENEN ICON

const Sidebar = ({ currentPage, onPageChange, teleopContent }) => {
  const [teleopOpen, setTeleopOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', icon: Camera, label: 'Dashboard' },
    { id: 'logs', icon: Terminal, label: 'Logs' },
    // ====== YENİ EKLENEN MENÜ ÖĞESİ ======
    { id: 'slam-config', icon: Maximize2, label: 'SLAM Config' }
    // ======================================
  ];

  return (
    <div className="sidebar">
      {navItems.map(item => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            className={`nav-btn ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => onPageChange(item.id)}
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </button>
        );
      })}

      {/* Teleop Collapsible Section */}
      <div className="teleop-section">
        <button
          className={`nav-btn teleop-toggle ${teleopOpen ? 'active' : ''}`}
          onClick={() => setTeleopOpen(!teleopOpen)}
        >
          <Gamepad2 size={20} />
          <span>Teleop</span>
          {teleopOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        
        {teleopOpen && (
          <div className="teleop-panel">
            {teleopContent}
          </div>
        )}
      </div>

      <button
        className={`nav-btn ${currentPage === 'settings' ? 'active' : ''}`}
        onClick={() => onPageChange('settings')}
      >
        <Settings size={20} />
        <span>Settings</span>
      </button>

      <style jsx>{`
        .sidebar {
          position: fixed;
          left: 0;
          top: 60px;
          width: 220px;
          height: calc(100vh - 60px);
          background: #0f1419;
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          padding: 24px 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          z-index: 90;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .sidebar::-webkit-scrollbar {
          width: 6px;
        }

        .sidebar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
        }

        .sidebar::-webkit-scrollbar-thumb {
          background: rgba(0, 255, 65, 0.3);
          border-radius: 3px;
        }

        .nav-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background: transparent;
          color: #8b92a0;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
          border-left: 3px solid transparent;
          flex-shrink: 0;
        }

        .nav-btn:hover {
          background: rgba(0, 255, 65, 0.1);
          color: #00ff41;
        }

        .nav-btn.active {
          background: rgba(0, 255, 65, 0.15);
          color: #00ff41;
          border-left-color: #00ff41;
          box-shadow: 0 0 20px rgba(0, 255, 65, 0.1);
        }

        .nav-btn span {
          flex: 1;
        }

        .teleop-section {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .teleop-toggle {
          justify-content: space-between;
        }

        .teleop-panel {
          margin-top: 8px;
          margin-left: 12px;
          padding-left: 12px;
          border-left: 2px solid rgba(0, 255, 65, 0.2);
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 2000px;
          }
        }

        @media (max-width: 768px) {
          .sidebar {
            width: 60px;
            padding: 24px 8px;
          }
          .nav-btn span,
          .teleop-panel {
            display: none;
          }
          .nav-btn {
            justify-content: center;
            padding: 14px 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
