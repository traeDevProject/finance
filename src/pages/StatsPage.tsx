import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Award, Flame, Calendar, PieChart, Radar } from 'lucide-react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { LineChart, PieChart as EChartsPieChart, RadarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent, RadarComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { useQuizStore } from '@/store';
import { CATEGORIES, QUESTION_TYPES } from '@/types';

echarts.use([
  LineChart,
  EChartsPieChart,
  RadarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  RadarComponent,
  CanvasRenderer,
]);

export function StatsPage() {
  const { stats, theme } = useQuizStore();
  const chartRef = useRef<ReactEChartsCore>(null);

  const totalAccuracy = stats.totalQuestions > 0
    ? Math.round((stats.correctCount / stats.totalQuestions) * 100)
    : 0;

  const dailyChartData = () => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const stat = stats.dailyStats.find(d => d.date === dateStr);
      last7Days.push({
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        count: stat?.questionCount || 0,
      });
    }
    return last7Days;
  };

  const lineChartOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: theme.isDark ? 'rgba(37, 37, 66, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      borderColor: theme.isDark ? '#374151' : '#E5E7EB',
      textStyle: {
        color: theme.isDark ? '#E5E7EB' : '#1F2937',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: dailyChartData().map(d => d.date),
      axisLine: { lineStyle: { color: theme.isDark ? '#475569' : '#CBD5E1' } },
      axisLabel: { color: theme.isDark ? '#9CA3AF' : '#6B7280' },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: theme.isDark ? '#475569' : '#CBD5E1' } },
      axisLabel: { color: theme.isDark ? '#9CA3AF' : '#6B7280' },
      splitLine: { lineStyle: { color: theme.isDark ? '#374151' : '#F3F4F6' } },
    },
    series: [
      {
        name: '答题数量',
        type: 'line',
        smooth: true,
        data: dailyChartData().map(d => d.count),
        lineStyle: { color: '#165DFF', width: 3 },
        itemStyle: { color: '#165DFF' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(22, 93, 255, 0.3)' },
            { offset: 1, color: 'rgba(22, 93, 255, 0.05)' },
          ]),
        },
      },
    ],
  };

  const pieChartOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: theme.isDark ? 'rgba(37, 37, 66, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      borderColor: theme.isDark ? '#374151' : '#E5E7EB',
      textStyle: {
        color: theme.isDark ? '#E5E7EB' : '#1F2937',
      },
      formatter: '{b}: {c}题 ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: theme.isDark ? '#E5E7EB' : '#1F2937' },
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: theme.isDark ? '#252542' : '#FFFFFF',
          borderWidth: 2,
        },
        label: { show: false },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
            color: theme.isDark ? '#E5E7EB' : '#1F2937',
          },
        },
        labelLine: { show: false },
        data: QUESTION_TYPES.map((type, index) => {
          const stat = stats.typeStats[type.value];
          const colors = ['#165DFF', '#FF6B35', '#00B42A', '#8F5CF6'];
          return {
            value: stat.total,
            name: type.label,
            itemStyle: { color: colors[index] },
          };
        }).filter(d => d.value > 0),
      },
    ],
  };

  const radarChartOption = {
    backgroundColor: 'transparent',
    radar: {
      indicator: CATEGORIES.map(cat => ({
        name: cat.name,
        max: 100,
      })),
      shape: 'polygon',
      splitNumber: 5,
      axisName: { color: theme.isDark ? '#E5E7EB' : '#1F2937' },
      splitLine: { lineStyle: { color: theme.isDark ? '#374151' : '#E5E7EB' } },
      splitArea: { areaStyle: { color: theme.isDark ? ['rgba(22, 93, 255, 0.05)', 'rgba(22, 93, 255, 0.1)'] : ['rgba(22, 93, 255, 0.02)', 'rgba(22, 93, 255, 0.05)'] } },
      axisLine: { lineStyle: { color: theme.isDark ? '#475569' : '#CBD5E1' } },
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: CATEGORIES.map(cat => {
              const stat = stats.categoryStats[cat.id];
              return stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
            }),
            name: '掌握度',
            areaStyle: { color: 'rgba(22, 93, 255, 0.2)' },
            lineStyle: { color: '#165DFF', width: 2 },
            itemStyle: { color: '#165DFF' },
          },
        ],
      },
    ],
  };

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.getEchartsInstance().resize();
    }
  }, [theme.isDark]);

  return (
    <div className="space-y-6">
      <div className={`rounded-xl p-6 ${theme.isDark ? 'bg-card-dark border-border-dark' : 'bg-card-light border-border-light'} border`}>
        <h2 className="text-xl font-bold">数据统计</h2>
        <p className={`${theme.isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          分析您的学习进度和答题表现
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Target, label: '总答题数', value: stats.totalQuestions, color: 'text-primary', bg: 'bg-primary/10' },
          { icon: Award, label: '正确数', value: stats.correctCount, color: 'text-success', bg: 'bg-success/10' },
          { icon: TrendingUp, label: '正确率', value: `${totalAccuracy}%`, color: 'text-secondary', bg: 'bg-secondary/10' },
          { icon: Flame, label: '连续天数', value: `${stats.streakDays}天`, color: 'text-warning', bg: 'bg-warning/10' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-xl ${theme.isDark ? 'bg-card-dark border-border-dark' : 'bg-card-light border-border-light'} border`}
          >
            <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className={`text-sm ${theme.isDark ? 'text-gray-500' : 'text-gray-400'}`}>{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`rounded-xl p-6 ${theme.isDark ? 'bg-card-dark border-border-dark' : 'bg-card-light border-border-light'} border`}
        >
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">近7天答题数量</h3>
          </div>
          <div className="h-64">
            <ReactEChartsCore echarts={echarts} option={lineChartOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`rounded-xl p-6 ${theme.isDark ? 'bg-card-dark border-border-dark' : 'bg-card-light border-border-light'} border`}
        >
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-secondary" />
            <h3 className="font-semibold">各题型答题分布</h3>
          </div>
          <div className="h-64">
            <ReactEChartsCore echarts={echarts} option={pieChartOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={`rounded-xl p-6 ${theme.isDark ? 'bg-card-dark border-border-dark' : 'bg-card-light border-border-light'} border`}
      >
        <div className="flex items-center gap-2 mb-4">
          <Radar className="w-5 h-5 text-info" />
          <h3 className="font-semibold">知识维度掌握度</h3>
        </div>
        <div className="h-80">
          <ReactEChartsCore echarts={echarts} option={radarChartOption} style={{ height: '100%', width: '100%' }} />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={`rounded-xl p-6 ${theme.isDark ? 'bg-card-dark border-border-dark' : 'bg-card-light border-border-light'} border`}
      >
        <h3 className="font-semibold mb-4">闯关进度</h3>
        <div className="space-y-4">
          {[
            { name: '初级挑战', progress: stats.levelProgress[1] ? 100 : 0, unlocked: true, passed: stats.levelProgress[1] },
            { name: '中级进阶', progress: stats.levelProgress[2] ? 100 : (stats.levelProgress[1] ? 0 : -1), unlocked: !!stats.levelProgress[1], passed: stats.levelProgress[2] },
            { name: '高级精通', progress: stats.levelProgress[3] ? 100 : (stats.levelProgress[2] ? 0 : -1), unlocked: !!stats.levelProgress[2], passed: stats.levelProgress[3] },
          ].map((level, index) => (
            <div key={level.name}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{level.name}</span>
                <span className={level.passed ? 'text-success' : level.unlocked ? 'text-gray-500' : 'text-gray-600'}>
                  {level.passed ? '已通过' : level.unlocked ? '进行中' : '未解锁'}
                </span>
              </div>
              <div className="h-3 rounded-full bg-gray-200 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${level.progress >= 0 ? level.progress : 0}%` }}
                  transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                  className={`h-full ${level.passed ? 'bg-success' : level.unlocked ? 'bg-primary' : 'bg-gray-400'}`}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
