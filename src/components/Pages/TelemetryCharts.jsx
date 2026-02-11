import React, { useState, useEffect, useRef } from 'react';
import { useROSTopic } from '../../hooks/useROS';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// ─── Color Constants (matching existing UI) ───
const NEON_GREEN = '#00ff41';
const CYAN = '#00e5ff';
const AMBER = '#ffab00';
const RED = '#ff4444';
const MAGENTA = '#ff00aa';
const BG_PANEL = 'rgba(0, 0, 0, 0.3)';
const BORDER_COLOR = 'rgba(0, 255, 65, 0.2)';
const GRID_COLOR = 'rgba(0, 255, 65, 0.07)';
const TEXT_DIM = '#5a6270';
const TEXT_MID = '#8b92a0';

// ─── Custom Tooltip ───
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(10, 14, 26, 0.95)',
      border: '1px solid rgba(0, 255, 65, 0.3)',
      borderRadius: 6,
      padding: '8px 12px',
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 11,
      backdropFilter: 'blur(4px)',
    }}>
      <p style={{ color: TEXT_MID, margin: 0, marginBottom: 4 }}>T: {label}</p>
      {payload.map((entry, idx) => (
        <p key={idx} style={{ color: entry.color, margin: 0 }}>
          {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
        </p>
      ))}
    </div>
  );
};

// ─── Chart Panel Wrapper ───
const ChartPanel = ({ title, children, icon, status }) => (
  <div style={{
    background: BG_PANEL,
    border: `1px solid ${BORDER_COLOR}`,
    borderRadius: 12,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 280,
  }}>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 16px',
      background: 'rgba(0, 0, 0, 0.5)',
      borderBottom: `1px solid ${BORDER_COLOR}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 14 }}>{icon}</span>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1.5,
          color: NEON_GREEN,
          textTransform: 'uppercase',
        }}>
          {title}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {status && (
          <span style={{
            fontSize: 9,
            fontFamily: "'JetBrains Mono', monospace",
            color: status === 'LIVE' ? NEON_GREEN : AMBER,
            background: status === 'LIVE' ? 'rgba(0, 255, 65, 0.1)' : 'rgba(255, 171, 0, 0.1)',
            padding: '2px 8px',
            borderRadius: 4,
            border: `1px solid ${status === 'LIVE' ? 'rgba(0, 255, 65, 0.3)' : 'rgba(255, 171, 0, 0.3)'}`,
          }}>
            ● {status}
          </span>
        )}
      </div>
    </div>
    <div style={{ flex: 1, padding: '10px 6px 4px 0' }}>{children}</div>
  </div>
);

// ─── Chart Tab Selector ───
const ChartTabs = ({ tabs, active, onChange }) => (
  <div style={{ display: 'flex', gap: 4, padding: '0 12px 8px', flexWrap: 'wrap' }}>
    {tabs.map((tab) => (
      <button
        key={tab}
        onClick={() => onChange(tab)}
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9,
          padding: '4px 10px',
          background: active === tab ? 'rgba(0, 255, 65, 0.15)' : 'transparent',
          color: active === tab ? NEON_GREEN : TEXT_DIM,
          border: `1px solid ${active === tab ? 'rgba(0, 255, 65, 0.4)' : BORDER_COLOR}`,
          borderRadius: 4,
          cursor: 'pointer',
          letterSpacing: 0.5,
          textTransform: 'uppercase',
          transition: 'all 0.2s',
        }}
      >
        {tab}
      </button>
    ))}
  </div>
);

// ═══════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════
const TelemetryCharts = ({ ros, connected }) => {
  // ROS topic subscriptions
  const { data: imuData } = useROSTopic(ros, '/imu/data', 'sensor_msgs/Imu', 200);

  const [data, setData] = useState([]);
  const [motorData, setMotorData] = useState([]);
  const [healthData, setHealthData] = useState([]);
  const [flightTab, setFlightTab] = useState('Altitude');
  const [imuTab, setImuTab] = useState('All Axes');
  const tickCount = useRef(0);
  const MAX_POINTS = 40;

  // ─── Generate simulated data point ───
  const generateDataPoint = (i) => {
    const now = new Date();
    return {
      time: `${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`,
      altitude: 45 + Math.sin(i * 0.3) * 15 + Math.random() * 3,
      speed: 5.1 + Math.sin(i * 0.2) * 2.5 + Math.random() * 0.8,
      battery: Math.max(10, 83.9 - (i % 200) * 0.15 + Math.random() * 0.5),
      signal: Math.min(100, 75 + Math.sin(i * 0.15) * 20 + Math.random() * 5),
      pitch: 2.1 + Math.sin(i * 0.4) * 3 + Math.random() * 0.5,
      roll: 1.6 + Math.cos(i * 0.35) * 2.5 + Math.random() * 0.4,
      yaw: 180 + Math.sin(i * 0.1) * 30 + Math.random() * 2,
      temperature: 42 + Math.sin(i * 0.08) * 5 + Math.random() * 1.5,
      motorRPM1: 4200 + Math.sin(i * 0.25) * 300 + Math.random() * 100,
      motorRPM2: 4150 + Math.cos(i * 0.25) * 280 + Math.random() * 100,
      motorRPM3: 4180 + Math.sin(i * 0.3) * 260 + Math.random() * 100,
      motorRPM4: 4220 + Math.cos(i * 0.3) * 290 + Math.random() * 100,
      verticalSpeed: Math.sin(i * 0.35) * 2 + Math.random() * 0.3,
    };
  };

  // ─── Update IMU data from ROS if available ───
  useEffect(() => {
    if (imuData && imuData.orientation) {
      const { x, y, z, w } = imuData.orientation;
      const sinr_cosp = 2 * (w * x + y * z);
      const cosr_cosp = 1 - 2 * (x * x + y * y);
      const roll = Math.atan2(sinr_cosp, cosr_cosp) * (180 / Math.PI);
      const sinp = 2 * (w * y - z * x);
      const pitch = Math.abs(sinp) >= 1
        ? Math.sign(sinp) * 90
        : Math.asin(sinp) * (180 / Math.PI);

      setData(prev => {
        if (prev.length === 0) return prev;
        const updated = [...prev];
        const last = { ...updated[updated.length - 1], pitch, roll };
        updated[updated.length - 1] = last;
        return updated;
      });
    }
  }, [imuData]);

  // ─── Initialize data ───
  useEffect(() => {
    const initial = [];
    for (let i = 0; i < MAX_POINTS; i++) {
      initial.push(generateDataPoint(i));
    }
    setData(initial);
  }, []);

  // ─── Realtime simulation loop ───
  useEffect(() => {
    const interval = setInterval(() => {
      tickCount.current += 1;
      const i = MAX_POINTS + tickCount.current;

      setData(prev => {
        const next = [...prev.slice(1), generateDataPoint(i)];
        // Preserve battery drain
        const lastBat = prev[prev.length - 1]?.battery || 80;
        next[next.length - 1].battery = Math.max(10, lastBat - 0.05 + Math.random() * 0.03);
        return next;
      });

      setMotorData([
        { motor: 'M1 (FL)', rpm: 4200 + Math.random() * 200, temp: 45 + Math.random() * 8, current: 12.5 + Math.random() * 3 },
        { motor: 'M2 (FR)', rpm: 4150 + Math.random() * 200, temp: 43 + Math.random() * 8, current: 12.2 + Math.random() * 3 },
        { motor: 'M3 (RL)', rpm: 4180 + Math.random() * 200, temp: 44 + Math.random() * 8, current: 12.8 + Math.random() * 3 },
        { motor: 'M4 (RR)', rpm: 4220 + Math.random() * 200, temp: 46 + Math.random() * 8, current: 13.1 + Math.random() * 3 },
      ]);

      setHealthData([
        { subject: 'GPS', value: 85 + Math.random() * 15, fullMark: 100 },
        { subject: 'IMU', value: 90 + Math.random() * 10, fullMark: 100 },
        { subject: 'LIDAR', value: 78 + Math.random() * 20, fullMark: 100 },
        { subject: 'Camera', value: 88 + Math.random() * 12, fullMark: 100 },
        { subject: 'Comms', value: 70 + Math.random() * 25, fullMark: 100 },
        { subject: 'Battery', value: 82 + Math.random() * 15, fullMark: 100 },
      ]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const latestData = data[data.length - 1] || {};
  const batteryColor = latestData.battery > 50 ? NEON_GREEN : latestData.battery > 25 ? AMBER : RED;

  const batteryPieData = [
    { name: 'Used', value: 100 - (latestData.battery || 0) },
    { name: 'Remaining', value: latestData.battery || 0 },
  ];

  // ═══ RENDER ═══
  return (
    <div style={{
      width: '100%',
      height: '100%',
      overflow: 'auto',
      background: 'var(--bg-primary)',
      padding: 20,
    }}>
      {/* ─── HEADER ─── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        padding: '14px 20px',
        background: BG_PANEL,
        border: `1px solid ${BORDER_COLOR}`,
        borderRadius: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20 }}>📊</span>
          <div>
            <span style={{
              color: NEON_GREEN,
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: 'uppercase',
              textShadow: '0 0 20px rgba(0, 255, 65, 0.3)',
            }}>
              Telemetry Charts
            </span>
            <div style={{ fontSize: 11, color: TEXT_MID, marginTop: 2 }}>
              Real-time drone telemetry visualization
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 20, fontSize: 11, color: TEXT_MID, fontFamily: "'JetBrains Mono', monospace" }}>
          <span>ALT: <span style={{ color: NEON_GREEN }}>{latestData.altitude?.toFixed(1) || '—'}m</span></span>
          <span>SPD: <span style={{ color: CYAN }}>{latestData.speed?.toFixed(2) || '—'} m/s</span></span>
          <span>BAT: <span style={{ color: batteryColor }}>{latestData.battery?.toFixed(1) || '—'}%</span></span>
          <span>SIG: <span style={{ color: AMBER }}>{latestData.signal?.toFixed(0) || '—'}%</span></span>
          <span style={{
            color: connected ? NEON_GREEN : RED,
            padding: '2px 8px',
            background: connected ? 'rgba(0,255,65,0.1)' : 'rgba(255,68,68,0.1)',
            borderRadius: 4,
            border: `1px solid ${connected ? 'rgba(0,255,65,0.3)' : 'rgba(255,68,68,0.3)'}`,
          }}>
            {connected ? '● ROS' : '○ SIM'}
          </span>
        </div>
      </div>

      {/* ─── CHART GRID ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 16,
      }}>

        {/* ═══ 1 — FLIGHT DATA ═══ */}
        <ChartPanel title="Flight Data" icon="📈" status="LIVE">
          <ChartTabs tabs={['Altitude', 'Speed', 'V-Speed']} active={flightTab} onChange={setFlightTab} />
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="gradAlt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={NEON_GREEN} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={NEON_GREEN} stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gradSpd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CYAN} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={CYAN} stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gradVspd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={MAGENTA} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={MAGENTA} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={GRID_COLOR} strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fill: TEXT_DIM, fontSize: 9 }} />
              <YAxis
                tick={{ fill: TEXT_DIM, fontSize: 9 }}
                domain={flightTab === 'Altitude' ? [20, 80] : flightTab === 'Speed' ? [0, 10] : [-4, 4]}
                unit={flightTab === 'Altitude' ? 'm' : 'm/s'}
              />
              <Tooltip content={<CustomTooltip />} />
              {flightTab === 'Altitude' && (
                <Area type="monotone" dataKey="altitude" stroke={NEON_GREEN} fill="url(#gradAlt)" strokeWidth={2} dot={false} name="Altitude (m)" isAnimationActive={false} />
              )}
              {flightTab === 'Speed' && (
                <Area type="monotone" dataKey="speed" stroke={CYAN} fill="url(#gradSpd)" strokeWidth={2} dot={false} name="Speed (m/s)" isAnimationActive={false} />
              )}
              {flightTab === 'V-Speed' && (
                <Area type="monotone" dataKey="verticalSpeed" stroke={MAGENTA} fill="url(#gradVspd)" strokeWidth={2} dot={false} name="V-Speed (m/s)" isAnimationActive={false} />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </ChartPanel>

        {/* ═══ 2 — IMU ORIENTATION ═══ */}
        <ChartPanel title="IMU Orientation" icon="🧭" status="LIVE">
          <ChartTabs tabs={['All Axes', 'Pitch', 'Roll', 'Yaw']} active={imuTab} onChange={setImuTab} />
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <CartesianGrid stroke={GRID_COLOR} strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fill: TEXT_DIM, fontSize: 9 }} />
              <YAxis tick={{ fill: TEXT_DIM, fontSize: 9 }} unit="°" />
              <Tooltip content={<CustomTooltip />} />
              {(imuTab === 'All Axes' || imuTab === 'Pitch') && (
                <Line type="monotone" dataKey="pitch" stroke={NEON_GREEN} strokeWidth={imuTab === 'Pitch' ? 2.5 : 1.5} dot={false} name="Pitch (°)" isAnimationActive={false} />
              )}
              {(imuTab === 'All Axes' || imuTab === 'Roll') && (
                <Line type="monotone" dataKey="roll" stroke={CYAN} strokeWidth={imuTab === 'Roll' ? 2.5 : 1.5} dot={false} name="Roll (°)" isAnimationActive={false} />
              )}
              {(imuTab === 'All Axes' || imuTab === 'Yaw') && (
                <Line type="monotone" dataKey="yaw" stroke={AMBER} strokeWidth={imuTab === 'Yaw' ? 2.5 : 1.5} dot={false} name="Yaw (°)" isAnimationActive={false} />
              )}
            </LineChart>
          </ResponsiveContainer>
        </ChartPanel>

        {/* ═══ 3 — BATTERY & POWER ═══ */}
        <ChartPanel title="Battery & Power" icon="🔋" status="LIVE">
          <div style={{ display: 'flex', height: 220 }}>
            <div style={{ flex: '0 0 120px', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={batteryPieData}
                    cx="50%" cy="50%"
                    innerRadius={35} outerRadius={48}
                    startAngle={90} endAngle={-270}
                    dataKey="value"
                    isAnimationActive={false}
                  >
                    <Cell fill={`${TEXT_DIM}33`} />
                    <Cell fill={batteryColor} />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)', textAlign: 'center',
              }}>
                <div style={{ color: batteryColor, fontSize: 18, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                  {latestData.battery?.toFixed(0) || 0}%
                </div>
                <div style={{ color: TEXT_DIM, fontSize: 8, letterSpacing: 1 }}>BAT</div>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="gradBat" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={batteryColor} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={batteryColor} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={GRID_COLOR} strokeDasharray="3 3" />
                  <XAxis dataKey="time" tick={{ fill: TEXT_DIM, fontSize: 9 }} />
                  <YAxis tick={{ fill: TEXT_DIM, fontSize: 9 }} domain={[0, 100]} unit="%" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="battery" stroke={batteryColor} fill="url(#gradBat)" strokeWidth={2} dot={false} name="Battery (%)" isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ChartPanel>

        {/* ═══ 4 — MOTOR RPM ═══ */}
        <ChartPanel title="Motor RPM" icon="⚙️" status="LIVE">
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={data}>
              <CartesianGrid stroke={GRID_COLOR} strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fill: TEXT_DIM, fontSize: 9 }} />
              <YAxis tick={{ fill: TEXT_DIM, fontSize: 9 }} domain={[3500, 5000]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 9, color: TEXT_MID, paddingTop: 4 }} iconSize={8} />
              <Line type="monotone" dataKey="motorRPM1" stroke={NEON_GREEN} strokeWidth={1.5} dot={false} name="M1 (FL)" isAnimationActive={false} />
              <Line type="monotone" dataKey="motorRPM2" stroke={CYAN} strokeWidth={1.5} dot={false} name="M2 (FR)" isAnimationActive={false} />
              <Line type="monotone" dataKey="motorRPM3" stroke={AMBER} strokeWidth={1.5} dot={false} name="M3 (RL)" isAnimationActive={false} />
              <Line type="monotone" dataKey="motorRPM4" stroke={MAGENTA} strokeWidth={1.5} dot={false} name="M4 (RR)" isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanel>

        {/* ═══ 5 — SIGNAL & TEMPERATURE ═══ */}
        <ChartPanel title="Signal & Temp" icon="📡" status="LIVE">
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={data}>
              <CartesianGrid stroke={GRID_COLOR} strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fill: TEXT_DIM, fontSize: 9 }} />
              <YAxis yAxisId="sig" tick={{ fill: TEXT_DIM, fontSize: 9 }} domain={[0, 100]} unit="%" />
              <YAxis yAxisId="temp" orientation="right" tick={{ fill: TEXT_DIM, fontSize: 9 }} domain={[30, 55]} unit="°C" />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 9 }} iconSize={8} />
              <Line yAxisId="sig" type="monotone" dataKey="signal" stroke={NEON_GREEN} strokeWidth={2} dot={false} name="Signal (%)" isAnimationActive={false} />
              <Line yAxisId="temp" type="monotone" dataKey="temperature" stroke={RED} strokeWidth={2} dot={false} name="Temp (°C)" isAnimationActive={false} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanel>

        {/* ═══ 6 — SYSTEM HEALTH RADAR ═══ */}
        <ChartPanel title="System Health" icon="🛡️" status="LIVE">
          <div style={{ display: 'flex', alignItems: 'center', height: 230 }}>
            <ResponsiveContainer width="60%" height="100%">
              <RadarChart data={healthData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke={GRID_COLOR} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: TEXT_MID, fontSize: 9 }} />
                <PolarRadiusAxis tick={{ fill: TEXT_DIM, fontSize: 8 }} domain={[0, 100]} axisLine={false} />
                <Radar name="Health" dataKey="value" stroke={NEON_GREEN} fill={NEON_GREEN} fillOpacity={0.12} strokeWidth={2} isAnimationActive={false} />
              </RadarChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, padding: '0 12px' }}>
              {healthData.map((item, idx) => {
                const c = item.value > 85 ? NEON_GREEN : item.value > 65 ? AMBER : RED;
                return (
                  <div key={idx} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '5px 0',
                    borderBottom: `1px solid ${GRID_COLOR}`,
                    fontSize: 11,
                  }}>
                    <span style={{ color: TEXT_MID }}>{item.subject}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 44, height: 5,
                        background: 'rgba(90, 98, 112, 0.2)',
                        borderRadius: 3, overflow: 'hidden',
                      }}>
                        <div style={{
                          width: `${item.value}%`, height: '100%',
                          background: c, borderRadius: 3,
                          transition: 'width 0.5s',
                        }} />
                      </div>
                      <span style={{
                        color: c, minWidth: 32, textAlign: 'right',
                        fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
                      }}>
                        {item.value.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ChartPanel>
      </div>

      {/* ─── BOTTOM STATUS BAR ─── */}
      <div style={{
        marginTop: 16,
        padding: '8px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: BG_PANEL,
        border: `1px solid ${BORDER_COLOR}`,
        borderRadius: 8,
        fontSize: 10,
        color: TEXT_DIM,
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        <span>REFRESH: 2s</span>
        <span>POINTS: {data.length}</span>
        <span>STREAM: <span style={{ color: NEON_GREEN }}>● ACTIVE</span></span>
        <span>ROS: <span style={{ color: connected ? NEON_GREEN : RED }}>{connected ? 'CONNECTED' : 'SIMULATED'}</span></span>
        <span>UPTIME: {Math.floor(tickCount.current * 2 / 60)}m {(tickCount.current * 2) % 60}s</span>
      </div>
    </div>
  );
};

export default TelemetryCharts;
