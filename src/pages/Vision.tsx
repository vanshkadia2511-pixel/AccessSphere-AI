import React, { useState, useRef } from 'react';
import { Camera, ScanLine, Type, Maximize, AlertTriangle, Volume2, Zap, Upload, Bot } from 'lucide-react';
import './Vision.css';

type VisionMode = 'obstacle' | 'ocr' | 'scene';

const MODES: { id: VisionMode; icon: React.ElementType; label: string; desc: string }[] = [
  { id: 'obstacle', icon: ScanLine, label: 'Obstacles', desc: 'Detect hazards' },
  { id: 'ocr',      icon: Type,     label: 'Read Signs', desc: 'Translate text' },
  { id: 'scene',    icon: Maximize, label: 'Scene',      desc: 'Audio describe' },
];

const SIGN_SAMPLES = [
  { id: 'es1', flag: '🇪🇸', lang: 'ES', original: 'Baños Accesibles — Sector Este', translated: 'Accessible Restrooms — East Sector', note: 'Fully equipped with grab bars and wheelchair space.' },
  { id: 'fr1', flag: '🇫🇷', lang: 'FR', original: 'Sortie de Secours — Niveau 2', translated: 'Emergency Exit — Level 2', note: 'Ramp access available. Follow green floor markers.' },
  { id: 'ar1', flag: '🇸🇦', lang: 'AR', original: 'مصعد — الطابق الأرضي', translated: 'Elevator — Ground Floor', note: 'Wheelchair-accessible elevator with tactile buttons.' },
  { id: 'pt1', flag: '🇧🇷', lang: 'PT', original: 'Zona Sensorial — Ambiente Calmo', translated: 'Sensory Zone — Quiet Environment', note: 'Designed for fans with sensory sensitivities. Low lighting, reduced noise.' },
  { id: 'de1', flag: '🇩🇪', lang: 'DE', original: 'Rollstuhlplätze — Block 102', translated: 'Wheelchair Bays — Block 102', note: 'Priority seating with companion spaces and unobstructed sightlines.' },
];

export const Vision: React.FC = () => {
  const [activeMode, setActiveMode] = useState<VisionMode>('obstacle');
  const [scanning, setScanning] = useState(true);
  const [selectedSign, setSelectedSign] = useState(0);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sign = SIGN_SAMPLES[selectedSign];

  const speakTranslation = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      setUploadedImage(dataUrl);
      setAiResult(null);
      setAiLoading(true);
      try {
        // Send to backend vision endpoint
        const res = await fetch('/api/vision-ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image_data_url: dataUrl })
        });
        const data = await res.json();
        setAiResult(data.result || 'No text detected in image.');
      } catch {
        setAiResult('Gemini Vision unavailable — using offline samples below.');
      } finally {
        setAiLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="vision-page animate-fade-in">
      <header className="vision-header">
        <div className="header-title">
          <div className="vision-icon-wrap">
            <Camera className="title-icon" />
          </div>
          <div>
            <h2>Vision Scanner</h2>
            <p className="subtitle">AI-powered spatial awareness &amp; real-time translation</p>
          </div>
        </div>
        <div className="vision-status-chips">
          <span className="vision-chip active-chip"><span className="pulse-dot-sm" />Live Feed</span>
          <span className="vision-chip">60 FPS</span>
          <span className="vision-chip">Gemini Vision</span>
        </div>
      </header>

      <div className="vision-container glass-panel">
        {/* Viewfinder */}
        <div className="viewfinder">
          <div className="camera-feed" />

          {/* Corner brackets */}
          <div className="corner corner-tl" />
          <div className="corner corner-tr" />
          <div className="corner corner-bl" />
          <div className="corner corner-br" />

          {/* Mode overlays */}
          {activeMode === 'obstacle' && (
            <div className="overlay obstacle-overlay">
              <div className="bounding-box hazard animate-scale-up">
                <span className="box-label">
                  <AlertTriangle size={12} className="box-icon" />
                  Obstacle — Wet Floor (3m)
                </span>
              </div>
              <div className="bounding-box safe animate-scale-up stagger-2">
                <span className="box-label safe-label">✓ Clear Path</span>
              </div>
              <div className="detection-confidence">
                <Zap size={11} />
                <span>97.3% Confidence</span>
              </div>
            </div>
          )}

          {activeMode === 'ocr' && (
            <div className="overlay ocr-overlay">
              <div className="bounding-box text-target animate-scale-up" />

              {/* Live Upload Path */}
              <div className="upload-bar glass-panel animate-slide-up">
                <label className="upload-label" htmlFor="sign-upload">
                  <Upload size={13} />
                  Upload Sign Photo for Gemini Vision AI
                </label>
                <input
                  id="sign-upload"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="upload-input"
                  onChange={handleImageUpload}
                  aria-label="Upload a sign photo for AI translation"
                />
              </div>

              {/* AI live result */}
              {aiLoading && (
                <div className="ai-vision-loading glass-panel animate-slide-up">
                  <Bot size={14} className="text-accent" />
                  <span>Gemini Vision analyzing image...</span>
                </div>
              )}
              {aiResult && !aiLoading && (
                <div className="ai-vision-result glass-panel animate-slide-up" role="status" aria-live="polite">
                  {uploadedImage && (
                    <img src={uploadedImage} alt="Uploaded sign" className="uploaded-thumb" />
                  )}
                  <div className="ai-vision-result-header">
                    <Bot size={13} className="text-accent" />
                    <span className="ai-triage-title">Gemini Vision Result</span>
                  </div>
                  <p className="ai-triage-text">{aiResult}</p>
                  <button
                    className="read-aloud-btn"
                    onClick={() => speakTranslation(aiResult!)}
                  >
                    <Volume2 size={13} /> Read Aloud
                  </button>
                </div>
              )}

              {/* Sign Selector (sample fallback) */}
              <div className="sign-selector-bar glass-panel animate-slide-up">
                <label className="sign-selector-label">Sample Stadium Signs:</label>
                <div className="sign-chips">
                  {SIGN_SAMPLES.map((s, i) => (
                    <button
                      key={s.id}
                      className={`sign-chip${i === selectedSign ? ' active' : ''}`}
                      onClick={() => setSelectedSign(i)}
                    >
                      {s.flag} {s.lang}
                    </button>
                  ))}
                </div>
              </div>

              <div className="translation-card glass-panel animate-slide-up">
                <div className="translation-header">
                  <span className="lang-tag">{sign.flag} {sign.lang}</span>
                  <span className="arrow-divider">→</span>
                  <span className="lang-tag">🇬🇧 EN</span>
                </div>
                <p className="original">"{sign.original}"</p>
                <p className="translated text-gradient">"{sign.translated}"</p>
                <p className="accessibility-note">♿ {sign.note}</p>
                <button className="read-aloud-btn" onClick={() => speakTranslation(sign.translated + '. ' + sign.note)}>
                  <Volume2 size={13} />
                  Read Aloud
                </button>
              </div>
            </div>
          )}

          {activeMode === 'scene' && (
            <div className="overlay scene-overlay">
              <div className="audio-card glass-panel animate-scale-up">
                <div className="audio-icon-wrap">
                  <Volume2 className="audio-icon" />
                  <span className="audio-ring" />
                  <span className="audio-ring audio-ring-2" />
                </div>
                <p className="scene-desc">
                  "You are in the East Concourse. There is a food stand 5 metres ahead to your left, and the accessible seating entrance is straight ahead."
                </p>
                <div className="scene-stats">
                  <span className="scene-stat">🧑 ~12 people nearby</span>
                  <span className="scene-stat">🚶 Path clear</span>
                </div>
              </div>
            </div>
          )}

          {/* Scanner line */}
          {scanning && <div className={`scanner-line scanner-${activeMode}`} />}

          {/* HUD overlays */}
          <div className="hud-top">
            <span className="hud-chip"><span className="live-dot" />REC</span>
            <span className="hud-chip">12.4 MP</span>
          </div>
        </div>

        {/* Controls */}
        <div className="vision-controls">
          {/* Mode selector — sliding pill */}
          <div className="mode-selector">
            {MODES.map(({ id, icon: Icon, label, desc }) => (
              <button
                key={id}
                className={`mode-btn${activeMode === id ? ' active' : ''}`}
                onClick={() => setActiveMode(id)}
              >
                <Icon size={16} />
                <div className="mode-text">
                  <span className="mode-label">{label}</span>
                  <span className="mode-desc">{desc}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Shutter */}
          <button
            className={`shutter-btn${scanning ? ' scanning' : ''}`}
            onClick={() => setScanning(v => !v)}
          >
            <span className="shutter-inner">
              <Camera size={22} />
            </span>
            {scanning && <span className="shutter-ring" />}
            {scanning && <span className="shutter-ring shutter-ring-2" />}
          </button>
        </div>
      </div>
    </div>
  );
};
