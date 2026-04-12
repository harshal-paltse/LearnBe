# LearnBe — AI Learning Assistant

A production-level React Native app built with Expo SDK 54 that helps students generate study materials, summaries, flashcards, quizzes, and personalized learning plans using Claude AI.

## Tech Stack

- **Framework**: React Native + Expo SDK 54
- **Navigation**: Expo Router v6 (file-based routing)
- **State Management**: Zustand
- **AI Backend**: Anthropic Claude API (`claude-sonnet-4-20250514`)
- **Styling**: StyleSheet API + custom design tokens
- **Storage**: AsyncStorage
- **Animations**: React Native Reanimated 4
- **Icons**: @expo/vector-icons (Ionicons)

## Features

- Onboarding flow with learning style selection
- Home dashboard with streak tracking
- AI-powered material generator (Summary, Flashcards, Quiz, Study Plan)
- Real-time Claude streaming
- Flashcard system with 3D flip + swipe gestures
- Quiz engine with MCQ, scoring, and weak-area suggestions
- Study plan timeline with milestone tracking
- Library with search, filter, and sort
- Topic explorer with AI-powered trending topics
- Confidence tracking with animated rating slider
- Full Light / Dark / System theme toggle

## Setup

1. Clone the repo
   ```bash
   git clone https://github.com/harshal-paltse/LearnBe.git
   cd LearnBe
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Add your Anthropic API key
   ```bash
   cp .env.example .env
   # Edit .env and add your key
   ```

4. Start the app
   ```bash
   npx expo start
   ```

5. Scan the QR code with **Expo Go** (SDK 54)

## Environment Variables

Create a `.env` file in the root:

```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

## Project Structure

```
app/                    # Expo Router screens
  (tabs)/               # Bottom tab navigator
    index.tsx           # Home dashboard
    explore.tsx         # Topic explorer
    library.tsx         # Saved materials
    profile.tsx         # Profile & settings
  onboarding/           # First-launch onboarding
  generate/[type].tsx   # Material generator
  flashcards/[setId].tsx
  quiz/[quizId].tsx
  study/[sessionId].tsx
components/             # Reusable components
  ui/                   # Core UI components
  home/                 # Home screen components
  generate/             # Generator components
  flashcards/           # Flashcard components
  quiz/                 # Quiz components
  study/                # Study plan components
store/                  # Zustand stores
services/               # API & storage services
hooks/                  # Custom hooks
constants/              # Design tokens, prompts, config
utils/                  # Helpers & formatters
```
