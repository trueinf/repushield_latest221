import { useState } from 'react';
import { TrendingUp, TrendingDown, Hash, MessageSquare, AlertCircle, ExternalLink } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Topic {
  id: string;
  name: string;
  description: string;
  volume: number;
  riskScore: number;
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  entities: string[];
  trend: 'up' | 'down' | 'stable';
  platforms: string[];
}

export function Topics() {
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  const topics: Topic[] = [
    {
      id: '1',
      name: 'Healthcare Policy',
      description: 'Universal healthcare, Medicare expansion, prescription drug costs, and healthcare accessibility',
      volume: 1234,
      riskScore: 65,
      sentiment: { positive: 35, neutral: 25, negative: 40 },
      entities: ['Democratic Party', 'Senate Leadership'],
      trend: 'up',
      platforms: ['twitter', 'reddit', 'youtube']
    },
    {
      id: '2',
      name: 'Economy & Jobs',
      description: 'Job creation, unemployment rates, economic growth, and middle-class prosperity',
      volume: 892,
      riskScore: 52,
      sentiment: { positive: 45, neutral: 30, negative: 25 },
      entities: ['Democratic Party'],
      trend: 'down',
      platforms: ['twitter', 'instagram']
    },
    {
      id: '3',
      name: 'Immigration Reform',
      description: 'Border policy, pathway to citizenship, DACA, and refugee admissions',
      volume: 756,
      riskScore: 71,
      sentiment: { positive: 20, neutral: 30, negative: 50 },
      entities: ['Democratic Party', 'Administration'],
      trend: 'up',
      platforms: ['twitter', 'reddit', 'facebook']
    },
    {
      id: '4',
      name: 'Climate & Environment',
      description: 'Clean energy investments, environmental protection, and climate legislation',
      volume: 623,
      riskScore: 38,
      sentiment: { positive: 60, neutral: 25, negative: 15 },
      entities: ['Democratic Party'],
      trend: 'up',
      platforms: ['instagram', 'facebook', 'youtube']
    },
    {
      id: '5',
      name: 'Party Leadership',
      description: 'Leadership effectiveness, party unity, messaging strategy, and candidate support',
      volume: 545,
      riskScore: 28,
      sentiment: { positive: 70, neutral: 20, negative: 10 },
      entities: ['Democratic Party', 'Party Leadership'],
      trend: 'stable',
      platforms: ['youtube', 'twitter']
    },
    {
      id: '6',
      name: 'Education Policy',
      description: 'Student loan forgiveness, education funding, teacher pay, and college affordability',
      volume: 489,
      riskScore: 58,
      sentiment: { positive: 30, neutral: 35, negative: 35 },
      entities: ['Democratic Party'],
      trend: 'down',
      platforms: ['reddit', 'twitter']
    },
  ];

  const volumeData = [
    { date: 'Dec 1', volume: 145 },
    { date: 'Dec 2', volume: 178 },
    { date: 'Dec 3', volume: 203 },
    { date: 'Dec 4', volume: 189 },
    { date: 'Dec 5', volume: 234 },
    { date: 'Dec 6', volume: 267 },
    { date: 'Dec 7', volume: 289 },
    { date: 'Dec 8', volume: 312 },
  ];

  const topPosts = [
    {
      id: '1',
      author: 'John Smith',
      platform: 'Twitter',
      content: 'Quality has gone downhill since they changed manufacturers. Not happy.',
      reach: 45000,
      riskScore: 74
    },
    {
      id: '2',
      author: 'TechReviewer',
      platform: 'YouTube',
      content: 'Comprehensive quality test: Brand X vs competitors - surprising results',
      reach: 120000,
      riskScore: 62
    },
    {
      id: '3',
      author: 'user_review',
      platform: 'Reddit',
      content: 'After 6 months of use, the quality is still holding up well. Impressed.',
      reach: 8500,
      riskScore: 28
    },
  ];

  const relatedTopics = [
    { name: 'Manufacturing Process', similarity: 85 },
    { name: 'Material Selection', similarity: 78 },
    { name: 'Quality Control', similarity: 72 },
  ];

  const connectedNarratives = [
    { name: 'Brand prioritizes profit over quality', criticality: 78 },
    { name: 'Cost-cutting measures affecting products', criticality: 65 },
  ];

  const getRiskColor = (score: number) => {
    if (score >= 70) return '#DC2626';
    if (score >= 40) return '#F97316';
    return '#16A34A';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4" style={{ color: '#DC2626' }} />;
      case 'down': return <TrendingDown className="w-4 h-4" style={{ color: '#16A34A' }} />;
      default: return <span className="w-4 h-0.5" style={{ backgroundColor: '#9CA3AF' }} />;
    }
  };

  return (
    <div className="flex h-full" style={{ backgroundColor: '#F9FAFB' }}>
      {/* Topics List */}
      <div className={`${selectedTopic ? 'w-1/2' : 'w-full'} flex flex-col`} style={{ borderRight: '1px solid #E5E7EB' }}>
        <div className="bg-white p-6" style={{ borderBottom: '1px solid #E5E7EB' }}>
          <h1 style={{ color: '#071525' }}>Topics</h1>
          <p style={{ color: '#334155' }} className="mt-1">Discover what people are talking about across platforms</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-4">
            {topics.map((topic) => (
              <div
                key={topic.id}
                onClick={() => setSelectedTopic(topic)}
                className="bg-white rounded-2xl p-6 cursor-pointer transition-all hover:shadow-lg"
                style={{
                  border: selectedTopic?.id === topic.id ? '2px solid #2563EB' : '1px solid #E5E7EB'
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #E2ECFF 0%, #D9F5FB 100%)' }}>
                      <Hash className="w-6 h-6" style={{ color: '#2563EB' }} />
                    </div>
                    <div>
                      <h3 style={{ color: '#071525', fontWeight: '500' }}>{topic.name}</h3>
                      <p style={{ color: '#9CA3AF' }} className="mt-0.5">{topic.volume.toLocaleString()} mentions</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(topic.trend)}
                    <span className="px-3 py-1.5 rounded-xl text-white" style={{ backgroundColor: getRiskColor(topic.riskScore) }}>
                      {topic.riskScore}
                    </span>
                  </div>
                </div>

                <p style={{ color: '#334155' }} className="mb-4">{topic.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1">
                      {topic.platforms.slice(0, 3).map((platform, idx) => (
                        <div
                          key={idx}
                          className="w-7 h-7 rounded-full border-2 flex items-center justify-center"
                          style={{ backgroundColor: '#F9FAFB', borderColor: 'white' }}
                        >
                          <span style={{ color: '#334155' }}>{platform[0].toUpperCase()}</span>
                        </div>
                      ))}
                    </div>
                    <span style={{ color: '#9CA3AF' }}>{topic.platforms.length} platforms</span>
                  </div>

                  <div className="flex gap-2">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: '#16A34A' }} />
                      <span style={{ color: '#334155' }}>{topic.sentiment.positive}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: '#9CA3AF' }} />
                      <span style={{ color: '#334155' }}>{topic.sentiment.neutral}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: '#DC2626' }} />
                      <span style={{ color: '#334155' }}>{topic.sentiment.negative}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Topic Detail */}
      {selectedTopic && (
        <div className="w-1/2 bg-white overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <h2 className="text-gray-900">Topic Details</h2>
            <button
              onClick={() => setSelectedTopic(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <h2 className="text-gray-900">{selectedTopic.name}</h2>
                <span className={`px-3 py-1 rounded text-white ${getRiskColor(selectedTopic.riskScore)}`}>
                  {selectedTopic.riskScore}
                </span>
              </div>
              <p className="text-gray-600">{selectedTopic.description}</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-500">Volume</p>
                <p className="text-gray-900 mt-1">{selectedTopic.volume.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-500">Risk Score</p>
                <p className="text-gray-900 mt-1">{selectedTopic.riskScore}/100</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-500">Trend</p>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(selectedTopic.trend)}
                  <span className="text-gray-900">{selectedTopic.trend}</span>
                </div>
              </div>
            </div>

            {/* Sentiment Distribution */}
            <div>
              <h3 className="text-gray-900 mb-3">Sentiment Distribution</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-700">Positive</span>
                    <span className="text-gray-900">{selectedTopic.sentiment.positive}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${selectedTopic.sentiment.positive}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-700">Neutral</span>
                    <span className="text-gray-900">{selectedTopic.sentiment.neutral}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-400 rounded-full" style={{ width: `${selectedTopic.sentiment.neutral}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-700">Negative</span>
                    <span className="text-gray-900">{selectedTopic.sentiment.negative}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${selectedTopic.sentiment.negative}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Volume Over Time */}
            <div>
              <h3 className="text-gray-900 mb-3">Volume Over Time</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={volumeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Line type="monotone" dataKey="volume" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Associated Entities */}
            <div>
              <h3 className="text-gray-900 mb-3">Associated Entities</h3>
              <div className="flex flex-wrap gap-2">
                {selectedTopic.entities.map((entity, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg">
                    {entity}
                  </span>
                ))}
              </div>
            </div>

            {/* Top Influential Posts */}
            <div>
              <h3 className="text-gray-900 mb-3">Top Influential Posts</h3>
              <div className="space-y-3">
                {topPosts.map((post) => (
                  <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-gray-900">{post.author}</p>
                        <p className="text-gray-500">{post.platform}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-white ${getRiskColor(post.riskScore)}`}>
                        {post.riskScore}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">{post.content}</p>
                    <div className="flex items-center justify-between text-gray-500">
                      <span>{post.reach.toLocaleString()} reach</span>
                      <button className="text-blue-600 hover:text-blue-700 flex items-center gap-1">
                        <span>View</span>
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Related Topics */}
            <div>
              <h3 className="text-gray-900 mb-3">Related Topics</h3>
              <div className="space-y-2">
                {relatedTopics.map((topic, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <span className="text-gray-900">{topic.name}</span>
                    <span className="text-gray-500">{topic.similarity}% similar</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Connected Narratives */}
            <div>
              <h3 className="text-gray-900 mb-3">Connected Narratives</h3>
              <div className="space-y-2">
                {connectedNarratives.map((narrative, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <span className="text-gray-900">{narrative.name}</span>
                    <span className={`px-2 py-1 rounded text-white ${getRiskColor(narrative.criticality)}`}>
                      {narrative.criticality}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                View All Posts in Feed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}