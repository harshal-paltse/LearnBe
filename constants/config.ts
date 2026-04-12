export const APP_CONFIG = {
  name: 'LearnBe',
  version: '1.0.0',
  apiBaseUrl: 'https://api.anthropic.com/v1',
  model: 'claude-sonnet-4-20250514',
  maxTokens: 4096,
  anthropicVersion: '2023-06-01',
  defaultDifficulty: 'intermediate' as const,
  defaultLength: 'medium' as const,
  streamingEnabled: true,
};

export const STORAGE_KEYS = {
  theme: '@learnbe/theme',
  user: '@learnbe/user',
  library: '@learnbe/library',
  progress: '@learnbe/progress',
  sessions: '@learnbe/sessions',
  onboarded: '@learnbe/onboarded',
  streak: '@learnbe/streak',
};
