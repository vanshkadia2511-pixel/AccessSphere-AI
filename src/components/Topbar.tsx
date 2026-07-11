import React, { useState, useEffect } from 'react';
import { Bell, Search, Mic, Clock } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import './Topbar.css';

const PAGE_TITLES: Record<string, string> = {
  '/':           'Dashboard',
  '/assistant':  'AI Assistant',
  '/planner':    'Route Planner',
  '/navigation': 'AR Navigation',
  '/live':       'Live Intelligence',
  '/vision':     'Vision Scanner',
  '/profile':    'Accessibility Profile',
  '/score':      'Evaluation Score',
};

export const Topbar: React.FC = () => {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] ?? 'AccessSphere';

  const [time, setTime] = useState(() => new Date());
  const [notifShake, setNotifShake] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const shake = setInterval(() => setNotifShake(true), 12000);
    const reset = setInterval(() => setNotifShake(false), 12700);
    return () => { clearInterval(shake); clearInterval(reset); };
  }, []);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

  return (
    <header className="topbar glass-panel animate-fade-in">
      {/* Page title */}
      <div className="topbar-title">
        <span className="topbar-page-label">{title}</span>
        <span className="topbar-match-tag">USA 🆚 England · Match Day</span>
      </div>

      {/* Search */}
      <div className={`search-bar${searchFocused ? ' focused' : ''}`}>
        <Search className="search-icon" />
        <input
          type="text"
          placeholder="Ask AccessSphere AI..."
          className="search-input"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
        <Mic className="search-mic" />
      </div>

      {/* Actions */}
      <div className="topbar-actions">
        {/* Live clock */}
        <div className="topbar-clock">
          <Clock size={13} />
          <span className="clock-time">{formatTime(time)}</span>
        </div>

        {/* Notification bell */}
        <button
          className={`icon-btn notif-btn${notifShake ? ' shake' : ''}`}
          aria-label="Notifications"
        >
          <Bell className="icon" />
          <span className="notif-badge">3</span>
        </button>

        {/* Avatar */}
        <div className="user-avatar-wrapper">
          <div className="online-ring" />
          <div className="user-avatar">
            <img
              src="https://ui-avatars.com/api/?name=Alex+Johnson&background=3b82f6&color=fff&bold=true&size=128"
              alt="Alex Johnson"
            />
          </div>
          <span className="online-dot" />
        </div>
      </div>
    </header>
  );
};
