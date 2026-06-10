import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Question, QuestionCategory, QuestionType, Level, QuizStats, ThemeState, User, QuizProgress, BattleState } from '@/types';
import { mockQuestions } from '@/data/mockData';

interface QuizStore {
  users: User[];
  currentUserId: string;
  
  addUser: (name: string) => User;
  switchUser: (userId: string) => void;
  deleteUser: (userId: string) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;

  questions: Question[];
  addQuestion: (question: Question) => void;
  updateQuestion: (id: string, updates: Partial<Question>) => void;
  deleteQuestion: (id: string) => void;
  getQuestionsByCategory: (category: QuestionCategory) => Question[];
  getQuestionsByType: (type: QuestionType) => Question[];
  importQuestions: (questions: Question[]) => void;
  exportQuestions: () => string;

  stats: QuizStats;
  recordAnswer: (questionId: string, userAnswer: string | string[], isCorrect: boolean) => void;
  addWrongQuestion: (question: Question, userAnswer: string | string[]) => void;
  removeWrongQuestion: (questionId: string) => void;
  updateWrongQuestion: (questionId: string, userAnswer: string | string[]) => void;

  levels: Level[];
  getCurrentLevel: () => Level | null;
  unlockNextLevel: (levelId: number) => void;
  markLevelPassed: (levelId: number) => void;

  theme: ThemeState;
  toggleTheme: () => void;

  quizProgress: QuizProgress | null;
  saveQuizProgress: (progress: QuizProgress) => void;
  clearQuizProgress: () => void;

  battle: BattleState;
  startBattle: (player1Name: string, player2Name: string, maxQuestions: number) => void;
  answerBattleQuestion: (player: 1 | 2, userAnswer: string | string[]) => void;
  nextBattleQuestion: () => void;
  endBattle: () => void;

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

const defaultUser: User = {
  id: 'default-user',
  name: '默认用户',
  avatar: '',
  createdAt: Date.now(),
};

const initialBattleState: BattleState = {
  isActive: false,
  player1: { name: '玩家1', score: 0, answers: {} },
  player2: { name: '玩家2', score: 0, answers: {} },
  currentQuestion: null,
  currentTurn: 1,
  questionIndex: 0,
  questions: [],
  timeLeft: 30,
  maxQuestions: 10,
};

export const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => ({
      users: [defaultUser],
      currentUserId: 'default-user',

      addUser: (name) => {
        const newUser: User = {
          id: `user-${Date.now()}`,
          name,
          avatar: '',
          createdAt: Date.now(),
        };
        set((state) => ({ users: [...state.users, newUser], currentUserId: newUser.id }));
        return newUser;
      },

      switchUser: (userId) => {
        set({ currentUserId: userId });
      },

      deleteUser: (userId) => {
        const state = get();
        if (state.users.length <= 1) return;
        const newUsers = state.users.filter(u => u.id !== userId);
        const newCurrentUserId = state.currentUserId === userId ? newUsers[0].id : state.currentUserId;
        set({ users: newUsers, currentUserId: newCurrentUserId });
      },

      updateUser: (userId, updates) => {
        set((state) => ({
          users: state.users.map(u => u.id === userId ? { ...u, ...updates } : u),
        }));
      },

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

      quizProgress: null,
      saveQuizProgress: (progress) => set({ quizProgress: progress }),
      clearQuizProgress: () => set({ quizProgress: null }),

      battle: initialBattleState,
      startBattle: (player1Name, player2Name, maxQuestions) => {
        const questions = [...get().questions].sort(() => Math.random() - 0.5);
        const battleQuestions = questions.slice(0, maxQuestions).filter(q => q.type !== 'essay');
        
        set({
          battle: {
            isActive: true,
            player1: { name: player1Name, score: 0, answers: {} },
            player2: { name: player2Name, score: 0, answers: {} },
            currentQuestion: battleQuestions[0] || null,
            currentTurn: Math.random() > 0.5 ? 1 : 2,
            questionIndex: 0,
            questions: battleQuestions,
            timeLeft: 30,
            maxQuestions,
          },
        });
      },
      answerBattleQuestion: (player, userAnswer) => {
        const battle = get().battle;
        if (!battle.currentQuestion || battle.currentTurn !== player) return;

        const question = battle.currentQuestion;
        let isCorrect = false;
        if (Array.isArray(question.answer)) {
          isCorrect = Array.isArray(userAnswer) &&
            userAnswer.length === question.answer.length &&
            userAnswer.every(a => question.answer.includes(a));
        } else {
          isCorrect = userAnswer === question.answer;
        }

        set((state) => {
          const newBattle = { ...state.battle };
          if (player === 1) {
            newBattle.player1.score += isCorrect ? 10 : 0;
            newBattle.player1.answers[question.id] = isCorrect;
          } else {
            newBattle.player2.score += isCorrect ? 10 : 0;
            newBattle.player2.answers[question.id] = isCorrect;
          }
          newBattle.currentTurn = player === 1 ? 2 : 1;
          newBattle.timeLeft = 30;
          return { battle: newBattle };
        });
      },
      nextBattleQuestion: () => {
        const battle = get().battle;
        if (battle.questionIndex >= battle.questions.length - 1) {
          get().endBattle();
          return;
        }

        set((state) => ({
          battle: {
            ...state.battle,
            questionIndex: state.battle.questionIndex + 1,
            currentQuestion: state.battle.questions[state.battle.questionIndex + 1],
            currentTurn: Math.random() > 0.5 ? 1 : 2,
            timeLeft: 30,
          },
        }));
      },
      endBattle: () => {
        set({ battle: initialBattleState });
      },

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
        users: state.users,
        currentUserId: state.currentUserId,
        questions: state.questions,
        stats: state.stats,
        levels: state.levels,
        theme: state.theme,
        quizProgress: state.quizProgress,
      }),
    }
  )
);
