import React, { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'accesssphere_profile';

interface AccessibilitySettings {
  highContrast: boolean;
  textScale: 'normal' | 'large' | 'extra-large';
  voiceOutput: boolean;
  screenReaderMode: boolean;
  language: string;
  venueId: string;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (updates: Partial<AccessibilitySettings>) => void;
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  highContrast: false,
  textScale: 'normal',
  voiceOutput: false,
  screenReaderMode: false,
  language: 'en',
  venueId: 'los-angeles',
};

function loadSettings(): AccessibilitySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    // Ignore parse errors — fall back to defaults
  }
  return DEFAULT_SETTINGS;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(loadSettings);

  const updateSettings = (updates: Partial<AccessibilitySettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...updates };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* quota exceeded */ }
      return next;
    });
  };

  useEffect(() => {
    const root = document.documentElement;

    // Apply High Contrast class
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Apply Text Scale attribute
    root.setAttribute('data-text-scale', settings.textScale);
  }, [settings.highContrast, settings.textScale]);

  return (
    <AccessibilityContext.Provider value={{ settings, updateSettings }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};