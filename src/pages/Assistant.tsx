import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Mic, Sparkles, Bot, User, Settings } from 'lucide-react';
import './Assistant.css';
import { useAccessibility } from '../context/AccessibilityContext';

/** A single conversation turn displayed in the chat UI. */
interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: Date;
}

/** Accessibility need values accepted by the backend API. */
type AccessNeed = 'mobility' | 'vision' | 'hearing' | 'sensory';

const SUGGESTION_CHIPS: string[] = [
  '📍 Find accessible restroom',
  '🚌 Book shuttle seat',
  '🆘 Emergency help',
  '🌐 Translate sign',
  '🍔 Order food to seat',
  '♿ Update my needs',
];

const INITIAL_MESSAGE: Message = {
  id: '1',
  sender: 'ai',
  text: "Hello! I'm your AccessSphere AI — your accessibility-first stadium copilot for FIFA World Cup 2026. I've loaded your accessibility profile and live stadium status. How can I help you today?",
  timestamp: new Date(),
};

/** Derive active accessibility needs from the user's settings. */
function deriveNeeds(settings: { highContrast: boolean; voiceOutput: boolean; screenReaderMode: boolean }): AccessNeed[] {
  const needs: AccessNeed[] = [];
  if (settings.highContrast) needs.push('vision');
  if (settings.voiceOutput) needs.push('hearing');
  if (settings.screenReaderMode) needs.push('sensory');
  return needs.length > 0 ? needs : ['mobility'];
}

export const Assistant: React.FC = () => {
  const { settings } = useAccessibility();
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) return;

    const rec = new SpeechRecognitionCtor();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = settings.language === 'ar' ? 'ar-SA' : settings.language === 'es' ? 'es-MX' : settings.language === 'fr' ? 'fr-FR' : 'en-US';

    rec.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setInput(text);
      setMicActive(false);
    };
    rec.onerror = () => setMicActive(false);
    rec.onend = () => setMicActive(false);

    recognitionRef.current = rec;
  }, [settings.language]);

  const toggleMic = useCallback(() => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Try Chrome or Edge.');
      return;
    }
    if (micActive) {
      recognitionRef.current.stop();
      setMicActive(false);
    } else {
      setMicActive(true);
      recognitionRef.current.start();
    }
  }, [micActive]);

  const speakText = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }, []);

  /**
   * Send a user message to the backend /api/chat endpoint (grounded Gemini
   * function-calling loop on the live path, deterministic offline engine when
   * no API key is configured). Never uses a pre-written response.
   */
  const handleSend = useCallback(async (text: string = input) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setApiError(null);

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: trimmed,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const needs = deriveNeeds(settings);

    // Map prior messages to the history schema expected by the backend.
    const historyPayload = messages
      .filter(m => m.id !== INITIAL_MESSAGE.id) // exclude the static greeting
      .map(msg => ({
        role: msg.sender === 'ai' ? ('assistant' as const) : ('user' as const),
        text: msg.text,
      }));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          profile: {
            language: settings.language || 'en',
            needs,
            venue_id: settings.venueId || 'los-angeles',
          },
          history: historyPayload,
        }),
      });

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}.`);
      }

      const data = (await response.json()) as { reply: string; mode: string };
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data.reply,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
      if (settings.voiceOutput) speakText(data.reply);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setApiError(`The assistant is temporarily unavailable (${message}). Please check your connection or try again.`);
    } finally {
      setIsTyping(false);
    }
  }, [input, messages, settings, speakText]);

  const formatTime = (d: Date): string =>
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="assistant-page animate-fade-in">
      {/* Header */}
      <header className="assistant-header">
        <div className="header-title">
          <div className="ai-avatar-header">
            <Bot size={20} />
            <div className="ai-status-ring" />
          </div>
          <div>
            <h2>AccessSphere AI</h2>
            <span className="ai-online">● Online · Multilingual · Voice-Ready</span>
          </div>
        </div>
        <div className="header-right-actions">
          <div className="ai-caps">
            <span className="ai-cap-chip">🧠 Gemini 2.5 Flash</span>
            <span className="ai-cap-chip">♿ Grounded Tool Calling</span>
          </div>
          <button
            className="settings-toggle-btn"
            onClick={() => setShowSettings(!showSettings)}
            aria-label="Assistant settings"
            aria-expanded={showSettings}
          >
            <Settings size={16} />
          </button>
        </div>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div className="assistant-settings-overlay glass-panel animate-scale-up" role="dialog" aria-label="Assistant settings">
          <div className="settings-header">
            <h4>⚙️ Gemini AI Settings</h4>
            <button className="close-settings-btn" onClick={() => setShowSettings(false)} aria-label="Close settings">×</button>
          </div>
          <div className="settings-body">
            <p className="settings-desc">
              AccessSphere AI uses Google Gemini 2.5 Flash with grounded function-calling.
              The API key is configured server-side. Change language and venue in your
              <strong> Profile</strong> page to personalise all AI responses.
            </p>
            <ul className="settings-info-list">
              <li>🔒 Key stored server-side only — never in the browser</li>
              <li>🌐 Responds in your chosen profile language (50+ via Gemini)</li>
              <li>📴 Auto-degrades to offline mode if API is unavailable</li>
            </ul>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {apiError && (
        <div className="api-error-banner" role="alert" aria-live="assertive">
          <span>⚠️ {apiError}</span>
          <button onClick={() => setApiError(null)} aria-label="Dismiss error">×</button>
        </div>
      )}

      {/* Chat Container */}
      <div className="chat-container glass-panel">
        <div
          className="chat-messages"
          role="log"
          aria-label="Conversation with AccessSphere AI"
          aria-live="polite"
          aria-relevant="additions"
        >
          {messages.map((msg, i) => (
            <div
              key={msg.id}
              className={`message ${msg.sender} animate-slide-up`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {msg.sender === 'ai' && (
                <div className="msg-avatar ai-msg-avatar" aria-hidden="true">
                  <Sparkles size={14} />
                </div>
              )}
              <div className="message-bubble-wrapper">
                <div className="message-bubble">
                  <p>{msg.text}</p>
                </div>
                <span className="msg-time" aria-label={`Sent at ${formatTime(msg.timestamp)}`}>
                  {formatTime(msg.timestamp)}
                </span>
              </div>
              {msg.sender === 'user' && (
                <div className="msg-avatar user-msg-avatar" aria-hidden="true">
                  <User size={14} />
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="message ai animate-slide-up" aria-label="AI is typing">
              <div className="msg-avatar ai-msg-avatar" aria-hidden="true">
                <Sparkles size={14} />
              </div>
              <div className="message-bubble typing-bubble" aria-busy="true">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} aria-hidden="true" />
        </div>

        {/* Suggestion chips */}
        <nav className="suggestion-chips" aria-label="Quick questions">
          {SUGGESTION_CHIPS.map(chip => (
            <button
              key={chip}
              className="chip"
              onClick={() => void handleSend(chip)}
              disabled={isTyping}
            >
              {chip}
            </button>
          ))}
        </nav>

        {/* Input */}
        <form
          className="chat-input-area"
          onSubmit={e => { e.preventDefault(); void handleSend(); }}
          aria-label="Send a message"
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about accessible routing, translations, or facilities…"
            className="chat-input"
            aria-label="Message input"
            maxLength={2000}
            disabled={isTyping}
          />
          <button
            type="button"
            id="mic-btn"
            className={`input-action-btn mic-btn${micActive ? ' active' : ''}`}
            onClick={toggleMic}
            aria-label={micActive ? 'Stop voice input' : 'Start voice input'}
            aria-pressed={micActive}
          >
            <Mic size={18} />
            {micActive && <span className="mic-ring" aria-hidden="true" />}
            {micActive && <span className="mic-ring mic-ring-2" aria-hidden="true" />}
          </button>
          <button
            type="submit"
            className="send-btn"
            disabled={!input.trim() || isTyping}
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
