export type QuestionType = 'single' | 'multiple' | 'judge' | 'essay';

export type QuestionCategory = 'finance_law' | 'finance_knowledge' | 'stock_basic' | 'entrepreneurship';

export interface Question {
  id: string;
  type: QuestionType;
  category: QuestionCategory;
  difficulty: 'easy' | 'medium' | 'hard';
  content: string;
  options?: string[];
  answer: string | string[];
  analysis: string;
}

export interface CategoryInfo {
  id: QuestionCategory;
  name: string;
  description: string;
  icon: string;
}

export interface AnswerRecord {
  questionId: string;
  userAnswer: string | string[];
  isCorrect: boolean;
  timestamp: number;
  timeSpent: number;
}

export interface WrongQuestion extends Question {
  wrongCount: number;
  lastWrongTime: number;
  userAnswers: string[];
}

export interface Level {
  id: number;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
  unlocked: boolean;
  passed: boolean;
  requiredScore: number;
}

export interface TimerModeResult {
  totalQuestions: number;
  correctCount: number;
  timeUsed: number;
  timestamp: number;
}

export interface DailyStats {
  date: string;
  questionCount: number;
  correctCount: number;
}

export interface QuizStats {
  totalQuestions: number;
  correctCount: number;
  streakDays: number;
  lastQuizDate: string;
  categoryStats: Record<QuestionCategory, { total: number; correct: number }>;
  typeStats: Record<QuestionType, { total: number; correct: number }>;
  levelProgress: Record<number, boolean>;
  wrongQuestions: WrongQuestion[];
  timerHistory: TimerModeResult[];
  dailyStats: DailyStats[];
}

export interface ThemeState {
  isDark: boolean;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: 'finance_law', name: '财经法规', description: '金融相关法律法规知识', icon: 'scale' },
  { id: 'finance_knowledge', name: '理财知识', description: '投资理财基础知识', icon: 'piggy-bank' },
  { id: 'stock_basic', name: '股市基础', description: '股票市场基础知识', icon: 'trending-up' },
  { id: 'entrepreneurship', name: '创业常识', description: '创业相关知识', icon: 'briefcase' },
];

export const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'single', label: '单选题' },
  { value: 'multiple', label: '多选题' },
  { value: 'judge', label: '判断题' },
  { value: 'essay', label: '简答题' },
];
