import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home, MessageSquare, User, Activity, Camera, Compass,
  Trophy, Settings, Map, Wifi, Shield
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { to: '/',            icon: Home,          label: 'Dashboard',    stagger: 'stagger-1' },
  { to: '/assistant',   icon: MessageSquare, label: 'AI Assistant', stagger: 'stagger-2' },
  { to: '/planner',     icon: Map,           label: 'Planner',      stagger: 'stagger-3' },
  { to: '/navigation',  icon: Compass,       label: 'AR Nav',       stagger: 'stagger-4' },
  { to: '/live',        icon: Activity,      label: 'Live Map',     stagger: 'stagger-5' },
  { to: '/vision',      icon: Camera,        label: 'Scanner',      stagger: 'stagger-6' },
  { to: '/profile',     icon: User,          label: 'Accessibility',stagger: 'stagger-7' },
  { to: '/score',       icon: Trophy,        label: 'Innovation Index', stagger: 'stagger-8' },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo animate-fade-in">
        <div className="logo-icon-wrapper">
          <Shield className="logo-shield" />
        </div>
        <div className="logo-text">
          <span className="logo-main text-gradient">AccessSphere</span>
          <span className="logo-sub">AI Platform</span>
        </div>
      </div>

      {/* Live Status */}
      <div className="sidebar-status animate-fade-in stagger-1">
        <span className="status-dot"></span>
        <span className="status-label">FIFA World Cup 2026™</span>
        <Wifi size={11} className="status-wifi" />
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {navItems.map(({ to, icon: Icon, label, stagger }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `nav-item animate-fade-in ${stagger}${isActive ? ' active' : ''}`
            }
          >
            <span className="nav-icon-wrapper">
              <Icon className="nav-icon" />
            </span>
            <span className="nav-label">{label}</span>
            <span className="nav-active-indicator" />
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer animate-fade-in stagger-8">
        <button className="nav-item settings-btn">
          <span className="nav-icon-wrapper">
            <Settings className="nav-icon" />
          </span>
          <span className="nav-label">Settings</span>
        </button>
        <div className="sidebar-version">v2.6.0 · Match Day Build</div>
      </div>
    </aside>
  );
};
