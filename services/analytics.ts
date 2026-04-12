import AsyncStorage from '@react-native-async-storage/async-storage';

interface AnalyticsEvent {
  event: string;
  properties: Record<string, unknown>;
  timestamp: string;
}

const ANALYTICS_KEY = '@learnbe/analytics';
const MAX_EVENTS = 500;

export async function trackEvent(event: string, properties: Record<string, unknown> = {}): Promise<void> {
  try {
    const data = await AsyncStorage.getItem(ANALYTICS_KEY);
    const events: AnalyticsEvent[] = data ? JSON.parse(data) : [];
    events.push({ event, properties, timestamp: new Date().toISOString() });
    if (events.length > MAX_EVENTS) events.splice(0, events.length - MAX_EVENTS);
    await AsyncStorage.setItem(ANALYTICS_KEY, JSON.stringify(events));
  } catch {
    // silently fail
  }
}

export async function getAnalytics(): Promise<AnalyticsEvent[]> {
  try {
    const data = await AsyncStorage.getItem(ANALYTICS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function clearAnalytics(): Promise<void> {
  await AsyncStorage.removeItem(ANALYTICS_KEY);
}
