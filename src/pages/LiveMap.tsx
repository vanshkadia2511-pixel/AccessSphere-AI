import React, { useState } from 'react';
import { Activity, Users, ArrowUpRight, ParkingSquare, DoorOpen, AlertTriangle, TrendingUp, Bot, Loader } from 'lucide-react';
import './LiveMap.css';

interface StatusItemProps { label: string; status: 'operational' | 'maintenance' | 'offline'; }
const StatusItem: React.FC<StatusItemProps> = ({ label, status }) => (
  <li className={`status-item ${status}`}>
    <span className="dot" />
    <span>{label}</span>
    <span className={`status-badge ${status}`}>{status === 'operational' ? 'OK' : status === 'maintenance' ? 'Maint.' : 'Offline'}</span>
  </li>
);

interface ParkingZoneProps { name: string; fill: number; spots: number; }
const ParkingZone: React.FC<ParkingZoneProps> = ({ name, fill, spots }) => {
  const color = fill >= 90 ? 'var(--error)' : fill >= 75 ? 'var(--warning)' : 'var(--success)';
  return (
    <div className="parking-zone">
      <div className="parking-zone-header">
        <span className="zone-name">{name}</span>
        <span className="spots-left" style={{ color }}>{spots} spots</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${fill}%`, background: color, boxShadow: `0 0 8px ${color}` }} />
      </div>
      <span className="fill-pct">{fill}% full</span>
    </div>
  );
};

export const LiveMap: React.FC = () => {
  const [north, setNorth] = useState(85);
  const [south, setSouth] = useState(32);
  const [east, setEast] = useState(78);
  const [west, setWest] = useState(95);

  // Selected Zone info
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  // Dynamic alerts
  const [facilityAlerts, setFacilityAlerts] = useState<StatusItemProps[]>([
    { label: 'Elevator 3 (East)', status: 'operational' },
    { label: 'Elevator 4 (North)', status: 'maintenance' },
    { label: 'Accessible Gate C', status: 'operational' },
    { label: 'Accessible Gate A', status: 'offline' },
  ]);

  // Form states
  const [newFacilityName, setNewFacilityName] = useState('');
  const [newFacilityStatus, setNewFacilityStatus] = useState<'operational' | 'maintenance' | 'offline'>('operational');

  // AI triage state
  const [aiTriage, setAiTriage] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const handleAddIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFacilityName.trim()) return;

    // Update facility list immediately
    const name = newFacilityName.trim();
    const status = newFacilityStatus;
    setFacilityAlerts(prev => [
      { label: name, status },
      ...prev
    ]);
    setNewFacilityName('');

    // Call AI for operational triage
    setAiLoading(true);
    setAiTriage(null);
    try {
      const statusLabel = status === 'offline' ? 'is OFFLINE' : status === 'maintenance' ? 'is under MAINTENANCE' : 'is now OPERATIONAL';
      const prompt = `VOLUNTEER INCIDENT REPORT: Facility "${name}" ${statusLabel}. As an operations AI for FIFA World Cup 2026, provide a brief triage: 1) Immediate action for venue staff (1 sentence). 2) Alternate accessible route recommendation if applicable (1 sentence). 3) Priority level (Low/Medium/High/Critical).`;
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          profile: { language: 'en', needs: ['mobility'], venue_id: 'los-angeles' },
          history: []
        })
      });
      const data = await res.json();
      setAiTriage(data.reply || 'AI triage unavailable — contact operations desk.');
    } catch {
      setAiTriage('Unable to reach AI. Contact the operations desk directly.');
    } finally {
      setAiLoading(false);
    }
  };

  const getZoneClass = (val: number) => {
    if (val >= 90) return 'danger';
    if (val >= 70) return 'warning';
    return 'success';
  };

  const getRecommendedGate = () => {
    const list = [
      { name: 'North Gate', val: north },
      { name: 'South Gate', val: south },
      { name: 'East Concourse', val: east },
      { name: 'West Concourse', val: west }
    ];
    list.sort((a, b) => a.val - b.val);
    return list[0].name;
  };

  const getAIAdviceForZone = (zone: string, density: number) => {
    if (density >= 90) {
      return `⚠️ GENAI OPERATIONS DECISION SUPPORT: ${zone} Density critical (${density}%). Re-route all arriving fans using South Gate. Deploy 3 additional crowd control guides. Send audio alert via AccessSphere App.`;
    }
    if (density >= 70) {
      return `💡 GENAI WARNING: ${zone} Congestion build-up (${density}%). Open ticket scan lane 5. Send message push advising standard checkins.`;
    }
    return `✓ GENAI NORMAL STATUS: ${zone} Path flow optimal (${density}%). Standard operations active. Recommended for priority wheelchair access.`;
  };

  const hasSurge = north >= 90 || south >= 90 || east >= 90 || west >= 90;
  const surgeName = west >= 90 ? 'West Concourse' : north >= 90 ? 'North Gate' : east >= 90 ? 'East Concourse' : 'South Gate';
  const surgeVal = Math.max(north, south, east, west);

  return (
    <div className="live-map-page animate-fade-in">
      <header className="live-map-header">
        <div className="header-title">
          <div className="live-icon-wrap">
            <Activity className="title-icon" />
          </div>
          <div>
            <h2>Real-Time Intelligence</h2>
            <p className="subtitle">Live crowd prediction, parking, and facility status</p>
          </div>
        </div>
        <div className="live-status-chip">
          <span className="broadcast-dot" />
          <span>LIVE DATA</span>
          <span className="live-refresh">↻ 5s</span>
        </div>
      </header>

      {/* Crowd surge banner */}
      {hasSurge && (
        <div className="surge-banner animate-slide-up stagger-1">
          <AlertTriangle size={15} />
          <span>Crowd surge detected at <strong>{surgeName} ({surgeVal}%)</strong>. Avoid this area — accessible alternate route via {getRecommendedGate()} recommended.</span>
        </div>
      )}

      <div className="live-map-grid">
        {/* Stadium Heatmap */}
        <section className="map-view glass-panel animate-scale-up">
          <div className="map-overlay">
            <span className="live-indicator">
              <span className="broadcast-dot" />
              LIVE
            </span>
            <span className="map-scale">Click zones to analyze with AI</span>
          </div>

          <div className="stadium-heatmap">
            <div className={`zone zone-north ${getZoneClass(north)}${selectedZone === 'North' ? ' selected-glow' : ''}`} onClick={() => setSelectedZone('North')}>
              {north >= 70 && <TrendingUp size={12} />}
              <span>North Gate</span>
              <span className="density">{north}%</span>
            </div>
            <div className={`zone zone-south ${getZoneClass(south)}${selectedZone === 'South' ? ' selected-glow' : ''}`} onClick={() => setSelectedZone('South')}>
              {getRecommendedGate() === 'South Gate' && <span className="recommended-badge">★ Recommended</span>}
              <span>South Gate</span>
              <span className="density">{south}%</span>
            </div>
            <div className={`zone zone-east ${getZoneClass(east)}${selectedZone === 'East' ? ' selected-glow' : ''}`} onClick={() => setSelectedZone('East')}>
              {east >= 70 && <TrendingUp size={12} />}
              <span>East Concourse</span>
              <span className="density">{east}%</span>
            </div>
            <div className={`zone zone-west ${getZoneClass(west)}${selectedZone === 'West' ? ' selected-glow' : ''}`} onClick={() => setSelectedZone('West')}>
              {west >= 70 && <TrendingUp size={12} style={west >= 90 ? {animation:'pulse 1s infinite'} : {}} />}
              <span>West Concourse</span>
              <span className="density">{west}%</span>
              {west >= 90 && <span className="surge-badge">⚡ Surge</span>}
            </div>
            <div className="pitch">
              <span className="pitch-text">⚽ Pitch</span>
              <span className="pitch-sub">Match Day</span>
            </div>
          </div>

          {/* AI Zone Intelligence Inspector */}
          {selectedZone && (
            <div className="ai-inspector-card glass-panel animate-scale-up">
              <div className="inspector-header">
                <h5>🔮 {selectedZone} Zone Analysis</h5>
                <button className="inspector-close" onClick={() => setSelectedZone(null)}>×</button>
              </div>
              <p className="ai-advice-text">
                {getAIAdviceForZone(
                  selectedZone,
                  selectedZone === 'North' ? north : selectedZone === 'South' ? south : selectedZone === 'East' ? east : west
                )}
              </p>
            </div>
          )}

          {/* Simulator Sliders */}
          <div className="simulator-controls glass-panel">
            <h4>⚙️ Smart Stadium Crowd Simulator</h4>
            <div className="sliders-grid">
              <div className="slider-row">
                <label>North Gate: {north}%</label>
                <input type="range" min="10" max="100" value={north} onChange={e => setNorth(Number(e.target.value))} />
              </div>
              <div className="slider-row">
                <label>South Gate: {south}%</label>
                <input type="range" min="10" max="100" value={south} onChange={e => setSouth(Number(e.target.value))} />
              </div>
              <div className="slider-row">
                <label>East Concourse: {east}%</label>
                <input type="range" min="10" max="100" value={east} onChange={e => setEast(Number(e.target.value))} />
              </div>
              <div className="slider-row">
                <label>West Concourse: {west}%</label>
                <input type="range" min="10" max="100" value={west} onChange={e => setWest(Number(e.target.value))} />
              </div>
            </div>
          </div>
        </section>

        {/* Intelligence Sidebar */}
        <aside className="intelligence-sidebar">
          {/* Crowd Prediction */}
          <div className="status-card glass-panel animate-scale-up stagger-2">
            <div className="card-header">
              <Users size={15} className="card-icon" />
              <h3>Crowd Prediction</h3>
            </div>
            <div className="stat-row">
              <span>Fill Rate</span>
              <span className="stat-value text-gradient">
                Fast <ArrowUpRight size={14} className="inline-icon" />
              </span>
            </div>
            <div className="stat-row">
              <span>Peak in</span>
              <span className="stat-value">~45 min</span>
            </div>
            <div className="insight-box">
              <span className="insight-icon">💡</span>
              <p>Use South Gate for fastest accessible entry based on current trends.</p>
            </div>
          </div>

          {/* Elevator & Gate */}
          <div className="status-card glass-panel animate-scale-up stagger-3">
            <div className="card-header">
              <DoorOpen size={15} className="card-icon" />
              <h3>Elevator &amp; Gate Alerts</h3>
            </div>
            <ul className="status-list">
              {facilityAlerts.map((item, idx) => (
                <StatusItem key={idx} label={item.label} status={item.status} />
              ))}
            </ul>
          </div>

          <div className="status-card glass-panel animate-scale-up stagger-3">
            <div className="card-header">
              <AlertTriangle size={15} className="card-icon text-red" />
              <h3>Volunteer Alert Center</h3>
              <span className="vol-badge">AI-Powered Triage</span>
            </div>
            <form onSubmit={handleAddIncident} className="incident-form">
              <input
                type="text"
                placeholder="e.g. Concourse B Ramp — Elevator Offline"
                value={newFacilityName}
                onChange={e => setNewFacilityName(e.target.value)}
                className="incident-input"
                aria-label="Incident description"
              />
              <div className="incident-select-row">
                <select
                  value={newFacilityStatus}
                  onChange={e => setNewFacilityStatus(e.target.value as any)}
                  className="incident-select"
                  aria-label="Incident status"
                >
                  <option value="operational">Operational (OK)</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="offline">Offline</option>
                </select>
                <button type="submit" className="btn-incident-submit" disabled={aiLoading}>
                  {aiLoading ? <Loader size={13} className="spin" /> : 'Report'}
                </button>
              </div>
            </form>

            {/* AI Triage Response */}
            {aiLoading && (
              <div className="ai-triage-loading">
                <Bot size={14} className="text-accent" />
                <span>Gemini AI generating triage...</span>
              </div>
            )}
            {aiTriage && !aiLoading && (
              <div className="ai-triage-panel" role="status" aria-live="polite">
                <div className="ai-triage-header">
                  <Bot size={14} className="text-accent" />
                  <span className="ai-triage-title">AI Operations Triage</span>
                </div>
                <p className="ai-triage-text">{aiTriage}</p>
              </div>
            )}
          </div>

          {/* Parking */}
          <div className="status-card glass-panel animate-scale-up stagger-4">
            <div className="card-header">
              <ParkingSquare size={15} className="card-icon" />
              <h3>Parking Intelligence</h3>
            </div>
            <div className="parking-stats">
              <ParkingZone name="Zone A — VIP/Accessible" fill={90} spots={2} />
              <ParkingZone name="Zone B — Standard Acc." fill={40} spots={45} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
