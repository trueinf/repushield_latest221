import { Search, Bell, User, Calendar } from 'lucide-react';

interface TopBarProps {
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
}

export function TopBar({ timeRange, onTimeRangeChange }: TopBarProps) {
  const timeRanges = [
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
  ];

  return (
    <header className="h-16 bg-white flex items-center justify-between px-6" style={{ borderBottom: '1px solid #E0E6EA' }}>
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9FAAB3' }} />
          <input
            type="text"
            placeholder="Search entities, posts, topics..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border transition-all"
            style={{ 
              border: '1px solid #E0E6EA',
              backgroundColor: 'white',
              color: '#1A1F26',
              fontSize: '0.875rem'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#0084BF';
              e.target.style.outline = 'none';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#E0E6EA';
            }}
          />
        </div>
      </div>
      
      <div className="flex items-center gap-3 ml-6">
        {/* Time Range Selector */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border" style={{ backgroundColor: 'white', border: '1px solid #E0E6EA' }}>
          <Calendar className="w-4 h-4" style={{ color: '#7A8A94' }} />
          <select
            value={timeRange}
            onChange={(e) => onTimeRangeChange(e.target.value)}
            className="border-none bg-transparent focus:outline-none cursor-pointer"
            style={{ color: '#3D4A52', fontSize: '0.875rem', fontWeight: '500' }}
          >
            {timeRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors" style={{ color: '#5C6C75' }}>
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ backgroundColor: '#E74C3C' }}></span>
        </button>
        
        {/* User Menu */}
        <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#0084BF' }}>
            <User className="w-4 h-4 text-white" />
          </div>
        </button>
      </div>
    </header>
  );
}
