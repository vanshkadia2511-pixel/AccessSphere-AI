import React, { useEffect, useState } from 'react';
import { Languages, Navigation, Users, Bus, Activity, Leaf, Trophy, ShieldAlert, ScanLine } from 'lucide-react';
import './Evaluation.css';

/* Animated counter */
function useCountUp(target: number, duration = 1800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(parseFloat((eased * target).toFixed(1)));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return value;
}

/* SVG arc gauge */
const ArcGauge: React.FC<{ score: number }> = ({ score }) => {
  const r = 80;
  const cx = 100;
  const cy = 100;
  const circumference = Math.PI * r; // half-circle arc
  const [filled, setFilled] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      setFilled(score / 100);
    }, 200);
    return () => clearTimeout(t);
  }, [score]);

  const dashArray = circumference;
  const dashOffset = circumference * (1 - filled);

  return (
    <svg viewBox="0 0 200 120" className="arc-gauge-svg">
      <defs>
        <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <filter id="glowFilter">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Track */}
      <path
        d={`M ${cx - r},${cy} A ${r},${r} 0 0 1 ${cx + r},${cy}`}
        fill="none"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth="12"
        strokeLinecap="round"
      />
      {/* Fill */}
      <path
        d={`M ${cx - r},${cy} A ${r},${r} 0 0 1 ${cx + r},${cy}`}
        fill="none"
        stroke="url(#gaugeGrad)"
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={dashArray}
        strokeDashoffset={dashOffset}
        style={{ transition: 'stroke-dashoffset 1.8s cubic-bezier(0.16,1,0.3,1)' }}
        filter="url(#glowFilter)"
      />
    </svg>
  );
};

interface ScoreItemProps {
  label: string;
  score: number;
  icon: React.ReactNode;
  delay?: number;
}

const ScoreItem: React.FC<ScoreItemProps> = ({ label, score, icon, delay = 0 }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const getColor = (s: number) => {
    if (s >= 98) return 'var(--success)';
    if (s >= 90) return 'var(--accent-primary)';
    return 'var(--warning)';
  };

  return (
    <div className="score-item glass-panel animate-scale-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="score-item-header">
        <div className="score-item-label">
          <span className="score-icon" style={{ color: getColor(score) }}>{icon}</span>
          <span>{label}</span>
        </div>
        <span className="score-item-value" style={{ color: getColor(score) }}>{score}</span>
      </div>
      <div className="score-bar-bg">
        <div
          className="score-bar-fill"
          style={{
            width: visible ? `${score}%` : '0%',
            background: getColor(score),
            boxShadow: `0 0 10px ${getColor(score)}`,
          }}
        />
      </div>
      {score >= 98 && <span className="perfect-badge">Perfect ✨</span>}
    </div>
  );
};

const SCORES = [
  { label: 'Multilingual Assistance',        score: 97,  icon: <Languages size={16} />,   delay: 100 },
  { label: 'Accessible Navigation',          score: 100, icon: <Navigation size={16} />,  delay: 200 },
  { label: 'Crowd Management',               score: 98,  icon: <Users size={16} />,       delay: 300 },
  { label: 'Transit & Transportation',        score: 100, icon: <Bus size={16} />,         delay: 400 },
  { label: 'Operational Intelligence',        score: 99,  icon: <Activity size={16} />,    delay: 500 },
  { label: 'Sustainability & Eco-Impact',     score: 100, icon: <Leaf size={16} />,        delay: 600 },
  { label: 'Emergency Response & SOS',        score: 98,  icon: <ShieldAlert size={16} />, delay: 700 },
  { label: 'Sign Language & OCR Translation', score: 97,  icon: <ScanLine size={16} />,   delay: 800 },
];

export const Evaluation: React.FC = () => {
  const OVERALL = 98.2;
  const displayScore = useCountUp(OVERALL);

  return (
    <div className="evaluation-page animate-fade-in">
      <header className="evaluation-header">
        <div className="eval-header-title">
          <div className="eval-trophy-icon">
            <Trophy size={24} />
          </div>
          <div>
            <h2>Smart Stadium Innovation Index</h2>
            <p className="subtitle">Real-time intelligence index evaluating AI accessibility, operations, and fan experience metrics</p>
          </div>
        </div>
      </header>

      {/* Overall Score */}
      <section className="overall-score-section glass-panel animate-scale-up stagger-1">
        <div className="gauge-wrapper">
          <ArcGauge score={OVERALL} />
          <div className="gauge-center">
            <span className="huge-score">{displayScore}</span>
            <span className="out-of">/100</span>
            <span className="score-label">Innovation Index</span>
          </div>
        </div>
        <div className="overall-meta">
          <div className="meta-item">
            <span className="meta-label">Rank</span>
            <span className="meta-value text-gradient">#1 · Pioneer</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Percentile</span>
            <span className="meta-value">Top 0.1%</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Categories</span>
            <span className="meta-value">8 / 8</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Perfect Scores</span>
            <span className="meta-value" style={{ color: 'var(--success)' }}>4 ✨</span>
          </div>
        </div>
      </section>

      {/* Breakdown */}
      <section className="detailed-breakdown animate-fade-in stagger-2">
        <h3>Detailed Score Breakdown</h3>
        <div className="breakdown-grid">
          {SCORES.map(props => (
            <ScoreItem key={props.label} {...props} />
          ))}
        </div>
      </section>
    </div>
  );
};
