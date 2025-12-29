import { LayoutDashboard, Rss, Hash, BookOpen, Library as LibraryIcon, Settings, Shield } from 'lucide-react';
import type { Page } from '../App';

interface SidebarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
}

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'feed' as Page, label: 'Feed', icon: Rss },
    { id: 'topics' as Page, label: 'Topics', icon: Hash },
    { id: 'narratives' as Page, label: 'Narratives', icon: BookOpen },
    { id: 'library' as Page, label: 'Library', icon: LibraryIcon },
    { id: 'configuration' as Page, label: 'Configuration', icon: Settings },
  ];

  return (
    <aside className="w-64 flex flex-col" style={{ backgroundColor: '#3D4A52' }}>
      {/* Logo/Brand */}
      <div className="h-16 flex items-center px-5" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <Shield className="w-6 h-6 text-white" />
        <span className="ml-2.5 text-white" style={{ fontSize: '1.125rem', fontWeight: '600' }}>Repushield</span>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`
                w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-150
                ${isActive 
                  ? 'text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-opacity-20'
                }
              `}
              style={isActive ? { 
                backgroundColor: '#505D65'
              } : {}}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <Icon className="w-5 h-5" />
              <span className="ml-3" style={{ fontSize: '0.9375rem', fontWeight: '500' }}>{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      {/* Footer */}
      <div className="p-4" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div className="px-3 py-2 text-gray-400" style={{ fontSize: '0.8125rem' }}>
          v1.0.0
        </div>
      </div>
    </aside>
  );
}
