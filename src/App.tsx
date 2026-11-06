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
  Globe,
  Search
} from 'lucide-react';

// ==========================================
// ==========================================
// FEATURE 5: APP_MAP & NATIVE LAUNCHER
// ==========================================
export type LanguageMode = 'auto' | 'en' | 'ur' | 'roman_ur';

interface AppTarget {
  key: string;
  name: string;
  packageName: string;
  fallbackPackage?: string;
  webFallback: string;
  keywords: string[];
}

export interface ParsedAppCommand {
  isAppCommand: boolean;
  app?: AppTarget;
  searchQuery?: string;
  searchUrl?: string;
  speechNote?: string;
  noSearchSupport?: boolean;
}

/**
 * PACKAGE Map for Popular Phone Apps (Capacitor AppLauncher)
 * Uses package names directly for AL.canOpenUrl and AL.openUrl
 */
const APP_MAP: Record<string, AppTarget> = {
  youtube: {
    key: 'youtube',
    name: 'YouTube',
    packageName: 'com.google.android.youtube',
    webFallback: 'https://www.youtube.com',
    keywords: ['youtube', 'yutube', 'yt', 'you tube', 'yotube', 'video', 'یوٹیوب']
  },
  whatsapp: {
    key: 'whatsapp',
    name: 'WhatsApp',
    packageName: 'com.whatsapp',
    webFallback: 'https://web.whatsapp.com',
    keywords: ['whatsapp', 'whatsap', 'watsapp', 'watsap', 'wa', 'wtsp', 'واٹس ایپ', 'واٹسایپ']
  },
  tiktok: {
    key: 'tiktok',
    name: 'TikTok',
    packageName: 'com.zhiliaoapp.musically',
    fallbackPackage: 'com.ss.android.ugc.trill',
    webFallback: 'https://www.tiktok.com',
    keywords: ['tiktok', 'tik tok', 'toktok', 'ٹک ٹاک', 'ٹک ٹوک']
  },
  telegram: {
    key: 'telegram',
    name: 'Telegram',
    packageName: 'org.telegram.messenger',
    webFallback: 'https://web.telegram.org',
    keywords: ['telegram', 'tele', 'tg', 'ٹیلیگرام']
  },
  instagram: {
    key: 'instagram',
    name: 'Instagram',
    packageName: 'com.instagram.android',
    webFallback: 'https://www.instagram.com',
    keywords: ['instagram', 'insta', 'ig', 'instagrem', 'انسٹاگرام', 'انسٹا']
  },
  chrome: {
    key: 'chrome',
    name: 'Chrome',
    packageName: 'com.android.chrome',
    webFallback: 'https://www.google.com',
    keywords: ['chrome', 'browser', 'google chrome', 'chrom', 'کروم']
  },
  gemini: {
    key: 'gemini',
    name: 'Gemini',
    packageName: 'com.google.android.apps.bard',
    webFallback: 'https://gemini.google.com',
    keywords: ['gemini', 'bard', 'google gemini', 'جیمنی']
  },
  claude: {
    key: 'claude',
    name: 'Claude',
    packageName: 'com.anthropic.claude',
    webFallback: 'https://claude.ai',
    keywords: ['claude', 'anthropic', 'کلاڈ']
  },
  google: {
    key: 'google',
    name: 'Google',
    packageName: 'com.google.android.googlequicksearchbox',
    webFallback: 'https://www.google.com',
    keywords: ['google', 'google app', 'search', 'گوگل']
  },
  freefire: {
    key: 'freefire',
    name: 'Free Fire',
    packageName: 'com.dts.freefireth',
    fallbackPackage: 'com.dts.freefiremax',
    webFallback: 'https://play.google.com/store/apps/details?id=com.dts.freefireth',
    keywords: ['free fire', 'freefire', 'ff', 'garena free fire', 'فری فائر']
  },
  discord: {
    key: 'discord',
    name: 'Discord',
    packageName: 'com.discord',
    webFallback: 'https://discord.com',
    keywords: ['discord', 'dc', 'diskord', 'ڈسکارڈ']
  },
  playstore: {
    key: 'playstore',
    name: 'Play Store',
    packageName: 'com.android.vending',
    webFallback: 'https://play.google.com/store',
    keywords: ['play store', 'playstore', 'store', 'market', 'google play', 'پلے اسٹور', 'پلے سٹور']
  },
  facebook: {
    key: 'facebook',
    name: 'Facebook',
    packageName: 'com.facebook.katana',
    webFallback: 'https://www.facebook.com',
    keywords: ['facebook', 'fb', 'facebok', 'فیس بک']
  },
  twitter: {
    key: 'twitter',
    name: 'X (Twitter)',
    packageName: 'com.twitter.android',
    webFallback: 'https://x.com',
    keywords: ['twitter', 'x', 'tweet', 'twiter', 'ٹویٹر', 'ٹوئٹر']
  },
  snapchat: {
    key: 'snapchat',
    name: 'Snapchat',
    packageName: 'com.snapchat.android',
    webFallback: 'https://www.snapchat.com',
    keywords: ['snapchat', 'snap', 'sc', 'snap chat', 'سنیپ چیٹ']
  },
  spotify: {
    key: 'spotify',
    name: 'Spotify',
    packageName: 'com.spotify.music',
    webFallback: 'https://open.spotify.com',
    keywords: ['spotify', 'music', 'songs', 'gaane', 'spoti', 'اسپاٹائفائی']
  },
  amazon: {
    key: 'amazon',
    name: 'Amazon',
    packageName: 'com.amazon.mShop.android.shopping',
    webFallback: 'https://www.amazon.com',
    keywords: ['amazon', 'shopping', 'امیزون']
  },
  pinterest: {
    key: 'pinterest',
    name: 'Pinterest',
    packageName: 'com.pinterest',
    webFallback: 'https://www.pinterest.com',
    keywords: ['pinterest', 'پنٹریسٹ']
  },
  gmail: {
    key: 'gmail',
    name: 'Gmail',
    packageName: 'com.google.android.gm',
    webFallback: 'https://mail.google.com',
    keywords: ['gmail', 'mail', 'email', 'g mail', 'جی میل']
  },
  maps: {
    key: 'maps',
    name: 'Maps',
    packageName: 'com.google.android.apps.maps',
    webFallback: 'https://maps.google.com',
    keywords: ['maps', 'google maps', 'map', 'rasta', 'location', 'گوگل میپس', 'میپس']
  },
  camera: {
    key: 'camera',
    name: 'Camera',
    packageName: 'com.android.camera',
    webFallback: '',
    keywords: ['camera', 'cam', 'tasveer', 'photo', 'capture', 'کیمرہ']
  },
  settings: {
    key: 'settings',
    name: 'Settings',
    packageName: 'com.android.settings',
    webFallback: '',
    keywords: ['settings', 'setting', 'phone settings', 'system settings', 'سیٹنگز', 'سیٹنگ']
  },
  calculator: {
    key: 'calculator',
    name: 'Calculator',
    packageName: 'com.google.android.calculator',
    webFallback: 'https://www.google.com/search?q=calculator',
    keywords: ['calculator', 'calc', 'hisaab', 'calcy', 'کیلکولیٹر']
  }
};

/**
 * Build URL to search directly inside target app or service
 */
function buildAppSearchUrl(appKey: string, query: string): { url?: string; speechNote?: string; noSearchSupport?: boolean } {
  const enc = encodeURIComponent(query.trim());
  switch (appKey) {
    case 'youtube':
      return { url: `https://www.youtube.com/results?search_query=${enc}` };
    case 'google':
    case 'chrome':
      return { url: `https://www.google.com/search?q=${enc}` };
    case 'instagram':
      return { url: `https://www.instagram.com/explore/search/keyword/?q=${enc}` };
    case 'tiktok':
      return { url: `https://www.tiktok.com/search?q=${enc}` };
    case 'facebook':
      return { url: `https://www.facebook.com/search/top?q=${enc}` };
    case 'twitter':
    case 'x':
      return { url: `https://x.com/search?q=${enc}` };
    case 'spotify':
      return { url: `https://open.spotify.com/search/${enc}` };
    case 'playstore':
      return { url: `market://search?q=${enc}&c=apps` };
    case 'maps':
      return { url: `geo:0,0?q=${enc}` };
    case 'amazon':
      return { url: `https://www.amazon.com/s?k=${enc}` };
    case 'pinterest':
      return { url: `https://www.pinterest.com/search/pins/?q=${enc}` };
    case 'telegram': {
      const cleanUsername = query.trim().replace(/^@/, '').replace(/\s+/g, '');
      return {
        url: `tg://resolve?domain=${encodeURIComponent(cleanUsername)}`,
        speechNote: 'Ye sirf usernames ke liye kaam karta hai.'
      };
    }
    case 'whatsapp':
      return {
        noSearchSupport: true,
        speechNote: 'WhatsApp mein search nahi ho sakta, sirf khol sakta hoon.'
      };
    default:
      return { noSearchSupport: true };
  }
}

/**
 * Enhanced local app launcher and in-app search parser
 * Understands English, Urdu, Roman Urdu commands:
 * e.g. "open youtube and search patti bhramchari", "youtube kholo aur bhabi no 1 search karo",
 * "youtube par XYZ search karo", "search XYZ on youtube", "instagram mein XYZ dhundo"
 */
function detectAppCommand(text: string): ParsedAppCommand {
  const rawClean = text.trim();
  if (!rawClean) return { isAppCommand: false };

  const lower = rawClean.toLowerCase();

  // Search words in English, Roman Urdu, Hindi, Urdu script
  const searchWordPattern = /\b(search|serach|find|dhundo|dhoondo|dhundho|dhoondho|talash|khojo)\b|سرچ|تلاش|ڈھونڈو/i;
  // Open triggers
  const openTriggerPattern = /\b(open|kholo|khol\s*do|khol\s*de|kholiye|chalao|chala\s*do|launch|start|run)\b|کھولو|چلاؤ|کھول\s*دو/i;

  const hasSearchWord = searchWordPattern.test(lower);
  const hasOpenTrigger = openTriggerPattern.test(lower);

  // Match against APP_MAP entries (longest keyword first)
  const allEntries: Array<{ key: string; app: AppTarget; kw: string }> = [];
  for (const [key, app] of Object.entries(APP_MAP)) {
    for (const kw of app.keywords) {
      allEntries.push({ key, app, kw });
    }
  }
  allEntries.sort((a, b) => b.kw.length - a.kw.length);

  let matchedAppKey: string | null = null;
  let matchedApp: AppTarget | null = null;
  let matchedKeyword: string | null = null;

  for (const item of allEntries) {
    const escapedKw = item.kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?:^|[\\s.,!?;:'"\\-\\/])${escapedKw}(?:$|[\\s.,!?;:'"\\-\\/])`, 'i');
    if (regex.test(lower)) {
      matchedAppKey = item.key;
      matchedApp = item.app;
      matchedKeyword = item.kw;
      break;
    }
  }

  // If no known app found, check if it's an open command for an unlisted app
  if (!matchedApp) {
    if (hasOpenTrigger && !hasSearchWord) {
      const openMatches = lower.match(/(?:open|kholo|chalao|launch)\s+([a-zA-Z0-9_\-\s]+)/i);
      if (openMatches && openMatches[1]) {
        let candidate = openMatches[1].trim();
        candidate = candidate.replace(/\s+(kholo|chalao|karo|please)$/i, '').trim();
        if (candidate) {
          const displayName = candidate.charAt(0).toUpperCase() + candidate.slice(1);
          return {
            isAppCommand: true,
            app: {
              key: candidate.toLowerCase(),
              name: displayName,
              packageName: `search:${candidate}`,
              webFallback: `https://play.google.com/store/search?q=${encodeURIComponent(candidate)}&c=apps`,
              keywords: [candidate]
            }
          };
        }
      }
    }
    return { isAppCommand: false };
  }

  // App is identified!
  // If no search word exists, it's a simple open command
  if (!hasSearchWord) {
    return {
      isAppCommand: true,
      app: matchedApp
    };
  }

  // Search word IS present! Extract query
  // Mark app keyword with placeholder __TARGET_APP__
  const escapedKw = matchedKeyword!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const kwRegex = new RegExp(`(?:^|[\\s.,!?;:'"\\-\\/])${escapedKw}(?:$|[\\s.,!?;:'"\\-\\/])`, 'i');
  const textWithMarker = lower.replace(kwRegex, (m) => m.replace(new RegExp(escapedKw, 'i'), '__TARGET_APP__'));

  let extractedQuery = '';

  // Pattern A: search <QUERY> on/in __TARGET_APP__
  const pA = /(?:search|serach|find|dhundo|dhoondo|dhundho|talash|khojo|سرچ|تلاش|ڈھونڈو)\s+(?:for\s+)?(.+?)\s+(?:on|in|par|mein|me|pe|se)\s+__TARGET_APP__/i;
  const mA = textWithMarker.match(pA);
  if (mA && mA[1]) {
    extractedQuery = mA[1];
  }

  // Pattern B: __TARGET_APP__ (kholo/open)? (aur/and)? (par/mein)? <QUERY> (ko)? (search/dhundo) (karo)?
  // e.g. "__TARGET_APP__ par bhabi no 1 search karo", "__TARGET_APP__ mein XYZ dhundo"
  if (!extractedQuery) {
    const pB = /__TARGET_APP__\s*(?:kholo|open|chalao)?\s*(?:and|aur)?\s*(?:par|mein|me|on|in|pe|se)?\s*(.+?)\s*(?:ko\s*)?(?:search|serach|find|dhundo|dhoondo|dhundho|talash|khojo|سرچ|تلاش|ڈھونڈو)(?:\s*(?:karo|kar\s*do|karna|kariye|please))?$/i;
    const mB = textWithMarker.match(pB);
    if (mB && mB[1]) {
      extractedQuery = mB[1];
    }
  }

  // Pattern C: __TARGET_APP__ ... (search/dhundo) <QUERY>
  // e.g. "open __TARGET_APP__ and search patti bhramchari"
  if (!extractedQuery) {
    const pC = /__TARGET_APP__.*?(?:search|serach|find|dhundo|dhoondo|dhundho|talash|khojo|سرچ|تلاش|ڈھونڈو)\s*(?:for\s*)?(.+)/i;
    const mC = textWithMarker.match(pC);
    if (mC && mC[1]) {
      extractedQuery = mC[1];
    }
  }

  // Pattern D: Generic fallback if search word exists
  if (!extractedQuery) {
    let fallback = textWithMarker
      .replace(/__TARGET_APP__/gi, ' ')
      .replace(/\b(open|kholo|khol\s*do|chalao|launch|run|start)\b/gi, ' ')
      .replace(/\b(search|serach|find|dhundo|dhoondo|dhundho|talash|khojo)\b|سرچ|تلاش|ڈھونڈو/gi, ' ')
      .replace(/\b(and|aur|phir|then|par|mein|me|on|in|pe|se|ko|karo|kar\s*do|karna|please|for)\b/gi, ' ');
    extractedQuery = fallback;
  }

  // Clean filler words and punctuation from extracted query
  extractedQuery = extractedQuery
    .replace(/^(and|aur|for|ke\s*liye|par|mein|me|on|in|karo|do|please)\s+/i, '')
    .replace(/\s+(karo|kar\s*do|karna|please|do|kariye)$/i, '')
    .replace(/[?!.,;:'"“”‘’]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // If query is empty, treat as pure open
  if (!extractedQuery) {
    return {
      isAppCommand: true,
      app: matchedApp
    };
  }

  // Build the app search URL
  const searchInfo = buildAppSearchUrl(matchedAppKey!, extractedQuery);

  return {
    isAppCommand: true,
    app: matchedApp,
    searchQuery: extractedQuery,
    searchUrl: searchInfo.url,
    speechNote: searchInfo.speechNote,
    noSearchSupport: searchInfo.noSearchSupport
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
      JarvisBridge?: {
        saveConfig: (config: { key: string; model: string; lang: 'auto' | 'en' | 'ur' | 'roman' }) => Promise<unknown>;
        askPermissions: () => Promise<unknown>;
        startOverlay: () => Promise<unknown>;
        stopOverlay: () => Promise<unknown>;
        status: () => Promise<{ overlay: boolean; running: boolean; mic: boolean }>;
      };
    };
  };
}

// Helpers for speech cleaning and script detection
function hasUrduScript(text: string): boolean {
  // Matches Arabic / Urdu / Perso-Arabic unicode range
  return /[\u0600-\u06FF]/.test(text);
}

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
  searchQuery?: string;
  searchUrl?: string;
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

  // Floating Doraemon (JarvisBridge native plugin for APK)
  const [hasJarvisBridge, setHasJarvisBridge] = useState<boolean>(() => {
    return typeof window !== 'undefined' && Boolean((window as unknown as CapacitorWindow)?.Capacitor?.Plugins?.JarvisBridge);
  });
  const [bridgeStatus, setBridgeStatus] = useState<{ overlay: boolean; running: boolean; mic: boolean } | null>(null);
  const [overlayMessage, setOverlayMessage] = useState<string>('');
  const [isOverlayLoading, setIsOverlayLoading] = useState<boolean>(false);

  // 1. Config sync: call JarvisBridge.saveConfig({ key: <saved Groq key>, model: <currently selected chat model>, lang: <"auto" | "en" | "ur" | "roman"> })
  // on app start and every time the key, model or language changes.
  const syncJarvisConfig = useCallback(async (keyOverride?: string, modelOverride?: string, langOverride?: LanguageMode) => {
    const win = window as unknown as CapacitorWindow;
    const JB = win.Capacitor?.Plugins?.JarvisBridge;
    if (!JB || typeof JB.saveConfig !== 'function') return;

    const activeKey = keyOverride !== undefined ? keyOverride : groqKey;
    const activeModel = modelOverride !== undefined ? modelOverride : (selectedChatModel || 'llama-3.1-8b-instant');
    const activeLang = langOverride !== undefined ? langOverride : selectedLangMode;
    const mappedLang: 'auto' | 'en' | 'ur' | 'roman' = activeLang === 'roman_ur' ? 'roman' : (activeLang as 'auto' | 'en' | 'ur');

    try {
      await JB.saveConfig({
        key: activeKey,
        model: activeModel,
        lang: mappedLang
      });
    } catch (err) {
      console.warn('JarvisBridge.saveConfig error:', err);
    }
  }, [groqKey, selectedChatModel, selectedLangMode]);

  // 4. Refresh status using JarvisBridge.status() -> { overlay, running, mic }
  const refreshBridgeStatus = useCallback(async () => {
    const win = window as unknown as CapacitorWindow;
    const JB = win.Capacitor?.Plugins?.JarvisBridge;
    if (JB) {
      setHasJarvisBridge(true);
      if (typeof JB.status === 'function') {
        try {
          const s = await JB.status();
          setBridgeStatus(s);
        } catch (err) {
          console.warn('JarvisBridge.status error:', err);
        }
      }
    } else {
      setHasJarvisBridge(false);
    }
  }, []);

  const handleLangModeChange = (mode: LanguageMode) => {
    setSelectedLangMode(mode);
    localStorage.setItem('doraemon_lang_mode', mode);
    playChime('pop');
    syncJarvisConfig(undefined, undefined, mode);
  };

  // 2. Big button "Floating Doraemon ON"
  const handleStartOverlay = async () => {
    const win = window as unknown as CapacitorWindow;
    const JB = win.Capacitor?.Plugins?.JarvisBridge;
    if (!JB) return;

    setIsOverlayLoading(true);
    setOverlayMessage('');

    try {
      await syncJarvisConfig();
      await JB.askPermissions();
      await JB.startOverlay();
      setOverlayMessage('Doraemon ab dusri apps par bhi dikhega');
      await refreshBridgeStatus();
    } catch (err: unknown) {
      console.warn('startOverlay error:', err);
      const errAny = err as Record<string, unknown> | Error | string;
      const msgStr = (
        (err instanceof Error ? err.message : '') + ' ' +
        (typeof errAny === 'object' && errAny !== null ? JSON.stringify(errAny) : String(errAny))
      ).toLowerCase();

      if (msgStr.includes('overlay_permission')) {
        setOverlayMessage('Settings khul rahi hai: Display over other apps allow karo, phir app mein wapis aa kar dobara dabao');
      } else if (msgStr.includes('mic_permission')) {
        setOverlayMessage('Mic permission allow karo, phir dobara dabao');
      } else {
        const fallbackMsg = err instanceof Error ? err.message : String(err);
        setOverlayMessage(`Error: ${fallbackMsg || 'Permission reject ho gayi. Dobara koshish karein.'}`);
      }
      await refreshBridgeStatus();
    } finally {
      setIsOverlayLoading(false);
    }
  };

  // 3. Button "Floating Doraemon OFF"
  const handleStopOverlay = async () => {
    const win = window as unknown as CapacitorWindow;
    const JB = win.Capacitor?.Plugins?.JarvisBridge;
    if (!JB || typeof JB.stopOverlay !== 'function') return;

    setIsOverlayLoading(true);
    try {
      await JB.stopOverlay();
      setOverlayMessage('Floating Doraemon band kar diya gaya hai');
      await refreshBridgeStatus();
    } catch (err) {
      console.warn('stopOverlay error:', err);
      setOverlayMessage(`Error: ${err instanceof Error ? err.message : String(err)}`);
      await refreshBridgeStatus();
    } finally {
      setIsOverlayLoading(false);
    }
  };

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState<string>('');
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Audio recording & Speech refs (always create a fresh stream, release immediately on finger release)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const currentStreamRef = useRef<MediaStream | null>(null);
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

  // Sync config on app start and every time key, model, or language changes
  useEffect(() => {
    syncJarvisConfig();
  }, [groqKey, selectedChatModel, selectedLangMode, syncJarvisConfig]);

  // Initial bridge status check on mount
  useEffect(() => {
    refreshBridgeStatus();
  }, [refreshBridgeStatus]);

  // Refresh bridge status when Settings opens
  useEffect(() => {
    if (isSettingsOpen) {
      refreshBridgeStatus();
    }
  }, [isSettingsOpen, refreshBridgeStatus]);

  // Foreground & App resume listener: reset isBusy and refresh bridge status
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (chatAbortControllerRef.current) {
          chatAbortControllerRef.current.abort('foreground_resume');
          chatAbortControllerRef.current = null;
        }
        setIsBusy(false);
        refreshBridgeStatus();
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
            refreshBridgeStatus();
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
  }, [refreshBridgeStatus]);

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
      syncJarvisConfig(trimmed, res.chosenChat, undefined);
    } else {
      setKeySaveMessage('✅ API Key successfully save ho gayi, Nobita!');
      syncJarvisConfig(trimmed, undefined, undefined);
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
    syncJarvisConfig('', 'llama-3.1-8b-instant', undefined);
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
    // Only check mute - do NOT block on isListening or any mic active flag
    if (isMutedRef.current) return;

    const cleanText = cleanTextForSpeech(text);
    if (!cleanText) return;

    // Invalidate previous speech session and stop audio immediately
    await stopSpeaking();
    const sessionId = ++speechSessionIdRef.current;

    const chunks = splitIntoSpeechChunks(cleanText, 200);
    if (chunks.length === 0) return;

    const { lang, fallbackLang } = getSpeechLanguage(cleanText, selectedLangMode);

    const performSpeak = async (): Promise<boolean> => {
      setIsSpeaking(true);
      const win = window as unknown as CapacitorWindow;
      const TTS = win.Capacitor?.Plugins?.TextToSpeech;

      if (TTS && typeof TTS.speak === 'function') {
        // Native Capacitor TextToSpeech plugin in Android WebView with category "playback"
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
              await TTS.speak({
                text: chunk,
                lang: fallbackLang,
                rate: 1.0,
                pitch: 1.1,
                volume: 1.0,
                category: 'playback'
              });
            } else {
              throw ttsErr;
            }
          }
        }
        return true;
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

          await new Promise<void>((resolve, reject) => {
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
            utterance.onerror = (e) => {
              currentUtteranceRef.current = null;
              reject(e);
            };
            window.speechSynthesis.speak(utterance);
          });
        }
        return true;
      }
      return false;
    };

    try {
      await performSpeak();
    } catch (err) {
      console.warn('Speech attempt failed, retrying once after 800 ms...', err);
      // Problem 1: If speaking fails, retry once after 800 ms
      if (speechSessionIdRef.current === sessionId && !isMutedRef.current) {
        await new Promise(r => setTimeout(r, 800));
        if (speechSessionIdRef.current === sessionId && !isMutedRef.current) {
          try {
            await performSpeak();
          } catch (retryErr) {
            console.warn('Speech retry failed:', retryErr);
          }
        }
      }
    } finally {
      if (speechSessionIdRef.current === sessionId) {
        setIsSpeaking(false);
      }
    }
  }, [selectedLangMode, stopSpeaking]);

  // Launch phone app directly or open in-app search URL using Capacitor AppLauncher
  const executeAppLaunch = async (app: AppTarget, customUrl?: string): Promise<{ success: boolean; notInstalled?: boolean }> => {
    playChime('gadget');

    const win = window as unknown as CapacitorWindow;
    const AL = win.Capacitor?.Plugins?.AppLauncher;

    // If customUrl is provided (for in-app search like YouTube query, Google query, Maps query, etc.)
    if (customUrl) {
      if (AL && typeof AL.openUrl === 'function') {
        try {
          await AL.openUrl({ url: customUrl });
          return { success: true };
        } catch (e) {
          console.warn('AppLauncher openUrl customUrl error:', e);
          try {
            window.open(customUrl, '_system');
            return { success: true };
          } catch {
            window.open(customUrl, '_blank');
            return { success: true };
          }
        }
      }
      // Standard browser fallback
      try {
        window.open(customUrl, '_blank');
        return { success: true };
      } catch {
        return { success: false };
      }
    }

    // Standard app launch via package name
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

    // Problem 1: After recording stops, wait 400ms before speaking reply so microphone is fully released
    const speakDoraemonReply = (textToSpeak: string, customDelayMs?: number) => {
      const delay = customDelayMs !== undefined ? customDelayMs : (wasSpoken ? 400 : 0);
      if (delay > 0) {
        setTimeout(() => {
          speakReply(textToSpeak);
        }, delay);
      } else {
        speakReply(textToSpeak);
      }
    };

    // Feature: Open App and In-App Search Command
    const appDetection = detectAppCommand(rawText);
    if (appDetection.isAppCommand && appDetection.app) {
      // 1. MUST set isBusy=false first (do NOT show thinking bubble, do NOT call AI model)
      setIsBusy(false);

      const app = appDetection.app;
      const isUrdu = hasUrduScript(rawText) || selectedLangMode === 'ur';
      const isEnglish = selectedLangMode === 'en' || (
        /^[a-zA-Z0-9\s.,!?'"-_]+$/.test(rawText) &&
        !/\b(kholo|chalao|karo|batao|dhundo|dhoondo|talash|khojo|hai|kaise|kya|aur|mein|me|par|pe|se)\b/i.test(rawText)
      );

      let doraReplyText = '';

      if (appDetection.searchQuery) {
        // App search command
        if (appDetection.speechNote) {
          // Special cases like WhatsApp (no search support) or Telegram (usernames only)
          if (app.key === 'whatsapp') {
            doraReplyText = isUrdu
              ? 'واٹس ایپ میں سرچ نہیں ہو سکتا، صرف کھول سکتا ہوں نوبیتا!'
              : (isEnglish
                ? "Nobita, WhatsApp doesn't support in-app search, opening WhatsApp for you!"
                : 'WhatsApp mein search nahi ho sakta, sirf khol sakta hoon Nobita!');
          } else if (app.key === 'telegram') {
            doraReplyText = isUrdu
              ? `ٹھیک ہے نوبیتا، ٹیلیگرام پر '${appDetection.searchQuery}' تلاش کر رہا ہوں۔ یہ صرف یوزر نیم کے لیے کام کرتا ہے!`
              : (isEnglish
                ? `Sure Nobita, searching '${appDetection.searchQuery}' on Telegram! This only works for usernames.`
                : `Theek hai Nobita, Telegram par '${appDetection.searchQuery}' search kar raha hoon! Ye sirf usernames ke liye kaam karta hai.`);
          } else {
            doraReplyText = appDetection.speechNote;
          }
        } else {
          // Standard in-app search
          if (isUrdu) {
            doraReplyText = `ٹھیک ہے نوبیتا، ${app.name} پر '${appDetection.searchQuery}' تلاش کر رہا ہوں! 🔍`;
          } else if (isEnglish) {
            doraReplyText = `Sure Nobita, searching '${appDetection.searchQuery}' on ${app.name}! 🔍`;
          } else {
            doraReplyText = `Theek hai Nobita, ${app.name} par '${appDetection.searchQuery}' search kar raha hoon! 🔍`;
          }
        }
      } else {
        // Simple app launch
        if (isUrdu) {
          doraReplyText = `ٹھیک ہے نوبیتا، ${app.name} کھول رہا ہوں! 🚀`;
        } else if (isEnglish) {
          doraReplyText = `Sure Nobita, opening ${app.name}! 🚀`;
        } else {
          doraReplyText = `Theek hai Nobita, ${app.name} khol raha hoon! 🚀`;
        }
      }

      const doraMsg: Message = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'doraemon',
        text: doraReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        appAction: app,
        searchQuery: appDetection.searchQuery,
        searchUrl: appDetection.searchUrl
      };

      setMessages(prev => [...prev, doraMsg]);
      playChime('gadget');

      // Doraemon speaks first (waiting 400ms if voice input)
      speakDoraemonReply(doraReplyText);

      // Opens it after ~1.2 seconds
      const launchDelay = (wasSpoken ? 400 : 0) + 1200;
      setTimeout(async () => {
        const result = await executeAppLaunch(app, appDetection.searchUrl);
        if (result.notInstalled) {
          const notInstalledVoice = isUrdu
            ? 'یہ ایپ فون میں انسٹال نہیں ملی نوبیتا'
            : (isEnglish ? 'This app was not found on your phone' : 'Ye app phone mein install nahi mila');
          speakReply(notInstalledVoice);
        }
      }, launchDelay);

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
      speakDoraemonReply(doraReplyText);

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
      speakDoraemonReply(errorText);
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
      speakDoraemonReply(reply);

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
        speakDoraemonReply(timeoutMsg);
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
      speakDoraemonReply(friendlyError);
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

    // Clean up any stale tracks from previous stream to guarantee a fresh stream
    if (currentStreamRef.current) {
      try {
        currentStreamRef.current.getTracks().forEach(t => {
          try { t.stop(); } catch {}
        });
      } catch {}
      currentStreamRef.current = null;
    }
    if (mediaRecorderRef.current) {
      try {
        if (mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
      } catch {}
      mediaRecorderRef.current = null;
    }

    try {
      // Create a fresh getUserMedia stream for each press
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      currentStreamRef.current = stream;
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
      currentStreamRef.current = null;
      mediaRecorderRef.current = null;
    }
  };

  const stopRecordingAndTranscribe = () => {
    if (!isHoldingMicRef.current && !mediaRecorderRef.current) return;
    // Reset all mic/listening flags immediately
    isHoldingMicRef.current = false;
    setIsListening(false);

    const stream = currentStreamRef.current;
    const recorder = mediaRecorderRef.current;

    // Immediately call track.stop() on EVERY track of the getUserMedia stream
    if (stream) {
      try {
        stream.getTracks().forEach(track => {
          try {
            track.stop();
          } catch (e) {
            console.warn('Track stop error:', e);
          }
        });
      } catch (e) {
        console.warn('Stream tracks stop error:', e);
      }
    }
    // Set stream = null and mediaRecorder = null immediately so microphone is fully released
    currentStreamRef.current = null;
    mediaRecorderRef.current = null;

    if (!recorder) return;

    if (recorder.state === 'recording' || recorder.state === 'paused') {
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        audioChunksRef.current = [];
        if (audioBlob.size < 500) {
          // Too short or empty
          setIsBusy(false);
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

          // Language-controlled transcription
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
            // Trigger send message with voice input flag (wasSpoken = true)
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
            setTimeout(() => speakReply(timeoutMsg), 400);
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
          setTimeout(() => speakReply(errText), 400);
        } finally {
          clearTimeout(timeoutId);
          if (chatAbortControllerRef.current === controller) {
            chatAbortControllerRef.current = null;
          }
        }
      };

      try {
        recorder.stop();
      } catch (e) {
        console.warn('Recorder stop error:', e);
      }
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
          'YouTube par bhabi no 1 search karo',
          'Instagram mein nature dhundo',
          'open youtube and search music',
          'Tumhe kisne banaya?',
          'Which company made you?',
          'Google Maps kholo',
          'WhatsApp chalao',
          'Free Fire kholo'
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

                {/* Automatic App Launcher / In-App Search Card */}
                {msg.appAction && (
                  <div className="mt-2.5 p-2.5 px-3 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-between gap-2 shadow-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-8 h-8 rounded-lg bg-[#0AA1DD] text-white flex items-center justify-center shrink-0 shadow-xs">
                        {msg.searchQuery ? <Search className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800 truncate">{msg.appAction.name}</div>
                        {msg.searchQuery ? (
                          <div className="text-[11px] text-sky-800 font-medium flex items-center gap-1 truncate">
                            <span className="text-slate-500">Khoja:</span>
                            <span className="font-semibold truncate text-[#0AA1DD]">"{msg.searchQuery}"</span>
                          </div>
                        ) : (
                          <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                            App khol diya gaya hai
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => executeAppLaunch(msg.appAction!, msg.searchUrl)}
                        className="py-1 px-2.5 rounded-lg bg-white border border-sky-300 text-sky-800 text-[11px] font-bold hover:bg-sky-100 active:scale-95 transition shadow-xs flex items-center gap-1"
                        title={msg.searchQuery ? 'Search dobara chalayein' : 'Agar app nahi khula to dobara koshish karein'}
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
                    syncJarvisConfig(undefined, newModel, undefined);
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

              {/* ========================================== */}
              {/* FLOATING DORAEMON SECTION (JarvisBridge APK) */}
              {/* Only exists inside APK; hide if undefined */}
              {/* ========================================== */}
              {(hasJarvisBridge || Boolean((window as unknown as CapacitorWindow)?.Capacitor?.Plugins?.JarvisBridge)) && (
                <div className="p-4 bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50/60 rounded-2xl border-2 border-sky-300 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#0AA1DD] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                        🔔
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Floating Doraemon
                        </h3>
                        <p className="text-[10px] text-slate-500">Screen overlay assistant</p>
                      </div>
                    </div>
                    {bridgeStatus?.running && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300 flex items-center gap-1 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Active
                      </span>
                    )}
                  </div>

                  {/* 4. Status Display: JarvisBridge.status() -> {overlay, running, mic} */}
                  {bridgeStatus && (
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className={`p-2 rounded-xl border ${bridgeStatus.running ? 'bg-white border-emerald-300 text-emerald-800 shadow-2xs' : 'bg-white/80 border-slate-200 text-slate-600'}`}>
                        <div className="text-[10px] uppercase font-bold text-slate-400">Status</div>
                        <div className="font-bold flex items-center justify-center gap-1 mt-0.5 text-xs">
                          <span className={`w-2 h-2 rounded-full ${bridgeStatus.running ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                          <span>{bridgeStatus.running ? 'Running' : 'Stopped'}</span>
                        </div>
                      </div>

                      <div className={`p-2 rounded-xl border ${bridgeStatus.overlay ? 'bg-white border-sky-300 text-sky-800 shadow-2xs' : 'bg-white/80 border-amber-300 text-amber-800'}`}>
                        <div className="text-[10px] uppercase font-bold text-slate-400">Overlay</div>
                        <div className="font-bold mt-0.5 text-xs">
                          {bridgeStatus.overlay ? 'Allowed ✅' : 'Needed ⚠️'}
                        </div>
                      </div>

                      <div className={`p-2 rounded-xl border ${bridgeStatus.mic ? 'bg-white border-emerald-300 text-emerald-800 shadow-2xs' : 'bg-white/80 border-amber-300 text-amber-800'}`}>
                        <div className="text-[10px] uppercase font-bold text-slate-400">Mic</div>
                        <div className="font-bold mt-0.5 text-xs">
                          {bridgeStatus.mic ? 'Allowed ✅' : 'Needed ⚠️'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2 & 3. Big ON Button & OFF Button */}
                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      onClick={handleStartOverlay}
                      disabled={isOverlayLoading}
                      className="w-full py-3 px-4 rounded-xl bg-[#0AA1DD] hover:bg-sky-600 active:scale-98 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <span className="text-base">🔔</span>
                      <span>Floating Doraemon ON</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleStopOverlay}
                      disabled={isOverlayLoading}
                      className="w-full py-2 px-4 rounded-xl bg-white hover:bg-rose-50 text-rose-700 hover:text-rose-800 border border-rose-200 font-bold text-xs shadow-2xs transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <span>⏹️</span>
                      <span>Floating Doraemon OFF</span>
                    </button>
                  </div>

                  {/* Feedback / Error Message */}
                  {overlayMessage && (
                    <div className={`p-2.5 rounded-xl text-xs font-semibold border ${
                      overlayMessage.includes('Doraemon ab dusri apps')
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : overlayMessage.includes('Floating Doraemon band')
                          ? 'bg-sky-50 border-sky-200 text-sky-900'
                          : 'bg-amber-50 border-amber-200 text-amber-950'
                    }`}>
                      {overlayMessage}
                    </div>
                  )}

                  {/* 5. Tip text */}
                  <div className="p-2.5 rounded-xl bg-blue-100/70 border border-blue-200 text-[11px] text-slate-700 flex items-start gap-2">
                    <span className="text-sm shrink-0">💡</span>
                    <p className="leading-snug">
                      Button ko dabake rakh kar bolo, ungli hataoge to jawab milega. Button ko ghumane ke liye jaldi se drag karo.
                    </p>
                  </div>
                </div>
              )}

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
