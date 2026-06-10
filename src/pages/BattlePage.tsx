import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Swords, RotateCcw, User, Zap, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useQuizStore } from '@/store';

export function BattlePage() {
  const { battle, startBattle, answerBattleQuestion, nextBattleQuestion, endBattle, theme } = useQuizStore();
  const [player1Name, setPlayer1Name] = useState('玩家1');
  const [player2Name, setPlayer2Name] = useState('玩家2');
  const [maxQuestions, setMaxQuestions] = useState(10);
  const [selectedAnswer, setSelectedAnswer] = useState<string | string[] | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    if (!battle.isActive || battle.timeLeft <= 0) return;

    const timer = setInterval(() => {
      const currentBattle = battle;
      if (currentBattle.timeLeft <= 1) {
        clearInterval(timer);
        nextBattleQuestion();
        setSelectedAnswer(null);
        setShowResult(false);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [battle.isActive, battle.timeLeft, nextBattleQuestion]);

  useEffect(() => {
    setSelectedAnswer(null);
    setShowResult(false);
    setLastAnswerCorrect(null);
  }, [battle.currentQuestion]);

  const handleStartBattle = () => {
    startBattle(player1Name, player2Name, maxQuestions);
  };

  const handleAnswer = (answer: string | string[]) => {
    if (!battle.currentQuestion) return;
    
    const question = battle.currentQuestion;
    let isCorrect = false;
    if (Array.isArray(question.answer)) {
      isCorrect = Array.isArray(answer) &&
        answer.length === question.answer.length &&
        answer.every(a => question.answer.includes(a));
    } else {
      isCorrect = answer === question.answer;
    }

    setLastAnswerCorrect(isCorrect);
    setShowResult(true);
    answerBattleQuestion(battle.currentTurn, answer);
  };

  const handleNextQuestion = () => {
    nextBattleQuestion();
    setSelectedAnswer(null);
    setShowResult(false);
    setLastAnswerCorrect(null);
  };

  const handleEndBattle = () => {
    endBattle();
    setSelectedAnswer(null);
    setShowResult(false);
    setLastAnswerCorrect(null);
  };

  return (
    <div className="space-y-6">
      <div className={`rounded-xl p-6 ${theme.isDark ? 'bg-card-dark border-border-dark' : 'bg-card-light border-border-light'} border`}>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
          <Swords className="w-6 h-6 text-primary" />
          双人对战模式
        </h2>
        <p className={`${theme.isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          本地双人对战，随机分配题目，限时抢答，自动计分判定胜负！
        </p>
      </div>

      {!battle.isActive ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`rounded-2xl p-8 ${theme.isDark ? 'bg-card-dark border-border-dark' : 'bg-card-light border-border-light'} border`}
        >
          <div className="text-center mb-8">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/30">
              <Swords className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-2">准备开始对战</h3>
            <p className={theme.isDark ? 'text-gray-400' : 'text-gray-500'}>设置玩家名称和题目数量</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${theme.isDark ? 'bg-blue-500/20' : 'bg-blue-50'}`}>
                  <User className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex-1">
                  <label className={`block text-sm font-medium mb-1 ${theme.isDark ? 'text-gray-400' : 'text-gray-500'}`}>玩家1名称</label>
                  <input
                    type="text"
                    value={player1Name}
                    onChange={(e) => setPlayer1Name(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${theme.isDark ? 'bg-bg-dark border-border-dark' : 'bg-white border-border-light'} focus:outline-none focus:ring-2 focus:ring-primary/50`}
                    placeholder="输入玩家1名称"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${theme.isDark ? 'bg-red-500/20' : 'bg-red-50'}`}>
                  <User className="w-5 h-5 text-red-500" />
                </div>
                <div className="flex-1">
                  <label className={`block text-sm font-medium mb-1 ${theme.isDark ? 'text-gray-400' : 'text-gray-500'}`}>玩家2名称</label>
                  <input
                    type="text"
                    value={player2Name}
                    onChange={(e) => setPlayer2Name(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${theme.isDark ? 'bg-bg-dark border-border-dark' : 'bg-white border-border-light'} focus:outline-none focus:ring-2 focus:ring-primary/50`}
                    placeholder="输入玩家2名称"
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme.isDark ? 'text-gray-400' : 'text-gray-500'}`}>题目数量</label>
                <div className="flex gap-2">
                  {[5, 10, 15, 20].map((num) => (
                    <button
                      key={num}
                      onClick={() => setMaxQuestions(num)}
                      className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                        maxQuestions === num
                          ? 'bg-primary text-white'
                          : theme.isDark
                          ? 'bg-bg-dark hover:bg-card-dark'
                          : 'bg-bg-light hover:bg-gray-100'
                      }`}
                    >
                      {num}题
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className={`p-8 rounded-xl ${theme.isDark ? 'bg-bg-dark' : 'bg-bg-light'}`}>
                <div className="text-center">
                  <p className={`text-4xl font-bold mb-2 ${theme.isDark ? 'text-gray-300' : 'text-gray-700'}`}>VS</p>
                  <p className="text-sm text-gray-500">限时30秒/题</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={handleStartBattle}
              className="px-8 py-4 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-bold text-lg hover:opacity-90 transition-opacity flex items-center gap-3 shadow-lg shadow-primary/30"
            >
              <Swords className="w-6 h-6" />
              开始对战
            </button>
          </div>
        </motion.div>
      ) : (
        <>
          <div className={`rounded-xl p-4 ${theme.isDark ? 'bg-card-dark border-border-dark' : 'bg-card-light border-border-light'} border`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-warning" />
                <span className="font-semibold">第 {battle.questionIndex + 1} / {battle.maxQuestions} 题</span>
              </div>
              <button
                onClick={handleEndBattle}
                className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                结束对战
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className={`p-4 rounded-xl ${battle.currentTurn === 1 ? 'bg-blue-500/20 border-2 border-blue-500' : theme.isDark ? 'bg-bg-dark' : 'bg-bg-light'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-5 h-5 text-blue-500" />
                  <span className="font-semibold">{battle.player1.name}</span>
                  {battle.currentTurn === 1 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="w-3 h-3 rounded-full bg-blue-500"
                    />
                  )}
                </div>
                <div className="text-3xl font-bold text-blue-500">{battle.player1.score}</div>
                <div className="text-sm text-gray-500">得分</div>
              </div>

              <div className="flex items-center justify-center">
                <div className={`p-4 rounded-xl ${theme.isDark ? 'bg-bg-dark' : 'bg-bg-light'}`}>
                  <div className="flex items-center gap-2">
                    <Clock className={`w-5 h-5 ${battle.timeLeft <= 10 ? 'text-danger animate-pulse' : 'text-gray-500'}`} />
                    <span className={`text-2xl font-mono font-bold ${battle.timeLeft <= 10 ? 'text-danger' : ''}`}>
                      {battle.timeLeft}s
                    </span>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-xl ${battle.currentTurn === 2 ? 'bg-red-500/20 border-2 border-red-500' : theme.isDark ? 'bg-bg-dark' : 'bg-bg-light'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-5 h-5 text-red-500" />
                  <span className="font-semibold">{battle.player2.name}</span>
                  {battle.currentTurn === 2 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="w-3 h-3 rounded-full bg-red-500"
                    />
                  )}
                </div>
                <div className="text-3xl font-bold text-red-500">{battle.player2.score}</div>
                <div className="text-sm text-gray-500">得分</div>
              </div>
            </div>
          </div>

          {battle.currentQuestion && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl p-6 ${theme.isDark ? 'bg-card-dark border-border-dark' : 'bg-card-light border-border-light'} border`}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  battle.currentQuestion.type === 'single' ? 'bg-blue-100 text-blue-700' :
                  battle.currentQuestion.type === 'multiple' ? 'bg-purple-100 text-purple-700' :
                  battle.currentQuestion.type === 'judge' ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {battle.currentQuestion.type === 'single' ? '单选题' :
                   battle.currentQuestion.type === 'multiple' ? '多选题' :
                   battle.currentQuestion.type === 'judge' ? '判断题' : '简答题'}
                </span>
                {showResult && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                      lastAnswerCorrect ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
                    }`}
                  >
                    {lastAnswerCorrect ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {lastAnswerCorrect ? '回答正确！' : '回答错误'}
                  </motion.div>
                )}
              </div>

              <h3 className="text-lg font-semibold mb-6">{battle.currentQuestion.content}</h3>

              {battle.currentQuestion.options && battle.currentQuestion.options.length > 0 && (
                <div className="space-y-3">
                  {battle.currentQuestion.options.map((option, index) => {
                    const question = battle.currentQuestion!;
                    const optionKey = String.fromCharCode(65 + index);
                    const isSelected = question.type === 'multiple'
                      ? Array.isArray(selectedAnswer) && selectedAnswer.includes(optionKey)
                      : selectedAnswer === optionKey;

                    const isCorrectAnswer = question.answer === optionKey ||
                      (Array.isArray(question.answer) && question.answer.includes(optionKey));

                    return (
                      <button
                        key={optionKey}
                        onClick={() => {
                          if (showResult) return;
                          if (question.type === 'multiple') {
                            const current = Array.isArray(selectedAnswer) ? selectedAnswer : [];
                            const newSelection = isSelected
                              ? current.filter(a => a !== optionKey)
                              : [...current, optionKey].sort();
                            setSelectedAnswer(newSelection);
                          } else {
                            setSelectedAnswer(optionKey);
                          }
                        }}
                        disabled={showResult}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                          showResult
                            ? isCorrectAnswer
                              ? 'border-success bg-success/10'
                              : 'border-border-light opacity-50'
                            : isSelected
                            ? 'border-primary bg-primary/10'
                            : theme.isDark
                            ? 'border-border-dark hover:border-primary/50'
                            : 'border-border-light hover:border-primary/50'
                        }`}
                      >
                        <span className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                          showResult
                            ? isCorrectAnswer
                              ? 'bg-success text-white'
                              : isSelected
                              ? 'bg-danger text-white'
                              : theme.isDark
                              ? 'bg-bg-dark'
                              : 'bg-gray-100'
                            : isSelected
                            ? 'bg-primary text-white'
                            : theme.isDark
                            ? 'bg-bg-dark'
                            : 'bg-gray-100'
                        }`}>
                          {optionKey}
                        </span>
                        <span className="flex-1 text-left">{option}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {!showResult && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => {
                    if (!selectedAnswer) return;
                    handleAnswer(selectedAnswer);
                  }}
                  disabled={!selectedAnswer}
                  className={`w-full mt-6 py-4 rounded-xl font-bold text-lg transition-all ${
                    selectedAnswer
                      ? 'bg-gradient-to-r from-primary to-primary-dark text-white hover:opacity-90'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  确认答案
                </motion.button>
              )}

              {showResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <div className={`p-4 rounded-xl mb-4 ${theme.isDark ? 'bg-bg-dark' : 'bg-bg-light'}`}>
                    <p className="text-sm text-gray-500 mb-2">答案解析</p>
                    <p className="text-gray-700">{battle.currentQuestion.analysis}</p>
                  </div>
                  <button
                    onClick={handleNextQuestion}
                    className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary-dark transition-colors"
                  >
                    {battle.questionIndex < battle.maxQuestions - 1 ? '下一题' : '查看结果'}
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
