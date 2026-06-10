import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Question, QuestionCategory, QuestionType, Level, QuizStats, ThemeState } from '@/types';
import { mockQuestions } from '@/data/mockData';

interface QuizStore {
  questions: Question[];
  addQuestion: (question: Question) => void;
  updateQuestion: (id: string, updates: Partial<Question>) => void;
  deleteQuestion: (id: string) => void;
  getQuestionsByCategory: (category: QuestionCategory) => Question[];
  getQuestionsByType: (type: QuestionType) => Question[];
  importQuestions: (questions: Question[]) => void;
  exportQuestions: () => string;

  stats: QuizStats;
  recordAnswer: (questionId: string, userAnswer: string | string[], isCorrect: boolean, timeSpent: number) => void;
  addWrongQuestion: (question: Question, userAnswer: string | string[]) => void;
  removeWrongQuestion: (questionId: string) => void;
  updateWrongQuestion: (questionId: string, userAnswer: string | string[]) => void;

  levels: Level[];
  getCurrentLevel: () => Level | null;
  unlockNextLevel: (levelId: number) => void;
  markLevelPassed: (levelId: number) => void;

  theme: ThemeState;
  toggleTheme: () => void;

  getTodayStats: () => { questionCount: number; correctCount: number };
  getStreakDays: () => number;
}

const LEVELS: Level[] = [
  { id: 1, name: '初级挑战', difficulty: 'easy', questionCount: 10, unlocked: true, passed: false, requiredScore: 8 },
  { id: 2, name: '中级进阶', difficulty: 'medium', questionCount: 10, unlocked: false, passed: false, requiredScore: 8 },
  { id: 3, name: '高级精通', difficulty: 'hard', questionCount: 10, unlocked: false, passed: false, requiredScore: 8 },
];

const initialStats: QuizStats = {
  totalQuestions: 0,
  correctCount: 0,
  streakDays: 0,
  lastQuizDate: '',
  categoryStats: {
    finance_law: { total: 0, correct: 0 },
    finance_knowledge: { total: 0, correct: 0 },
    stock_basic: { total: 0, correct: 0 },
    entrepreneurship: { total: 0, correct: 0 },
  },
  typeStats: {
    single: { total: 0, correct: 0 },
    multiple: { total: 0, correct: 0 },
    judge: { total: 0, correct: 0 },
    essay: { total: 0, correct: 0 },
  },
  levelProgress: {},
  wrongQuestions: [],
  timerHistory: [],
  dailyStats: [],
};

export const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => ({
      questions: mockQuestions,
      addQuestion: (question) => set((state) => ({ questions: [...state.questions, question] })),
      updateQuestion: (id, updates) =>
        set((state) => ({
          questions: state.questions.map((q) => (q.id === id ? { ...q, ...updates } : q)),
        })),
      deleteQuestion: (id) =>
        set((state) => ({ questions: state.questions.filter((q) => q.id !== id) })),
      getQuestionsByCategory: (category) =>
        get().questions.filter((q) => q.category === category),
      getQuestionsByType: (type) => get().questions.filter((q) => q.type === type),
      importQuestions: (questions) =>
        set((state) => ({
          questions: [...state.questions, ...questions],
        })),
      exportQuestions: () => JSON.stringify(get().questions, null, 2),

      stats: initialStats,
      recordAnswer: (questionId, userAnswer, isCorrect) => {
        const question = get().questions.find((q) => q.id === questionId);
        if (!question) return;

        const today = new Date().toISOString().split('T')[0];
        set((state) => {
          const newDailyStats = [...state.stats.dailyStats];
          const todayIndex = newDailyStats.findIndex((d) => d.date === today);

          if (todayIndex >= 0) {
            newDailyStats[todayIndex] = {
              ...newDailyStats[todayIndex],
              questionCount: newDailyStats[todayIndex].questionCount + 1,
              correctCount: newDailyStats[todayIndex].correctCount + (isCorrect ? 1 : 0),
            };
          } else {
            newDailyStats.push({ date: today, questionCount: 1, correctCount: isCorrect ? 1 : 0 });
          }

          const newCategoryStats = { ...state.stats.categoryStats };
          newCategoryStats[question.category].total += 1;
          if (isCorrect) newCategoryStats[question.category].correct += 1;

          const newTypeStats = { ...state.stats.typeStats };
          newTypeStats[question.type].total += 1;
          if (isCorrect) newTypeStats[question.type].correct += 1;

          let newStreakDays = state.stats.streakDays;
          const lastDate = state.stats.lastQuizDate;
          if (lastDate) {
            const last = new Date(lastDate);
            const todayDate = new Date(today);
            const diffDays = Math.floor((todayDate.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
              newStreakDays += 1;
            } else if (diffDays > 1) {
              newStreakDays = 1;
            }
          } else {
            newStreakDays = 1;
          }

          if (!isCorrect) {
            get().addWrongQuestion(question, userAnswer);
          } else {
            get().removeWrongQuestion(questionId);
          }

          return {
            stats: {
              ...state.stats,
              totalQuestions: state.stats.totalQuestions + 1,
              correctCount: state.stats.correctCount + (isCorrect ? 1 : 0),
              streakDays: newStreakDays,
              lastQuizDate: today,
              categoryStats: newCategoryStats,
              typeStats: newTypeStats,
              dailyStats: newDailyStats,
            },
          };
        });
      },
      addWrongQuestion: (question, userAnswer) => {
        set((state) => {
          const existing = state.stats.wrongQuestions.find((w) => w.id === question.id);
          if (existing) {
            return {
              stats: {
                ...state.stats,
                wrongQuestions: state.stats.wrongQuestions.map((w) =>
                  w.id === question.id
                    ? {
                        ...w,
                        wrongCount: w.wrongCount + 1,
                        lastWrongTime: Date.now(),
                        userAnswers: [...new Set([...w.userAnswers, String(userAnswer)])],
                      }
                    : w
                ),
              },
            };
          }
          return {
            stats: {
              ...state.stats,
              wrongQuestions: [
                ...state.stats.wrongQuestions,
                {
                  ...question,
                  wrongCount: 1,
                  lastWrongTime: Date.now(),
                  userAnswers: [String(userAnswer)],
                },
              ],
            },
          };
        });
      },
      removeWrongQuestion: (questionId) =>
        set((state) => ({
          stats: {
            ...state.stats,
            wrongQuestions: state.stats.wrongQuestions.filter((w) => w.id !== questionId),
          },
        })),
      updateWrongQuestion: (questionId, userAnswer) => {
        const question = get().questions.find((q) => q.id === questionId);
        if (!question) return;
        get().addWrongQuestion(question, userAnswer);
      },

      levels: LEVELS,
      getCurrentLevel: () => {
        const levels = get().levels;
        const unlockedLevel = levels.find((l) => l.unlocked && !l.passed);
        if (unlockedLevel) return unlockedLevel;
        return levels.find((l) => l.unlocked) || null;
      },
      unlockNextLevel: (levelId) =>
        set((state) => ({
          levels: state.levels.map((l) =>
            l.id === levelId + 1 ? { ...l, unlocked: true } : l
          ),
        })),
      markLevelPassed: (levelId) =>
        set((state) => ({
          levels: state.levels.map((l) =>
            l.id === levelId ? { ...l, passed: true } : l
          ),
        })),

      theme: { isDark: false },
      toggleTheme: () =>
        set((state) => ({ theme: { isDark: !state.theme.isDark } })),

      getTodayStats: () => {
        const today = new Date().toISOString().split('T')[0];
        const todayStats = get().stats.dailyStats.find((d) => d.date === today);
        return todayStats || { questionCount: 0, correctCount: 0 };
      },
      getStreakDays: () => get().stats.streakDays,
    }),
    {
      name: 'quiz-storage',
      partialize: (state) => ({
        questions: state.questions,
        stats: state.stats,
        levels: state.levels,
        theme: state.theme,
      }),
    }
  )
);
