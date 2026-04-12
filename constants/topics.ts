export interface TopicCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  subtopics: string[];
}

export const TOPIC_CATEGORIES: TopicCategory[] = [
  {
    id: 'sciences',
    name: 'Sciences',
    icon: 'flask',
    color: '#1B6FE8',
    subtopics: ['Physics', 'Chemistry', 'Biology', 'Astronomy', 'Earth Science', 'Environmental Science'],
  },
  {
    id: 'mathematics',
    name: 'Mathematics',
    icon: 'calculator',
    color: '#5B3FBF',
    subtopics: ['Algebra', 'Calculus', 'Statistics', 'Geometry', 'Trigonometry', 'Linear Algebra', 'Number Theory'],
  },
  {
    id: 'history',
    name: 'History & Social Studies',
    icon: 'time',
    color: '#B8600A',
    subtopics: ['World History', 'Ancient Civilizations', 'Modern History', 'Geography', 'Political Science', 'Economics'],
  },
  {
    id: 'literature',
    name: 'Literature & Language',
    icon: 'book',
    color: '#1A7A4A',
    subtopics: ['Classic Literature', 'Poetry', 'Grammar', 'Writing', 'Linguistics', 'World Languages'],
  },
  {
    id: 'cs',
    name: 'Computer Science',
    icon: 'code-slash',
    color: '#1B6FE8',
    subtopics: ['Programming', 'Data Structures', 'Algorithms', 'Web Development', 'Machine Learning', 'Databases', 'Networking'],
  },
  {
    id: 'business',
    name: 'Business & Economics',
    icon: 'trending-up',
    color: '#B8600A',
    subtopics: ['Microeconomics', 'Macroeconomics', 'Finance', 'Marketing', 'Management', 'Accounting', 'Entrepreneurship'],
  },
  {
    id: 'arts',
    name: 'Arts & Humanities',
    icon: 'color-palette',
    color: '#5B3FBF',
    subtopics: ['Art History', 'Music Theory', 'Philosophy', 'Ethics', 'Psychology', 'Sociology', 'Anthropology'],
  },
  {
    id: 'health',
    name: 'Health & Medicine',
    icon: 'heart',
    color: '#C0392B',
    subtopics: ['Anatomy', 'Physiology', 'Nutrition', 'Pharmacology', 'Public Health', 'Mental Health', 'First Aid'],
  },
];

export const QUICK_START_TOPICS = [
  'Quantum Mechanics',
  'Machine Learning',
  'World War II',
  'Organic Chemistry',
  'Calculus',
  'Shakespeare',
  'Blockchain',
  'Human Psychology',
  'Climate Change',
  'Ancient Rome',
];
