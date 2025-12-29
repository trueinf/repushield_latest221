import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { Dashboard } from './components/pages/Dashboard';
import { Feed } from './components/pages/Feed';
import { Topics } from './components/pages/Topics';
import { Narratives } from './components/pages/Narratives';
import { Library } from './components/pages/Library';
import { Configuration } from './components/pages/Configuration';

export type Page = 'dashboard' | 'feed' | 'topics' | 'narratives' | 'library' | 'configuration';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [timeRange, setTimeRange] = useState<string>('7d');

  const handleDashboardSearch = (keyword: string) => {
    // Navigate to Feed page after search
    setCurrentPage('feed');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard timeRange={timeRange} onSearch={handleDashboardSearch} />;
      case 'feed':
        return <Feed />;
      case 'topics':
        return <Topics />;
      case 'narratives':
        return <Narratives />;
      case 'library':
        return <Library />;
      case 'configuration':
        return <Configuration />;
      default:
        return <Dashboard timeRange={timeRange} />;
    }
  };

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#F7F9FA' }}>
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar timeRange={timeRange} onTimeRangeChange={setTimeRange} />
        
        <main className="flex-1 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}