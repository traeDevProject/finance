import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, AlertTriangle, CheckCircle, XCircle, Play, RotateCcw, Target, Clock } from 'lucide-react';
import { useQuizStore } from '@/store';
import { QuestionCard } from '@/components/QuestionCard';

const TOTAL_TIME = 10 * 60;
const QUESTION_COUNT = 50;

export function TimerPage() {
  const { questions, recordAnswer, theme } = useQuizStore();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [gameQuestions, setGameQuestions] = useState<typeof questions>([]);
  const [answers, setAnswers] = useState<Record<string, { answer: string | string[], correct: boolean }>>({});
  const [showResult, setShowResult] = useState(false);

  const answeredCount = Object.keys(answers).length;
  const correctCount = Object.values(answers).filter(a => a.correct).length;

  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameState('finished');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  const startGame = () => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    setGameQuestions(shuffled.slice(0, QUESTION_COUNT));
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTimeLeft(TOTAL_TIME);
    setGameState('playing');
    setShowResult(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const checkAnswer = useCallback((userAnswer: string | string[]) => {
    const currentQuestion = gameQuestions[currentQuestionIndex];
    if (!currentQuestion) return;

    let isCorrect = false;
    if (Array.isArray(currentQuestion.answer)) {
      isCorrect = Array.isArray(userAnswer) &&
        userAnswer.length === currentQuestion.answer.length &&
        userAnswer.every(a => currentQuestion.answer.includes(a));
    } else {
      isCorrect = userAnswer === currentQuestion.answer;
    }

    recordAnswer(currentQuestion.id, userAnswer, isCorrect, 0);

    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: { answer: userAnswer, correct: isCorrect }
    }));
    setShowResult(true);
  }, [gameQuestions, currentQuestionIndex, recordAnswer]);

  const nextQuestion = () => {
    if (currentQuestionIndex < gameQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowResult(false);
    } else {
      setGameState('finished');
    }
  };

  const percentage = (correctCount / Math.max(answeredCount, 1)) * 100;
  const timePercentage = (timeLeft / TOTAL_TIME) * 100;
  const isTimeWarning = timeLeft <= 60;
  const isTimeCritical = timeLeft <= 30;

  return (
    <div className="space-y-6">
      <div className={`rounded-xl p-6 ${theme.isDark ? 'bg-card-dark border-border-dark' : 'bg-card-light border-border-light'} border`}>
        <h2 className="text-xl font-bold mb-4">计时模式</h2>
        <p className={`mb-4 ${theme.isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          限时 10 分钟完成 {QUESTION_COUNT} 道题目，挑战你的答题速度和准确率！
        </p>
      </div>

      {gameState === 'idle' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`rounded-2xl p-12 text-center ${theme.isDark ? 'bg-card-dark border-border-dark' : 'bg-card-light border-border-light'} border`}
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <Timer className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-2xl font-bold mb-4">准备好挑战了吗？</h3>
          <p className={`mb-8 ${theme.isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            点击下方按钮开始计时答题
          </p>
          <button
            onClick={startGame}
            className="px-8 py-4 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors flex items-center gap-3 mx-auto text-lg"
          >
            <Play className="w-6 h-6" />
            开始挑战
          </button>
        </motion.div>
      )}

      {gameState === 'playing' && (
        <>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl p-4 ${theme.isDark ? 'bg-card-dark border-border-dark' : 'bg-card-light border-border-light'} border`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  isTimeCritical ? 'bg-danger/20 text-danger' :
                  isTimeWarning ? 'bg-warning/20 text-warning' :
                  theme.isDark ? 'bg-white/10' : 'bg-gray-100'
                }`}>
                  <Clock className="w-5 h-5" />
                  <span className="text-xl font-mono font-bold">{formatTime(timeLeft)}</span>
                </div>
                {isTimeWarning && <AlertTriangle className="w-6 h-6 text-warning animate-pulse" />}
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  <span className="font-semibold">
                    {answeredCount} / {gameQuestions.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="font-semibold text-success">{correctCount}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="w-20">时间进度</span>
                <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                  <motion.div
                    className={`h-full ${isTimeCritical ? 'bg-danger' : isTimeWarning ? 'bg-warning' : 'bg-primary'}`}
                    animate={{ width: `${timePercentage}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <span className="w-16 text-right">{Math.round(timePercentage)}%</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-20">答题进度</span>
                <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                  <motion.div
                    className="h-full bg-success"
                    animate={{ width: `${(answeredCount / gameQuestions.length) * 100}%` }}
                  />
                </div>
                <span className="w-16 text-right">{Math.round((answeredCount / gameQuestions.length) * 100)}%</span>
              </div>
            </div>
          </motion.div>

          {gameQuestions[currentQuestionIndex] && (
            <QuestionCard
              question={gameQuestions[currentQuestionIndex]}
              showResult={showResult}
              onAnswer={checkAnswer}
              disabled={showResult}
            />
          )}

          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center"
            >
              <button
                onClick={nextQuestion}
                className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors"
              >
                {currentQuestionIndex < gameQuestions.length - 1 ? '下一题' : '提交答卷'}
              </button>
            </motion.div>
          )}
        </>
      )}

      {gameState === 'finished' && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-2xl p-8 text-center ${theme.isDark ? 'bg-card-dark border-border-dark' : 'bg-card-light border-border-light'} border`}
          >
            <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
              percentage >= 60 ? 'bg-success/20' : percentage >= 40 ? 'bg-warning/20' : 'bg-danger/20'
            }`}>
              {percentage >= 60 ? (
                <CheckCircle className="w-12 h-12 text-success" />
              ) : percentage >= 40 ? (
                <Timer className="w-12 h-12 text-warning" />
              ) : (
                <XCircle className="w-12 h-12 text-danger" />
              )}
            </div>
            
            <h2 className="text-3xl font-bold mb-4 text-primary">答题完成！</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-lg mx-auto">
              <div className={`p-4 rounded-lg ${theme.isDark ? 'bg-bg-dark' : 'bg-bg-light'}`}>
                <p className="text-2xl font-bold text-primary">{answeredCount}</p>
                <p className="text-sm text-gray-500">完成题数</p>
              </div>
              <div className={`p-4 rounded-lg ${theme.isDark ? 'bg-bg-dark' : 'bg-bg-light'}`}>
                <p className="text-2xl font-bold text-success">{correctCount}</p>
                <p className="text-sm text-gray-500">正确数</p>
              </div>
              <div className={`p-4 rounded-lg ${theme.isDark ? 'bg-bg-dark' : 'bg-bg-light'}`}>
                <p className="text-2xl font-bold text-secondary">{Math.round(percentage)}%</p>
                <p className="text-sm text-gray-500">正确率</p>
              </div>
              <div className={`p-4 rounded-lg ${theme.isDark ? 'bg-bg-dark' : 'bg-bg-light'}`}>
                <p className="text-2xl font-bold text-info">{formatTime(TOTAL_TIME - timeLeft)}</p>
                <p className="text-sm text-gray-500">用时</p>
              </div>
            </div>
            
            <button
              onClick={startGame}
              className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors flex items-center gap-2 mx-auto"
            >
              <RotateCcw className="w-5 h-5" />
              再来一次
            </button>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
