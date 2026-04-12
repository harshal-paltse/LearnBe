export const SYSTEM_PROMPT = `You are LearnBe AI, an expert educational assistant helping students learn effectively. You adapt your explanations to different learning styles: visual, reading-writing, kinesthetic, and auditory. You always structure content clearly with headings, bullet points, and examples.

When generating flashcards, output ONLY valid JSON: {"cards":[{"front":"...","back":"...","hint":"..."}]}

When generating quizzes, output ONLY valid JSON: {"questions":[{"question":"...","options":["A","B","C","D"],"correct":0,"explanation":"...","concept":"..."}]}

When generating study plans, output ONLY valid JSON: {"topic":"...","duration":"...","goal":"...","milestones":[{"day":1,"title":"...","objectives":["..."],"resources":["..."],"estimatedMinutes":45,"activities":["..."]}]}

For summaries, use well-structured markdown with ## headings, bullet points, **bold key terms**, and > blockquotes for important definitions. Always end with a ## Key Takeaways section.

Be accurate, concise, encouraging, and academically rigorous.`;

export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type LengthOption = 'short' | 'medium' | 'detailed';
export type LearningStyle = 'visual' | 'reading' | 'kinesthetic' | 'auditory' | 'mixed';

export const PROMPTS = {
  summary: (
    topic: string,
    difficulty: Difficulty,
    length: LengthOption,
    learningStyle: LearningStyle,
    focusArea?: string
  ) =>
    `Create a comprehensive ${length} summary of "${topic}" at ${difficulty} level.
Learning style: ${learningStyle}.
${focusArea ? `Focus specifically on: ${focusArea}` : ''}

Structure the summary with:
- An engaging introduction
- Key concepts with clear explanations
- Examples and analogies appropriate for ${learningStyle} learners
- Important definitions in blockquotes
- A Key Takeaways section at the end

Use markdown formatting with ## headings, **bold** for key terms, and bullet points.`,

  flashcards: (
    topic: string,
    difficulty: Difficulty,
    count: number,
    learningStyle: LearningStyle
  ) =>
    `Generate exactly ${count} flashcards for "${topic}" at ${difficulty} level, optimized for ${learningStyle} learners.

Output ONLY valid JSON in this exact format:
{"cards":[{"front":"question or concept","back":"answer or explanation","hint":"helpful hint"}]}

Make cards progressively more challenging. Include key terms, concepts, formulas, and applications.`,

  quiz: (
    topic: string,
    difficulty: Difficulty,
    count: number,
    focusArea?: string
  ) =>
    `Generate exactly ${count} multiple choice questions about "${topic}" at ${difficulty} level.
${focusArea ? `Focus on: ${focusArea}` : ''}

Output ONLY valid JSON in this exact format:
{"questions":[{"question":"...","options":["A. option","B. option","C. option","D. option"],"correct":0,"explanation":"why this answer is correct","concept":"the concept being tested"}]}

The "correct" field is the 0-based index of the correct option. Make questions clear, unambiguous, and educational.`,

  studyPlan: (
    topic: string,
    goal: string,
    duration: string,
    currentLevel: Difficulty
  ) =>
    `Create a structured study plan for "${topic}".
Goal: ${goal}
Duration: ${duration}
Current level: ${currentLevel}

Output ONLY valid JSON in this exact format:
{"topic":"${topic}","duration":"${duration}","goal":"${goal}","milestones":[{"day":1,"title":"...","objectives":["..."],"resources":["..."],"estimatedMinutes":45,"activities":["Read summary","Flashcard drill","Mini quiz"]}]}

Create realistic daily milestones that build progressively. Each milestone should have 2-4 objectives and 2-3 activities.`,

  adaptPlan: (
    plan: string,
    completedMilestones: number,
    confidenceScores: Record<string, number>
  ) =>
    `I've completed ${completedMilestones} milestones of this study plan.
My confidence scores by topic: ${JSON.stringify(confidenceScores)}

Original plan: ${plan}

Adapt the remaining milestones based on my progress. Spend more time on low-confidence areas and accelerate through high-confidence ones. Output the updated plan in the same JSON format.`,

  topicSuggestion: (interests: string[], recentTopics: string[]) =>
    `Based on these interests: ${interests.join(', ')}
And recently studied topics: ${recentTopics.join(', ')}

Suggest 5 interesting topics to study next. Return ONLY a JSON array: ["topic1","topic2","topic3","topic4","topic5"]

Make suggestions diverse, intellectually stimulating, and relevant to the learner's interests.`,

  trendingTopics: () =>
    `Generate 5 currently trending and intellectually interesting study topics across different fields.
Return ONLY valid JSON: [{"title":"...","description":"one sentence description","category":"..."}]`,
};
