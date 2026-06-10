import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, HelpCircle, ChevronRight } from 'lucide-react';
import type { Question } from '@/types';
import { QUESTION_TYPES } from '@/types';
import { useQuizStore } from '@/store';

interface QuestionCardProps {
  question: Question;
  showResult?: boolean;
  onAnswer?: (answer: string | string[]) => void;
  disabled?: boolean;
}

export function QuestionCard({ question, showResult = false, onAnswer, disabled = false }: QuestionCardProps) {
  const { theme } = useQuizStore();
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [essayAnswer, setEssayAnswer] = useState('');

  const typeLabel = QUESTION_TYPES.find((t) => t.value === question.type)?.label || '';

  const handleOptionClick = (option: string) => {
    if (disabled || showResult) return;

    if (question.type === 'multiple') {
      setSelectedOptions((prev) =>
        prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
      );
    } else if (question.type === 'single' || question.type === 'judge') {
      setSelectedOptions([option]);
      onAnswer?.(option);
    }
  };

  const handleEssaySubmit = () => {
    if (disabled || showResult) return;
    onAnswer?.(essayAnswer);
  };

  const getOptionLabel = (index: number) => String.fromCharCode(65 + index);

  const isCorrectOption = (option: string) => {
    if (!showResult) return null;
    const answer = question.answer;
    if (Array.isArray(answer)) {
      return answer.includes(option);
    }
    return answer === option;
  };

  const isSelected = (option: string) => selectedOptions.includes(option);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-xl p-6 ${theme.isDark ? 'bg-card-dark border-border-dark' : 'bg-card-light border-border-light'} border shadow-md`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            question.difficulty === 'easy' ? 'bg-success/10 text-success' :
            question.difficulty === 'medium' ? 'bg-warning/10 text-warning' :
            'bg-danger/10 text-danger'
          }`}>
            {question.difficulty === 'easy' ? '简单' : question.difficulty === 'medium' ? '中等' : '困难'}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${theme.isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
            {typeLabel}
          </span>
        </div>
      </div>

      <h3 className="text-lg font-semibold mb-6 leading-relaxed">{question.content}</h3>

      {question.type !== 'essay' && question.options && (
        <div className="space-y-3">
          {question.options.map((option, index) => {
            const label = getOptionLabel(index);
            const correct = isCorrectOption(label);
            const selected = isSelected(label);

            let bgColor = '';
            let borderColor = '';
            let textColor = '';

            if (showResult) {
              if (correct) {
                bgColor = theme.isDark ? 'bg-success/20' : 'bg-success/10';
                borderColor = 'border-success';
                textColor = 'text-success';
              } else if (selected && !correct) {
                bgColor = theme.isDark ? 'bg-danger/20' : 'bg-danger/10';
                borderColor = 'border-danger';
                textColor = 'text-danger';
              } else {
                bgColor = theme.isDark ? 'bg-card-dark' : 'bg-gray-50';
                borderColor = theme.isDark ? 'border-border-dark' : 'border-border-light';
                textColor = theme.isDark ? 'text-text-dark' : 'text-text-light';
              }
            } else {
              if (selected) {
                bgColor = theme.isDark ? 'bg-primary/20' : 'bg-primary/10';
                borderColor = 'border-primary';
                textColor = 'text-primary';
              } else {
                bgColor = theme.isDark ? 'bg-card-dark' : 'bg-gray-50';
                borderColor = theme.isDark ? 'border-border-dark' : 'border-border-light';
                textColor = theme.isDark ? 'text-text-dark' : 'text-text-light';
              }
            }

            return (
              <motion.button
                key={label}
                onClick={() => handleOptionClick(label)}
                disabled={disabled || showResult}
                className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-200 ${bgColor} ${borderColor} ${textColor} ${disabled || showResult ? 'cursor-default' : 'cursor-pointer hover:scale-[1.02]'}`}
              >
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                  correct ? 'bg-success text-white' :
                  selected && !correct ? 'bg-danger text-white' :
                  theme.isDark ? 'bg-white/10' : 'bg-gray-200'
                }`}>
                  {correct && showResult ? <CheckCircle className="w-5 h-5" /> :
                   selected && !correct && showResult ? <XCircle className="w-5 h-5" /> :
                   label}
                </span>
                <span className="text-left flex-1">{option}</span>
                {!disabled && !showResult && <ChevronRight className="w-5 h-5 opacity-50" />}
              </motion.button>
            );
          })}
        </div>
      )}

      {question.type === 'essay' && (
        <div className="space-y-4">
          <textarea
            value={essayAnswer}
            onChange={(e) => setEssayAnswer(e.target.value)}
            disabled={disabled || showResult}
            placeholder="请输入您的答案..."
            className={`w-full h-32 p-4 rounded-lg border-2 resize-none transition-colors ${
              theme.isDark ? 'bg-card-dark border-border-dark text-text-dark placeholder-gray-500' :
              'bg-gray-50 border-border-light text-text-light placeholder-gray-400'
            } ${disabled || showResult ? 'cursor-not-allowed' : ''}`}
          />
          {!disabled && !showResult && (
            <button
              onClick={handleEssaySubmit}
              className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
            >
              提交答案
            </button>
          )}
        </div>
      )}

      {showResult && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className={`mt-6 p-4 rounded-lg ${theme.isDark ? 'bg-info/10' : 'bg-info/5'} border border-info/20`}
        >
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="w-5 h-5 text-info" />
            <span className="font-semibold text-info">答案解析</span>
          </div>
          <div className="flex items-start gap-3">
            <span className={`font-medium ${theme.isDark ? 'text-text-dark' : 'text-text-light'}`}>正确答案：</span>
            <span className="text-success font-medium">
              {Array.isArray(question.answer) ? question.answer.join('、') : question.answer}
            </span>
          </div>
          <p className={`mt-3 text-sm ${theme.isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {question.analysis}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
