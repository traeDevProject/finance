import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Upload, Download, Search, X, Save } from 'lucide-react';
import { useQuizStore } from '@/store';
import { CATEGORIES, QUESTION_TYPES } from '@/types';
import type { Question, QuestionType, QuestionCategory } from '@/types';

export function ManagePage() {
  const { questions, addQuestion, updateQuestion, deleteQuestion, importQuestions, exportQuestions, theme } = useQuizStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory | 'all'>('all');
  const [selectedType, setSelectedType] = useState<QuestionType | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState({
    type: 'single' as QuestionType,
    category: 'finance_law' as QuestionCategory,
    difficulty: 'easy' as 'easy' | 'medium' | 'hard',
    content: '',
    options: ['', '', '', ''],
    answer: '',
    analysis: '',
  });
  const [fileInput, setFileInput] = useState<HTMLInputElement | null>(null);

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || q.category === selectedCategory;
    const matchesType = selectedType === 'all' || q.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const handleSubmit = () => {
    if (!formData.content.trim() || !formData.answer.trim() || !formData.analysis.trim()) {
      alert('请填写完整信息');
      return;
    }

    const question: Question = {
      id: editingQuestion?.id || `q${Date.now()}`,
      type: formData.type,
      category: formData.category,
      difficulty: formData.difficulty,
      content: formData.content,
      options: formData.type !== 'essay' ? formData.options.filter(o => o.trim()) : undefined,
      answer: formData.type === 'multiple' 
        ? formData.answer.split(',').map(a => a.trim()).filter(Boolean)
        : formData.answer,
      analysis: formData.analysis,
    };

    if (editingQuestion) {
      updateQuestion(question.id, question);
    } else {
      addQuestion(question);
    }

    resetForm();
    setShowModal(false);
  };

  const resetForm = () => {
    setFormData({
      type: 'single',
      category: 'finance_law',
      difficulty: 'easy',
      content: '',
      options: ['', '', '', ''],
      answer: '',
      analysis: '',
    });
    setEditingQuestion(null);
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      type: question.type,
      category: question.category,
      difficulty: question.difficulty,
      content: question.content,
      options: question.options || ['', '', '', ''],
      answer: Array.isArray(question.answer) ? question.answer.join(', ') : question.answer,
      analysis: question.analysis,
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这道题目吗？')) {
      deleteQuestion(id);
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedQuestions = JSON.parse(event.target?.result as string);
        if (Array.isArray(importedQuestions)) {
          importQuestions(importedQuestions);
          alert('导入成功');
        } else {
          alert('文件格式不正确');
        }
      } catch {
        alert('文件解析失败');
      }
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    const data = exportQuestions();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `questions_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderQuestionItem = (question: Question, index: number) => (
    <motion.div
      key={question.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.02 }}
      className={`flex items-center gap-4 p-4 border-b ${theme.isDark ? 'border-border-dark hover:bg-bg-dark' : 'border-border-light hover:bg-gray-50'} transition-colors`}
    >
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{question.content}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`px-2 py-0.5 rounded text-xs ${
            question.difficulty === 'easy' ? 'bg-success/10 text-success' :
            question.difficulty === 'medium' ? 'bg-warning/10 text-warning' :
            'bg-danger/10 text-danger'
          }`}>
            {question.difficulty === 'easy' ? '简单' : question.difficulty === 'medium' ? '中等' : '困难'}
          </span>
          <span className={`px-2 py-0.5 rounded text-xs ${theme.isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
            {CATEGORIES.find(c => c.id === question.category)?.name}
          </span>
          <span className={`px-2 py-0.5 rounded text-xs ${theme.isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
            {QUESTION_TYPES.find(t => t.value === question.type)?.label}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleEdit(question)}
          className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
          title="编辑"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleDelete(question.id)}
          className="p-2 rounded-lg hover:bg-danger/10 text-danger transition-colors"
          title="删除"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      <div className={`rounded-xl p-6 ${theme.isDark ? 'bg-card-dark border-border-dark' : 'bg-card-light border-border-light'} border`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">题库管理</h2>
            <p className={`${theme.isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              共 {questions.length} 道题目
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
              ref={(el) => setFileInput(el)}
            />
            <button
              onClick={() => fileInput?.click()}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              导入题库
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              导出题库
            </button>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              添加题目
            </button>
          </div>
        </div>
      </div>

      <div className={`rounded-xl p-4 ${theme.isDark ? 'bg-card-dark border-border-dark' : 'bg-card-light border-border-light'} border`}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme.isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="搜索题目内容..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${theme.isDark ? 'bg-bg-dark border-border-dark text-text-dark placeholder-gray-500' : 'bg-white border-border-light text-text-light placeholder-gray-400'} focus:outline-none focus:border-primary`}
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as QuestionCategory | 'all')}
              className={`px-4 py-2 rounded-lg border ${theme.isDark ? 'bg-bg-dark border-border-dark text-text-dark' : 'bg-white border-border-light text-text-light'} focus:outline-none focus:border-primary`}
            >
              <option value="all">全部分类</option>
              {CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as QuestionType | 'all')}
              className={`px-4 py-2 rounded-lg border ${theme.isDark ? 'bg-bg-dark border-border-dark text-text-dark' : 'bg-white border-border-light text-text-light'} focus:outline-none focus:border-primary`}
            >
              <option value="all">全部题型</option>
              {QUESTION_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className={`rounded-xl ${theme.isDark ? 'bg-card-dark border-border-dark' : 'bg-card-light border-border-light'} border overflow-hidden`}>
        {filteredQuestions.length > 0 ? (
          <div className="max-h-[600px] overflow-y-auto">
            {filteredQuestions.map((question, index) => renderQuestionItem(question, index))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className={`${theme.isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              暂无匹配的题目
            </p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowModal(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`w-full max-w-2xl rounded-xl p-6 ${theme.isDark ? 'bg-card-dark border-border-dark' : 'bg-card-light border-border-light'} border max-h-[90vh] overflow-y-auto`}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">{editingQuestion ? '编辑题目' : '添加题目'}</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme.isDark ? 'text-gray-300' : 'text-gray-700'}`}>题型</label>
                    <select
                      value={formData.type}
                      onChange={(e) => {
                        const newType = e.target.value as QuestionType;
                        setFormData(prev => ({ ...prev, type: newType }));
                      }}
                      className={`w-full px-4 py-2 rounded-lg border ${theme.isDark ? 'bg-bg-dark border-border-dark text-text-dark' : 'bg-white border-border-light text-text-light'} focus:outline-none focus:border-primary`}
                    >
                      {QUESTION_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme.isDark ? 'text-gray-300' : 'text-gray-700'}`}>分类</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as QuestionCategory }))}
                      className={`w-full px-4 py-2 rounded-lg border ${theme.isDark ? 'bg-bg-dark border-border-dark text-text-dark' : 'bg-white border-border-light text-text-light'} focus:outline-none focus:border-primary`}
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme.isDark ? 'text-gray-300' : 'text-gray-700'}`}>难度</label>
                  <div className="flex gap-2">
                    {(['easy', 'medium', 'hard'] as const).map((diff) => (
                      <button
                        key={diff}
                        onClick={() => setFormData(prev => ({ ...prev, difficulty: diff }))}
                        className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                          formData.difficulty === diff
                            ? diff === 'easy' ? 'bg-success/20 border-success text-success' :
                              diff === 'medium' ? 'bg-warning/20 border-warning text-warning' :
                              'bg-danger/20 border-danger text-danger'
                            : theme.isDark
                            ? 'bg-bg-dark border-border-dark hover:border-border-light'
                            : 'bg-white border-border-light hover:border-gray-300'
                        }`}
                      >
                        {diff === 'easy' ? '简单' : diff === 'medium' ? '中等' : '困难'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme.isDark ? 'text-gray-300' : 'text-gray-700'}`}>题目内容</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="请输入题目内容..."
                    className={`w-full px-4 py-3 rounded-lg border resize-none ${theme.isDark ? 'bg-bg-dark border-border-dark text-text-dark placeholder-gray-500' : 'bg-white border-border-light text-text-light placeholder-gray-400'} focus:outline-none focus:border-primary`}
                    rows={3}
                  />
                </div>

                {formData.type !== 'essay' && (
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme.isDark ? 'text-gray-300' : 'text-gray-700'}`}>选项（至少2个）</label>
                    <div className="space-y-2">
                      {formData.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${theme.isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
                            {String.fromCharCode(65 + index)}
                          </span>
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...formData.options];
                              newOptions[index] = e.target.value;
                              setFormData(prev => ({ ...prev, options: newOptions }));
                            }}
                            placeholder={`选项 ${String.fromCharCode(65 + index)}`}
                            className={`flex-1 px-4 py-2 rounded-lg border ${theme.isDark ? 'bg-bg-dark border-border-dark text-text-dark placeholder-gray-500' : 'bg-white border-border-light text-text-light placeholder-gray-400'} focus:outline-none focus:border-primary`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme.isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    正确答案
                    {formData.type === 'multiple' && <span className="text-gray-400 font-normal">（多选答案用逗号分隔，如：A, B, C）</span>}
                    {formData.type === 'judge' && <span className="text-gray-400 font-normal">（填写：正确 或 错误）</span>}
                  </label>
                  <input
                    type="text"
                    value={formData.answer}
                    onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                    placeholder={formData.type === 'multiple' ? '如：A, B, C' : formData.type === 'judge' ? '正确 或 错误' : '如：A'}
                    className={`w-full px-4 py-2 rounded-lg border ${theme.isDark ? 'bg-bg-dark border-border-dark text-text-dark placeholder-gray-500' : 'bg-white border-border-light text-text-light placeholder-gray-400'} focus:outline-none focus:border-primary`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme.isDark ? 'text-gray-300' : 'text-gray-700'}`}>答案解析</label>
                  <textarea
                    value={formData.analysis}
                    onChange={(e) => setFormData(prev => ({ ...prev, analysis: e.target.value }))}
                    placeholder="请输入答案解析..."
                    className={`w-full px-4 py-3 rounded-lg border resize-none ${theme.isDark ? 'bg-bg-dark border-border-dark text-text-dark placeholder-gray-500' : 'bg-white border-border-light text-text-light placeholder-gray-400'} focus:outline-none focus:border-primary`}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 rounded-lg font-medium transition-colors hover:bg-gray-100"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {editingQuestion ? '保存修改' : '添加题目'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
