import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { HomePage } from '@/pages/HomePage';
import { ChallengePage } from '@/pages/ChallengePage';
import { TimerPage } from '@/pages/TimerPage';
import { BattlePage } from '@/pages/BattlePage';
import { WrongPage } from '@/pages/WrongPage';
import { StatsPage } from '@/pages/StatsPage';
import { ManagePage } from '@/pages/ManagePage';
import { useQuizStore } from '@/store';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const { theme } = useQuizStore();

  useEffect(() => {
    if (theme.isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme.isDark]);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onPageChange={setCurrentPage} />;
      case 'challenge':
        return <ChallengePage />;
      case 'timer':
        return <TimerPage />;
      case 'battle':
        return <BattlePage />;
      case 'wrong':
        return <WrongPage />;
      case 'stats':
        return <StatsPage />;
      case 'manage':
        return <ManagePage />;
      default:
        return <HomePage onPageChange={setCurrentPage} />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

export default App;
