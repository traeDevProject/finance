import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon, BookOpen, Trophy, Timer, BarChart3, FileText, ChevronRight } from 'lucide-react';
import { useQuizStore } from '@/store';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const menuItems = [
  { id: 'home', label: '首页', icon: BookOpen },
  { id: 'challenge', label: '闯关模式', icon: Trophy },
  { id: 'timer', label: '计时模式', icon: Timer },
  { id: 'wrong', label: '错题本', icon: FileText },
  { id: 'stats', label: '数据统计', icon: BarChart3 },
  { id: 'manage', label: '题库管理', icon: BookOpen },
];

export function Layout({ children, currentPage, onPageChange }: LayoutProps) {
  const { theme, toggleTheme } = useQuizStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme.isDark ? 'bg-bg-dark text-text-dark' : 'bg-bg-light text-text-light'}`}>
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b ${theme.isDark ? 'bg-bg-dark/95 border-border-dark' : 'bg-card-light/95 border-border-light'} shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-primary tracking-tight">CCTV2财经题库</h1>
                <p className="text-xs text-gray-500">专业财经知识学习平台</p>
              </div>
            </div>

            <nav className="hidden lg:flex items-center gap-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onPageChange(item.id)}
                    className={`relative flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300 ${
                      currentPage === item.id
                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                        : theme.isDark
                        ? 'hover:bg-card-dark text-text-dark hover:shadow-md'
                        : 'hover:bg-gray-100 text-text-light hover:shadow-md'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium text-sm md:text-base">{item.label}</span>
                    {currentPage === item.id && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-white/30 rounded-full"
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className={`p-3 rounded-xl transition-all duration-200 ${theme.isDark ? 'hover:bg-card-dark hover:shadow-md' : 'hover:bg-gray-100 hover:shadow-md'}`}
                aria-label="切换主题"
              >
                {theme.isDark ? <Sun className="w-6 h-6 text-yellow-400" /> : <Moon className="w-6 h-6 text-gray-600" />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-3 rounded-xl transition-all duration-200 hover:bg-gray-100"
                aria-label="菜单"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`lg:hidden border-b ${theme.isDark ? 'border-border-dark bg-bg-dark/95' : 'border-border-light bg-card-light/95'} backdrop-blur-md`}
          >
            <nav className="px-4 py-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onPageChange(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-200 ${
                      currentPage === item.id
                        ? 'bg-primary text-white'
                        : theme.isDark
                        ? 'hover:bg-card-dark'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="font-semibold text-lg">{item.label}</span>
                    {currentPage === item.id && <ChevronRight className="w-5 h-5 ml-auto" />}
                  </button>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className={`mt-auto py-8 border-t ${theme.isDark ? 'border-border-dark' : 'border-border-light'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-primary">CCTV2财经题库</span>
            </div>
            <p className={`text-sm ${theme.isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              © 2024 央视财经 - 专业财经知识学习平台
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
