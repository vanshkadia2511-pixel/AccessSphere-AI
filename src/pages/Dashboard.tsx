import React, { useEffect, useState } from 'react';
import {
  AlertCircle, Clock, MapPin, Navigation, Calendar, ShieldAlert,
  Zap, Thermometer, Users, Trophy, Sparkles, Leaf, Gift
} from 'lucide-react';
import './Dashboard.css';

/* Sustainability Tracker Component */
const SustainabilityTracker: React.FC = () => {
  const [points, setPoints] = useState(150);
  const [claimedReward, setClaimedReward] = useState<string | null>(null);

  const logAction = (pts: number, actionName: string) => {
    setPoints(prev => prev + pts);
    alert(`🌱 Action Logged: "${actionName}"! Added +${pts} Eco-Points.`);
  };

  const claimReward = (cost: number, rewardName: string) => {
    if (points < cost) {
      alert(`❌ Insufficient Points! You need ${cost} points to claim "${rewardName}".`);
      return;
    }
    setPoints(prev => prev - cost);
    setClaimedReward(rewardName);
    alert(`🎉 Success! You claimed "${rewardName}". Your digital pass has been added to your profile.`);
  };

  return (
    <section className="sustainability-tracker-card glass-panel animate-scale-up stagger-3">
      <div className="section-header">
        <Leaf size={16} className="section-icon text-success" />
        <div className="header-text-combo">
          <h3>Green Fan Rewards</h3>
          <p className="section-subtitle">Earn points for eco-friendly matchday choices</p>
        </div>
        <div className="points-display">
          <span className="points-amount text-gradient">{points}</span>
          <span className="points-lbl">Pts</span>
        </div>
      </div>

      {claimedReward && (
        <div className="claimed-badge animate-slide-up">
          <Gift size={12} />
          <span>Active Reward: <strong>{claimedReward}</strong></span>
        </div>
      )}

      <div className="tracker-interactive-sections">
        {/* Log Actions */}
        <div className="actions-section-box">
          <span className="sub-box-title">Log Your Action:</span>
          <div className="log-buttons-grid">
            <button className="log-action-btn" onClick={() => logAction(100, 'Took Smart Shuttle')}>
              🚌 Took Smart Transit (+100)
            </button>
            <button className="log-action-btn" onClick={() => logAction(50, 'Returned Cup')}>
              🥤 Returned Cup (+50)
            </button>
            <button className="log-action-btn" onClick={() => logAction(30, 'Recycled Trash')}>
              ♻️ Sorted Trash (+30)
            </button>
          </div>
        </div>

        {/* Claim Rewards */}
        <div className="rewards-section-box">
          <span className="sub-box-title">Available Rewards:</span>
          <div className="rewards-claim-grid">
            <button 
              className={`claim-reward-btn${points >= 200 ? ' claimable' : ''}`}
              onClick={() => claimReward(200, 'Free Metro Pass')}
            >
              🎟️ Free Metro Pass (200 Pts)
            </button>
            <button 
              className={`claim-reward-btn${points >= 100 ? ' claimable' : ''}`}
              onClick={() => claimReward(100, '10% Food discount')}
            >
              🍔 10% Concessions (100 Pts)
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

/* Queue Estimator Component */
interface QueueItem {
  name: string;
  normalWait: number;
  peakWait: number;
  accessibleNormal: number;
  accessiblePeak: number;
  type: string;
}

const QUEUES: QueueItem[] = [
  { name: 'Gate C (Priority Entry)', normalWait: 5,  peakWait: 15, accessibleNormal: 2, accessiblePeak: 4,  type: 'gate' },
  { name: 'Gate A (General Entry)',  normalWait: 12, peakWait: 35, accessibleNormal: 4, accessiblePeak: 8,  type: 'gate' },
  { name: 'Gate B (General Entry)',  normalWait: 18, peakWait: 45, accessibleNormal: 5, accessiblePeak: 10, type: 'gate' },
  { name: 'Concourse A Restrooms',   normalWait: 3,  peakWait: 12, accessibleNormal: 1, accessiblePeak: 3,  type: 'service' },
  { name: 'East Side Hotdogs & Beer',normalWait: 8,  peakWait: 22, accessibleNormal: 2, accessiblePeak: 5,  type: 'service' },
];

const QueueEstimator: React.FC = () => {
  const [isPeak, setIsPeak] = useState(false);

  return (
    <section className="queue-card glass-panel animate-scale-up stagger-3">
      <div className="section-header">
        <Users size={16} className="section-icon text-cyan" />
        <div className="header-text-combo">
          <h3>Live Queue Estimator</h3>
          <p className="section-subtitle">Real-time stadium bottlenecks &amp; priority times</p>
        </div>
        <div className="simulation-toggle">
          <span className={`toggle-label ${!isPeak ? 'active-mode' : ''}`}>Normal</span>
          <button 
            className={`toggle-slider-btn ${isPeak ? 'peak-on' : ''}`}
            onClick={() => setIsPeak(!isPeak)}
            aria-label="Toggle Peak Hours Simulation"
          >
            <span className="slider-pill" />
          </button>
          <span className={`toggle-label ${isPeak ? 'active-mode text-red' : ''}`}>Peak</span>
        </div>
      </div>

      <div className="queue-list">
        {QUEUES.map((q) => {
          const wait = isPeak ? q.peakWait : q.normalWait;
          const accWait = isPeak ? q.accessiblePeak : q.accessibleNormal;
          
          // Color coding based on wait times
          let statusClass = 'status-green';
          if (wait > 30) statusClass = 'status-red';
          else if (wait > 15) statusClass = 'status-orange';

          return (
            <div key={q.name} className="queue-row">
              <div className="queue-meta">
                <span className="queue-name">{q.name}</span>
                <span className="queue-type-badge">{q.type}</span>
              </div>
              <div className="queue-visual-metrics">
                <div className="progress-bar-wrap">
                  <div 
                    className={`progress-fill ${statusClass}`}
                    style={{ width: `${Math.min(100, (wait / 50) * 100)}%` }}
                  />
                </div>
                <div className="queue-wait-times">
                  <span className="time-block normal-time">
                    <Clock size={11} /> Standard: <strong>{wait} min</strong>
                  </span>
                  <span className="time-block priority-time">
                    <Sparkles size={11} /> Accessible Lane: <strong>{accWait} min</strong>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

/* Live countdown hook */
function useCountdown(targetSeconds: number) {
  const [secs, setSecs] = useState(targetSeconds);
  useEffect(() => {
    const t = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  const h = String(Math.floor(secs / 3600)).padStart(2, '0');
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return { h, m, s };
}

export const Dashboard: React.FC = () => {
  const { h, m, s } = useCountdown(4 * 3600 + 20 * 60 + 15);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [sosCountdown, setSosCountdown] = useState(0);

  const handleSOS = () => {
    setSosActive(true);
    setSosCountdown(30);
    const timer = setInterval(() => {
      setSosCountdown(prev => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="dashboard animate-fade-in">
      {/* ── Top Stat Strip ── */}
      <div className="stat-strip">
        <div className="stat-chip">
          <Thermometer size={13} />
          <span>28°C · Partly Cloudy</span>
        </div>
        <div className="stat-chip success">
          <Zap size={13} />
          <span>Accessibility Score: 98.2</span>
        </div>
        <div className="stat-chip warning">
          <Users size={13} />
          <span>Crowd: Medium (62%)</span>
        </div>
        <div className="stat-chip info">
          <MapPin size={13} />
          <span>Gate C · Block 102</span>
        </div>
      </div>

      {/* ── Header ── */}
      <header className="dashboard-header">
        <div>
          <h1 className="text-gradient">Welcome back, Alex 👋</h1>
          <p className="subtitle">Your FIFA World Cup 2026™ Match-Day Overview</p>
        </div>

        {/* Live Score Card */}
        <div className="live-score-card glass-panel animate-scale-up">
          <div className="match-badge">
            <span className="match-badge-dot" />
            MATCH DAY
          </div>
          <div className="score-teams">
            <div className="team">
              <span className="team-flag">🇺🇸</span>
              <span className="team-code">USA</span>
            </div>
            <div className="score-vs">
              <span className="vs-divider">VS</span>
              <div className="countdown-box">
                <span className="countdown-unit">
                  <span className="countdown-digit">{h}</span>
                  <span className="countdown-label-sm">HRS</span>
                </span>
                <span className="countdown-sep">:</span>
                <span className="countdown-unit">
                  <span className="countdown-digit">{m}</span>
                  <span className="countdown-label-sm">MIN</span>
                </span>
                <span className="countdown-sep">:</span>
                <span className="countdown-unit">
                  <span className="countdown-digit">{s}</span>
                  <span className="countdown-label-sm">SEC</span>
                </span>
              </div>
            </div>
            <div className="team">
              <span className="team-flag">🏴󠁧󠁢󠁥󠁮󠁧󠁿</span>
              <span className="team-code">ENG</span>
            </div>
          </div>
          <div className="match-venue">SoFi Stadium · Los Angeles</div>
        </div>
      </header>

      {/* ── SOS Emergency Panel ── */}
      {sosActive && (
        <section
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          className="sos-panel glass-panel animate-slide-up"
        >
          <div className="sos-panel-header">
            <ShieldAlert size={20} className="sos-icon-pulse" />
            <div>
              <h2 className="sos-title">🆘 Emergency Assistance Requested</h2>
              <p className="sos-subtitle">Stadium staff have been notified. Help is on the way.</p>
            </div>
          </div>
          <div className="sos-details">
            <div className="sos-status-row">
              <span className="sos-status-dot" />
              <span>Rerouting to nearest accessible assistance point — <strong>Gate C Staff Station</strong></span>
            </div>
            <div className="sos-status-row">
              <span className="sos-status-dot" />
              <span>Estimated staff arrival: <strong>{sosCountdown > 0 ? `${sosCountdown}s` : 'Arrived'}</strong></span>
            </div>
            <div className="sos-status-row">
              <span className="sos-status-dot" />
              <span>Your seat location transmitted: <strong>Block 102 · Row C · Wheelchair Bay</strong></span>
            </div>
          </div>
          <div className="sos-actions">
            <button className="btn-emergency" aria-label="Call stadium medical team">
              📞 Call Medical Team
            </button>
            <button
              className="btn-dismiss"
              onClick={() => setSosActive(false)}
              aria-label="Dismiss SOS emergency panel"
            >
              Dismiss
            </button>
          </div>
        </section>
      )}

      {/* ── Alerts ── */}
      {!alertDismissed && (
        <section className="alerts-section animate-slide-up stagger-2">
          <div className="alert-card emergency">
            <ShieldAlert className="alert-icon" />
            <div className="alert-content">
              <h4>⚡ EMERGENCY: Severe Weather Warning</h4>
              <p>Lightning detected nearby. The match is temporarily paused. Please proceed to the indoor concourse safely. Your accessible route has been updated.</p>
              <div className="emergency-actions">
                <button className="btn-emergency">View Evacuation Route</button>
                <button className="btn-assist">I Need Assistance</button>
                <button className="btn-dismiss" onClick={() => setAlertDismissed(true)}>Dismiss</button>
              </div>
            </div>
          </div>

          <div className="alert-card warning mt-sm">
            <AlertCircle className="alert-icon" />
            <div className="alert-content">
              <h4>Gate Change Notice</h4>
              <p>Your accessible entry gate has been updated to <strong>Gate C (East Concourse)</strong>. Ramp access confirmed.</p>
            </div>
          </div>
        </section>
      )}

      {/* ── Main Grid ── */}
      <div className="dashboard-grid">
        {/* Timeline */}
        <section className="timeline-card glass-panel animate-scale-up stagger-3">
          <div className="section-header">
            <Trophy size={16} className="section-icon" />
            <h3>Match-Day Timeline</h3>
          </div>
          <div className="timeline">
            <div className="timeline-item completed">
              <div className="timeline-icon">
                <Calendar size={16} />
                <div className="tl-progress-line" />
              </div>
              <div className="timeline-content">
                <h4>Tickets Verified ✓</h4>
                <p>2x Accessible Seating, Block 102</p>
                <span className="time">09:00 AM</span>
              </div>
            </div>

            <div className="timeline-item active">
              <div className="timeline-icon">
                <Navigation size={16} />
                <div className="tl-progress-line active-line" />
              </div>
              <div className="timeline-content">
                <h4>Accessible Transit <span className="live-tag">LIVE</span></h4>
                <p>Smart Shuttle arriving at downtown hub.</p>
                <span className="time">Now — 01:15 PM</span>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-icon">
                <MapPin size={16} />
                <div className="tl-progress-line" />
              </div>
              <div className="timeline-content">
                <h4>Stadium Arrival</h4>
                <p>Proceed to Gate C for priority screening.</p>
                <span className="time">02:00 PM</span>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-icon">
                <Clock size={16} />
              </div>
              <div className="timeline-content">
                <h4>Kick-off 🏟️</h4>
                <p>USA vs. England — SoFi Stadium</p>
                <span className="time">03:30 PM</span>
              </div>
            </div>
          </div>
        </section>

        {/* Live Queue Estimator */}
        <QueueEstimator />

        {/* Sustainability Green Rewards Tracker */}
        <SustainabilityTracker />

        {/* Quick Actions */}
        <section className="quick-actions animate-scale-up stagger-4">
          <div className="section-header">
            <Zap size={16} className="section-icon" />
            <h3>Quick Actions</h3>
          </div>
          <div className="actions-grid">
            <button className="action-btn glass-panel">
              <div className="action-icon-ring blue">
                <Navigation className="action-icon" />
              </div>
              <span>Live Routing</span>
              <span className="action-sub">2 min ETA</span>
            </button>
            <button
              className="action-btn glass-panel"
              onClick={handleSOS}
              aria-label="Activate emergency SOS assistance"
            >
              <div className="action-icon-ring red">
                <AlertCircle className="action-icon" />
              </div>
              <span>Request Help</span>
              <span className="action-sub">Instant SOS</span>
            </button>
            <button className="action-btn glass-panel">
              <div className="action-icon-ring cyan">
                <MapPin className="action-icon" />
              </div>
              <span>Find Restroom</span>
              <span className="action-sub">30m away</span>
            </button>
            <button className="action-btn glass-panel">
              <div className="action-icon-ring amber">
                <Calendar className="action-icon" />
              </div>
              <span>Food Delivery</span>
              <span className="action-sub">Seat delivery</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
