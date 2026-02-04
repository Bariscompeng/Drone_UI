import React, { useState, useEffect, useRef } from 'react';
import ROSLIB from 'roslib';
import { useROS } from '../../hooks/useROS';
import { Terminal, Trash2, Download, Pause, Play, AlertCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

const Logs = () => {
  const { ros, connected } = useROS();
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [autoScroll, setAutoScroll] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const logsEndRef = useRef(null);
  const logsContainerRef = useRef(null);
  const topicRef = useRef(null);
  const isUserScrollingRef = useRef(false);

  useEffect(() => {
    if (!ros || !connected) {
      console.log('⚠️ ROS not connected, cannot subscribe to /rosout');
      return;
    }

    console.log('📜 Subscribing to /rosout');

    try {
      const topic = new ROSLIB.Topic({
        ros: ros,
        name: '/rosout',
        messageType: 'rcl_interfaces/msg/Log'
      });

      const handleLog = (message) => {
        const logEntry = {
          id: Date.now() + Math.random(),
          timestamp: new Date(),
          level: getLevelName(message.level),
          name: message.name || 'Unknown',
          msg: message.msg || '',
          file: message.file || '',
          function: message.function || '',
          line: message.line || 0
        };

        setLogs(prev => [...prev, logEntry].slice(-1000));
      };

      topic.subscribe(handleLog);
      topicRef.current = topic;

      console.log('✅ Subscribed to /rosout');
    } catch (err) {
      console.error('❌ Error subscribing to /rosout:', err);
    }

    return () => {
      if (topicRef.current) {
        console.log('🔌 Unsubscribing from /rosout');
        try {
          topicRef.current.unsubscribe();
        } catch (err) {
          console.error('Error unsubscribing:', err);
        }
      }
    };
  }, [ros, connected]);

  // Auto-scroll effect
  useEffect(() => {
    if (autoScroll && logsEndRef.current && !isUserScrollingRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  // Manuel scroll detection
  useEffect(() => {
    const container = logsContainerRef.current;
    if (!container) return;

    let scrollTimeout;

    const handleScroll = () => {
      // Scroll başladığında kullanıcı scroll yapıyor olarak işaretle
      isUserScrollingRef.current = true;

      // Scroll timeout'u temizle
      clearTimeout(scrollTimeout);

      // Kullanıcı en alta scroll yaptı mı kontrol et
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;

      // 500ms timeout sonra scroll durdu
      scrollTimeout = setTimeout(() => {
        isUserScrollingRef.current = false;

        // Eğer kullanıcı yukarı scroll yaptıysa auto-scroll'u kapat
        if (!isAtBottom && autoScroll) {
          console.log('📜 User scrolled up - disabling auto-scroll');
          setAutoScroll(false);
        }
        // Eğer kullanıcı tekrar en alta scroll yaptıysa auto-scroll'u aç
        else if (isAtBottom && !autoScroll) {
          console.log('📜 User scrolled to bottom - enabling auto-scroll');
          setAutoScroll(true);
        }
      }, 500);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [autoScroll]);

  const getLevelName = (level) => {
    const levels = {
      10: 'DEBUG',
      20: 'INFO',
      30: 'WARN',
      40: 'ERROR',
      50: 'FATAL'
    };
    return levels[level] || 'UNKNOWN';
  };

  const getLevelColor = (level) => {
    const colors = {
      'DEBUG': '#8b92a0',
      'INFO': '#00ff41',
      'WARN': '#ffaa00',
      'ERROR': '#ff4444',
      'FATAL': '#ff0000'
    };
    return colors[level] || '#ffffff';
  };

  const getLevelIcon = (level) => {
    const icons = {
      'DEBUG': <Info size={14} />,
      'INFO': <Info size={14} />,
      'WARN': <AlertTriangle size={14} />,
      'ERROR': <AlertCircle size={14} />,
      'FATAL': <XCircle size={14} />
    };
    return icons[level] || <Info size={14} />;
  };

  const filteredLogs = logs.filter(log => {
    if (filter !== 'all' && log.level.toLowerCase() !== filter) return false;
    if (searchTerm && !log.msg.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const handleClearLogs = () => {
    if (window.confirm('Clear all logs?')) {
      setLogs([]);
    }
  };

  const handleDownloadLogs = () => {
    const logText = logs.map(log => 
      `[${log.timestamp.toISOString()}] [${log.level}] [${log.name}] ${log.msg}`
    ).join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ros_logs_${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleToggleAutoScroll = () => {
    setAutoScroll(!autoScroll);
    if (!autoScroll) {
      // Auto-scroll açıldığında en alta scroll yap
      setTimeout(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const styles = {
    container: {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#0a0e1a',
      color: '#e0e0e0'
    },
    header: {
      padding: '16px 20px',
      borderBottom: '1px solid rgba(0, 255, 65, 0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      flexWrap: 'wrap'
    },
    title: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '18px',
      fontWeight: 700,
      color: '#00ff41'
    },
    controls: {
      display: 'flex',
      gap: '8px',
      alignItems: 'center',
      flexWrap: 'wrap'
    },
    filterBtn: (active) => ({
      padding: '6px 12px',
      background: active ? 'rgba(0, 255, 65, 0.2)' : 'rgba(0, 0, 0, 0.3)',
      border: `1px solid ${active ? '#00ff41' : 'rgba(255, 255, 255, 0.1)'}`,
      borderRadius: '6px',
      color: active ? '#00ff41' : '#8b92a0',
      fontSize: '11px',
      fontWeight: 600,
      cursor: 'pointer',
      textTransform: 'uppercase',
      transition: 'all 0.2s'
    }),
    iconBtn: (active = false) => ({
      width: '36px',
      height: '36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: active ? 'rgba(0, 255, 65, 0.2)' : 'rgba(0, 0, 0, 0.3)',
      border: `1px solid ${active ? '#00ff41' : 'rgba(255, 255, 255, 0.1)'}`,
      borderRadius: '6px',
      color: active ? '#00ff41' : '#8b92a0',
      cursor: 'pointer',
      transition: 'all 0.2s'
    }),
    autoScrollBtn: {
      padding: '8px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      background: autoScroll ? 'rgba(0, 255, 65, 0.2)' : 'rgba(255, 68, 68, 0.2)',
      border: `1px solid ${autoScroll ? '#00ff41' : '#ff4444'}`,
      borderRadius: '6px',
      color: autoScroll ? '#00ff41' : '#ff4444',
      fontSize: '11px',
      fontWeight: 700,
      cursor: 'pointer',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      transition: 'all 0.2s',
      boxShadow: autoScroll ? '0 0 10px rgba(0, 255, 65, 0.2)' : '0 0 10px rgba(255, 68, 68, 0.2)'
    },
    searchInput: {
      padding: '8px 12px',
      background: 'rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '6px',
      color: '#e0e0e0',
      fontSize: '12px',
      width: '200px',
      fontFamily: 'inherit'
    },
    logsContainer: {
      flex: 1,
      overflowY: 'auto',
      overflowX: 'hidden',
      padding: '12px',
      fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
      fontSize: '12px',
      lineHeight: '1.6',
      scrollBehavior: 'smooth'
    },
    logEntry: {
      display: 'flex',
      gap: '12px',
      padding: '8px 12px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      transition: 'background 0.2s'
    },
    logTimestamp: {
      color: '#5a6270',
      fontSize: '11px',
      minWidth: '80px',
      flexShrink: 0
    },
    logLevel: (level) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      color: getLevelColor(level),
      fontWeight: 700,
      minWidth: '70px',
      flexShrink: 0
    }),
    logName: {
      color: '#00aaff',
      minWidth: '120px',
      flexShrink: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    },
    logMsg: {
      color: '#e0e0e0',
      flex: 1,
      wordBreak: 'break-word'
    },
    noLogs: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      gap: '16px',
      color: '#5a6270'
    }
  };

  const levelCounts = logs.reduce((acc, log) => {
    acc[log.level] = (acc[log.level] || 0) + 1;
    return acc;
  }, {});

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>
          <Terminal size={24} />
          <span>ROS Logs</span>
          {connected ? (
            <span style={{ fontSize: '12px', color: '#00ff41' }}>● Connected</span>
          ) : (
            <span style={{ fontSize: '12px', color: '#ff4444' }}>○ Disconnected</span>
          )}
        </div>

        <div style={styles.controls}>
          <input
            type="text"
            style={styles.searchInput}
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <button style={styles.filterBtn(filter === 'all')} onClick={() => setFilter('all')}>
            All ({logs.length})
          </button>
          <button style={styles.filterBtn(filter === 'info')} onClick={() => setFilter('info')}>
            Info ({levelCounts.INFO || 0})
          </button>
          <button style={styles.filterBtn(filter === 'warn')} onClick={() => setFilter('warn')}>
            Warn ({levelCounts.WARN || 0})
          </button>
          <button style={styles.filterBtn(filter === 'error')} onClick={() => setFilter('error')}>
            Error ({levelCounts.ERROR || 0})
          </button>

          {/* Auto-scroll toggle - ÇOK BELİRGİN */}
          <button 
            style={styles.autoScrollBtn}
            onClick={handleToggleAutoScroll}
            title={autoScroll ? 'Click to pause auto-scroll' : 'Click to resume auto-scroll'}
          >
            {autoScroll ? (
              <>
                <Play size={14} />
                <span>LIVE</span>
              </>
            ) : (
              <>
                <Pause size={14} />
                <span>PAUSED</span>
              </>
            )}
          </button>

          <button 
            style={styles.iconBtn()}
            onClick={handleDownloadLogs} 
            title="Download logs"
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(0, 255, 65, 0.1)';
              e.target.style.borderColor = '#00ff41';
              e.target.style.color = '#00ff41';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(0, 0, 0, 0.3)';
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.target.style.color = '#8b92a0';
            }}
          >
            <Download size={16} />
          </button>

          <button 
            style={styles.iconBtn()}
            onClick={handleClearLogs} 
            title="Clear logs"
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 68, 68, 0.1)';
              e.target.style.borderColor = '#ff4444';
              e.target.style.color = '#ff4444';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(0, 0, 0, 0.3)';
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.target.style.color = '#8b92a0';
            }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div ref={logsContainerRef} style={styles.logsContainer}>
        {filteredLogs.length > 0 ? (
          <>
            {filteredLogs.map(log => (
              <div key={log.id} style={styles.logEntry}>
                <span style={styles.logTimestamp}>
                  {log.timestamp.toLocaleTimeString('en-US', { hour12: false })}
                </span>
                <span style={styles.logLevel(log.level)}>
                  {getLevelIcon(log.level)}
                  {log.level}
                </span>
                <span style={styles.logName} title={log.name}>
                  {log.name}
                </span>
                <span style={styles.logMsg}>{log.msg}</span>
              </div>
            ))}
            <div ref={logsEndRef} />
          </>
        ) : (
          <div style={styles.noLogs}>
            <Terminal size={48} color="#5a6270" />
            <div style={{ fontSize: '14px', fontWeight: 600 }}>
              {connected ? 'Waiting for logs...' : 'Not connected to ROS'}
            </div>
            <div style={{ fontSize: '11px' }}>
              {connected ? 'Listening to /rosout topic' : 'Check ROS connection in Settings'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Logs;
