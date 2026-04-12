export function validateTopic(topic: string): string | null {
  if (!topic.trim()) return 'Please enter a topic';
  if (topic.trim().length < 2) return 'Topic must be at least 2 characters';
  if (topic.length > 2000) return 'Topic must be under 2000 characters';
  return null;
}

export function validateName(name: string): string | null {
  if (!name.trim()) return 'Name is required';
  if (name.trim().length < 2) return 'Name must be at least 2 characters';
  if (name.length > 50) return 'Name must be under 50 characters';
  return null;
}
