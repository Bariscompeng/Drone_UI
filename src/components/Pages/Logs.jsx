import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Trash2, Download, Search } from 'lucide-react';

const Logs = () => {
  const [logs, setLogs] = useState([
    { id: 1, time: '14:32:45', level: 'INFO', message: 'System initialized successfully' },
    { id: 2, time: '14:32:46', level: 'INFO', message: 'ROS master connected' },
    { id: 3, time: '14:32:48', level: 'WARN', message: 'GPS signal weak' },
    { id: 4, time: '14:32:50', level: 'INFO', message: 'Camera feed started' },
    { id: 5, time: '14:32:52', level: 'ERROR', message: 'Failed to connect to thermal camera' },
    { id: 6, time: '14:32:55', level: 'INFO', message: 'Thermal camera reconnected' },
  ]);
  
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef(null);

  useEffect(() => {
    // Simulated log generation
    const interval = setInterval(() => {
      const levels = ['INFO', 'WARN', 'ERROR'];
      const messages = [
        'Heartbeat received',
        'Data packet processed',
        'Connection timeout',
        'Battery level: 85%',
        'GPS fix acquired',
        'IMU data updated',
        'Network latency: 45ms'
      ];

      const newLog = {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        level: levels[Math.floor(Math.random() * levels.length)],
        message: messages[Math.floor(Math.random() * messages.length)]
      };

      setLogs(prev => [...prev, newLog]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const clearLogs = () => {
    setLogs([]);
  };

  const exportLogs = () => {
    const logText = logs.map(log => 
      `[${log.time}] ${log.level}: ${log.message}`
    ).join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drone-logs-${Date.now()}.txt`;
    a.click();
  };

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === 'ALL' || log.level === filter;
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="logs-page">
      <div className="logs-header">
        <div className="header-left">
          <Terminal size={20} />
          <h2>System Logs</h2>
          <span className="log-count">({filteredLogs.length} entries)</span>
        </div>
        
        <div className="header-controls">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-buttons">
            {['ALL', 'INFO', 'WARN', 'ERROR'].map(level => (
              <button
                key={level}
                className={`filter-btn ${filter === level ? 'active' : ''} ${level.toLowerCase()}`}
                onClick={() => setFilter(level)}
              >
                {level}
              </button>
            ))}
          </div>

          <label className="auto-scroll">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
            />
            Auto-scroll
          </label>

          <button className="action-btn" onClick={exportLogs} title="Export Logs">
            <Download size={16} />
          </button>

          <button className="action-btn danger" onClick={clearLogs} title="Clear Logs">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="logs-container">
        {filteredLogs.map(log => (
          <div key={log.id} className={`log-entry log-${log.level.toLowerCase()}`}>
            <span className="log-time">[{log.time}]</span>
            <span className="log-level">{log.level}</span>
            <span className="log-message">{log.message}</span>
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>

      <style jsx>{`
        .logs-page {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          padding: 20px;
        }

        .logs-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding: 16px 20px;
          background: linear-gradient(145deg, #161b26 0%, #0f1419 100%);
          border: 1px solid rgba(0, 255, 65, 0.2);
          border-radius: 12px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #00ff41;
        }

        .header-left h2 {
          font-size: 18px;
          font-weight: 700;
        }

        .log-count {
          font-size: 12px;
          color: #8b92a0;
        }

        .header-controls {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          color: #8b92a0;
        }

        .search-box input {
          background: transparent;
          border: none;
          outline: none;
          color: #e0e0e0;
          font-size: 13px;
          width: 200px;
        }

        .filter-buttons {
          display: flex;
          gap: 6px;
        }

        .filter-btn {
          padding: 6px 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          color: #8b92a0;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .filter-btn.active {
          border-color: currentColor;
        }

        .filter-btn.info.active {
          color: #00ff41;
          background: rgba(0, 255, 65, 0.1);
        }

        .filter-btn.warn.active {
          color: #ffaa00;
          background: rgba(255, 170, 0, 0.1);
        }

        .filter-btn.error.active {
          color: #ff4444;
          background: rgba(255, 68, 68, 0.1);
        }

        .filter-btn.all.active {
          color: #00ff41;
          background: rgba(0, 255, 65, 0.1);
        }

        .auto-scroll {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #8b92a0;
          cursor: pointer;
        }

        .auto-scroll input[type="checkbox"] {
          cursor: pointer;
        }

        .action-btn {
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          color: #8b92a0;
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-btn:hover {
          background: rgba(0, 255, 65, 0.1);
          border-color: #00ff41;
          color: #00ff41;
        }

        .action-btn.danger:hover {
          background: rgba(255, 68, 68, 0.1);
          border-color: #ff4444;
          color: #ff4444;
        }

        .logs-container {
          flex: 1;
          overflow-y: auto;
          background: linear-gradient(145deg, #161b26 0%, #0f1419 100%);
          border: 1px solid rgba(0, 255, 65, 0.2);
          border-radius: 12px;
          padding: 16px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
        }

        .log-entry {
          display: flex;
          gap: 12px;
          padding: 8px 12px;
          border-radius: 4px;
          margin-bottom: 4px;
          transition: all 0.2s;
        }

        .log-entry:hover {
          background: rgba(255, 255, 255, 0.03);
        }

        .log-time {
          color: #5a6270;
          min-width: 80px;
        }

        .log-level {
          min-width: 60px;
          font-weight: 700;
        }

        .log-info .log-level {
          color: #00ff41;
        }

        .log-warn .log-level {
          color: #ffaa00;
        }

        .log-error .log-level {
          color: #ff4444;
        }

        .log-message {
          color: #e0e0e0;
          flex: 1;
        }

        @media (max-width: 768px) {
          .logs-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .header-controls {
            width: 100%;
          }

          .search-box input {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default Logs;
