import { MaterialType } from '../store/useLibraryStore';

export interface SuggestionAction {
  action: MaterialType;
  message: string;
  icon: string;
}

export function suggestNextAction(confidenceScore: number): SuggestionAction {
  if (confidenceScore < 40) {
    return { action: 'summary', message: 'Build your foundation first', icon: 'document-text' };
  }
  if (confidenceScore < 65) {
    return { action: 'flashcards', message: 'Reinforce with active recall', icon: 'layers' };
  }
  if (confidenceScore < 80) {
    return { action: 'quiz', message: 'Test what you know', icon: 'help-circle' };
  }
  return { action: 'studyPlan', message: 'Master advanced concepts', icon: 'map' };
}

export function getConfidenceLabel(score: number): string {
  if (score <= 20) return 'Not started';
  if (score <= 40) return 'Beginner';
  if (score <= 60) return 'Developing';
  if (score <= 80) return 'Proficient';
  return 'Mastered';
}

export function getConfidenceColor(score: number, colors: { accentRed: string; accentAmber: string; accentBlue: string; accentGreen: string; textTertiary: string }): string {
  if (score <= 20) return colors.textTertiary;
  if (score <= 40) return colors.accentRed;
  if (score <= 60) return colors.accentAmber;
  if (score <= 80) return colors.accentBlue;
  return colors.accentGreen;
}
