import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Lock, Check, ChevronRight, RotateCcw, Star, Target, AlertCircle } from 'lucide-react';
import { useQuizStore } from '@/store';
import { QuestionCard } from '@/components/QuestionCard';

export function ChallengePage() {
  const { questions, levels, unlockNextLevel, markLevelPassed, recordAnswer, theme } = useQuizStore();
  const [currentLevel, setCurrentLevel] = useState(levels.find(l => l.unlocked && !l.passed) || levels[0]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [levelQuestions, setLevelQuestions] = useState<typeof questions>([]);
  const [answers, setAnswers] = useState<Record<string, { answer: string | string[], correct: boolean }>>({});
  const [gameResult, setGameResult] = useState<'pass' | 'fail' | null>(null);
  const [showGameResult, setShowGameResult] = useState(false);

  useEffect(() => {
    const levelQs = questions.filter(q => q.difficulty === currentLevel?.difficulty);
    const shuffled = [...levelQs].sort(() => Math.random() - 0.5);
    setLevelQuestions(shuffled.slice(0, currentLevel?.questionCount || 10));
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResult(false);
    setGameResult(null);
    setShowGameResult(false);
  }, [currentLevel, questions]);

  const currentQuestion = levelQuestions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const correctCount = Object.values(answers).filter(a => a.correct).length;

  const checkAnswer = (userAnswer: string | string[]) => {
    if (!currentQuestion) return;
    
    let isCorrect = false;
    if (Array.isArray(currentQuestion.answer)) {
      isCorrect = Array.isArray(userAnswer) && 
        userAnswer.length === currentQuestion.answer.length &&
        userAnswer.every(a => currentQuestion.answer.includes(a));
    } else {
      isCorrect = userAnswer === currentQuestion.answer;
    }

    recordAnswer(currentQuestion.id, userAnswer, isCorrect);
    
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: { answer: userAnswer, correct: isCorrect }
    }));
    setShowResult(true);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < levelQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowResult(false);
    } else {
      const passed = correctCount >= currentLevel.requiredScore;
      setGameResult(passed ? 'pass' : 'fail');
      setShowGameResult(true);
      
      if (passed) {
        markLevelPassed(currentLevel.id);
        if (currentLevel.id < levels.length) {
          unlockNextLevel(currentLevel.id);
        }
      }
    }
  };

  const retryLevel = () => {
    const levelQs = questions.filter(q => q.difficulty === currentLevel?.difficulty);
    const shuffled = [...levelQs].sort(() => Math.random() - 0.5);
    setLevelQuestions(shuffled.slice(0, currentLevel?.questionCount || 10));
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResult(false);
    setGameResult(null);
    setShowGameResult(false);
  };

  const selectLevel = (level: typeof levels[0]) => {
    if (!level.unlocked) return;
    setCurrentLevel(level);
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'bg-success';
      case 'medium': return 'bg-warning';
      case 'hard': return 'bg-danger';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className={`rounded-xl p-6 ${theme.isDark ? 'bg-card-dark border-border-dark' : 'bg-card-light border-border-light'} border`}>
        <h2 className="text-xl font-bold mb-4">闯关模式</h2>
        <div className="flex flex-wrap gap-3">
          {levels.map((level) => (
            <button
              key={level.id}
              onClick={() => selectLevel(level)}
              disabled={!level.unlocked}
              className={`relative px-6 py-3 rounded-lg border-2 transition-all duration-200 ${
                currentLevel?.id === level.id
                  ? 'border-primary bg-primary/10'
                  : level.unlocked
                  ? 'border-border-light hover:border-primary/50'
                  : 'border-border-light opacity-50 cursor-not-allowed'
              } ${theme.isDark ? 'bg-card-dark' : 'bg-white'}`}
            >
              {!level.unlocked && (
                <Lock className="absolute -top-2 -right-2 w-6 h-6 bg-gray-500 text-white rounded-full" />
              )}
              {level.passed && (
                <Check className="absolute -top-2 -right-2 w-6 h-6 bg-success text-white rounded-full" />
              )}
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${getDifficultyColor(level.difficulty)}`} />
                <span className="font-semibold">{level.name}</span>
              </div>
              <p className="text-sm text-gray-500">
                {level.passed ? '已通过' : level.unlocked ? `${level.questionCount}题/需答对${level.requiredScore}题` : '未解锁'}
              </p>
            </button>
          ))}
        </div>
      </div>

      {!showGameResult ? (
        <>
          <div className={`rounded-xl p-4 ${theme.isDark ? 'bg-card-dark border-border-dark' : 'bg-card-light border-border-light'} border`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <span className="text-lg font-semibold">第 {currentQuestionIndex + 1} / {levelQuestions.length} 题</span>
                <span className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < Math.floor(correctCount / 2) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-success" />
                <span className="font-semibold text-success">{correctCount} 正确</span>
              </div>
            </div>
            <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(answeredCount / levelQuestions.length) * 100}%` }}
                className="h-full bg-gradient-to-r from-primary to-success"
              />
            </div>
          </div>

          {currentQuestion && (
            <QuestionCard
              question={currentQuestion}
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
                className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors flex items-center gap-2"
              >
                {currentQuestionIndex < levelQuestions.length - 1 ? (
                  <>下一题 <ChevronRight className="w-5 h-5" /></>
                ) : (
                  '查看结果'
                )}
              </button>
            </motion.div>
          )}
        </>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`rounded-2xl p-8 text-center ${theme.isDark ? 'bg-card-dark border-border-dark' : 'bg-card-light border-border-light'} border`}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
                gameResult === 'pass' ? 'bg-success/20' : 'bg-danger/20'
              }`}
            >
              {gameResult === 'pass' ? (
                <Trophy className="w-12 h-12 text-success" />
              ) : (
                <AlertCircle className="w-12 h-12 text-danger" />
              )}
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`text-3xl font-bold mb-4 ${gameResult === 'pass' ? 'text-success' : 'text-danger'}`}
            >
              {gameResult === 'pass' ? '🎉 闯关成功！' : '😢 闯关失败'}
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className={`mb-6 ${theme.isDark ? 'text-gray-400' : 'text-gray-500'}`}
            >
              {gameResult === 'pass' 
                ? `恭喜您通过「${currentLevel.name}」！` 
                : `很遗憾，您答对了 ${correctCount} 题，需要答对 ${currentLevel.requiredScore} 题才能通过`}
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className={`grid grid-cols-3 gap-4 mb-8 max-w-md mx-auto ${theme.isDark ? 'bg-bg-dark' : 'bg-bg-light'} rounded-lg p-4`}
            >
              <div>
                <p className="text-2xl font-bold text-primary">{answeredCount}</p>
                <p className="text-sm text-gray-500">总题数</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-success">{correctCount}</p>
                <p className="text-sm text-gray-500">正确数</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-secondary">
                  {Math.round((correctCount / answeredCount) * 100)}%
                </p>
                <p className="text-sm text-gray-500">正确率</p>
              </div>
            </motion.div>
            
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              onClick={retryLevel}
              className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors flex items-center gap-2 mx-auto"
            >
              <RotateCcw className="w-5 h-5" />
              重新挑战
            </motion.button>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
