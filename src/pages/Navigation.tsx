import React, { useState } from 'react';
import { Compass, Navigation2, ArrowUp, ArrowUpRight, Maximize2, Map, Crosshair, Zap, Clock, ChevronRight } from 'lucide-react';
import './Navigation.css';

export const Navigation: React.FC = () => {
  const [arActive, setArActive] = useState(true);

  return (
    <div className="navigation-page animate-fade-in">
      <header className="navigation-header">
        <div className="header-title">
          <div className="nav-icon-hero">
            <Compass className="nav-hero-icon" />
          </div>
          <div>
            <h2>AR Indoor Navigation</h2>
            <p className="subtitle">
              Routing to: <strong className="text-gradient">Block 102 · Accessible Seating</strong>
            </p>
          </div>
        </div>
        <div className="nav-header-chips">
          <span className="nav-hchip active-route">
            <span className="pulse-dot-sm" style={{background:'var(--success)', color:'var(--success)'}} />
            Active Route
          </span>
          <span className="nav-hchip">
            <Zap size={12} />
            Elevator Access
          </span>
        </div>
      </header>

      <div className="navigation-content">
        {/* ── AR Viewport ── */}
        <section className={`ar-view ${arActive ? 'active' : ''} glass-panel`}>
          <div className="ar-camera-feed">
            {/* Perspective grid */}
            <div className="ar-grid" />

            <div className="ar-overlay">
              {/* Path arrows */}
              <div className="ar-path">
                <div className="ar-arrow-wrap pulse">
                  <ArrowUpRight className="ar-icon" />
                  <span className="ar-arrow-label">Turn Right</span>
                </div>
                <div className="ar-arrow-wrap future-1">
                  <ArrowUp className="ar-icon" />
                </div>
                <div className="ar-arrow-wrap future-2">
                  <ArrowUp className="ar-icon" />
                </div>
              </div>

              {/* Target reticle */}
              <div className="ar-target">
                <div className="reticle-rings">
                  <span className="reticle-ring r1" />
                  <span className="reticle-ring r2" />
                  <span className="reticle-ring r3" />
                </div>
                <Crosshair className="target-crosshair" />
                <span className="target-label">Elevator 3</span>
                <span className="target-dist">30m ahead</span>
              </div>
            </div>

            {/* Path trail dots */}
            <div className="path-trail">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="trail-dot" style={{ bottom: `${15 + i * 8}%`, left: `50%`, animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>

            {/* HUD corner info */}
            <div className="ar-hud-tl">
              <span className="hud-label">Heading</span>
              <span className="hud-value text-gradient">NE 045°</span>
            </div>
            <div className="ar-hud-tr">
              <span className="hud-label">Signal</span>
              <span className="hud-value" style={{color:'var(--success)'}}>Strong</span>
            </div>
          </div>

          {/* Turn instruction card */}
          <div className="turn-instruction glass-panel animate-slide-up">
            <div className="turn-icon-wrapper">
              <ArrowUpRight className="instruction-icon" />
            </div>
            <div className="turn-text">
              <h3>Turn right in <span className="text-gradient">30m</span></h3>
              <p>Proceed to Elevator 3 for Level 2 access</p>
            </div>
            <div className="turn-eta">
              <Clock size={13} />
              2 min
            </div>
          </div>
        </section>

        {/* ── Sidebar ── */}
        <aside className="minimap-sidebar">
          {/* Minimap */}
          <div className="minimap-card glass-panel animate-scale-up stagger-2">
            <div className="card-header">
              <Map size={15} className="card-icon" />
              <h3>Level 1 Floorplan</h3>
              <button className="icon-btn-small" onClick={() => setArActive(!arActive)}>
                <Maximize2 size={14} />
              </button>
            </div>

            <div className="minimap-container">
              <div className="minimap-layout">
                <div className="map-zone store">Store</div>
                <div className="map-zone restroom">WC</div>
                <div className="map-route-line" />
                <div className="map-current-pos">
                  <span className="pos-dot" />
                  <span className="pos-ring" />
                </div>
                <div className="map-target-marker">
                  <Crosshair size={14} />
                  <span>E3</span>
                </div>
              </div>
            </div>

            <div className="route-details">
              <div className="route-stat">
                <span className="label">Distance</span>
                <span className="value text-gradient">120m</span>
              </div>
              <div className="route-stat">
                <span className="label">ETA</span>
                <span className="value">2 min</span>
              </div>
              <div className="route-stat">
                <span className="label">Access</span>
                <span className="value" style={{color:'var(--success)'}}>Elevator</span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="upcoming-turns glass-panel animate-scale-up stagger-3">
            <div className="card-header">
              <Navigation2 size={15} className="card-icon" />
              <h3>Next Steps</h3>
            </div>
            <div className="steps-list">
              {[
                { icon: ArrowUpRight, dist: '30m', desc: 'Turn right to Elevator 3', active: true, color: 'var(--accent-primary)' },
                { icon: ArrowUp,      dist: 'Lift', desc: 'Take Elevator 3 to Level 2', active: false, color: 'var(--info)' },
                { icon: Navigation2,  dist: '50m',  desc: 'Proceed straight to Block 102', active: false, color: 'var(--success)' },
              ].map(({ icon: Icon, dist, desc, active, color }, i) => (
                <div key={i} className={`step-item${active ? ' active' : ''}`}>
                  <div className="step-icon-wrap" style={{ borderColor: active ? color : undefined }}>
                    <Icon size={14} style={{ color: active ? color : undefined }} />
                  </div>
                  <div className="step-content">
                    <span className="dist" style={{ color: active ? color : undefined }}>{dist}</span>
                    <span className="desc">{desc}</span>
                  </div>
                  <ChevronRight size={13} className="step-chevron" />
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
