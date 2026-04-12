import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/config';

export type MaterialType = 'summary' | 'flashcards' | 'quiz' | 'studyPlan';

export interface FlashCard {
  front: string;
  back: string;
  hint?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  concept: string;
}

export interface StudyMilestone {
  day: number;
  title: string;
  objectives: string[];
  resources: string[];
  estimatedMinutes: number;
  activities: string[];
  completed?: boolean;
}

export interface StudyPlan {
  topic: string;
  duration: string;
  goal: string;
  milestones: StudyMilestone[];
}

export interface LibraryItem {
  id: string;
  type: MaterialType;
  topic: string;
  content: string;
  cards?: FlashCard[];
  questions?: QuizQuestion[];
  plan?: StudyPlan;
  savedAt: string;
  reviewCount: number;
  confidenceScore: number;
  difficulty: string;
  tags: string[];
}

interface LibraryStore {
  items: LibraryItem[];
  addItem: (item: Omit<LibraryItem, 'id' | 'savedAt' | 'reviewCount'>) => Promise<string>;
  removeItem: (id: string) => Promise<void>;
  updateItem: (id: string, updates: Partial<LibraryItem>) => Promise<void>;
  incrementReview: (id: string) => Promise<void>;
  loadLibrary: () => Promise<void>;
  searchItems: (query: string) => LibraryItem[];
}

export const useLibraryStore = create<LibraryStore>((set, get) => ({
  items: [],

  addItem: async (item) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newItem: LibraryItem = {
      ...item,
      id,
      savedAt: new Date().toISOString(),
      reviewCount: 0,
    };
    const items = [newItem, ...get().items];
    set({ items });
    await AsyncStorage.setItem(STORAGE_KEYS.library, JSON.stringify(items));
    return id;
  },

  removeItem: async (id) => {
    const items = get().items.filter((i) => i.id !== id);
    set({ items });
    await AsyncStorage.setItem(STORAGE_KEYS.library, JSON.stringify(items));
  },

  updateItem: async (id, updates) => {
    const items = get().items.map((i) => (i.id === id ? { ...i, ...updates } : i));
    set({ items });
    await AsyncStorage.setItem(STORAGE_KEYS.library, JSON.stringify(items));
  },

  incrementReview: async (id) => {
    const items = get().items.map((i) =>
      i.id === id ? { ...i, reviewCount: i.reviewCount + 1 } : i
    );
    set({ items });
    await AsyncStorage.setItem(STORAGE_KEYS.library, JSON.stringify(items));
  },

  loadLibrary: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.library);
      if (data) set({ items: JSON.parse(data) });
    } catch {
      // use defaults
    }
  },

  searchItems: (query) => {
    const q = query.toLowerCase();
    return get().items.filter(
      (i) =>
        i.topic.toLowerCase().includes(q) ||
        i.content.toLowerCase().includes(q) ||
        i.tags.some((t) => t.toLowerCase().includes(q))
    );
  },
}));
