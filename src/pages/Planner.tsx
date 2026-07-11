import React, { useState } from 'react';
import { Map as MapIcon, Compass, Navigation2, CheckCircle2, CloudRain, ArrowRight, Bus, Train, Car } from 'lucide-react';
import './Planner.css';

interface RouteOption {
  id: string;
  name: string;
  icon: React.ElementType;
  totalTime: number;
  timeLabel: string;
  crowdLevel: string;
  gate: string;
  carbonSaved: string;
  steps: {
    title: string;
    desc: string;
    time: string;
    badge?: string;
    badgeClass?: string;
  }[];
}

const ROUTE_OPTIONS: RouteOption[] = [
  {
    id: 'shuttle',
    name: 'Smart Shuttle (ADA Line A)',
    icon: Bus,
    totalTime: 52,
    timeLabel: 'mins total (+7m)',
    crowdLevel: 'Medium',
    gate: 'Gate C',
    carbonSaved: '🌱 82% Carbon Saved',
    steps: [
      { title: 'Leave Hotel', desc: 'ADA priority shuttle pickup outside lobby.', time: '10:00 AM' },
      { title: 'Smart Shuttle (Line A)', desc: 'Wheelchair ramp deployed. In-transit crowd tracking.', time: '10:15 AM - Downtown Hub', badge: '★ Reserved Spot', badgeClass: 'spec-tag-reserved' },
      { title: 'Arrive at East Transit Center', desc: 'Dedicated dropoff zone close to priority lift.', time: '11:00 AM' },
      { title: 'Navigate to Gate C', desc: 'Covered ramp path via AR Assist navigation.', time: '11:05 AM' }
    ]
  },
  {
    id: 'rail',
    name: 'LA Metro (Light Rail)',
    icon: Train,
    totalTime: 38,
    timeLabel: 'mins total',
    crowdLevel: 'High',
    gate: 'Gate A',
    carbonSaved: '⚡ 95% Emissions Saved',
    steps: [
      { title: 'Leave Hotel', desc: 'Walk 100m to 7th St Metro Station (Elevator active).', time: '10:00 AM' },
      { title: 'Metro E-Line Train', desc: 'Level boarding. Accessible cars located in front/back.', time: '10:10 AM', badge: '🌱 Low Carbon', badgeClass: 'spec-tag-green' },
      { title: 'Arrive at Downtown transit plaza', desc: 'Follow green guide signs to stadium escalators.', time: '10:33 AM' },
      { title: 'Navigate to Gate A', desc: 'High traffic concourse. Security lane 4 has ADA support.', time: '10:38 AM' }
    ]
  },
  {
    id: 'rideshare',
    name: 'Uber / Lyft (Accessible Rides)',
    icon: Car,
    totalTime: 45,
    timeLabel: 'mins total (+12m)',
    crowdLevel: 'Low',
    gate: 'Gate B',
    carbonSaved: '🚗 Standard Vehicle Profile',
    steps: [
      { title: 'Leave Hotel', desc: 'Request Wheelchair Accessible Vehicle (WAV) via app.', time: '10:00 AM' },
      { title: 'Rideshare WAV Transport', desc: 'Direct travel to official drop-off Zone 2.', time: '10:15 AM' },
      { title: 'Arrive at West Drop-Off Zone', desc: 'Use sidewalk ramp towards Block 102 entry.', time: '10:40 AM' },
      { title: 'Navigate to Gate B', desc: 'Elevator entry active behind concessions.', time: '10:45 AM' }
    ]
  }
];

export const Planner: React.FC = () => {
  const [selectedRoute, setSelectedRoute] = useState('shuttle');
  const route = ROUTE_OPTIONS.find(r => r.id === selectedRoute) || ROUTE_OPTIONS[0];

  return (
    <div className="planner-page animate-fade-in">
      <header className="planner-header">
        <div className="header-title">
          <div className="planner-icon-wrap">
            <Compass className="title-icon" />
          </div>
          <div>
            <h1 className="text-gradient">Transportation &amp; Navigation Planner</h1>
            <p className="subtitle">Your customized accessible route to the stadium.</p>
          </div>
        </div>
      </header>

      {/* Transit mode picker */}
      <div className="transit-mode-picker glass-panel animate-scale-up">
        <label className="picker-label">Select Transit Option:</label>
        <div className="transit-chips">
          {ROUTE_OPTIONS.map((opt) => {
            const IconComponent = opt.icon;
            return (
              <button
                key={opt.id}
                className={`transit-chip${opt.id === selectedRoute ? ' active' : ''}`}
                onClick={() => setSelectedRoute(opt.id)}
              >
                <IconComponent size={14} />
                <span>{opt.name.split(' (')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="weather-alert glass-panel warning-theme animate-scale-up stagger-1">
        <div className="weather-alert-glow" />
        <CloudRain className="weather-icon animate-pulse" />
        <div className="weather-content">
          <h4>Weather Alert: Heavy Rain Expected</h4>
          <p>Your route has been updated to prioritize covered walkways and indoor transit hubs.</p>
        </div>
      </div>

      <div className="planner-grid">
        <section className="route-overview glass-panel animate-scale-up stagger-2">
          <div className="route-header">
            <h3>{route.name}</h3>
            <span className="badge">♿ Wheelchair Accessible</span>
          </div>
          
          <div className="route-stats">
            <div className="stat">
              <span className="stat-value text-gradient-tri">{route.totalTime}</span>
              <span className="stat-label">{route.timeLabel}</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-value text-gradient">{route.crowdLevel}</span>
              <span className="stat-label">Crowd Level</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-value text-gradient">{route.gate}</span>
              <span className="stat-label">Elevator Entry</span>
            </div>
          </div>

          <div className="sustainability-info-tag">
            <span>{route.carbonSaved}</span>
          </div>

          <div className="map-placeholder">
            <div className="map-grid-overlay" />
            <div className="map-pulsing-rings">
              <span className="map-ring r1" />
              <span className="map-ring r2" />
            </div>
            <MapIcon className="map-icon" />
            <p className="map-text">Live Interactive 3D Floorplan ({route.gate})</p>
            <button className="btn-primary map-btn">
              <span>Start Live Navigation</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </section>

        <section className="itinerary glass-panel animate-scale-up stagger-3">
          <h3>Step-by-Step Itinerary</h3>
          
          <div className="itinerary-steps">
            {route.steps.map((step, idx) => {
              const isCompleted = idx === 0;
              const isActive = idx === 1;

              return (
                <div key={idx} className={`step${isCompleted ? ' completed' : ''}${isActive ? ' active' : ''}`}>
                  <div className="step-indicator">
                    <div className="step-icon-wrapper">
                      {isCompleted ? <CheckCircle2 className="step-icon" /> : isActive ? <Navigation2 className="step-icon" /> : <MapIcon className="step-icon" />}
                    </div>
                    {idx < route.steps.length - 1 && <div className="step-line"></div>}
                  </div>
                  <div className="step-details">
                    <h4>{step.title}</h4>
                    <p className="step-time">{step.time}</p>
                    <p className="step-desc-detail">{step.desc}</p>
                    {step.badge && (
                      <div className="step-extra">
                        <span className={`tag ${step.badgeClass}`}>{step.badge}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};
