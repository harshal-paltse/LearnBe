import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/config';
import { MaterialType } from './useLibraryStore';

export interface StudySession {
  id: string;
  topic: string;
  type: MaterialType;
  startedAt: string;
  lastActiveAt: string;
  progressPercent: number;
  completed: boolean;
  libraryItemId?: string;
}

interface SessionStore {
  currentSession: StudySession | null;
  recentSessions: StudySession[];
  startSession: (topic: string, type: MaterialType, libraryItemId?: string) => StudySession;
  updateProgress: (sessionId: string, progress: number) => Promise<void>;
  completeSession: (sessionId: string) => Promise<void>;
  loadSessions: () => Promise<void>;
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  currentSession: null,
  recentSessions: [],

  startSession: (topic, type, libraryItemId) => {
    const session: StudySession = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      topic,
      type,
      startedAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      progressPercent: 0,
      completed: false,
      libraryItemId,
    };
    const recentSessions = [session, ...get().recentSessions].slice(0, 10);
    set({ currentSession: session, recentSessions });
    AsyncStorage.setItem(STORAGE_KEYS.sessions, JSON.stringify({ current: session, recent: recentSessions }));
    return session;
  },

  updateProgress: async (sessionId, progress) => {
    const update = (s: StudySession) =>
      s.id === sessionId ? { ...s, progressPercent: progress, lastActiveAt: new Date().toISOString() } : s;

    const current = get().currentSession;
    const updatedCurrent = current?.id === sessionId ? update(current) : current;
    const recentSessions = get().recentSessions.map(update);
    set({ currentSession: updatedCurrent, recentSessions });
    await AsyncStorage.setItem(STORAGE_KEYS.sessions, JSON.stringify({ current: updatedCurrent, recent: recentSessions }));
  },

  completeSession: async (sessionId) => {
    const update = (s: StudySession) =>
      s.id === sessionId ? { ...s, completed: true, progressPercent: 100 } : s;

    const recentSessions = get().recentSessions.map(update);
    set({ currentSession: null, recentSessions });
    await AsyncStorage.setItem(STORAGE_KEYS.sessions, JSON.stringify({ current: null, recent: recentSessions }));
  },

  loadSessions: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.sessions);
      if (data) {
        const parsed = JSON.parse(data);
        set({ currentSession: parsed.current || null, recentSessions: parsed.recent || [] });
      }
    } catch {
      // use defaults
    }
  },
}));
