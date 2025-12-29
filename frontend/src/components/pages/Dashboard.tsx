import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, Loader2, Search } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { searchPosts } from '../../utils/api';

interface DashboardProps {
  timeRange: string;
  onSearch?: (keyword: string) => void; // Callback to navigate to Feed page
}

interface DashboardData {
  totalMentions: number;
  platformData: Array<{ platform: string; mentions: number; score: number }>;
  riskData: { high: number; medium: number; low: number };
  mentionsOverTime: Array<{ date: string; mentions: number }>;
  averageScore?: number; // Average of all scores (reputation index)
  topTopics?: Array<{ name: string; volume: number; riskScore: number; sentiment: { positive: number; neutral: number; negative: number } }>;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const platformColors: Record<string, string> = {
  'twitter': '#3498DB',
  'X (Twitter)': '#3498DB',
  'reddit': '#F39C12',
  'Reddit': '#F39C12',
  'facebook': '#1877F2',
  'Facebook': '#1877F2',
  'news': '#E74C3C',
  'News': '#E74C3C',
  'youtube': '#E74C3C',
  'YouTube': '#E74C3C',
  'instagram': '#2ECC71',
  'Instagram': '#2ECC71',
};

export function Dashboard({ timeRange, onSearch }: DashboardProps) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState<boolean>(false);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard?timeRange=${timeRange}`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const result = await response.json();
      if (result.success && result.data) {
        setDashboardData(result.data);
      } else {
        // Use default/mock data if no data available
        setDashboardData({
          totalMentions: 0,
          platformData: [],
          riskData: { high: 0, medium: 0, low: 0 },
          mentionsOverTime: [],
        });
      }
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
      // Use default data on error
      setDashboardData({
        totalMentions: 0,
        platformData: [],
        riskData: { high: 0, medium: 0, low: 0 },
        mentionsOverTime: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!searchKeyword.trim()) {
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const response = await searchPosts(searchKeyword.trim());
      
      if (response.success) {
        // Store search results in localStorage for Feed page
        try {
          localStorage.setItem('feed_search_results', JSON.stringify(response.posts));
          localStorage.setItem('feed_search_keyword', searchKeyword.trim());
          localStorage.setItem('feed_has_searched', 'true');
        } catch (error) {
          console.error('Error saving search to localStorage:', error);
        }
        
        // Navigate to Feed page if callback provided
        if (onSearch) {
          onSearch(searchKeyword.trim());
        }
      } else {
        setSearchError('Search failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Search error:', error);
      setSearchError(error.message || 'Failed to search. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearData = async () => {
    // Confirmation dialog
    const confirmed = window.confirm(
      '⚠️ WARNING: This will permanently delete ALL data from the database.\n\n' +
      'This includes:\n' +
      '• All posts\n' +
      '• All users\n' +
      '• All entities and hashtags\n' +
      '• All media/images\n' +
      '• All evidence\n' +
      '• All admin responses\n\n' +
      'This action cannot be undone!\n\n' +
      'Are you sure you want to continue?'
    );

    if (!confirmed) {
      return;
    }

    setIsClearing(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/clear`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Clear the dashboard data and refresh
        setDashboardData({
          totalMentions: 0,
          platformData: [],
          riskData: { high: 0, medium: 0, low: 0 },
          mentionsOverTime: [],
        });
        alert('✅ All data has been cleared successfully!');
        // Refresh the dashboard
        await fetchDashboardData();
      } else {
        throw new Error(result.error || 'Failed to clear data');
      }
    } catch (err: any) {
      console.error('Error clearing data:', err);
      setError(err.message || 'Failed to clear data');
      alert(`❌ Error: ${err.message || 'Failed to clear data'}`);
    } finally {
      setIsClearing(false);
    }
  };

  // Calculate reputation index from average of all scores (1-10 scale)
  // The reputation index is the average score of all posts
  // Lower average = better reputation (more positive posts), Higher average = worse reputation (more negative posts)
  const reputationIndex = dashboardData
    ? dashboardData.averageScore !== undefined 
      ? Math.round(dashboardData.averageScore * 10) / 10 // Round to 1 decimal place, ensure it's between 1-10
      : 5 // Default to neutral (5) if no average score available
    : 5;
  
  const reputationTrend = +5.2; // TODO: Calculate from historical data
  
  const platformData = dashboardData?.platformData.map((p) => ({
    platform: p.platform === 'twitter' ? 'X (Twitter)' : p.platform.charAt(0).toUpperCase() + p.platform.slice(1),
    score: p.score,
    mentions: p.mentions,
    color: platformColors[p.platform] || platformColors[p.platform.toLowerCase()] || '#9FAAB3',
  })) || [];

  const mentionsData = dashboardData?.mentionsOverTime || [];

  const riskData = dashboardData
    ? [
        { name: 'High Risk', value: dashboardData.riskData.high, color: '#E74C3C' },
        { name: 'Medium Risk', value: dashboardData.riskData.medium, color: '#F39C12' },
        { name: 'Low Risk', value: dashboardData.riskData.low, color: '#2ECC71' },
      ]
    : [
        { name: 'High Risk', value: 12, color: '#E74C3C' },
        { name: 'Medium Risk', value: 34, color: '#F39C12' },
        { name: 'Low Risk', value: 87, color: '#2ECC71' },
      ];

  // Use real top topics from dashboard data, or empty array if not available
  const topTopics = dashboardData?.topTopics || [];

  const narratives = [
    { title: 'Party out of touch with working class voters', criticality: 78, trend: 'rising', posts: 67 },
    { title: 'Strong record on job creation and economic growth', criticality: 25, trend: 'stable', posts: 45 },
    { title: 'Immigration stance too extreme for moderates', criticality: 64, trend: 'rising', posts: 52 },
    { title: 'Leading on climate action and clean energy', criticality: 20, trend: 'declining', posts: 38 },
  ];

  const alerts = [
    { id: 1, message: 'High-risk spike detected on X', severity: 'high', time: '2 hours ago', status: 'open' },
    { id: 2, message: 'Negative narrative trending upward', severity: 'medium', time: '5 hours ago', status: 'in-progress' },
    { id: 3, message: 'Unusual mention volume on Reddit', severity: 'medium', time: '8 hours ago', status: 'resolved' },
  ];

  const getRiskColor = (score: number) => {
    // 1-10 scale: 1=positive, 10=negative
    if (score >= 8) return '#E74C3C'; // High risk (8-10)
    if (score >= 4) return '#F39C12'; // Medium risk (4-7)
    return '#2ECC71'; // Low risk (1-3)
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: '#0084BF' }} />
          <p style={{ color: '#7A8A94' }}>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 style={{ color: '#1A1F26', fontWeight: '600', fontSize: '1.5rem' }}>Dashboard</h1>
            <p style={{ color: '#5C6C75', fontSize: '0.875rem' }} className="mt-1">At-a-glance view of reputation health and risk</p>
          </div>
          <button
            onClick={handleClearData}
            disabled={isClearing}
            className="px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: isClearing ? '#9CA3AF' : '#DC2626',
              color: 'white',
              fontSize: '0.875rem',
            }}
            onMouseEnter={(e) => {
              if (!isClearing) {
                e.currentTarget.style.backgroundColor = '#B91C1C';
              }
            }}
            onMouseLeave={(e) => {
              if (!isClearing) {
                e.currentTarget.style.backgroundColor = '#DC2626';
              }
            }}
          >
            {isClearing ? (
              <>
                <Loader2 className="w-4 h-4 inline-block animate-spin mr-2" />
                Clearing...
              </>
            ) : (
              'Clear All Data'
            )}
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#7A8A94' }} />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Search for posts by keyword, name, or topic..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ 
                  border: '1px solid #E0E6EA', 
                  color: '#3D4A52', 
                  fontSize: '0.875rem',
                  backgroundColor: 'white'
                }}
                disabled={isSearching}
              />
            </div>
            <button
              type="submit"
              disabled={isSearching || !searchKeyword.trim()}
              className="px-6 py-2.5 rounded-lg text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
              style={{ 
                backgroundColor: isSearching || !searchKeyword.trim() ? '#9CA3AF' : '#0084BF'
              }}
            >
              {isSearching ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Searching...
                </span>
              ) : (
                'Search'
              )}
            </button>
          </div>
          {searchError && (
            <p className="mt-2 text-sm" style={{ color: '#DC2626' }}>
              {searchError}
            </p>
          )}
        </form>
      </div>

      {/* Reputation Health Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-5" style={{ boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.08)' }}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p style={{ color: '#7A8A94', fontSize: '0.8125rem', fontWeight: '500' }}>Global Reputation Index</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span style={{ color: '#1A1F26', fontSize: '2rem', fontWeight: '600', lineHeight: '1' }}>{reputationIndex}</span>
                <span style={{ color: '#9FAAB3', fontSize: '0.875rem' }}>/10</span>
              </div>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded" style={{ backgroundColor: '#D4EDDA', color: '#2ECC71', fontSize: '0.8125rem', fontWeight: '600' }}>
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{Math.abs(reputationTrend)}%</span>
            </div>
          </div>
          <div className="mt-4 h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#E0E6EA' }}>
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${(reputationIndex / 10) * 100}%`,
                backgroundColor: '#0084BF'
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg p-5" style={{ boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.08)' }}>
          <p style={{ color: '#7A8A94', fontSize: '0.8125rem', fontWeight: '500' }}>Total Mentions</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span style={{ color: '#1A1F26', fontSize: '2rem', fontWeight: '600', lineHeight: '1' }}>
              {dashboardData?.totalMentions.toLocaleString() || '0'}
            </span>
            <span className="flex items-center gap-1" style={{ color: '#2ECC71', fontSize: '0.8125rem', fontWeight: '600' }}>
              <TrendingUp className="w-3.5 h-3.5" />
              <span>12%</span>
            </span>
          </div>
          <p style={{ color: '#9FAAB3', fontSize: '0.8125rem' }} className="mt-2">vs previous {timeRange}</p>
        </div>

        <div className="bg-white rounded-lg p-5" style={{ boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.08)' }}>
          <p style={{ color: '#7A8A94', fontSize: '0.8125rem', fontWeight: '500' }}>Active Alerts</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span style={{ color: '#1A1F26', fontSize: '2rem', fontWeight: '600', lineHeight: '1' }}>{alerts.filter(a => a.status !== 'resolved').length}</span>
            <span style={{ color: '#9FAAB3', fontSize: '0.875rem' }}>/ {alerts.length} total</span>
          </div>
          <p style={{ color: '#9FAAB3', fontSize: '0.8125rem' }} className="mt-2">{alerts.filter(a => a.severity === 'high').length} high priority</p>
        </div>
      </div>

      {/* Platform Breakdown & Mentions Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-5" style={{ boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.08)' }}>
          <h2 style={{ color: '#1A1F26', fontWeight: '600', fontSize: '1.0625rem' }} className="mb-4">Platform Breakdown</h2>
          <div className="space-y-4">
            {platformData.map((platform) => (
              <div key={platform.platform}>
                <div className="flex items-center justify-between mb-1.5">
                  <span style={{ color: '#3D4A52', fontSize: '0.875rem', fontWeight: '500' }}>{platform.platform}</span>
                  <div className="flex items-center gap-3">
                    <span style={{ color: '#7A8A94', fontSize: '0.8125rem' }}>{platform.mentions} mentions</span>
                    <span style={{ color: '#1A1F26', fontWeight: '600', fontSize: '0.875rem' }}>{platform.score}</span>
                  </div>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#F0F3F5' }}>
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${platform.score}%`, backgroundColor: platform.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg p-5" style={{ boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.08)' }}>
          <h2 style={{ color: '#1A1F26', fontWeight: '600', fontSize: '1.0625rem' }} className="mb-4">Mentions Over Time</h2>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={mentionsData}>
              <defs>
                <linearGradient id="colorMentions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0084BF" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#0084BF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E6EA" />
              <XAxis dataKey="date" stroke="#9FAAB3" style={{ fontSize: '0.75rem' }} />
              <YAxis stroke="#9FAAB3" style={{ fontSize: '0.75rem' }} />
              <Tooltip />
              <Area type="monotone" dataKey="mentions" stroke="#0084BF" strokeWidth={2} fill="url(#colorMentions)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Risk Snapshot & Top Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-5" style={{ boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.08)' }}>
          <h2 style={{ color: '#1A1F26', fontWeight: '600', fontSize: '1.0625rem' }} className="mb-4">Risk & Severity Snapshot</h2>
          <div className="flex items-center gap-8">
            <div className="flex-shrink-0">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {riskData.map((risk) => (
                <div key={risk.name} className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: risk.color }} />
                  <span style={{ color: '#3D4A52', fontSize: '0.875rem' }}>{risk.name}</span>
                  <span style={{ color: '#1A1F26', fontWeight: '600', fontSize: '0.875rem' }} className="ml-auto">{risk.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-5" style={{ boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.08)' }}>
          <h2 style={{ color: '#1A1F26', fontWeight: '600', fontSize: '1.0625rem' }} className="mb-4">Top Topics</h2>
          <div className="space-y-2.5">
            {topTopics.map((topic, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer" style={{ border: '1px solid #E0E6EA' }}>
                <div className="flex-1">
                  <div className="flex items-center gap-2.5">
                    <span style={{ color: '#1A1F26', fontWeight: '500', fontSize: '0.875rem' }}>{topic.name}</span>
                    <span className="px-2 py-0.5 rounded text-white" style={{ 
                      backgroundColor: getRiskColor(topic.riskScore),
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      {topic.riskScore}
                    </span>
                  </div>
                  <p style={{ color: '#7A8A94', fontSize: '0.8125rem' }} className="mt-0.5">{topic.volume} mentions</p>
                </div>
                <div className="flex gap-1">
                  <div className="w-1.5 rounded-full" style={{ backgroundColor: '#2ECC71', height: `${topic.sentiment.positive / 2}px` }} />
                  <div className="w-1.5 rounded-full" style={{ backgroundColor: '#9FAAB3', height: `${topic.sentiment.neutral / 2}px` }} />
                  <div className="w-1.5 rounded-full" style={{ backgroundColor: '#E74C3C', height: `${topic.sentiment.negative / 2}px` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Narratives & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-5" style={{ boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.08)' }}>
          <h2 style={{ color: '#1A1F26', fontWeight: '600', fontSize: '1.0625rem' }} className="mb-4">Active Narratives</h2>
          <div className="space-y-3">
            {narratives.map((narrative, idx) => (
              <div key={idx} className="p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer" style={{ border: '1px solid #E0E6EA' }}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-3">
                    <h3 style={{ color: '#1A1F26', fontWeight: '500', fontSize: '0.875rem' }}>{narrative.title}</h3>
                    <p style={{ color: '#7A8A94', fontSize: '0.8125rem' }} className="mt-1">{narrative.posts} posts contributing</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="px-2.5 py-1 rounded text-white" style={{ 
                      backgroundColor: getRiskColor(narrative.criticality),
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      {narrative.criticality}
                    </span>
                    <span className="flex items-center gap-1" style={{ 
                      color: narrative.trend === 'rising' ? '#E74C3C' : narrative.trend === 'declining' ? '#2ECC71' : '#7A8A94',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      {narrative.trend === 'rising' ? <TrendingUp className="w-3 h-3" /> : narrative.trend === 'declining' ? <TrendingDown className="w-3 h-3" /> : <span className="w-3 h-0.5 bg-current rounded" />}
                      <span>{narrative.trend}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg p-5" style={{ boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.08)' }}>
          <h2 style={{ color: '#1A1F26', fontWeight: '600', fontSize: '1.0625rem' }} className="mb-4">Recent Alerts</h2>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="p-4 rounded-lg" style={{ border: '1px solid #E0E6EA', backgroundColor: alert.severity === 'high' ? '#FEF5F5' : '#FFFAF0' }}>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded" style={{ 
                    backgroundColor: alert.severity === 'high' ? '#FDD' : '#FFE5CC'
                  }}>
                    <AlertTriangle className="w-4 h-4" style={{ 
                      color: alert.severity === 'high' ? '#E74C3C' : '#F39C12'
                    }} />
                  </div>
                  <div className="flex-1">
                    <p style={{ color: '#1A1F26', fontWeight: '500', fontSize: '0.875rem' }}>{alert.message}</p>
                    <p style={{ color: '#7A8A94', fontSize: '0.8125rem' }} className="mt-1">{alert.time}</p>
                  </div>
                  <div className="flex items-center">
                    {alert.status === 'resolved' ? (
                      <CheckCircle className="w-4 h-4" style={{ color: '#2ECC71' }} />
                    ) : alert.status === 'in-progress' ? (
                      <Clock className="w-4 h-4" style={{ color: '#F39C12' }} />
                    ) : (
                      <AlertTriangle className="w-4 h-4" style={{ color: '#E74C3C' }} />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}