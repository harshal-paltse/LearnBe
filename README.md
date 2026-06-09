<div align="center">

<img src="./assets/icon.png" alt="LearnBe Logo" width="100" height="100" style="border-radius: 20px;" />

# LearnBe

**AI-powered learning, personalized to you.**

LearnBe is a production-grade React Native app that transforms how you study — generating summaries, flashcards, quizzes, and full study plans in real time using Claude AI, all adapted to your personal learning style.

[![Built with Expo](https://img.shields.io/badge/Built%20with-Expo%20SDK%2054-000020?style=flat-square&logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Powered by Claude](https://img.shields.io/badge/AI-Claude%20Sonnet%204-D97706?style=flat-square)](https://www.anthropic.com)
[![License](https://img.shields.io/badge/License-MIT-22C55E?style=flat-square)](LICENSE)

</div>

---

## What is LearnBe?

LearnBe sits between you and the information you need to learn. Feed it any topic — from Quantum Mechanics to Organic Chemistry to Machine Learning — and it instantly generates tailored study materials using Anthropic's Claude Sonnet model with real-time streaming. The app adapts content to your preferred learning style (visual, auditory, reading, or kinesthetic) and tracks your progress across sessions, streaks, and milestones.

Whether you're cramming for an exam, building a new skill, or satisfying curiosity, LearnBe gives you the tools to do it faster and smarter.

---

## Features

### AI Content Generation
- **Summaries** — structured markdown with headings, key terms, definitions, and takeaways
- **Flashcards** — swipeable 3D-flip cards with hints, generated to the right difficulty
- **Quizzes** — multiple-choice questions with explanations and concept tagging
- **Study Plans** — day-by-day milestone timelines with objectives, resources, and activities
- Real-time **streaming output** from Claude — watch content appear as it's written

### Learning Experience
- Onboarding with learning style selection (Visual / Reading / Kinesthetic / Auditory)
- Goal-based personalization (Exam Prep / Skill Building / Curiosity / Professional)
- Difficulty levels: Beginner → Intermediate → Advanced → Expert
- Confidence rating slider after every study session
- Daily streak tracker with weekly activity visualization
- In-progress session resume from the home dashboard

### Content Library
- Save and organize all generated materials
- Search, filter by type, and sort your library
- Topic explorer with AI-suggested trending topics across 8 subject areas
- Quick-start chips for 10 curated high-interest topics

### Progress & Analytics
- Topics covered, cards mastered, quizzes passed, total study hours
- Weak area detection after quizzes
- Study plan milestone tracking with completion states
- Persistent progress across sessions via AsyncStorage

### UI & Polish
- Full **light / dark / system** theme support
- Smooth animations via React Native Reanimated 4
- Haptic feedback throughout
- Skeleton loaders, toast notifications, empty states
- Custom design token system (typography, spacing, radius, shadows, color palette)
- Accessible — `accessibilityRole`, `accessibilityLabel`, and `accessibilityState` on all interactive elements

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | React Native + Expo SDK 54 |
| Language | TypeScript 5.9 |
| Navigation | Expo Router v6 (file-based) |
| State Management | Zustand 5 |
| AI Backend | Anthropic Claude API (`claude-sonnet-4-20250514`) |
| Streaming | Fetch + ReadableStream SSE parsing |
| Animations | React Native Reanimated 4 |
| Gestures | React Native Gesture Handler 2 |
| Storage | AsyncStorage + Expo SecureStore |
| Styling | StyleSheet API + custom design tokens |
| Icons | @expo/vector-icons (Ionicons) |
| Typography | Inter via @expo-google-fonts |
| Graphics | React Native SVG |
| Haptics | Expo Haptics |

---

## Project Structure

```
LearnBe/
├── app/                          # Expo Router screens (file-based routing)
│   ├── (tabs)/                   # Bottom tab navigator
│   │   ├── index.tsx             # Home dashboard
│   │   ├── explore.tsx           # Topic explorer
│   │   ├── library.tsx           # Saved materials library
│   │   ├── profile.tsx           # Profile & settings
│   │   └── _layout.tsx           # Tab navigator config + onboarding guard
│   ├── onboarding/index.tsx      # First-launch onboarding flow
│   ├── generate/[type].tsx       # AI material generator (summary/flashcards/quiz/studyPlan)
│   ├── flashcards/[setId].tsx    # Flashcard study session
│   ├── quiz/[quizId].tsx         # Quiz engine
│   ├── study/[sessionId].tsx     # Study plan timeline
│   ├── topic/[topicId].tsx       # Topic detail view
│   └── _layout.tsx               # Root layout (fonts, theme, splash)
│
├── components/
│   ├── ui/                       # Core reusable components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   ├── Chip.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── CircularProgress.tsx
│   │   ├── MarkdownRenderer.tsx
│   │   ├── SkeletonLoader.tsx
│   │   ├── Toast.tsx
│   │   ├── BottomSheet.tsx
│   │   ├── EmptyState.tsx
│   │   ├── RatingSlider.tsx
│   │   ├── Avatar.tsx
│   │   ├── Divider.tsx
│   │   └── SectionHeader.tsx
│   ├── home/                     # Home screen components
│   ├── generate/                 # Generator UI (cards, options panel, streaming view)
│   ├── flashcards/               # Flip card, swipe indicators, progress dots
│   ├── quiz/                     # Question card, score ring
│   └── study/                    # Timeline, milestone card, study timer
│
├── store/                        # Zustand global state
│   ├── useUserStore.ts           # Profile, onboarding, streak
│   ├── useLibraryStore.ts        # Saved materials
│   ├── useSessionStore.ts        # Active + recent sessions
│   ├── useProgressStore.ts       # Stats and mastery tracking
│   └── useThemeStore.ts          # Theme preference
│
├── services/
│   ├── anthropic.ts              # Claude API streaming + one-shot calls
│   ├── storage.ts                # AsyncStorage wrappers
│   ├── parser.ts                 # JSON extraction from AI responses
│   └── analytics.ts             # Event tracking helpers
│
├── hooks/
│   ├── useTheme.ts               # Resolved color palette + typography tokens
│   ├── useStream.ts              # Streaming state machine hook
│   ├── useLocalStorage.ts        # Typed AsyncStorage hook
│   ├── useHaptics.ts             # Haptic feedback helpers
│   └── useDebounce.ts            # Debounce utility hook
│
├── constants/
│   ├── tokens.ts                 # Design tokens (colors, typography, spacing, radius)
│   ├── config.ts                 # App config (API endpoints, model, storage keys)
│   ├── prompts.ts                # All Claude prompt templates + type definitions
│   └── topics.ts                 # Topic categories and quick-start topics
│
└── utils/                        # Formatters, helpers
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- [Expo Go](https://expo.dev/go) on your iOS or Android device (SDK 54)
- An [Anthropic API key](https://console.anthropic.com)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/harshal-paltse/LearnBe.git
cd LearnBe

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
```

Open `.env` and add your key:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### Running the App

```bash
# Start Expo dev server
npx expo start
```

Then scan the QR code with **Expo Go** on your device, or press:
- `a` — open Android emulator
- `i` — open iOS simulator
- `w` — open in browser (web mode)

---

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `ANTHROPIC_API_KEY` | Your Anthropic API key from [console.anthropic.com](https://console.anthropic.com) | ✅ Yes |

> The app validates the key at runtime. If missing or set to the placeholder value, it surfaces a clear error rather than failing silently.

---

## AI Architecture

LearnBe calls the Claude API **directly from the client** using streaming Server-Sent Events (SSE). Each generation type uses a purpose-built prompt template that instructs Claude to return either structured JSON (flashcards, quizzes, study plans) or formatted markdown (summaries).

```
User Input → Prompt Template → Claude Sonnet 4 (streaming)
                                      ↓
                            SSE token stream
                                      ↓
                     onToken callback → UI renders live
                                      ↓
                     onComplete → JSON parse / save to library
```

The `parser.ts` service handles robust JSON extraction from streamed responses, with fallback handling for malformed output.

---

## Topic Coverage

LearnBe ships with 8 curated subject categories:

| Category | Subtopics |
|---|---|
| 🔬 Sciences | Physics, Chemistry, Biology, Astronomy, Earth Science |
| ➗ Mathematics | Algebra, Calculus, Statistics, Linear Algebra, Number Theory |
| 🕐 History & Social Studies | World History, Ancient Civilizations, Political Science, Economics |
| 📖 Literature & Language | Classic Literature, Poetry, Grammar, Linguistics |
| 💻 Computer Science | Programming, Algorithms, ML, Web Dev, Databases, Networking |
| 📈 Business & Economics | Finance, Marketing, Management, Accounting, Entrepreneurship |
| 🎨 Arts & Humanities | Philosophy, Psychology, Music Theory, Art History, Sociology |
| 🫀 Health & Medicine | Anatomy, Physiology, Nutrition, Pharmacology, Public Health |

---

## Contributing

Contributions are welcome. Here's how to get involved:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to your branch: `git push origin feature/your-feature-name`
5. Open a Pull Request against `main`

Please keep PRs focused and include a clear description of what changed and why. Follow the existing code style — TypeScript strict mode, component-level StyleSheet, and the established design token system.

### Ideas for Contribution
- [ ] Spaced repetition algorithm for flashcard scheduling
- [ ] Offline mode with cached content
- [ ] Push notifications for daily study reminders
- [ ] Export to PDF / share as image
- [ ] Audio playback for auditory learners (TTS)
- [ ] Collaborative study rooms
- [ ] Custom topic categories

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

<div align="center">

Built with curiosity. Powered by Claude. Made for learners.

**[⭐ Star this repo](https://github.com/harshal-paltse/LearnBe)** if LearnBe helped you study smarter.

</div>
