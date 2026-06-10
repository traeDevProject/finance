import { motion } from 'framer-motion';
import { BookOpen, Trophy, Timer, FileText, BarChart3, TrendingUp, Target, Award, Flame } from 'lucide-react';
import { useQuizStore } from '@/store';
import { CATEGORIES } from '@/types';

interface HomePageProps {
  onPageChange: (page: string) => void;
}

export function HomePage({ onPageChange }: HomePageProps) {
  const { questions, stats, theme } = useQuizStore();
  const todayStats = stats.dailyStats.find(d => d.date === new Date().toISOString().split('T')[0]);
  const todayCount = todayStats?.questionCount || 0;
  const todayCorrect = todayStats?.correctCount || 0;

  const features = [
    { id: 'challenge', icon: Trophy, title: '闯关模式', desc: '挑战不同难度关卡', color: 'bg-primary', path: 'challenge' },
    { id: 'timer', icon: Timer, title: '计时模式', desc: '限时答题挑战', color: 'bg-secondary', path: 'timer' },
    { id: 'wrong', icon: FileText, title: '错题本', desc: '复习错题查漏补缺', color: 'bg-danger', path: 'wrong' },
    { id: 'stats', icon: BarChart3, title: '数据统计', desc: '分析学习进度', color: 'bg-info', path: 'stats' },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-8 ${theme.isDark ? 'bg-gradient-to-br from-primary/20 to-info/20' : 'bg-gradient-to-br from-primary/5 to-info/5'} border ${theme.isDark ? 'border-border-dark' : 'border-border-light'}`}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">欢迎来到 CCTV2 财经题库</h1>
            <p className={`text-lg ${theme.isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              专业财经知识学习平台，助您掌握财经法规、理财知识、股市基础、创业常识
            </p>
          </div>
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-primary" />
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: TrendingUp, label: '总题目数', value: questions.length, color: 'text-primary' },
          { icon: Target, label: '今日答题', value: todayCount, color: 'text-secondary' },
          { icon: Award, label: '今日正确率', value: todayCount > 0 ? Math.round((todayCorrect / todayCount) * 100) + '%' : '-', color: 'text-success' },
          { icon: Flame, label: '连续答题', value: `${stats.streakDays}天`, color: 'text-warning' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-xl ${theme.isDark ? 'bg-card-dark border-border-dark' : 'bg-card-light border-border-light'} border`}
          >
            <stat.icon className={`w-6 h-6 ${stat.color} mb-3`} />
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className={`text-sm ${theme.isDark ? 'text-gray-500' : 'text-gray-400'}`}>{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`rounded-xl p-6 ${theme.isDark ? 'bg-card-dark border-border-dark' : 'bg-card-light border-border-light'} border`}
      >
        <h2 className="text-xl font-bold mb-6">题库分类</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => {
            const count = questions.filter(q => q.category === cat.id).length;
            return (
              <div key={cat.id} className={`p-4 rounded-lg ${theme.isDark ? 'bg-bg-dark' : 'bg-bg-light'}`}>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">{cat.name}</h3>
                <p className={`text-sm ${theme.isDark ? 'text-gray-500' : 'text-gray-400'}`}>{count} 题</p>
              </div>
            );
          })}
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {features.map((feature, index) => (
          <motion.button
            key={feature.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            onClick={() => onPageChange(feature.path)}
            className={`p-6 rounded-xl ${theme.isDark ? 'bg-card-dark border-border-dark hover:border-primary/50' : 'bg-card-light border-border-light hover:border-primary/50'} border transition-all duration-200 hover:scale-[1.02]`}
          >
            <div className={`w-12 h-12 rounded-lg ${feature.color}/10 flex items-center justify-center mb-4`}>
              <feature.icon className={`w-6 h-6 ${feature.color.replace('bg-', 'text-')}`} />
            </div>
            <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
            <p className={`text-sm ${theme.isDark ? 'text-gray-500' : 'text-gray-400'}`}>{feature.desc}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
