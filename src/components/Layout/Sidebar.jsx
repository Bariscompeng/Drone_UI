import React from 'react';
import { Camera, Terminal, Settings } from 'lucide-react';

const Sidebar = ({ currentPage, onPageChange }) => {
  const navItems = [
    { id: 'dashboard', icon: Camera, label: 'Dashboard' },
    { id: 'logs', icon: Terminal, label: 'Logs' },
    { id: 'settings', icon: Settings, label: 'Settings' }
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

        @media (max-width: 768px) {
          .sidebar {
            width: 60px;
            padding: 24px 8px;
          }

          .nav-btn span {
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
