import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/config';

export interface TopicProgress {
  score: number; // 0-100
  lastReviewed: string;
  sessionsCount: number;
  quizzesPassed: number;
  flashcardsMastered: number;
}

interface ProgressStore {
  topics: Record<string, TopicProgress>;
  updateTopicScore: (topicId: string, score: number) => Promise<void>;
  getTopicProgress: (topicId: string) => TopicProgress | null;
  loadProgress: () => Promise<void>;
  topicsCovered: number;
  cardsMastered: number;
  quizzesPassed: number;
}

const defaultProgress: TopicProgress = {
  score: 0,
  lastReviewed: new Date().toISOString(),
  sessionsCount: 0,
  quizzesPassed: 0,
  flashcardsMastered: 0,
};

export const useProgressStore = create<ProgressStore>((set, get) => ({
  topics: {},
  topicsCovered: 0,
  cardsMastered: 0,
  quizzesPassed: 0,

  updateTopicScore: async (topicId, score) => {
    const existing = get().topics[topicId] || { ...defaultProgress };
    const updated: TopicProgress = {
      ...existing,
      score: Math.min(100, Math.max(0, score)),
      lastReviewed: new Date().toISOString(),
      sessionsCount: existing.sessionsCount + 1,
    };
    const topics = { ...get().topics, [topicId]: updated };
    const topicsCovered = Object.keys(topics).length;
    set({ topics, topicsCovered });
    await AsyncStorage.setItem(STORAGE_KEYS.progress, JSON.stringify({ topics }));
  },

  getTopicProgress: (topicId) => {
    return get().topics[topicId] || null;
  },

  loadProgress: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.progress);
      if (data) {
        const parsed = JSON.parse(data);
        const topics = parsed.topics || {};
        const topicsCovered = Object.keys(topics).length;
        const cardsMastered = Object.values(topics as Record<string, TopicProgress>).reduce(
          (sum, t) => sum + (t.flashcardsMastered || 0), 0
        );
        const quizzesPassed = Object.values(topics as Record<string, TopicProgress>).reduce(
          (sum, t) => sum + (t.quizzesPassed || 0), 0
        );
        set({ topics, topicsCovered, cardsMastered, quizzesPassed });
      }
    } catch {
      // use defaults
    }
  },
}));
