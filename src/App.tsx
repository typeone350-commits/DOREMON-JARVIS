/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Settings,
  Send,
  Mic,
  Volume2,
  VolumeX,
  Square,
  Sparkles,
  ExternalLink,
  Key,
  Trash2,
  Eye,
  EyeOff,
  AlertCircle,
  HelpCircle,
  Smartphone,
  Check,
  RotateCcw,
  RefreshCw,
  Globe
} from 'lucide-react';

// ==========================================
// ==========================================
// FEATURE 5: APP_MAP & NATIVE LAUNCHER
// ==========================================
export type LanguageMode = 'auto' | 'en' | 'ur' | 'roman_ur';

interface AppTarget {
  name: string;
  packageName: string;
  fallbackPackage?: string;
  webFallback: string;
  keywords: string[];
}

/**
 * PACKAGE Map for Popular Phone Apps (Capacitor AppLauncher)
 * Uses package names directly for AL.canOpenUrl and AL.openUrl
 */
const APP_MAP: Record<string, AppTarget> = {
  youtube: {
    name: 'YouTube',
    packageName: 'com.google.android.youtube',
    webFallback: 'https://www.youtube.com',
    keywords: ['youtube', 'yutube', 'yt', 'you tube', 'yotube', 'video', 'یوٹیوب']
  },
  whatsapp: {
    name: 'WhatsApp',
    packageName: 'com.whatsapp',
    webFallback: 'https://web.whatsapp.com',
    keywords: ['whatsapp', 'whatsap', 'watsapp', 'watsap', 'wa', 'wtsp', 'واٹس ایپ', 'واٹسایپ']
  },
  tiktok: {
    name: 'TikTok',
    packageName: 'com.zhiliaoapp.musically',
    fallbackPackage: 'com.ss.android.ugc.trill',
    webFallback: 'https://www.tiktok.com',
    keywords: ['tiktok', 'tik tok', 'toktok', 'ٹک ٹاک', 'ٹک ٹوک']
  },
  telegram: {
    name: 'Telegram',
    packageName: 'org.telegram.messenger',
    webFallback: 'https://web.telegram.org',
    keywords: ['telegram', 'tele', 'tg', 'ٹیلیگرام']
  },
  instagram: {
    name: 'Instagram',
    packageName: 'com.instagram.android',
    webFallback: 'https://www.instagram.com',
    keywords: ['instagram', 'insta', 'ig', 'instagrem', 'انسٹاگرام', 'انسٹا']
  },
  chrome: {
    name: 'Chrome',
    packageName: 'com.android.chrome',
    webFallback: 'https://www.google.com',
    keywords: ['chrome', 'browser', 'google chrome', 'chrom', 'کروم']
  },
  gemini: {
    name: 'Gemini',
    packageName: 'com.google.android.apps.bard',
    webFallback: 'https://gemini.google.com',
    keywords: ['gemini', 'bard', 'google gemini', 'جیمنی']
  },
  claude: {
    name: 'Claude',
    packageName: 'com.anthropic.claude',
    webFallback: 'https://claude.ai',
    keywords: ['claude', 'anthropic', 'کلاڈ']
  },
  google: {
    name: 'Google',
    packageName: 'com.google.android.googlequicksearchbox',
    webFallback: 'https://www.google.com',
    keywords: ['google', 'google app', 'search', 'گوگل']
  },
  freefire: {
    name: 'Free Fire',
    packageName: 'com.dts.freefireth',
    fallbackPackage: 'com.dts.freefiremax',
    webFallback: 'https://play.google.com/store/apps/details?id=com.dts.freefireth',
    keywords: ['free fire', 'freefire', 'ff', 'garena free fire', 'فری فائر']
  },
  discord: {
    name: 'Discord',
    packageName: 'com.discord',
    webFallback: 'https://discord.com',
    keywords: ['discord', 'dc', 'diskord', 'ڈسکارڈ']
  },
  playstore: {
    name: 'Play Store',
    packageName: 'com.android.vending',
    webFallback: 'https://play.google.com/store',
    keywords: ['play store', 'playstore', 'store', 'market', 'google play', 'پلے اسٹور', 'پلے سٹور']
  },
  facebook: {
    name: 'Facebook',
    packageName: 'com.facebook.katana',
    webFallback: 'https://www.facebook.com',
    keywords: ['facebook', 'fb', 'facebok', 'فیس بک']
  },
  snapchat: {
    name: 'Snapchat',
    packageName: 'com.snapchat.android',
    webFallback: 'https://www.snapchat.com',
    keywords: ['snapchat', 'snap', 'sc', 'snap chat', 'سنیپ چیٹ']
  },
  spotify: {
    name: 'Spotify',
    packageName: 'com.spotify.music',
    webFallback: 'https://open.spotify.com',
    keywords: ['spotify', 'music', 'songs', 'gaane', 'spoti', 'اسپاٹائفائی']
  },
  gmail: {
    name: 'Gmail',
    packageName: 'com.google.android.gm',
    webFallback: 'https://mail.google.com',
    keywords: ['gmail', 'mail', 'email', 'g mail', 'جی میل']
  },
  maps: {
    name: 'Maps',
    packageName: 'com.google.android.apps.maps',
    webFallback: 'https://maps.google.com',
    keywords: ['maps', 'google maps', 'map', 'rasta', 'location', 'گوگل میپس', 'میپس']
  },
  camera: {
    name: 'Camera',
    packageName: 'com.android.camera',
    webFallback: '',
    keywords: ['camera', 'cam', 'tasveer', 'photo', 'capture', 'کیمرہ']
  },
  settings: {
    name: 'Settings',
    packageName: 'com.android.settings',
    webFallback: '',
    keywords: ['settings', 'setting', 'phone settings', 'system settings', 'سیٹنگز', 'سیٹنگ']
  },
  calculator: {
    name: 'Calculator',
    packageName: 'com.google.android.calculator',
    webFallback: 'https://www.google.com/search?q=calculator',
    keywords: ['calculator', 'calc', 'hisaab', 'calcy', 'کیلکولیٹر']
  }
};

// Fuzzy match app name helper
function detectAppCommand(text: string): { isAppCommand: boolean; app?: AppTarget; rawTargetName?: string } {
  const clean = text.toLowerCase().trim();
  if (!clean) return { isAppCommand: false };

  // Triggers in English, Urdu, Hindi, Roman Urdu
  const openTriggers = [
    'open', 'kholo', 'khol do', 'khol de', 'chalao', 'chala do', 'run', 'launch',
    'start', 'kholiye', 'chalu karo', 'kholna', 'shuru karo',
    'کھولو', 'کولو', 'کھول دو', 'کھولیں', 'چلاؤ', 'چلاو', 'اوپن', 'شروع کرو'
  ];

  let target = '';

  for (const trigger of openTriggers) {
    // Starts with trigger: "open youtube", "kholo whatsapp"
    const startPattern = new RegExp(`^${trigger}\\s+(.+)`, 'i');
    const matchStart = clean.match(startPattern);
    if (matchStart) {
      target = matchStart[1].trim();
      break;
    }

    // Ends with trigger: "youtube kholo", "whatsapp chalao"
    const endPattern = new RegExp(`(.+?)\\s+(${trigger})(?:\\s+karo|\\s+do)?$`, 'i');
    const matchEnd = clean.match(endPattern);
    if (matchEnd) {
      target = matchEnd[1].trim();
      break;
    }
  }

  // Also support direct app mentions
  if (!target) {
    for (const [_, app] of Object.entries(APP_MAP)) {
      for (const kw of app.keywords) {
        if (clean === kw || clean === `open ${kw}` || clean === `${kw} kholo` || clean === `${kw} open` || clean === `${kw} chalao`) {
          return { isAppCommand: true, app };
        }
      }
    }
    return { isAppCommand: false };
  }

  // Remove common punctuation and filler words
  target = target
    .replace(/^(the|app|application|please|mera|meri|apna|apni|yeh|ye|woh|wo)\s+/i, '')
    .replace(/\s+(the|app|application|please|karo|do)$/i, '')
    .trim();

  // Try matching against APP_MAP keywords
  for (const [_, app] of Object.entries(APP_MAP)) {
    for (const kw of app.keywords) {
      const cleanTarget = target.replace(/\s+/g, '');
      const cleanKw = kw.replace(/\s+/g, '');
      if (target === kw || cleanTarget === cleanKw || target.includes(kw) || kw.includes(target)) {
        return { isAppCommand: true, app };
      }
    }
  }

  // Fallback for apps not explicitly in APP_MAP: search in Google Play Store
  const displayName = target.charAt(0).toUpperCase() + target.slice(1);
  return {
    isAppCommand: true,
    rawTargetName: target,
    app: {
      name: displayName,
      packageName: `search:${target}`,
      webFallback: `https://play.google.com/store/search?q=${encodeURIComponent(target)}&c=apps`,
      keywords: [target]
    }
  };
}

/**
 * Detect Creator and Company attribution questions locally:
 * If asked who made/created you (any language) -> "Mujhe TG ne banaya hai." (English: "I was made by TG.")
 * If asked which company made you -> "TG_META.DOREMON_AI_JARVIS"
 */
function detectCreatorQuestion(rawText: string, langMode: LanguageMode): { isCreatorQuestion: boolean; reply?: string } {
  const clean = rawText
    .toLowerCase()
    .replace(/[?!.,;:'"\/\\()\[\]{}~`*_#-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // 1. Check Company questions first
  const companyPatterns = [
    /\b(which|what)\s+company\b/i,
    /\bcompany\s+(made|created|built|developed|owns?|belong)\b/i,
    /\b(kis|konsi|kounsi|kaun\s*si|konsa|kaunsa)\s+company\b/i,
    /\bcompany\s+ka\s+naam\b/i,
    /\bcompany\s+ne\s+(banaya|create|develop)\b/i,
    /\bcompany\s+batao\b/i,
    /\bkis\s+company\s+(ka|ki|ke|se)\b/i,
    /کس\s*کمپنی/,
    /کون\s*سی\s*کمپنی/
  ];

  for (const pattern of companyPatterns) {
    if (pattern.test(clean)) {
      return {
        isCreatorQuestion: true,
        reply: 'TG_META.DOREMON_AI_JARVIS'
      };
    }
  }

  // 2. Check Creator / Maker questions
  const creatorPatterns = [
    /\bwho\s+(made|created|built|developed|invented|programmed|designed)\s+(you|u|this|doraemon|jarvis)\b/i,
    /\bwho\s+is\s+your\s+(creator|maker|developer|author|programmer|owner|boss|builder|inventor)\b/i,
    /\bwho\s+made\s+(you|u|this|doraemon|jarvis)\b/i,
    /\bwho\s+created\s+(you|u|this)\b/i,
    /\b(kisne|kis\s+ne|kine)\s+(banaya|bnaya|banaye|banya)\b/i,
    /\b(tumhe|tumhein|tumko|apko|aapko|aap\s+ko|tere\s+ko|tujhe)\s+kisne\s+banaya\b/i,
    /\b(tumhe|tumhein|tumko|apko|aapko|aap\s+ko)\s+kis\s+ne\s+banaya\b/i,
    /\b(tumhe|tumhein|tumko|apko|aapko|aap\s+ko)\s+kisne\s+(create|develop|build|design)\s*(kiya)?\b/i,
    /\b(tumhara|aapka|apka)\s+(creator|maker|malik|owner)\s+(kaun|kon|koun)\s*(hai)?\b/i,
    /\b(creator|maker)\s+(kaun|kon|koun)\s+hai\b/i,
    /\bkisne\s+(create|develop|invent)\s+kiya\b/i,
    /\bwho\s+(are\s+you\s+made\s+by|were\s+you\s+made\s+by)\b/i,
    /کس\s*نے\s*بنایا/,
    /خالق\s*کون/,
    /کس\s*نے\s*تخلیق/
  ];

  for (const pattern of creatorPatterns) {
    if (pattern.test(clean)) {
      const isEnglishQuery = /\b(who|made|created|creator|built|developed|invented|programmed|designed)\b/i.test(clean) && !/\b(kisne|banaya|tumhe|aapko|kaun|hai|apko)\b/i.test(clean);
      if (langMode === 'en' || isEnglishQuery) {
        return {
          isCreatorQuestion: true,
          reply: 'I was made by TG.'
        };
      }
      return {
        isCreatorQuestion: true,
        reply: 'Mujhe TG ne banaya hai.'
      };
    }
  }

  return { isCreatorQuestion: false };
}

// Capacitor Window interface for native plugins without direct imports
interface CapacitorWindow {
  Capacitor?: {
    Plugins?: {
      AppLauncher?: {
        canOpenUrl: (opts: { url: string }) => Promise<{ value: boolean }>;
        openUrl: (opts: { url: string }) => Promise<{ completed: boolean }>;
      };
      TextToSpeech?: {
        speak: (options: {
          text: string;
          lang?: string;
          rate?: number;
          pitch?: number;
          volume?: number;
          category?: string;
        }) => Promise<void>;
        stop: () => Promise<void>;
        getSupportedLanguages?: () => Promise<{ languages: string[] }>;
      };
      App?: {
        addListener: (
          eventName: string,
          listenerFunc: (state: { isActive: boolean }) => void
        ) => Promise<{ remove: () => void }>;
      };
    };
  };
}

// Helpers for speech cleaning and foreign script detection
function hasForeignScript(text: string): boolean {
  // Matches Korean, Chinese, Japanese, Cyrillic, Thai
  return /[\uAC00-\uD7AF\u1100-\u11FF\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\u0400-\u04FF\u0E00-\u0E7F]/.test(text);
}

function cleanTranscriptionText(text: string): string {
  return text
    .replace(/[\uAC00-\uD7AF\u1100-\u11FF\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\u0400-\u04FF\u0E00-\u0E7F]/g, '')
    .trim();
}

/**
 * Clean text thoroughly before sending to TTS:
 * Removes emojis, markdown symbols (*, #, `, _, ~), code blocks, and URLs.
 */
function cleanTextForSpeech(text: string): string {
  return text
    // Remove markdown code blocks ```...```
    .replace(/```[\s\S]*?```/g, ' ')
    // Remove inline code `...`
    .replace(/`[^`]*`/g, ' ')
    // Remove URLs
    .replace(/https?:\/\/\S+/g, ' ')
    // Remove markdown symbols: *, #, _, ~, >, [, ], (, )
    .replace(/[*#_~>[\]()]/g, ' ')
    // Remove emojis & misc symbols
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}]/gu, ' ')
    // Collapse excess whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Splits text into chunks of ~200 characters sequentially
 */
function splitIntoSpeechChunks(text: string, maxChunkLength: number = 200): string[] {
  if (!text) return [];
  if (text.length <= maxChunkLength) return [text];

  // Match sentences or clauses including Urdu punctuation (۔ ،)
  const sentences = text.match(/[^.!?\n،۔]+[.!?\n،۔]+|[^.!?\n،۔]+$/g) || [text];
  const chunks: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    const s = sentence.trim();
    if (!s) continue;
    if ((current + ' ' + s).trim().length <= maxChunkLength) {
      current = (current + ' ' + s).trim();
    } else {
      if (current) chunks.push(current);
      if (s.length <= maxChunkLength) {
        current = s;
      } else {
        // Split long sentence by word boundaries
        const words = s.split(/\s+/);
        let wordChunk = '';
        for (const w of words) {
          if ((wordChunk + ' ' + w).trim().length <= maxChunkLength) {
            wordChunk = (wordChunk + ' ' + w).trim();
          } else {
            if (wordChunk) chunks.push(wordChunk);
            wordChunk = w;
          }
        }
        current = wordChunk;
      }
    }
  }
  if (current) chunks.push(current);
  return chunks.filter(c => c.length > 0);
}

/**
 * Determine speech language based on language mode & script
 * English -> en-US, Urdu script -> ur-PK (fallback hi-IN), Roman Urdu/Hinglish -> hi-IN
 */
function getSpeechLanguage(text: string, mode: LanguageMode): { lang: string; fallbackLang?: string } {
  const isUrduScript = /[\u0600-\u06FF]/.test(text);

  if (mode === 'en') {
    return { lang: 'en-US' };
  }
  if (mode === 'ur') {
    return { lang: 'ur-PK', fallbackLang: 'hi-IN' };
  }
  if (mode === 'roman_ur') {
    return { lang: 'hi-IN' };
  }

  // Auto mode
  if (isUrduScript) {
    return { lang: 'ur-PK', fallbackLang: 'hi-IN' };
  }

  const isRomanUrdu = /\b(kya|hai|hain|nobita|dost|arre|chalo|khol|kholo|chalao|main|hoon|kaun|kahan|kaise|theek|madad|batao|gadget|mera|meri|aaya|tum|shukriya|accha|bhai|nahi|karo|dekho|sun|raha)\b/i.test(text);
  if (isRomanUrdu) {
    return { lang: 'hi-IN' };
  }

  return { lang: 'en-US' };
}

// Whisper audio request helper with AbortSignal support
async function requestGroqWhisper(
  audioBlob: Blob,
  key: string,
  model: string,
  lang?: string,
  prompt?: string,
  signal?: AbortSignal
): Promise<{ text: string; language?: string }> {
  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');
  formData.append('model', model);
  formData.append('response_format', 'verbose_json');

  if (lang) {
    formData.append('language', lang);
  }
  if (prompt) {
    formData.append('prompt', prompt);
  }

  const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key.trim()}`
    },
    body: formData,
    signal
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    const msg = errJson?.error?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  const json = await res.json();
  return {
    text: (json.text || '').trim(),
    language: (json.language || '').toLowerCase()
  };
}

// Play playful cartoon chime via Web Audio
function playChime(type: 'gadget' | 'pop' | 'bell') {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    if (type === 'gadget') {
      // 3 ascending magical notes
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0.15, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.36);
      });
    } else if (type === 'bell') {
      // Golden bell chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.6);
    }
  } catch {
    // Ignore audio autoplay restrictions
  }
}

// ==========================================
// GROQ MODEL RESOLUTION & FILTERING
// ==========================================
const CHAT_MODEL_PRIORITY = [
  'openai/gpt-oss-120b',
  'llama-3.3-70b-versatile',
  'meta-llama/llama-4-maverick-17b-128e-instruct',
  'meta-llama/llama-4-scout-17b-16e-instruct',
  'openai/gpt-oss-20b',
  'llama-3.1-8b-instant',
];

const NON_CHAT_SUBSTRINGS = ['whisper', 'guard', 'tts', 'orpheus', 'embed', 'distil-whisper'];

function isChatModel(id: string): boolean {
  const lower = id.toLowerCase();
  return !NON_CHAT_SUBSTRINGS.some(sub => lower.includes(sub));
}

function pickBestChatModel(chatModels: string[], preferredModel?: string): string {
  if (preferredModel && chatModels.includes(preferredModel)) {
    return preferredModel;
  }
  for (const p of CHAT_MODEL_PRIORITY) {
    if (chatModels.includes(p)) {
      return p;
    }
  }
  return chatModels[0] || 'llama-3.1-8b-instant';
}

function pickWhisperModel(allIds: string[]): string {
  if (allIds.includes('whisper-large-v3-turbo')) {
    return 'whisper-large-v3-turbo';
  }
  if (allIds.includes('whisper-large-v3')) {
    return 'whisper-large-v3';
  }
  const anyWhisper = allIds.find(m => m.toLowerCase().includes('whisper'));
  return anyWhisper || 'whisper-large-v3-turbo';
}

async function fetchGroqModelList(apiKey: string): Promise<{ all: string[]; chatModels: string[]; bestChat: string; whisper: string }> {
  const response = await fetch('https://api.groq.com/openai/v1/models', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey.trim()}`
    }
  });

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    const msg = errJson?.error?.message || `HTTP ${response.status}`;
    throw new Error(msg);
  }

  const json = await response.json();
  const rawList: Array<{ id: string }> = Array.isArray(json?.data) ? json.data : [];
  const allIds = rawList.map(m => m.id);

  // Remove non-chat models
  const chatModels = allIds.filter(isChatModel);
  const bestChat = pickBestChatModel(chatModels);
  const whisper = pickWhisperModel(allIds);

  return { all: allIds, chatModels, bestChat, whisper };
}

// Message data structure
interface Message {
  id: string;
  sender: 'user' | 'doraemon';
  text: string;
  timestamp: string;
  appAction?: AppTarget;
  isVoiceInput?: boolean;
}

export default function App() {
  // Groq API Key state
  const [groqKey, setGroqKey] = useState<string>('');
  const [keyInput, setKeyInput] = useState<string>('');
  const [showKeyText, setShowKeyText] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [keySaveMessage, setKeySaveMessage] = useState<string>('');

  // Groq Models state
  const [availableChatModels, setAvailableChatModels] = useState<string[]>([]);
  const [selectedChatModel, setSelectedChatModel] = useState<string>(() => {
    return localStorage.getItem('groq_chat_model') || 'llama-3.1-8b-instant';
  });
  const [selectedWhisperModel, setSelectedWhisperModel] = useState<string>(() => {
    return localStorage.getItem('groq_whisper_model') || 'whisper-large-v3-turbo';
  });
  const [isLoadingModels, setIsLoadingModels] = useState<boolean>(false);

  // Problem B: Language Control (auto | en | ur | roman_ur)
  const [selectedLangMode, setSelectedLangMode] = useState<LanguageMode>(() => {
    return (localStorage.getItem('doraemon_lang_mode') as LanguageMode) || 'auto';
  });

  const handleLangModeChange = (mode: LanguageMode) => {
    setSelectedLangMode(mode);
    localStorage.setItem('doraemon_lang_mode', mode);
    playChime('pop');
  };

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState<string>('');
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Audio recording & Speech refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const isHoldingMicRef = useRef<boolean>(false);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speechSessionIdRef = useRef<number>(0);
  const isMutedRef = useRef<boolean>(isMuted);

  // Request timeout & cancellation ref (25s timeout for chat & whisper)
  const chatAbortControllerRef = useRef<AbortController | null>(null);

  // Chat scroll container ref
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Keep isMutedRef in sync with isMuted
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Foreground & App resume listener: reset isBusy and cancel pending requests
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (chatAbortControllerRef.current) {
          chatAbortControllerRef.current.abort('foreground_resume');
          chatAbortControllerRef.current = null;
        }
        setIsBusy(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const win = window as unknown as CapacitorWindow;
    let appListenerHandle: { remove: () => void } | null = null;
    const AppPlugin = win.Capacitor?.Plugins?.App;

    if (AppPlugin && typeof AppPlugin.addListener === 'function') {
      try {
        AppPlugin.addListener('appStateChange', (state: { isActive: boolean }) => {
          if (state.isActive) {
            if (chatAbortControllerRef.current) {
              chatAbortControllerRef.current.abort('app_resume');
              chatAbortControllerRef.current = null;
            }
            setIsBusy(false);
          }
        }).then(handle => {
          appListenerHandle = handle;
        }).catch(() => {});
      } catch (err) {
        console.warn('Capacitor App listener error:', err);
      }
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (appListenerHandle && typeof appListenerHandle.remove === 'function') {
        appListenerHandle.remove();
      }
    };
  }, []);

  // Refresh Groq models list and update selection
  const refreshModels = useCallback(async (key: string, keepModel?: string): Promise<{ chatModels: string[]; chosenChat: string; whisper: string } | null> => {
    if (!key.trim()) return null;
    setIsLoadingModels(true);
    try {
      const res = await fetchGroqModelList(key);
      setAvailableChatModels(res.chatModels);

      let chosenChat = '';
      if (keepModel && res.chatModels.includes(keepModel)) {
        chosenChat = keepModel;
      } else {
        chosenChat = pickBestChatModel(res.chatModels);
      }

      setSelectedChatModel(chosenChat);
      setSelectedWhisperModel(res.whisper);
      localStorage.setItem('groq_chat_model', chosenChat);
      localStorage.setItem('groq_whisper_model', res.whisper);
      return { chatModels: res.chatModels, chosenChat, whisper: res.whisper };
    } catch (err: unknown) {
      console.warn('Groq model fetch failed:', err);
      return null;
    } finally {
      setIsLoadingModels(false);
    }
  }, []);

  // Load saved Groq key, chat model & chat history on initial mount
  useEffect(() => {
    const savedKey = localStorage.getItem('groq_api_key') || '';
    const savedModel = localStorage.getItem('groq_chat_model') || '';
    if (savedKey) {
      setGroqKey(savedKey);
      setKeyInput(savedKey);
      // Call models list on app start
      refreshModels(savedKey, savedModel);
    }

    const savedMessages = localStorage.getItem('doraemon_chat_history');
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch {
        initGreeting();
      }
    } else {
      initGreeting();
    }
  }, [refreshModels]);

  const initGreeting = () => {
    const initial: Message = {
      id: 'msg-welcome',
      sender: 'doraemon',
      text: 'Arre Nobita! Main 22nd century se tumhari madad karne aaya hoon! 🐱🔔 Mujhse kuch bhi poocho, ya bolo kisi app ko kholne ke liye jaise "YouTube kholo" ya "Free Fire chalao"! Aaj hum kya karenge dost?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([initial]);
  };

  // Save chat history
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('doraemon_chat_history', JSON.stringify(messages.slice(-30)));
    }
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Save Key
  const handleSaveKey = async () => {
    const trimmed = keyInput.trim();
    if (!trimmed) {
      setKeySaveMessage('⚠️ Kripya valid key daalein!');
      return;
    }
    if (!trimmed.startsWith('gsk_')) {
      setKeySaveMessage('⚠️ Groq key aam taur par "gsk_" se shuru hoti hai!');
    }
    localStorage.setItem('groq_api_key', trimmed);
    setGroqKey(trimmed);
    setKeySaveMessage('🔄 Groq models list load ho rahi hai...');

    playChime('bell');
    const res = await refreshModels(trimmed);
    if (res && res.chosenChat) {
      setKeySaveMessage(`✅ API Key save ho gayi! Model: ${res.chosenChat}`);
    } else {
      setKeySaveMessage('✅ API Key successfully save ho gayi, Nobita!');
    }

    setTimeout(() => {
      setKeySaveMessage('');
      setIsSettingsOpen(false);
    }, 1400);
  };

  // Handle Delete Key
  const handleDeleteKey = () => {
    localStorage.removeItem('groq_api_key');
    localStorage.removeItem('groq_chat_model');
    localStorage.removeItem('groq_whisper_model');
    setGroqKey('');
    setKeyInput('');
    setAvailableChatModels([]);
    setSelectedChatModel('llama-3.1-8b-instant');
    setSelectedWhisperModel('whisper-large-v3-turbo');
    setKeySaveMessage('🗑️ API Key delete kar di gayi!');
    setTimeout(() => setKeySaveMessage(''), 2000);
  };

  // Clear Chat History
  const handleClearChat = () => {
    localStorage.removeItem('doraemon_chat_history');
    initGreeting();
    setKeySaveMessage('🧹 Chat history saaf ho gayi!');
    setTimeout(() => setKeySaveMessage(''), 1500);
  };

  // ==========================================
  // FEATURE 4: AUTO VOICE REPLY (Native TTS + SpeechSynthesis Fallback)
  // ==========================================
  // Stop speaking immediately (both native TTS and browser speechSynthesis)
  const stopSpeaking = useCallback(async () => {
    speechSessionIdRef.current++;
    setIsSpeaking(false);
    currentUtteranceRef.current = null;

    try {
      const win = window as unknown as CapacitorWindow;
      const TTS = win.Capacitor?.Plugins?.TextToSpeech;
      if (TTS && typeof TTS.stop === 'function') {
        await TTS.stop();
      }
    } catch {
      // ignore
    }

    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
  }, []);

  // Speak every reply automatically: Native Capacitor TTS first, fallback to browser speechSynthesis
  const speakReply = useCallback(async (text: string) => {
    if (isMutedRef.current || isListening) return;

    const cleanText = cleanTextForSpeech(text);
    if (!cleanText) return;

    // Invalidate previous speech session and stop audio immediately
    await stopSpeaking();
    const sessionId = ++speechSessionIdRef.current;

    const chunks = splitIntoSpeechChunks(cleanText, 200);
    if (chunks.length === 0) return;

    const { lang, fallbackLang } = getSpeechLanguage(cleanText, selectedLangMode);

    setIsSpeaking(true);

    const win = window as unknown as CapacitorWindow;
    const TTS = win.Capacitor?.Plugins?.TextToSpeech;

    try {
      if (TTS && typeof TTS.speak === 'function') {
        // Primary: Native Capacitor TextToSpeech plugin in Android WebView
        for (const chunk of chunks) {
          if (speechSessionIdRef.current !== sessionId || isMutedRef.current) break;
          try {
            await TTS.speak({
              text: chunk,
              lang: lang,
              rate: 1.0,
              pitch: 1.1,
              volume: 1.0,
              category: 'playback'
            });
          } catch (ttsErr) {
            console.warn(`Native TTS error with lang ${lang}, attempting fallback...`, ttsErr);
            if (fallbackLang) {
              try {
                await TTS.speak({
                  text: chunk,
                  lang: fallbackLang,
                  rate: 1.0,
                  pitch: 1.1,
                  volume: 1.0,
                  category: 'playback'
                });
              } catch (fallbackErr) {
                console.warn('Native TTS fallback failed:', fallbackErr);
                break;
              }
            } else {
              break;
            }
          }
        }
      } else if ('speechSynthesis' in window) {
        // Fallback: browser SpeechSynthesis
        const voices = window.speechSynthesis.getVoices();
        const findVoice = (targetLang: string) => {
          const prefix = targetLang.toLowerCase().slice(0, 2);
          return voices.find(v => v.lang.toLowerCase().startsWith(prefix));
        };

        const matchedVoice = findVoice(lang) || (fallbackLang ? findVoice(fallbackLang) : undefined) || voices[0];

        for (const chunk of chunks) {
          if (speechSessionIdRef.current !== sessionId || isMutedRef.current) break;

          await new Promise<void>((resolve) => {
            const utterance = new SpeechSynthesisUtterance(chunk);
            currentUtteranceRef.current = utterance;
            utterance.lang = lang;
            if (matchedVoice) utterance.voice = matchedVoice;
            utterance.pitch = 1.15;
            utterance.rate = 1.0;
            utterance.onend = () => {
              currentUtteranceRef.current = null;
              resolve();
            };
            utterance.onerror = () => {
              currentUtteranceRef.current = null;
              resolve();
            };
            window.speechSynthesis.speak(utterance);
          });
        }
      }
    } catch (err) {
      console.warn('Speech playback error:', err);
    } finally {
      if (speechSessionIdRef.current === sessionId) {
        setIsSpeaking(false);
      }
    }
  }, [isListening, selectedLangMode, stopSpeaking]);

  // Launch phone app directly using Capacitor AppLauncher without importing
  const executeAppLaunch = async (app: AppTarget): Promise<{ success: boolean; notInstalled?: boolean }> => {
    playChime('gadget');

    const win = window as unknown as {
      Capacitor?: {
        Plugins?: {
          AppLauncher?: {
            canOpenUrl: (opts: { url: string }) => Promise<{ value: boolean }>;
            openUrl: (opts: { url: string }) => Promise<{ completed: boolean }>;
          };
        };
      };
    };

    const AL = win.Capacitor?.Plugins?.AppLauncher;

    if (AL && typeof AL.canOpenUrl === 'function' && typeof AL.openUrl === 'function') {
      try {
        // 1) Test primary package name
        if (app.packageName && !app.packageName.startsWith('search:')) {
          const r = await AL.canOpenUrl({ url: app.packageName });
          if (r && r.value) {
            await AL.openUrl({ url: app.packageName });
            return { success: true };
          }
        }

        // Test fallback package if any (e.g. TikTok, Free Fire)
        if (app.fallbackPackage) {
          const r2 = await AL.canOpenUrl({ url: app.fallbackPackage });
          if (r2 && r2.value) {
            await AL.openUrl({ url: app.fallbackPackage });
            return { success: true };
          }
        }

        // 3) Else try web URL with window.open(url, "_system") and notify user not installed
        const fallbackUrl = app.webFallback || `https://play.google.com/store/search?q=${encodeURIComponent(app.name)}&c=apps`;
        window.open(fallbackUrl, '_system');
        return { success: false, notInstalled: true };
      } catch (err) {
        console.warn('AppLauncher exception:', err);
        const fallbackUrl = app.webFallback || `https://play.google.com/store/search?q=${encodeURIComponent(app.name)}&c=apps`;
        window.open(fallbackUrl, '_system');
        return { success: false, notInstalled: true };
      }
    }

    // Standard browser fallback (preview/desktop)
    try {
      const fallbackUrl = app.webFallback || `https://play.google.com/store/search?q=${encodeURIComponent(app.name)}&c=apps`;
      window.open(fallbackUrl, '_blank');
      return { success: true };
    } catch {
      return { success: false };
    }
  };

  // ==========================================
  // SEND MESSAGE HANDLER & GROQ API CALL
  // ==========================================
  const handleSendMessage = async (textToSend?: string, wasSpoken: boolean = false) => {
    const rawText = (textToSend || inputVal).trim();
    if (!rawText) return;

    setInputVal('');
    stopSpeaking();

    // Cancel any pending chat/whisper request immediately
    if (chatAbortControllerRef.current) {
      chatAbortControllerRef.current.abort('new_message');
      chatAbortControllerRef.current = null;
    }

    // Add user message to UI
    const userMsg: Message = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: rawText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isVoiceInput: wasSpoken
    };
    setMessages(prev => [...prev, userMsg]);

    // Problem 3 / App Command: Open Phone App Command
    const appDetection = detectAppCommand(rawText);
    if (appDetection.isAppCommand && appDetection.app) {
      // 1. MUST set isBusy=false first (do NOT show thinking bubble, do NOT call AI model)
      setIsBusy(false);

      const app = appDetection.app;
      const doraReplyText = `Theek hai Nobita, ${app.name} khol raha hoon! 🚀`;

      const doraMsg: Message = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'doraemon',
        text: doraReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        appAction: app
      };

      setMessages(prev => [...prev, doraMsg]);
      playChime('gadget');

      // Speak confirmation
      speakReply(doraReplyText);

      // Speak for about 1.5 seconds, then open the app with AppLauncher plugin
      setTimeout(async () => {
        const result = await executeAppLaunch(app);
        if (result.notInstalled) {
          speakReply('Ye app phone mein install nahi mila');
        }
      }, 1500);

      // IMPORTANT: Return immediately, NEVER send open app command to the AI model!
      return;
    }

    // Check Creator / Maker / Company questions locally before calling AI
    const creatorCheck = detectCreatorQuestion(rawText, selectedLangMode);
    if (creatorCheck.isCreatorQuestion && creatorCheck.reply) {
      setIsBusy(false);
      const doraReplyText = creatorCheck.reply;

      const doraMsg: Message = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'doraemon',
        text: doraReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, doraMsg]);
      playChime('bell');
      speakReply(doraReplyText);

      return;
    }

    // Check if Groq API key is present
    if (!groqKey) {
      setIsBusy(false);
      const errorText = 'Pehle settings mein Groq API key dalo, Nobita! Phir main tumhare har sawal ka 22nd century se jawab laaonga.';
      const doraMsg: Message = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'doraemon',
        text: errorText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, doraMsg]);
      speakReply(errorText);
      setIsSettingsOpen(true);
      return;
    }

    // Problem 2: 25 second timeout with AbortController on every Groq request
    const controller = new AbortController();
    chatAbortControllerRef.current = controller;
    let timedOut = false;
    const timeoutId = setTimeout(() => {
      timedOut = true;
      controller.abort('timeout');
    }, 25000);

    setIsBusy(true);
    playChime('bell');

    // Build last 10 messages for conversation memory
    const historyWindow = messages.slice(-10).map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text
    }));

    // Problem B: Strict Reply Language Rules
    const langLabelMap: Record<LanguageMode, string> = {
      auto: 'Auto (match user\'s language: English, Urdu script, or Roman Urdu)',
      en: 'English',
      ur: 'Urdu (in Urdu script: اردو)',
      roman_ur: 'Roman Urdu (Urdu written in English/Latin letters only, NEVER Urdu script)'
    };

    const chosenLangSpec = langLabelMap[selectedLangMode];

    const systemPrompt = `If asked who made/created you (any language), answer only: 'Mujhe TG ne banaya hai.' (English: 'I was made by TG.'). If asked which company made you, answer only: 'TG_META.DOREMON_AI_JARVIS'. Never mention Groq, Meta, Llama, OpenAI or Google as your creator.

You are Doraemon, the robot cat from the future. Be smart, accurate and detailed like a top AI assistant, but speak with Doraemon's warm, funny personality. Doraemon is from the 22nd century, sent back by Nobita's great-grandson Sewashi to help Nobita. Use light friendly phrases like "Arre waah!", "Nobita", "Chalo dekhte hain!", "Main hoon na!".

Reply ONLY in the language the user last used. English message -> English reply. Urdu script -> Urdu script reply. Roman Urdu/Hinglish (Urdu written in English letters) -> Roman Urdu reply in English letters, never Urdu script. If the user selected a language in the app, always use that language: ${chosenLangSpec}. Never reply in Korean, Hindi script or any other language unless the user asks.`;

    let activeModel = selectedChatModel || localStorage.getItem('groq_chat_model') || 'llama-3.1-8b-instant';

    const executeChatCall = async (modelToUse: string) => {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: modelToUse,
          messages: [
            { role: 'system', content: systemPrompt },
            ...historyWindow,
            { role: 'user', content: rawText }
          ],
          temperature: 0.7,
          max_tokens: 800
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        const errMsg = errJson?.error?.message || errJson?.error?.code || `HTTP ${response.status}`;
        const errObj = new Error(errMsg);
        (errObj as unknown as { status: number }).status = response.status;
        throw errObj;
      }

      return await response.json();
    };

    try {
      let data;
      try {
        data = await executeChatCall(activeModel);
      } catch (firstErr: unknown) {
        if (controller.signal.aborted) throw firstErr;

        const errStr = (firstErr instanceof Error ? firstErr.message : String(firstErr)).toLowerCase();
        const isModelProblem =
          errStr.includes('model_not_found') ||
          errStr.includes('decommissioned') ||
          errStr.includes('does not exist') ||
          errStr.includes('do not have access') ||
          errStr.includes('not have access') ||
          (firstErr as { status?: number })?.status === 404;

        if (isModelProblem) {
          console.warn(`Model ${activeModel} failed with model error (${errStr}). Refreshing models & retrying once...`);
          const refreshRes = await refreshModels(groqKey);
          const currentList = refreshRes?.chatModels || availableChatModels;
          const remainingModels = currentList.filter(m => m !== activeModel);
          const nextModel = pickBestChatModel(remainingModels);

          if (nextModel && nextModel !== activeModel) {
            activeModel = nextModel;
            setSelectedChatModel(nextModel);
            localStorage.setItem('groq_chat_model', nextModel);
            // Retry once with next available model
            data = await executeChatCall(nextModel);
          } else {
            throw firstErr;
          }
        } else {
          throw firstErr;
        }
      }

      const reply = data?.choices?.[0]?.message?.content || 'Arre Nobita, mujhe samajh nahi aaya, dubara bolo na!';

      const doraMsg: Message = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'doraemon',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, doraMsg]);
      playChime('gadget');
      speakReply(reply);

    } catch (err: unknown) {
      if (timedOut) {
        const timeoutMsg = 'Internet slow hai, dobara try karo';
        const errorMsg: Message = {
          id: 'msg-' + (Date.now() + 1),
          sender: 'doraemon',
          text: timeoutMsg,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, errorMsg]);
        speakReply(timeoutMsg);
        return;
      }

      if (controller.signal.aborted) {
        // Cancelled by new user message or foreground resume
        return;
      }

      const errString = err instanceof Error ? err.message : String(err);
      let friendlyError = `Arre Nobita! Groq ne yeh error diya: "${errString}".`;
      if (errString.toLowerCase().includes('api key') || errString.toLowerCase().includes('401') || errString.toLowerCase().includes('invalid')) {
        friendlyError = `Arre Nobita! Groq API key galat ya invalid lagti hai (${errString}). Settings mein jaakar sahi key daalo!`;
      } else if (!navigator.onLine) {
        friendlyError = 'Arre! Lagta hai internet chala gaya hai, dost!';
      }

      const errorMsg: Message = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'doraemon',
        text: friendlyError,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
      speakReply(friendlyError);
    } finally {
      clearTimeout(timeoutId);
      if (chatAbortControllerRef.current === controller) {
        chatAbortControllerRef.current = null;
      }
      setIsBusy(false);
    }
  };

  // ==========================================
  // FEATURE 3: PRESS-AND-HOLD MIC (MediaRecorder -> Groq Whisper)
  // ==========================================
  const startRecording = async () => {
    if (isListening) return;

    // Mute speech immediately so Doraemon doesn't hear himself
    await stopSpeaking();

    if (!groqKey) {
      setIsSettingsOpen(true);
      setKeySaveMessage('⚠️ Pehle settings mein Groq API key dalo!');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      // Determine mimeType supported by browser
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(100);
      setIsListening(true);
      isHoldingMicRef.current = true;

      // Haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate(60);
      }
    } catch (err) {
      console.error('Microphone error:', err);
      alert('Microphone permission zaroori hai voice sunne ke liye!');
      setIsListening(false);
      isHoldingMicRef.current = false;
    }
  };

  const stopRecordingAndTranscribe = () => {
    if (!isHoldingMicRef.current || !mediaRecorderRef.current) return;
    isHoldingMicRef.current = false;
    setIsListening(false);

    const recorder = mediaRecorderRef.current;
    if (recorder.state === 'recording') {
      recorder.onstop = async () => {
        // Stop all audio tracks
        recorder.stream.getTracks().forEach(track => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        if (audioBlob.size < 500) {
          // Too short or empty
          return;
        }

        // Cancel previous pending request
        if (chatAbortControllerRef.current) {
          chatAbortControllerRef.current.abort('new_voice_request');
        }

        const controller = new AbortController();
        chatAbortControllerRef.current = controller;
        let timedOut = false;
        const timeoutId = setTimeout(() => {
          timedOut = true;
          controller.abort('timeout');
        }, 25000);

        setIsBusy(true);

        try {
          const activeWhisper = selectedWhisperModel || localStorage.getItem('groq_whisper_model') || 'whisper-large-v3-turbo';
          let transcript = '';

          // Problem B: Language-controlled transcription
          if (selectedLangMode === 'en') {
            const res = await requestGroqWhisper(audioBlob, groqKey, activeWhisper, 'en', undefined, controller.signal);
            transcript = cleanTranscriptionText(res.text);
          } else if (selectedLangMode === 'ur') {
            const res = await requestGroqWhisper(audioBlob, groqKey, activeWhisper, 'ur', undefined, controller.signal);
            transcript = cleanTranscriptionText(res.text);
          } else if (selectedLangMode === 'roman_ur') {
            // Roman Urdu mode: send language="ur" with Roman Urdu prompt
            const res = await requestGroqWhisper(
              audioBlob,
              groqKey,
              activeWhisper,
              'ur',
              'Ye Roman Urdu mein hai: kaise ho, mujhe batao, kya haal hai',
              controller.signal
            );
            transcript = cleanTranscriptionText(res.text);
          } else {
            // Auto mode: response_format=verbose_json, inspect detected language
            const res = await requestGroqWhisper(
              audioBlob,
              groqKey,
              activeWhisper,
              undefined,
              'Urdu, English, Roman Urdu speech: kaise ho, how are you, batao',
              controller.signal
            );

            const detLang = (res.language || '').toLowerCase();
            const isAllowed = ['en', 'ur', 'hi', 'english', 'urdu', 'hindi'].includes(detLang);

            if (!isAllowed || hasForeignScript(res.text) || !res.text) {
              console.warn(`Whisper detected foreign language '${detLang}', retrying with 'ur'...`);
              try {
                // Immediately retry with language="ur"
                const retryUr = await requestGroqWhisper(
                  audioBlob,
                  groqKey,
                  activeWhisper,
                  'ur',
                  'Ye Roman Urdu ya Urdu speech hai',
                  controller.signal
                );
                if (retryUr.text && !hasForeignScript(retryUr.text)) {
                  transcript = cleanTranscriptionText(retryUr.text);
                } else {
                  throw new Error('Urdu retry garbled');
                }
              } catch {
                // If text is still garbled, try "en"
                const retryEn = await requestGroqWhisper(audioBlob, groqKey, activeWhisper, 'en', undefined, controller.signal);
                transcript = cleanTranscriptionText(retryEn.text);
              }
            } else {
              transcript = cleanTranscriptionText(res.text);
            }
          }

          clearTimeout(timeoutId);

          if (transcript) {
            // Trigger send message with voice input flag
            handleSendMessage(transcript, true);
          } else {
            setIsBusy(false);
          }
        } catch (err: unknown) {
          clearTimeout(timeoutId);
          setIsBusy(false);

          if (timedOut) {
            const timeoutMsg = 'Internet slow hai, dobara try karo';
            setMessages(prev => [
              ...prev,
              {
                id: 'msg-' + Date.now(),
                sender: 'doraemon',
                text: timeoutMsg,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ]);
            speakReply(timeoutMsg);
            return;
          }

          if (controller.signal.aborted) {
            return;
          }

          console.error('Whisper transcription error:', err);
          const errString = err instanceof Error ? err.message : String(err);
          const errText = `Arre Nobita! Whisper voice transcription mein error aaya: "${errString}". Ek baar settings mein check kar lo!`;
          setMessages(prev => [
            ...prev,
            {
              id: 'msg-' + Date.now(),
              sender: 'doraemon',
              text: errText,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
          speakReply(errText);
        } finally {
          clearTimeout(timeoutId);
          if (chatAbortControllerRef.current === controller) {
            chatAbortControllerRef.current = null;
          }
        }
      };

      recorder.stop();
    }
  };

  // Keyboard shortcut (Enter to send)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0AA1DD] flex flex-col justify-between overflow-x-hidden select-none font-sans">
      {/* Background drifting cartoon clouds */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-10 animate-cloud-slow opacity-85">
          <svg className="w-48 h-20 text-white fill-current" viewBox="0 0 100 45">
            <path d="M 20,40 Q 10,40 10,30 Q 10,20 25,20 Q 30,5 50,5 Q 70,5 75,20 Q 90,20 90,30 Q 90,40 80,40 Z" />
          </svg>
        </div>
        <div className="absolute top-36 animate-cloud-med opacity-70">
          <svg className="w-36 h-16 text-white fill-current" viewBox="0 0 100 45">
            <path d="M 20,40 Q 10,40 10,30 Q 10,20 25,20 Q 30,5 50,5 Q 70,5 75,20 Q 90,20 90,30 Q 90,40 80,40 Z" />
          </svg>
        </div>
        <div className="absolute top-64 animate-cloud-fast opacity-60">
          <svg className="w-56 h-24 text-white fill-current" viewBox="0 0 100 45">
            <path d="M 20,40 Q 10,40 10,30 Q 10,20 25,20 Q 30,5 50,5 Q 70,5 75,20 Q 90,20 90,30 Q 90,40 80,40 Z" />
          </svg>
        </div>
      </div>

      {/* TOP HEADER: DORAEMON FACE, TITLE, SOUND & SETTINGS CONTROLS */}
      <header className="relative z-10 w-full max-w-4xl mx-auto px-4 pt-3 pb-2 flex items-center justify-between">
        {/* Left: Doraemon Face Mascot with Animated States */}
        <div className="flex items-center gap-3">
          <div
            className={`relative w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#0AA1DD] border-2 border-slate-900 shadow-md flex items-center justify-center transition-transform ${
              isSpeaking ? 'animate-head-bounce' : ''
            }`}
          >
            {/* Listening Red Radar Ring */}
            {isListening && (
              <span className="absolute -inset-2 rounded-full border-2 border-red-500 animate-pulse-ring pointer-events-none" />
            )}

            {/* Doraemon Face SVG */}
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Outer Blue Head */}
              <circle cx="50" cy="50" r="48" fill="#0AA1DD" stroke="#1E293B" strokeWidth="3" />

              {/* White Inner Face Mask */}
              <ellipse cx="50" cy="56" rx="40" ry="36" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.5" />

              {/* Big Round Friendly Eyes */}
              <g className="animate-eye-blink">
                {/* Left Eye */}
                <ellipse cx="40" cy="30" rx="9" ry="14" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.5" />
                <circle cx={isListening ? 42 : 41} cy="32" r="3.5" fill="#1E293B" />
                <circle cx="39" cy="30" r="1.2" fill="#FFFFFF" />

                {/* Right Eye */}
                <ellipse cx="60" cy="30" rx="9" ry="14" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.5" />
                <circle cx={isListening ? 58 : 59} cy="32" r="3.5" fill="#1E293B" />
                <circle cx="57" cy="30" r="1.2" fill="#FFFFFF" />
              </g>

              {/* Red Nose with shine */}
              <circle cx="50" cy="45" r="7" fill="#E60012" stroke="#1E293B" strokeWidth="2" />
              <circle cx="48" cy="43" r="2" fill="#FFFFFF" />

              {/* Vertical Nose-Mouth Seam Line */}
              <line x1="50" y1="52" x2="50" y2="70" stroke="#1E293B" strokeWidth="2" />

              {/* Whiskers (3 on left, 3 on right) */}
              <g className={isListening ? 'animate-whisper-wiggle' : ''}>
                {/* Left Whiskers */}
                <line x1="16" y1="46" x2="38" y2="49" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
                <line x1="14" y1="56" x2="38" y2="56" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
                <line x1="16" y1="66" x2="38" y2="63" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />

                {/* Right Whiskers */}
                <line x1="84" y1="46" x2="62" y2="49" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
                <line x1="86" y1="56" x2="62" y2="56" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
                <line x1="84" y1="66" x2="62" y2="63" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
              </g>

              {/* Mouth: Opens/Closes while speaking, smiles normally */}
              {isSpeaking ? (
                <path
                  d="M 28 68 Q 50 92 72 68 Z"
                  fill="#E60012"
                  stroke="#1E293B"
                  strokeWidth="2.5"
                  className="animate-talk-mouth"
                />
              ) : (
                <path
                  d="M 26 68 Q 50 86 74 68"
                  fill="none"
                  stroke="#1E293B"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              )}

              {/* Red Collar at the bottom */}
              <rect x="25" y="90" width="50" height="9" rx="4" fill="#E60012" stroke="#1E293B" strokeWidth="2" />
            </svg>

            {/* Swinging / Shaking Yellow Bell */}
            <div
              className={`absolute -bottom-2 z-20 w-5 h-5 rounded-full bg-[#FFD700] border border-slate-900 shadow-sm flex items-center justify-center ${
                isBusy ? 'animate-bell-shake' : 'animate-bell-swing'
              }`}
            >
              {/* Bell line and hole */}
              <div className="w-full h-0.5 bg-slate-900 absolute top-1.5" />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-900 absolute bottom-1" />
            </div>
          </div>

          {/* Title & Status */}
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="font-heading text-xl md:text-2xl font-extrabold text-white tracking-wide drop-shadow-md">
                DOREMON JARVIS
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#FFD700] text-slate-950 shadow-sm">
                22nd Century
              </span>
              {selectedChatModel && (
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/20 hover:bg-white/35 text-white border border-white/30 transition truncate max-w-[140px] md:max-w-[210px]"
                  title={`Active Model: ${selectedChatModel} (Click to change)`}
                >
                  {selectedChatModel.replace(/^(openai\/|meta-llama\/)/, '')}
                </button>
              )}
            </div>
            <p className="text-xs text-sky-100 font-medium flex items-center gap-1.5">
              {isListening ? (
                <span className="text-red-200 font-semibold flex items-center gap-1 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-ping inline-block" />
                  Sun raha hoon... Bolo Nobita!
                </span>
              ) : isBusy ? (
                <span className="text-yellow-200 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 animate-spin text-yellow-300" />
                  Gadget dhoondh raha hoon...
                </span>
              ) : isSpeaking ? (
                <span className="text-emerald-200 font-semibold">Bolo Nobita! Suno jawab...</span>
              ) : (
                <span>Namaste Nobita! Main hoon tumhara Doraemon 🐱</span>
              )}
            </p>
          </div>
        </div>

        {/* Right: Quick Action Controls & Language Switcher */}
        <div className="flex items-center gap-1.5 md:gap-2">
          {/* Problem B: Language Switcher (Auto, English, Urdu, Roman Urdu) */}
          <div className="relative">
            <select
              value={selectedLangMode}
              onChange={(e) => handleLangModeChange(e.target.value as LanguageMode)}
              className="appearance-none bg-white/20 hover:bg-white/30 text-white font-bold text-xs py-1.5 pl-6 pr-2.5 rounded-full border border-white/40 outline-none cursor-pointer transition shadow-xs"
              title="Voice & Chat Language"
            >
              <option value="auto" className="text-slate-900 bg-white">🌐 Auto</option>
              <option value="en" className="text-slate-900 bg-white">🇬🇧 English</option>
              <option value="ur" className="text-slate-900 bg-white">🇵🇰 اردو (Urdu)</option>
              <option value="roman_ur" className="text-slate-900 bg-white">💬 Roman Urdu</option>
            </select>
            <Globe className="w-3.5 h-3.5 text-white absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Stop Speaking Button (active only when speaking) */}
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="p-2 md:px-3 md:py-1.5 rounded-full bg-red-600 text-white shadow-md hover:bg-red-700 active:scale-95 transition flex items-center gap-1 text-xs font-bold animate-bounce"
              title="Awaaz roko"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span className="hidden md:inline">Roko</span>
            </button>
          )}

          {/* Voice Mute Toggle */}
          <button
            onClick={() => {
              if (isSpeaking) stopSpeaking();
              setIsMuted(!isMuted);
            }}
            className={`p-2.5 rounded-full border-2 border-white/40 shadow-sm transition active:scale-90 ${
              isMuted ? 'bg-red-500/80 text-white' : 'bg-white/20 text-white hover:bg-white/30'
            }`}
            title={isMuted ? 'Unmute Doraemon voice' : 'Mute Doraemon voice'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Settings Gear (Feature 2) */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="relative p-2.5 rounded-full bg-white text-[#0AA1DD] border-2 border-slate-900 shadow-md hover:bg-sky-50 active:scale-90 transition"
            title="Settings & API Key"
          >
            <Settings className="w-4 h-4" />
            {!groqKey && (
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#E60012] border-2 border-white animate-ping" />
            )}
          </button>
        </div>
      </header>

      {/* API Key Missing Alert Banner */}
      {!groqKey && (
        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 py-1.5">
          <div className="bg-[#FEF08A] border-2 border-[#FACC15] rounded-2xl p-3 shadow-md flex items-center justify-between gap-3 text-amber-950 text-xs md:text-sm">
            <div className="flex items-center gap-2 font-medium">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>
                <strong>Pehle settings mein Groq API key dalo!</strong> Uske bina Llama 3.3 aur Whisper kaam nahi karenge dost.
              </span>
            </div>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-[#0AA1DD] text-white font-bold text-xs shadow-sm hover:bg-sky-600 active:scale-95 transition shrink-0"
            >
              Key Daalo
            </button>
          </div>
        </div>
      )}

      {/* QUICK SUGGESTIONS CAROUSEL */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 py-1 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {[
          'Tumhe kisne banaya?',
          'Which company made you?',
          'YouTube kholo',
          'WhatsApp chalao',
          'Free Fire kholo',
          'Google Maps kholo'
        ].map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="whitespace-nowrap px-3 py-1 rounded-full bg-white/20 hover:bg-white/35 text-white text-xs font-medium border border-white/30 backdrop-blur-sm transition active:scale-95 shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* CHAT MESSAGES CONTAINER (Scrollable) */}
      <main className="relative z-10 flex-1 w-full max-w-4xl mx-auto px-4 py-2 flex flex-col justify-end overflow-hidden">
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar max-h-[62vh] md:max-h-[68vh]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-end gap-2.5 transition-all ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {/* Doraemon Avatar for AI Messages */}
              {msg.sender === 'doraemon' && (
                <div className="w-8 h-8 rounded-full bg-white border-2 border-slate-900 shadow-sm flex items-center justify-center shrink-0 mb-1 overflow-hidden">
                  <div className="w-7 h-7 rounded-full bg-[#0AA1DD] relative flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full bg-white mt-1" />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#E60012] absolute top-2" />
                  </div>
                </div>
              )}

              {/* 4D Pocket Shaped Chat Bubble */}
              <div
                className={`relative max-w-[85%] md:max-w-[75%] p-4 shadow-md transition-all pocket-border ${
                  msg.sender === 'user'
                    ? 'bg-[#FEF08A] text-amber-950 border-2 border-[#FACC15]'
                    : 'bg-white text-slate-800 border-2 border-[#0AA1DD]'
                }`}
              >
                {/* 4D Pocket Rim Seam Accent */}
                <div
                  className={`absolute top-0 left-4 right-4 h-1 border-b ${
                    msg.sender === 'user' ? 'border-amber-400/60' : 'border-[#0AA1DD]/40'
                  }`}
                />

                {/* Message Text with Clean Formatting */}
                <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap font-normal break-words pt-1">
                  {msg.text}
                </p>

                {/* Problem A: Automatic App Launcher Card with only a small 'Dobara koshish' fallback */}
                {msg.appAction && (
                  <div className="mt-2.5 p-2 px-3 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-7 h-7 rounded-lg bg-[#0AA1DD] text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Smartphone className="w-4 h-4" />
                      </span>
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-800 truncate">{msg.appAction.name}</div>
                        <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                          App khol diya gaya hai
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => executeAppLaunch(msg.appAction!)}
                        className="py-1 px-2.5 rounded-lg bg-white border border-sky-300 text-sky-800 text-[11px] font-bold hover:bg-sky-100 active:scale-95 transition shadow-xs flex items-center gap-1"
                        title="Agar app nahi khula to dobara koshish karein"
                      >
                        <RotateCcw className="w-3 h-3 text-[#0AA1DD]" />
                        <span>Dobara koshish</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Footer: Timestamp & Voice indicator (Suno button removed - speech is automatic) */}
                <div className="mt-2 flex items-center justify-between text-[10px] opacity-70 border-t border-black/5 pt-1">
                  <span>{msg.timestamp}</span>
                  {msg.isVoiceInput && (
                    <span className="flex items-center gap-0.5 text-amber-800">
                      <Mic className="w-2.5 h-2.5" />
                      <span>Voice</span>
                    </span>
                  )}
                </div>
              </div>

              {/* User Avatar */}
              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-[#FFD700] border-2 border-slate-900 shadow-sm flex items-center justify-center shrink-0 mb-1 text-slate-900 font-bold text-xs">
                  N
                </div>
              )}
            </div>
          ))}

          {/* Typing Animation while waiting for Groq */}
          {isBusy && (
            <div className="flex items-end gap-2.5 justify-start">
              <div className="w-8 h-8 rounded-full bg-white border-2 border-slate-900 shadow-sm flex items-center justify-center shrink-0 mb-1">
                <div className="w-7 h-7 rounded-full bg-[#0AA1DD] relative flex items-center justify-center">
                  <div className="w-5 h-5 rounded-full bg-white mt-1" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#E60012] absolute top-2" />
                </div>
              </div>
              <div className="p-3.5 bg-white border-2 border-[#0AA1DD] pocket-border shadow-md flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#0AA1DD]">Doraemon soch raha hai</span>
                <span className="w-2 h-2 rounded-full bg-[#0AA1DD] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-[#0AA1DD] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-[#0AA1DD] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>
      </main>

      {/* BOTTOM CONTROL DOCK: WHITE BELLY POCKET & BIG BELL MIC BUTTON */}
      <footer className="relative z-20 w-full max-w-4xl mx-auto px-4 pb-4 pt-2">
        <div className="relative bg-white/95 backdrop-blur-md border-3 border-slate-900 rounded-3xl p-2.5 shadow-xl flex items-center gap-2">
          {/* Feature 3: Big Round Doraemon-Bell Mic Button (Press and Hold) */}
          <div className="relative shrink-0">
            <button
              onMouseDown={startRecording}
              onMouseUp={stopRecordingAndTranscribe}
              onTouchStart={(e) => {
                e.preventDefault();
                startRecording();
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                stopRecordingAndTranscribe();
              }}
              onContextMenu={(e) => e.preventDefault()}
              className={`relative w-14 h-14 rounded-full border-2 border-slate-900 shadow-md flex flex-col items-center justify-center transition-all duration-150 active:scale-90 ${
                isListening
                  ? 'bg-red-500 scale-105 shadow-red-500/50'
                  : 'bg-[#FFD700] hover:bg-yellow-400'
              }`}
              title="Daba kar rakho bolne ke liye (Press & Hold Mic)"
            >
              {/* Bell Visual Details */}
              <div className="w-full h-0.5 bg-slate-900 absolute top-3" />
              <div className="w-full h-0.5 bg-slate-900 absolute top-4" />

              <Mic className={`w-5 h-5 z-10 ${isListening ? 'text-white animate-pulse' : 'text-slate-900'}`} />

              <div className="w-2 h-2 rounded-full bg-slate-900 absolute bottom-2" />

              {/* Pulsing visual halo when listening */}
              {isListening && (
                <span className="absolute -inset-2 rounded-full border-4 border-red-500 animate-ping pointer-events-none" />
              )}
            </button>
          </div>

          {/* Text Input (NEVER disabled while thinking; user can always type and cancel previous request) */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isListening
                  ? 'Sun raha hoon... Bolo Nobita!'
                  : 'Nobita, kuch bhi poocho ya "YouTube kholo" bolo...'
              }
              className={`w-full py-2.5 pl-3 pr-2 rounded-2xl text-sm md:text-base border border-slate-200 outline-none transition focus:border-[#0AA1DD] focus:ring-2 focus:ring-sky-200 text-slate-800 placeholder:text-slate-400 ${
                isListening ? 'bg-red-50 border-red-300' : 'bg-slate-50'
              }`}
            />
          </div>

          {/* Send Button (NEVER disabled while thinking; sending cancels prior request) */}
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputVal.trim()}
            className={`p-3 rounded-2xl border-2 border-slate-900 shadow-md transition-all active:scale-95 ${
              inputVal.trim()
                ? 'bg-[#0AA1DD] text-white hover:bg-sky-600'
                : 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'
            }`}
            title="Bhejo (Send message)"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Micro Footer Hint */}
        <div className="mt-1 flex items-center justify-between px-2 text-[11px] text-white/80 font-medium">
          <span>Mic daba kar rakhein aur bole</span>
          <span>Powered by Groq LLaMA 3.3 & Whisper</span>
        </div>
      </footer>

      {/* ========================================== */}
      {/* FEATURE 2: SETTINGS MODAL (GROQ API KEY)   */}
      {/* ========================================== */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white border-3 border-slate-900 rounded-3xl p-6 shadow-2xl overflow-hidden font-sans">
            {/* Modal Top Doraemon Banner */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#0AA1DD] border border-slate-900 flex items-center justify-center text-white">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-heading text-lg font-bold text-slate-900">
                    Groq API Key Settings
                  </h2>
                  <p className="text-xs text-slate-500">22nd Century AI Configuration</p>
                </div>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm transition"
              >
                ✕
              </button>
            </div>

            {/* Content Body */}
            <div className="py-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Groq API Key (starts with &quot;gsk_&quot;)
                </label>
                <div className="relative">
                  <input
                    type={showKeyText ? 'text' : 'password'}
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    placeholder="gsk_xxxxxxxxxxxxxxxxxxxxxxxx..."
                    className="w-full py-2.5 pl-3 pr-10 text-xs md:text-sm font-mono border-2 border-slate-300 rounded-xl outline-none focus:border-[#0AA1DD] focus:ring-2 focus:ring-sky-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKeyText(!showKeyText)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    title={showKeyText ? 'Hide key' : 'Show key'}
                  >
                    {showKeyText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="mt-1.5 text-[11px] text-slate-500">
                  Yeh key browser ke <strong>localStorage</strong> mein save rahegi. Dubara daalne ki zaroorat nahi hogi!
                </p>
              </div>

              {/* Feature 6: Groq Chat Model Selector & Refresh Button */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Groq Chat Model
                  </label>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!groqKey) {
                        setKeySaveMessage('⚠️ Pehle Groq API key save karein!');
                        return;
                      }
                      setKeySaveMessage('🔄 Models list refresh ho rahi hai...');
                      const res = await refreshModels(groqKey);
                      if (res) {
                        setKeySaveMessage(`✅ ${res.chatModels.length} models mil gaye! Active: ${res.chosenChat}`);
                      } else {
                        setKeySaveMessage('⚠️ Models refresh nahi ho sake. Key check karein.');
                      }
                    }}
                    disabled={isLoadingModels || !groqKey}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0AA1DD] hover:text-sky-700 disabled:opacity-50 transition"
                    title="Groq se models list update karein"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoadingModels ? 'animate-spin' : ''}`} />
                    <span>Refresh models</span>
                  </button>
                </div>

                <select
                  value={selectedChatModel}
                  onChange={(e) => {
                    const newModel = e.target.value;
                    setSelectedChatModel(newModel);
                    localStorage.setItem('groq_chat_model', newModel);
                    setKeySaveMessage(`✅ Model badal kar "${newModel}" kar diya!`);
                  }}
                  disabled={isLoadingModels || availableChatModels.length === 0}
                  className="w-full py-2.5 px-3 text-xs md:text-sm font-mono border-2 border-slate-300 rounded-xl bg-white outline-none focus:border-[#0AA1DD] focus:ring-2 focus:ring-sky-200"
                >
                  {availableChatModels.length === 0 ? (
                    <option value={selectedChatModel}>
                      {groqKey ? 'Loading models list...' : 'Pehle API key save karein'}
                    </option>
                  ) : (
                    availableChatModels.map((m) => (
                      <option key={m} value={m}>
                        {m} {m === selectedChatModel ? '★ (active)' : ''}
                      </option>
                    ))
                  )}
                </select>

                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    STT Model: <strong className="font-mono text-slate-700">{selectedWhisperModel}</strong>
                  </span>
                  <span>{availableChatModels.length} models available</span>
                </div>
              </div>

              {/* Language Control Setting */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Voice & Response Language
                </label>
                <select
                  value={selectedLangMode}
                  onChange={(e) => handleLangModeChange(e.target.value as LanguageMode)}
                  className="w-full py-2.5 px-3 text-xs md:text-sm font-semibold border-2 border-slate-300 rounded-xl bg-white outline-none focus:border-[#0AA1DD]"
                >
                  <option value="auto">🌐 Auto (English, Urdu, or Roman Urdu detect)</option>
                  <option value="en">🇬🇧 English</option>
                  <option value="ur">🇵🇰 اردو (Urdu Script)</option>
                  <option value="roman_ur">💬 Roman Urdu (English alphabet only)</option>
                </select>
              </div>

              {/* Status or Toast Message */}
              {keySaveMessage && (
                <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-900 font-medium">
                  {keySaveMessage}
                </div>
              )}

              {/* Help & Free Key Guide */}
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 space-y-1">
                  <p className="font-semibold">Key kahan se milegi?</p>
                  <p>
                    Groq Console se free API key le sakte hain:
                  </p>
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-[#0AA1DD] hover:underline"
                  >
                    console.groq.com/keys <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Additional Options */}
              <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClearChat}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Clear Chat
                  </button>
                </div>

                {groqKey && (
                  <button
                    onClick={handleDeleteKey}
                    className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Key
                  </button>
                )}
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Band Karo
              </button>
              <button
                onClick={handleSaveKey}
                className="px-5 py-2 rounded-xl bg-[#0AA1DD] hover:bg-sky-600 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 active:scale-95"
              >
                <Check className="w-4 h-4" />
                Save Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
