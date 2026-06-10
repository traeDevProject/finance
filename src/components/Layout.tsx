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
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b ${theme.isDark ? 'bg-bg-dark/90 border-border-dark' : 'bg-card-light/90 border-border-light'} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-primary">CCTV2财经题库</h1>
                <p className="text-xs text-gray-500">专业财经知识学习平台</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    currentPage === item.id
                      ? 'bg-primary text-white'
                      : theme.isDark
                      ? 'hover:bg-card-dark text-text-dark'
                      : 'hover:bg-gray-100 text-text-light'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                  {currentPage === item.id && <ChevronRight className="w-4 h-4" />}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors ${theme.isDark ? 'hover:bg-card-dark' : 'hover:bg-gray-100'}`}
                aria-label="切换主题"
              >
                {theme.isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg transition-colors hover:bg-gray-100"
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
            className={`md:hidden border-b ${theme.isDark ? 'border-border-dark bg-bg-dark' : 'border-border-light bg-card-light'}`}
          >
            <nav className="px-4 py-2 space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onPageChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    currentPage === item.id
                      ? 'bg-primary text-white'
                      : theme.isDark
                      ? 'hover:bg-card-dark'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
