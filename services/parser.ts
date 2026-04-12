import { FlashCard, QuizQuestion, StudyPlan } from '../store/useLibraryStore';

export function parseFlashcards(text: string): FlashCard[] | null {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]);
    if (Array.isArray(parsed.cards)) return parsed.cards;
    return null;
  } catch {
    return null;
  }
}

export function parseQuiz(text: string): QuizQuestion[] | null {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]);
    if (Array.isArray(parsed.questions)) return parsed.questions;
    return null;
  } catch {
    return null;
  }
}

export function parseStudyPlan(text: string): StudyPlan | null {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]);
    if (parsed.topic && Array.isArray(parsed.milestones)) return parsed as StudyPlan;
    return null;
  } catch {
    return null;
  }
}

export function parseSuggestions(text: string): string[] {
  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    return JSON.parse(jsonMatch[0]);
  } catch {
    return [];
  }
}

export function parseTrendingTopics(text: string): Array<{ title: string; description: string; category: string }> {
  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    return JSON.parse(jsonMatch[0]);
  } catch {
    return [];
  }
}
