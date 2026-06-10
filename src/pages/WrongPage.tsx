import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, RefreshCw, Trash2, ChevronRight, BookOpen } from 'lucide-react';
import { useQuizStore } from '@/store';
import { QuestionCard } from '@/components/QuestionCard';

export function WrongPage() {
  const { stats, recordAnswer, removeWrongQuestion, theme } = useQuizStore();
  const { wrongQuestions } = stats;
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (questionId: string, answer: string | string[]) => {
    const question = wrongQuestions.find(q => q.id === questionId);
    if (!question) return;

    let isCorrect = false;
    if (Array.isArray(question.answer)) {
      isCorrect = Array.isArray(answer) &&
        answer.length === question.answer.length &&
        answer.every(a => question.answer.includes(a));
    } else {
      isCorrect = answer === question.answer;
    }

    recordAnswer(questionId, answer, isCorrect, 0);
    setShowResult(true);

    if (isCorrect) {
      removeWrongQuestion(questionId);
    }
  };

  const handleRemove = (questionId: string) => {
    removeWrongQuestion(questionId);
    if (selectedQuestion === questionId) {
      setSelectedQuestion(null);
    }
  };

  const handleRetry = (questionId: string) => {
    setSelectedQuestion(questionId);
    setShowResult(false);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className={`rounded-xl p-6 ${theme.isDark ? 'bg-card-dark border-border-dark' : 'bg-card-light border-border-light'} border`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-2">错题本</h2>
            <p className={`${theme.isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              共 {wrongQuestions.length} 道错题需要复习
            </p>
          </div>
          <div className="w-16 h-16 rounded-xl bg-danger/10 flex items-center justify-center">
            <FileText className="w-8 h-8 text-danger" />
          </div>
        </div>
      </div>

      {wrongQuestions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`rounded-2xl p-12 text-center ${theme.isDark ? 'bg-card-dark border-border-dark' : 'bg-card-light border-border-light'} border`}
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/10 flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-success" />
          </div>
          <h3 className="text-2xl font-bold mb-4">太棒了！</h3>
          <p className={`${theme.isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            暂无错题，继续保持！
          </p>
        </motion.div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`md:col-span-1 ${theme.isDark ? 'bg-card-dark border-border-dark' : 'bg-card-light border-border-light'} border rounded-xl p-4 max-h-[600px] overflow-y-auto`}
          >
            <h3 className="font-semibold mb-4">错题列表</h3>
            <div className="space-y-2">
              {wrongQuestions.map((question, index) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedQuestion === question.id
                      ? 'bg-primary/20 border border-primary'
                      : theme.isDark
                      ? 'hover:bg-bg-dark border border-transparent'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                  onClick={() => handleRetry(question.id)}
                >
                  <div className="flex items-start justify-between">
                    <p className="font-medium line-clamp-2 flex-1 mr-2">
                      {question.content}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(question.id);
                      }}
                      className="p-1 rounded hover:bg-danger/20 text-danger/70 hover:text-danger transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span className={`px-2 py-0.5 rounded-full ${
                      question.difficulty === 'easy' ? 'bg-success/10 text-success' :
                      question.difficulty === 'medium' ? 'bg-warning/10 text-warning' :
                      'bg-danger/10 text-danger'
                    }`}>
                      {question.difficulty === 'easy' ? '简单' : question.difficulty === 'medium' ? '中等' : '困难'}
                    </span>
                    <span>错误 {question.wrongCount} 次</span>
                    <span>{formatDate(question.lastWrongTime)}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-2"
          >
            {selectedQuestion ? (
              <>
                {wrongQuestions.find(q => q.id === selectedQuestion) && (
                  <QuestionCard
                    question={wrongQuestions.find(q => q.id === selectedQuestion)!}
                    showResult={showResult}
                    onAnswer={(answer) => handleAnswer(selectedQuestion!, answer)}
                    disabled={showResult}
                  />
                )}
                {showResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-center gap-4"
                  >
                    <button
                      onClick={() => {
                        setShowResult(false);
                        const currentIndex = wrongQuestions.findIndex(q => q.id === selectedQuestion);
                        if (currentIndex < wrongQuestions.length - 1) {
                          setSelectedQuestion(wrongQuestions[currentIndex + 1].id);
                        } else {
                          setSelectedQuestion(wrongQuestions[0].id);
                        }
                      }}
                      className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors flex items-center gap-2"
                    >
                      <RefreshCw className="w-5 h-5" />
                      下一题
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </motion.div>
                )}
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`rounded-xl p-12 text-center ${theme.isDark ? 'bg-card-dark border-border-dark' : 'bg-card-light border-border-light'} border`}
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">选择一道错题开始复习</h3>
                <p className={`${theme.isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  点击左侧列表中的题目进行重做
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
