import React, { useState } from 'react';
import { Eye, Ear, ShieldCheck, Heart, Save, CheckCircle2 } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import './Profile.css';

interface ToggleProps {
  label: string;
  description: string;
  icon: React.ReactNode;
  value: boolean;
  onChange: () => void;
  color?: string;
}

const AccessibilityToggle: React.FC<ToggleProps> = ({ label, description, icon, value, onChange, color = 'var(--accent-primary)' }) => (
  <div className={`requirement-toggle${value ? ' active' : ''}`} onClick={onChange} style={{ '--toggle-color': color } as React.CSSProperties}>
    <div className="req-info">
      <div className="req-icon-wrap" style={{ background: value ? `color-mix(in srgb, ${color} 15%, transparent)` : undefined, borderColor: value ? `color-mix(in srgb, ${color} 35%, transparent)` : undefined }}>
        <span className="req-icon" style={{ color: value ? color : undefined }}>{icon}</span>
      </div>
      <div>
        <h4>{label}</h4>
        <p>{description}</p>
      </div>
    </div>
    <div className={`toggle-switch${value ? ' on' : ''}`} style={value ? { background: color } as React.CSSProperties : {}}>
      <div className="switch-knob" />
    </div>
  </div>
);

export const Profile: React.FC = () => {
  const { settings, updateSettings } = useAccessibility();

  const [mobility, setMobility] = useState(true);
  const [saved, setSaved] = useState(false);
  const [language, setLanguage] = useState(settings.language || 'en');
  const [venueId, setVenueId] = useState(settings.venueId || 'los-angeles');

  const handleToggleVision = () => {
    const nextVal = !settings.highContrast;
    updateSettings({
      highContrast: nextVal,
      textScale: nextVal ? 'large' : 'normal'
    });
  };

  const handleToggleHearing = () => {
    updateSettings({ voiceOutput: !settings.voiceOutput });
  };

  const handleToggleCognitive = () => {
    updateSettings({ screenReaderMode: !settings.screenReaderMode });
  };

  const handleSave = () => {
    updateSettings({ language, venueId });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="profile-page animate-fade-in">
      <header className="profile-header">
        <h1 className="text-gradient">Accessibility Profile</h1>
        <p className="subtitle">Personalize your AccessSphere experience for FIFA World Cup 2026™</p>
      </header>

      <div className="profile-grid">
        {/* Personal Card */}
        <section className="profile-card glass-panel animate-scale-up stagger-1">
          <h3>Personal Details</h3>
          <div className="personal-info">
            <div className="avatar-large">
              <div className="avatar-img">
                <img
                  src="https://ui-avatars.com/api/?name=Alex+Johnson&background=3b82f6&color=fff&bold=true&size=128"
                  alt="Alex Johnson"
                />
              </div>
              <div className="avatar-ring" />
              <div className="avatar-badge">♿</div>
            </div>
            <div className="info-fields">
              <div className="field">
                <label>Full Name</label>
                <input type="text" defaultValue="Alex Johnson" className="input-field" />
              </div>
              <div className="field">
                <label>Ticket Number</label>
                <input type="text" defaultValue="FWC26-982347" className="input-field" readOnly />
              </div>
              <div className="field">
                <label>Seat</label>
                <input type="text" defaultValue="Block 102 · Row C · Wheelchair Bay" className="input-field" readOnly />
              </div>
              <div className="field">
                <label htmlFor="language-select">Language</label>
                <select
                  id="language-select"
                  className="input-field"
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="ar">العربية</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="venue-select">Home Venue</label>
                <select
                  id="venue-select"
                  className="input-field"
                  value={venueId}
                  onChange={e => setVenueId(e.target.value)}
                >
                  <option value="los-angeles">SoFi Stadium — Los Angeles</option>
                  <option value="new-york-new-jersey">MetLife Stadium — New York/NJ</option>
                  <option value="dallas">AT&amp;T Stadium — Dallas</option>
                  <option value="san-francisco">Levi's Stadium — San Francisco</option>
                  <option value="miami">Hard Rock Stadium — Miami</option>
                  <option value="seattle">Lumen Field — Seattle</option>
                  <option value="boston">Gillette Stadium — Boston</option>
                  <option value="philadelphia">Lincoln Financial — Philadelphia</option>
                  <option value="kansas-city">Arrowhead Stadium — Kansas City</option>
                  <option value="atlanta">Mercedes-Benz Stadium — Atlanta</option>
                  <option value="guadalajara">Estadio Akron — Guadalajara</option>
                  <option value="mexico-city">Estadio Azteca — Mexico City</option>
                  <option value="monterrey">Estadio BBVA — Monterrey</option>
                  <option value="toronto">BMO Field — Toronto</option>
                  <option value="vancouver">BC Place — Vancouver</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Requirements */}
        <section className="profile-card glass-panel animate-scale-up stagger-2">
          <h3>Accessibility Needs</h3>
          <div className="requirements-list">
            <AccessibilityToggle
              label="Mobility Assistance"
              description="Wheelchair accessible routing and priority seating."
              icon={<Heart size={16} />}
              value={mobility}
              onChange={() => setMobility(v => !v)}
              color="var(--accent-primary)"
            />
            <AccessibilityToggle
              label="Visual Assistance"
              description="High contrast, large text, and audio descriptions."
              icon={<Eye size={16} />}
              value={settings.highContrast}
              onChange={handleToggleVision}
              color="var(--info)"
            />
            <AccessibilityToggle
              label="Hearing Assistance"
              description="Sign language translation and haptic alerts."
              icon={<Ear size={16} />}
              value={settings.voiceOutput}
              onChange={handleToggleHearing}
              color="var(--accent-secondary)"
            />
            <AccessibilityToggle
              label="Cognitive Support"
              description="Simplified instructions and quiet zone navigation."
              icon={<ShieldCheck size={16} />}
              value={settings.screenReaderMode}
              onChange={handleToggleCognitive}
              color="var(--success)"
            />
          </div>
        </section>

        {/* Active needs summary */}
        <section className="needs-summary glass-panel animate-scale-up stagger-3">
          <h3>Active Accommodations</h3>
          <div className="accommodation-chips">
            {mobility  && <span className="acc-chip blue">♿ Wheelchair Routing</span>}
            {settings.highContrast && <span className="acc-chip cyan">👁 Audio Descriptions</span>}
            {settings.voiceOutput  && <span className="acc-chip purple">👂 Haptic Alerts</span>}
            {settings.screenReaderMode && <span className="acc-chip green">🧠 Quiet Zones</span>}
            {!mobility && !settings.highContrast && !settings.voiceOutput && !settings.screenReaderMode &&
              <span className="acc-chip muted">No active accommodations</span>
            }
          </div>
        </section>

        {/* Save button */}
        <section className="profile-actions animate-scale-up stagger-4">
          <button className={`save-btn${saved ? ' saved' : ''}`} onClick={handleSave}>
            {saved
              ? <><CheckCircle2 size={18} /> Profile Saved!</>
              : <><Save size={18} /> Save Profile</>
            }
          </button>
        </section>
      </div>
    </div>
  );
};
