import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Image as ImageIcon, Sparkles, Bot, User, Settings } from 'lucide-react';
import './Assistant.css';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: Date;
}

const SUGGESTION_CHIPS = [
  '📍 Find accessible restroom',
  '🚌 Book shuttle seat',
  '🆘 Emergency help',
  '🌐 Translate sign',
  '🍔 Order food to seat',
  '♿ Update my needs',
];

const AI_RESPONSES = [
  'I can certainly help with that. The most accessible route to Gate C involves taking the Smart Shuttle from Downtown Hub, then the elevator to Level 2. Would you like me to book a spot for you?',
  'Absolutely! I\'ve found 3 accessible restrooms near Block 102. The nearest one is 30 meters to your left, fully equipped with grab bars and space for a wheelchair. Shall I navigate you there?',
  'Your accessibility profile is set to Wheelchair + Mobility Assistance. I\'ve pre-reserved a priority elevator slot and notified stadium staff. Is there anything else you need?',
];

const getFallbackResponse = (query: string): string => {
  const q = query.toLowerCase();
  if (q.includes('restroom') || q.includes('toilet') || q.includes('bathroom') || q.includes('baño')) {
    return AI_RESPONSES[1];
  }
  if (q.includes('shuttle') || q.includes('route') || q.includes('gate') || q.includes('transit') || q.includes('way') || q.includes('seat')) {
    return AI_RESPONSES[0];
  }
  if (q.includes('need') || q.includes('profile') || q.includes('assist') || q.includes('help') || q.includes('emergency')) {
    return AI_RESPONSES[2];
  }
  return 'I\'m here to help. You can ask me about accessible routes, restrooms, or transportation options at the stadium.';
};

import { useAccessibility } from '../context/AccessibilityContext';

export const Assistant: React.FC = () => {
  const { settings } = useAccessibility();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Hello Alex! I\'m your AccessSphere AI. I can see you\'re heading to the USA vs. England match at SoFi Stadium today. I\'ve already loaded your accessibility profile and checked the live stadium status. How can I help you?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setInput(text);
        setMicActive(false);
      };

      rec.onerror = (e: any) => {
        console.error('Speech recognition error', e);
        setMicActive(false);
      };

      rec.onend = () => {
        setMicActive(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Try Chrome.");
      return;
    }

    if (micActive) {
      recognitionRef.current.stop();
      setMicActive(false);
    } else {
      setMicActive(true);
      recognitionRef.current.start();
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const [showSettings, setShowSettings] = useState(false);
  const [localApiKey, setLocalApiKey] = useState(() => sessionStorage.getItem('ACCESS_GEMINI_API_KEY') || '');

  const saveLocalKey = (key: string) => {
    setLocalApiKey(key);
    sessionStorage.setItem('ACCESS_GEMINI_API_KEY', key);
    alert('API Key updated successfully! (Saved in sessionStorage only)');
    setShowSettings(false);
  };

  const getGeminiResponse = async (userPrompt: string): Promise<string> => {
    const needs: ('mobility' | 'vision' | 'hearing' | 'sensory')[] = [];
    if (settings.highContrast) needs.push('vision');
    if (settings.voiceOutput) needs.push('hearing');
    if (settings.screenReaderMode) needs.push('sensory');
    // If no other need is checked, default to mobility
    if (needs.length === 0) needs.push('mobility');

    // map messages (excluding the initial welcome message) to history schema
    const historyPayload = messages.slice(1).map(msg => ({
      role: msg.sender === 'ai' ? 'assistant' as const : 'user' as const,
      text: msg.text
    }));

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: userPrompt,
        profile: {
          language: settings.language || 'en',
          needs: needs,
          venue_id: settings.venueId || 'los-angeles'
        },
        history: historyPayload
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.reply;
  };

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const geminiReply = await getGeminiResponse(text.trim());
      setIsTyping(false);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: geminiReply,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
      if (settings.voiceOutput) {
        speakText(geminiReply);
      }
    } catch (e) {
      console.warn("Gemini API call failed, falling back to mock response.", e);
      setTimeout(() => {
        setIsTyping(false);
        const fallbackText = getFallbackResponse(text);
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: fallbackText,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMsg]);
        if (settings.voiceOutput) {
          speakText(fallbackText);
        }
      }, 1500);
    }
  };

  const formatTime = (d: Date) =>
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
            <span className="ai-cap-chip">🧠 Gemini AI</span>
            <span className="ai-cap-chip">♿ Accessibility Expert</span>
          </div>
          <button className="settings-toggle-btn" onClick={() => setShowSettings(!showSettings)} aria-label="Assistant Settings">
            <Settings size={16} />
          </button>
        </div>
      </header>

      {/* Settings Modal */}
      {showSettings && (
        <div className="assistant-settings-overlay glass-panel animate-scale-up">
          <div className="settings-header">
            <h4>⚙️ Gemini AI Assistant Settings</h4>
            <button className="close-settings-btn" onClick={() => setShowSettings(false)}>×</button>
          </div>
          <div className="settings-body">
            <p className="settings-desc">
              AccessSphere AI uses Google Gemini 2.5 Flash. You can configure a personal API key stored securely in your temporary browser session.
            </p>
            <div className="api-key-input-group">
              <label htmlFor="apiKeyInput">Gemini API Key:</label>
              <input
                id="apiKeyInput"
                type="password"
                placeholder={localApiKey ? '••••••••••••••••••••' : 'Enter AI Key...'}
                value={localApiKey}
                onChange={e => setLocalApiKey(e.target.value)}
                className="settings-api-key-input"
              />
              <div className="settings-actions">
                <button className="btn-save-key" onClick={() => saveLocalKey(localApiKey)}>Save Key</button>
                <button className="btn-clear-key" onClick={() => saveLocalKey('')}>Clear</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Container */}
      <div className="chat-container glass-panel">
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={msg.id} className={`message ${msg.sender} animate-slide-up`} style={{ animationDelay: `${i * 0.05}s` }}>
              {msg.sender === 'ai' && (
                <div className="msg-avatar ai-msg-avatar">
                  <Sparkles size={14} />
                </div>
              )}
              <div className="message-bubble-wrapper">
                <div className="message-bubble">
                  <p>{msg.text}</p>
                </div>
                <span className="msg-time">{formatTime(msg.timestamp)}</span>
              </div>
              {msg.sender === 'user' && (
                <div className="msg-avatar user-msg-avatar">
                  <User size={14} />
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="message ai animate-slide-up">
              <div className="msg-avatar ai-msg-avatar">
                <Sparkles size={14} />
              </div>
              <div className="message-bubble typing-bubble">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion chips */}
        <div className="suggestion-chips">
          {SUGGESTION_CHIPS.map(chip => (
            <button
              key={chip}
              className="chip"
              onClick={() => handleSend(chip)}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input */}
        <form className="chat-input-area" onSubmit={e => { e.preventDefault(); handleSend(); }}>
          <button type="button" className="input-action-btn" title="Attach image">
            <ImageIcon size={18} />
          </button>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask for accessible routing, food delivery, or translations..."
            className="chat-input"
          />
          <button
            type="button"
            className={`input-action-btn mic-btn${micActive ? ' active' : ''}`}
            onClick={toggleMic}
            title="Voice input"
          >
            <Mic size={18} />
            {micActive && <span className="mic-ring" />}
            {micActive && <span className="mic-ring mic-ring-2" />}
          </button>
          <button type="submit" className="send-btn" disabled={!input.trim()}>
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
