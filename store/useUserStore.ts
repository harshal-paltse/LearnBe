import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/config';
import { LearningStyle, Difficulty, LengthOption } from '../constants/prompts';

export interface UserProfile {
  name: string;
  learningStyle: LearningStyle;
  goal: 'exam_prep' | 'skill_building' | 'curiosity' | 'professional';
  defaultDifficulty: Difficulty;
  defaultLength: LengthOption;
  dailyGoalMinutes: number;
  quizTimerEnabled: boolean;
  fontSizeLarge: boolean;
  languagePreference: string;
  memberSince: string;
  interests: string[];
}

interface StreakData {
  current: number;
  longest: number;
  lastStudyDate: string;
  weeklyActivity: boolean[];
}

interface UserStore {
  profile: UserProfile;
  streak: StreakData;
  totalStudyMinutes: number;
  materialsGenerated: number;
  isOnboarded: boolean;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updateStreak: () => Promise<void>;
  addStudyMinutes: (minutes: number) => Promise<void>;
  incrementMaterials: () => Promise<void>;
  setOnboarded: (value: boolean) => Promise<void>;
  loadUser: () => Promise<void>;
}

const defaultProfile: UserProfile = {
  name: 'Learner',
  learningStyle: 'mixed',
  goal: 'curiosity',
  defaultDifficulty: 'intermediate',
  defaultLength: 'medium',
  dailyGoalMinutes: 30,
  quizTimerEnabled: false,
  fontSizeLarge: false,
  languagePreference: 'en',
  memberSince: new Date().toISOString(),
  interests: [],
};

const defaultStreak: StreakData = {
  current: 0,
  longest: 0,
  lastStudyDate: '',
  weeklyActivity: [false, false, false, false, false, false, false],
};

export const useUserStore = create<UserStore>((set, get) => ({
  profile: defaultProfile,
  streak: defaultStreak,
  totalStudyMinutes: 0,
  materialsGenerated: 0,
  isOnboarded: false,

  updateProfile: async (updates) => {
    const profile = { ...get().profile, ...updates };
    set({ profile });
    await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify({ profile, streak: get().streak, totalStudyMinutes: get().totalStudyMinutes, materialsGenerated: get().materialsGenerated }));
  },

  updateStreak: async () => {
    const today = new Date().toDateString();
    const { streak } = get();
    if (streak.lastStudyDate === today) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const isConsecutive = streak.lastStudyDate === yesterday.toDateString();

    const newCurrent = isConsecutive ? streak.current + 1 : 1;
    const dayOfWeek = new Date().getDay();
    const weeklyActivity = [...streak.weeklyActivity];
    weeklyActivity[dayOfWeek] = true;

    const newStreak: StreakData = {
      current: newCurrent,
      longest: Math.max(newCurrent, streak.longest),
      lastStudyDate: today,
      weeklyActivity,
    };
    set({ streak: newStreak });
    await AsyncStorage.setItem(STORAGE_KEYS.streak, JSON.stringify(newStreak));
  },

  addStudyMinutes: async (minutes) => {
    const total = get().totalStudyMinutes + minutes;
    set({ totalStudyMinutes: total });
    await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify({ ...get(), totalStudyMinutes: total }));
  },

  incrementMaterials: async () => {
    const count = get().materialsGenerated + 1;
    set({ materialsGenerated: count });
  },

  setOnboarded: async (value) => {
    set({ isOnboarded: value });
    await AsyncStorage.setItem(STORAGE_KEYS.onboarded, JSON.stringify(value));
  },

  loadUser: async () => {
    try {
      const [userData, streakData, onboardedData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.user),
        AsyncStorage.getItem(STORAGE_KEYS.streak),
        AsyncStorage.getItem(STORAGE_KEYS.onboarded),
      ]);
      if (userData) {
        const parsed = JSON.parse(userData);
        set({
          profile: { ...defaultProfile, ...parsed.profile },
          totalStudyMinutes: parsed.totalStudyMinutes || 0,
          materialsGenerated: parsed.materialsGenerated || 0,
        });
      }
      if (streakData) {
        set({ streak: { ...defaultStreak, ...JSON.parse(streakData) } });
      }
      if (onboardedData) {
        set({ isOnboarded: JSON.parse(onboardedData) });
      }
    } catch {
      // use defaults
    }
  },
}));
