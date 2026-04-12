import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useStream } from '../../hooks/useStream';
import { useUserStore } from '../../store/useUserStore';
import { useLibraryStore, MaterialType } from '../../store/useLibraryStore';
import { Button } from '../../components/ui/Button';
import { OptionsPanel } from '../../components/generate/OptionsPanel';
import { StreamingTextView } from '../../components/generate/StreamingTextView';
import { Toast } from '../../components/ui/Toast';
import { PROMPTS, Difficulty, LengthOption, LearningStyle } from '../../constants/prompts';
import { parseFlashcards, parseQuiz, parseStudyPlan } from '../../services/parser';
import { validateTopic } from '../../utils/validators';

const TYPE_CONFIG: Record<MaterialType, { title: string; placeholder: string; icon: string }> = {
  summary: { title: 'Summary', placeholder: 'Enter a topic, concept, or paste text to summarize...', icon: 'document-text' },
  flashcards: { title: 'Flashcards', placeholder: 'Enter a topic to create flashcards for...', icon: 'layers' },
  quiz: { title: 'Quiz', placeholder: 'Enter a topic to generate quiz questions...', icon: 'help-circle' },
  studyPlan: { title: 'Study Plan', placeholder: 'Enter a topic or skill you want to master...', icon: 'map' },
};

export default function GenerateScreen() {
  const { type, prefill } = useLocalSearchParams<{ type: string; prefill?: string }>();
  const materialType = (type as MaterialType) || 'summary';
  const config = TYPE_CONFIG[materialType] || TYPE_CONFIG.summary;

  const { colors, typography, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const { profile, incrementMaterials } = useUserStore();
  const { addItem } = useLibraryStore();
  const { text, isStreaming, isComplete, error, phase, start, reset } = useStream();

  const [topic, setTopic] = useState(prefill || '');
  const [topicError, setTopicError] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>(profile.defaultDifficulty);
  const [length, setLength] = useState<LengthOption>(profile.defaultLength);
  const [learningStyle, setLearningStyle] = useState<LearningStyle>(profile.learningStyle);
  const [focusArea, setFocusArea] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
  }, []);

  const handleGenerate = useCallback(async () => {
    const err = validateTopic(topic);
    if (err) { setTopicError(err); return; }
    setTopicError(null);
    reset();
    setSavedId(null);

    let prompt = '';
    switch (materialType) {
      case 'summary':
        prompt = PROMPTS.summary(topic, difficulty, length, learningStyle, focusArea);
        break;
      case 'flashcards':
        prompt = PROMPTS.flashcards(topic, difficulty, 15, learningStyle);
        break;
      case 'quiz':
        prompt = PROMPTS.quiz(topic, difficulty, 10, focusArea);
        break;
      case 'studyPlan':
        prompt = PROMPTS.studyPlan(topic, focusArea || 'General mastery', '2 weeks', difficulty);
        break;
    }

    await start(prompt);
    await incrementMaterials();
  }, [topic, difficulty, length, learningStyle, focusArea, materialType, start, reset, incrementMaterials]);

  const handleSave = useCallback(async () => {
    if (!text) return;
    let cards, questions, plan;

    if (materialType === 'flashcards') cards = parseFlashcards(text) || undefined;
    if (materialType === 'quiz') questions = parseQuiz(text) || undefined;
    if (materialType === 'studyPlan') plan = parseStudyPlan(text) || undefined;

    const id = await addItem({
      type: materialType,
      topic,
      content: text,
      cards,
      questions,
      plan,
      confidenceScore: 0,
      difficulty,
      tags: [topic, materialType, difficulty],
    });
    setSavedId(id);
    showToast('Saved to library', 'success');
  }, [text, materialType, topic, difficulty, addItem, showToast]);

  const handleLaunchContent = useCallback(() => {
    if (!isComplete || !text) return;

    if (materialType === 'flashcards') {
      const cards = parseFlashcards(text);
      if (cards && savedId) {
        router.push(`/flashcards/${savedId}`);
      } else if (cards) {
        handleSave().then(() => {});
        showToast('Save first to launch flashcards', 'info');
      } else {
        showToast('Could not parse flashcards. Try regenerating.', 'error');
      }
    } else if (materialType === 'quiz') {
      const questions = parseQuiz(text);
      if (questions && savedId) {
        router.push(`/quiz/${savedId}`);
      } else {
        handleSave().then(() => {});
        showToast('Save first to launch quiz', 'info');
      }
    } else if (materialType === 'studyPlan' && savedId) {
      router.push(`/study/${savedId}`);
    }
  }, [isComplete, text, materialType, savedId, handleSave, showToast]);

  const handleShare = useCallback(async () => {
    if (!text) return;
    const available = await Sharing.isAvailableAsync();
    if (available) {
      showToast('Preparing share...', 'info');
    }
  }, [text, showToast]);

  const handlePasteClipboard = useCallback(async () => {
    const content = await Clipboard.getStringAsync();
    if (content) setTopic(content.slice(0, 2000));
  }, []);

  const getPhaseText = () => {
    switch (phase) {
      case 'generating': return 'Generating...';
      case 'structuring': return 'Structuring content...';
      case 'complete': return 'Done';
      default: return `Generate ${config.title}`;
    }
  };

  const getErrorMessage = () => {
    if (!error) return null;
    if (error.includes('API_KEY_MISSING')) return 'Add your Anthropic API key in Profile → Settings to use AI features.';
    if (error.includes('RATE_LIMIT')) return 'Taking a breather... try again in a moment.';
    if (error.includes('API_ERROR')) return 'API error. Please check your connection and try again.';
    return 'Something went wrong. Please try again.';
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm, paddingHorizontal: spacing.lg, borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: colors.surface, borderRadius: radius.md }]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Ionicons name={config.icon as never} size={18} color={colors.accentBlue} />
          <Text style={[typography.h3, { color: colors.text, marginLeft: 8 }]}>{config.title}</Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowOptions(!showOptions)}
          style={[styles.optionsButton, { backgroundColor: showOptions ? colors.accentBlueSoft : colors.surface, borderRadius: radius.md }]}
          accessibilityRole="button"
          accessibilityLabel="Toggle options"
        >
          <Ionicons name="options" size={18} color={showOptions ? colors.accentBlue : colors.text} />
        </TouchableOpacity>
      </View>

      {!isStreaming && !isComplete ? (
        <ScrollView style={styles.inputArea} contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }} keyboardShouldPersistTaps="handled">
          {/* Topic Input */}
          <View>
            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderRadius: radius.lg, borderWidth: 1.5, borderColor: topicError ? colors.accentRed : colors.border }]}>
              <TextInput
                style={[styles.topicInput, { color: colors.text }]}
                placeholder={config.placeholder}
                placeholderTextColor={colors.textTertiary}
                value={topic}
                onChangeText={(t) => { setTopic(t); setTopicError(null); }}
                multiline
                maxLength={2000}
                accessibilityLabel="Topic input"
                accessibilityHint={config.placeholder}
              />
              <View style={styles.inputFooter}>
                <TouchableOpacity onPress={handlePasteClipboard} accessibilityRole="button" accessibilityLabel="Paste from clipboard">
                  <Text style={[typography.caption, { color: colors.accentBlue }]}>Paste</Text>
                </TouchableOpacity>
                <Text style={[typography.caption, { color: colors.textTertiary }]}>{topic.length}/2000</Text>
              </View>
            </View>
            {topicError && (
              <Text style={[typography.caption, { color: colors.accentRed, marginTop: spacing.xs }]}>{topicError}</Text>
            )}
          </View>

          {/* Options Panel */}
          {showOptions && (
            <View style={[styles.optionsPanel, { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border }]}>
              <OptionsPanel
                difficulty={difficulty}
                length={length}
                learningStyle={learningStyle}
                focusArea={focusArea}
                onDifficultyChange={setDifficulty}
                onLengthChange={setLength}
                onLearningStyleChange={setLearningStyle}
                onFocusAreaChange={setFocusArea}
              />
              <View style={{ marginTop: spacing.md }}>
                <Text style={[typography.label, { color: colors.textTertiary, marginBottom: spacing.sm, textTransform: 'uppercase' }]}>
                  Focus Area (optional)
                </Text>
                <TextInput
                  style={[styles.focusInput, { backgroundColor: colors.inputBg, borderRadius: radius.md, color: colors.text, borderWidth: 1, borderColor: colors.border }]}
                  placeholder="What specifically do you want to master?"
                  placeholderTextColor={colors.textTertiary}
                  value={focusArea}
                  onChangeText={setFocusArea}
                />
              </View>
            </View>
          )}

          {/* Error state */}
          {error && (
            <View style={[styles.errorCard, { backgroundColor: colors.accentRedSoft, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.accentRed + '40' }]}>
              <Ionicons name="alert-circle" size={18} color={colors.accentRed} />
              <Text style={[typography.bodyMd, { color: colors.accentRed, flex: 1, marginLeft: spacing.sm }]}>
                {getErrorMessage()}
              </Text>
            </View>
          )}

          <Button
            label={getPhaseText()}
            onPress={handleGenerate}
            fullWidth
            size="lg"
            loading={isStreaming}
            disabled={!topic.trim()}
          />
        </ScrollView>
      ) : (
        <View style={styles.streamContainer}>
          <StreamingTextView
            text={text}
            isStreaming={isStreaming}
            renderMarkdown={materialType === 'summary' || materialType === 'studyPlan'}
          />

          {isComplete && (
            <View style={[styles.actionsBar, { backgroundColor: colors.surface, borderTopColor: colors.border, borderTopWidth: 1, paddingBottom: insets.bottom + spacing.sm, paddingHorizontal: spacing.lg, paddingTop: spacing.md }]}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                <Button label="Save" onPress={handleSave} variant="primary" size="sm" icon={<Ionicons name="bookmark" size={14} color={colors.background} />} />
                <Button label="Regenerate" onPress={handleGenerate} variant="outline" size="sm" icon={<Ionicons name="refresh" size={14} color={colors.text} />} />
                {(materialType === 'flashcards' || materialType === 'quiz' || materialType === 'studyPlan') && (
                  <Button label={materialType === 'flashcards' ? 'Study Cards' : materialType === 'quiz' ? 'Take Quiz' : 'View Plan'} onPress={handleLaunchContent} variant="secondary" size="sm" />
                )}
                <Button label="Share" onPress={handleShare} variant="ghost" size="sm" icon={<Ionicons name="share-outline" size={14} color={colors.text} />} />
                <Button label="Discard" onPress={() => { reset(); setTopic(''); }} variant="danger" size="sm" />
              </ScrollView>
            </View>
          )}
        </View>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          visible={!!toast}
          onHide={() => setToast(null)}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    gap: 12,
  },
  backButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  optionsButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  inputArea: { flex: 1 },
  inputWrapper: { padding: 16 },
  topicInput: { fontSize: 16, lineHeight: 24, minHeight: 120, textAlignVertical: 'top' },
  inputFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  optionsPanel: {},
  focusInput: { padding: 12, fontSize: 14 },
  errorCard: { flexDirection: 'row', alignItems: 'flex-start' },
  streamContainer: { flex: 1 },
  actionsBar: {},
});
