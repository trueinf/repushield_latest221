import { useState } from 'react';
import { TrendingUp, TrendingDown, BookOpen, AlertTriangle, CheckCircle, XCircle, Twitter, Youtube, MessageCircle, Video, Facebook, HelpCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface Narrative {
  id: string;
  title: string;
  description: string;
  whyItMatters: string;
  criticality: number;
  trend: 'rising' | 'stable' | 'falling';
  postCount: number;
  platforms: string[];
  entities: string[];
  priority: 'high' | 'medium' | 'low';
}

export function Narratives() {
  const [selectedNarrative, setSelectedNarrative] = useState<Narrative | null>(null);

  const narratives: Narrative[] = [
    {
      id: '1',
      title: 'Party out of touch with working class voters',
      description: 'Multiple commentators and voters expressing sentiment that the Democratic Party has shifted focus away from traditional working-class economic issues.',
      whyItMatters: 'This narrative directly threatens core voter base and could lead to decreased turnout and support in swing states if left unaddressed.',
      criticality: 78,
      trend: 'rising',
      postCount: 234,
      platforms: ['twitter', 'reddit', 'youtube'],
      entities: ['Democratic Party', 'Party Leadership'],
      priority: 'high'
    },
    {
      id: '2',
      title: 'Immigration stance alienating moderate voters',
      description: 'Growing sentiment that the party\'s immigration policies are too progressive for swing voters and centrist Democrats.',
      whyItMatters: 'Could lead to losses in competitive districts and increased vulnerability in suburban areas critical for electoral success.',
      criticality: 72,
      trend: 'rising',
      postCount: 189,
      platforms: ['twitter', 'reddit'],
      entities: ['Democratic Party'],
      priority: 'high'
    },
    {
      id: '3',
      title: 'Strong record on climate action and clean energy',
      description: 'Positive recognition for historic climate legislation, clean energy investments, and environmental leadership.',
      whyItMatters: 'Reinforces positive brand perception among younger voters and environmentalists, can be leveraged for mobilization.',
      criticality: 25,
      trend: 'stable',
      postCount: 145,
      platforms: ['twitter', 'instagram'],
      entities: ['Democratic Party', 'Climate Caucus'],
      priority: 'low'
    },
    {
      id: '4',
      title: 'Effective grassroots organization and turnout efforts',
      description: 'Recognition for community organizing, voter registration drives, and get-out-the-vote operations.',
      whyItMatters: 'Strengthens party infrastructure and builds competitive advantage in ground game compared to opposition.',
      criticality: 18,
      trend: 'falling',
      postCount: 112,
      platforms: ['instagram', 'facebook'],
      entities: ['Democratic Party'],
      priority: 'low'
    },
    {
      id: '5',
      title: 'Economic messaging unclear and inconsistent',
      description: 'Criticism about mixed messages on economic policy, lack of clear narrative on inflation and jobs.',
      whyItMatters: 'Could escalate into larger credibility issue if not addressed with unified, clear economic messaging.',
      criticality: 64,
      trend: 'rising',
      postCount: 98,
      platforms: ['twitter', 'reddit', 'quora'],
      entities: ['Democratic Party', 'Economic Policy Team'],
      priority: 'medium'
    },
  ];

  const timelineData = [
    { date: 'Dec 1', mentions: 18, risk: 72 },
    { date: 'Dec 2', mentions: 24, risk: 74 },
    { date: 'Dec 3', mentions: 31, risk: 75 },
    { date: 'Dec 4', mentions: 28, risk: 76 },
    { date: 'Dec 5', mentions: 39, risk: 77 },
    { date: 'Dec 6', mentions: 42, risk: 78 },
    { date: 'Dec 7', mentions: 48, risk: 78 },
    { date: 'Dec 8', mentions: 52, risk: 78 },
  ];

  const platformBreakdown = [
    { platform: 'Twitter', posts: 112, percentage: 48 },
    { platform: 'Reddit', posts: 75, percentage: 32 },
    { platform: 'YouTube', posts: 47, percentage: 20 },
  ];

  const topPosts = [
    {
      id: '1',
      author: 'John Smith',
      platform: 'twitter',
      content: 'Very disappointed with recent product quality from @BrandX. They clearly cut corners.',
      reach: 45000,
      engagement: 892
    },
    {
      id: '2',
      author: 'QualityMatters',
      platform: 'reddit',
      content: 'Has anyone else noticed the decline in Brand X quality? Materials feel cheaper now.',
      reach: 12000,
      engagement: 456
    },
    {
      id: '3',
      author: 'TechReview Daily',
      platform: 'youtube',
      content: 'Brand X quality analysis: What changed and why it matters to consumers',
      reach: 95000,
      engagement: 3421
    },
  ];

  const factChecks = [
    { claim: 'Manufacturing moved to cheaper facilities', status: 'true', details: 'Confirmed through company statements in Q2 earnings' },
    { claim: 'Product materials are lower quality', status: 'mixed', details: 'Some components changed, quality impact varies by product line' },
    { claim: 'Cost savings not passed to consumers', status: 'false', details: 'Prices remained stable despite inflation in the sector' },
  ];

  const recommendedActions = [
    {
      type: 'statement',
      title: 'Issue transparency statement',
      description: 'Address quality concerns directly with data-backed quality metrics',
      priority: 'high'
    },
    {
      type: 'campaign',
      title: 'Quality assurance campaign',
      description: 'Showcase quality control processes and testing procedures',
      priority: 'high'
    },
    {
      type: 'engagement',
      title: 'Engage with top critics',
      description: 'Direct outreach to influential voices expressing concerns',
      priority: 'medium'
    },
  ];

  const getCriticalityColor = (score: number) => {
    if (score >= 70) return 'bg-red-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return <TrendingUp className="w-5 h-5 text-red-600" />;
      case 'falling': return <TrendingDown className="w-5 h-5 text-green-600" />;
      default: return <span className="w-5 h-1 bg-gray-600 rounded" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-50 text-red-700 border-red-200';
      case 'medium': return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-green-50 text-green-700 border-green-200';
    }
  };

  const getFactCheckIcon = (status: string) => {
    switch (status) {
      case 'true': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'false': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <AlertTriangle className="w-5 h-5 text-orange-600" />;
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter': return <Twitter className="w-4 h-4" />;
      case 'youtube': return <Youtube className="w-4 h-4" />;
      case 'reddit': return <MessageCircle className="w-4 h-4" />;
      case 'facebook': return <Facebook className="w-4 h-4" />;
      case 'quora': return <HelpCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="flex h-full">
      {/* Narratives List */}
      <div className={`${selectedNarrative ? 'w-1/2' : 'w-full'} border-r border-gray-200 flex flex-col`}>
        <div className="bg-white border-b border-gray-200 p-6">
          <h1 className="text-gray-900">Narratives</h1>
          <p className="text-gray-500 mt-1">Track overarching stories and perceptions forming across platforms</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {narratives.map((narrative) => (
              <div
                key={narrative.id}
                onClick={() => setSelectedNarrative(narrative)}
                className={`bg-white border border-gray-200 rounded-lg p-5 cursor-pointer hover:shadow-md transition-shadow ${selectedNarrative?.id === narrative.id ? 'ring-2 ring-blue-500' : ''}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      <h3 className="text-gray-900">{narrative.title}</h3>
                    </div>
                    <p className="text-gray-600">{narrative.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded text-white ${getCriticalityColor(narrative.criticality)}`}>
                        {narrative.criticality}
                      </span>
                      <span className="text-gray-500">criticality</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {getTrendIcon(narrative.trend)}
                      <span className="text-gray-700">{narrative.trend}</span>
                    </div>

                    <div className="text-gray-500">
                      {narrative.postCount} posts
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded border ${getPriorityColor(narrative.priority)}`}>
                    {narrative.priority} priority
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <span className="text-gray-500">Platforms:</span>
                  <div className="flex gap-1">
                    {narrative.platforms.map((platform, idx) => (
                      <div key={idx} className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
                        {getPlatformIcon(platform)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Narrative Detail */}
      {selectedNarrative && (
        <div className="w-1/2 bg-white overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <h2 className="text-gray-900">Narrative Details</h2>
            <button
              onClick={() => setSelectedNarrative(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-3">
                <h2 className="text-gray-900 flex-1">{selectedNarrative.title}</h2>
                <span className={`px-3 py-1 rounded text-white ${getCriticalityColor(selectedNarrative.criticality)}`}>
                  {selectedNarrative.criticality}
                </span>
              </div>
              <p className="text-gray-600 mb-4">{selectedNarrative.description}</p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-900">
                  <strong>Why it matters:</strong> {selectedNarrative.whyItMatters}
                </p>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-500">Total Posts</p>
                <p className="text-gray-900 mt-1">{selectedNarrative.postCount}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-500">Platforms</p>
                <p className="text-gray-900 mt-1">{selectedNarrative.platforms.length}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-500">Trend</p>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(selectedNarrative.trend)}
                  <span className="text-gray-900">{selectedNarrative.trend}</span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h3 className="text-gray-900 mb-3">Mentions & Risk Over Time</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" />
                  <YAxis yAxisId="left" stroke="#6b7280" />
                  <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
                  <Tooltip />
                  <Line yAxisId="left" type="monotone" dataKey="mentions" stroke="#3b82f6" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="risk" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Platform Breakdown */}
            <div>
              <h3 className="text-gray-900 mb-3">Platform Breakdown</h3>
              <div className="space-y-3">
                {platformBreakdown.map((platform, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-700">{platform.platform}</span>
                      <span className="text-gray-900">{platform.posts} posts ({platform.percentage}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${platform.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Triggering Posts */}
            <div>
              <h3 className="text-gray-900 mb-3">Top Triggering Posts</h3>
              <div className="space-y-3">
                {topPosts.map((post) => (
                  <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                        {getPlatformIcon(post.platform)}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900">{post.author}</p>
                        <p className="text-gray-700 mt-1">{post.content}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-gray-500 mt-2 pt-2 border-t border-gray-200">
                      <span>{post.reach.toLocaleString()} reach</span>
                      <span>{post.engagement.toLocaleString()} engagement</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fact Check Summary */}
            <div>
              <h3 className="text-gray-900 mb-3">Fact Check Summary</h3>
              <div className="space-y-3">
                {factChecks.map((fact, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      {getFactCheckIcon(fact.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-gray-900">{fact.claim}</p>
                          <span className={`px-2 py-0.5 rounded ${
                            fact.status === 'true' ? 'bg-green-100 text-green-700' :
                            fact.status === 'false' ? 'bg-red-100 text-red-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {fact.status}
                          </span>
                        </div>
                        <p className="text-gray-600">{fact.details}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Actions */}
            <div>
              <h3 className="text-gray-900 mb-3">Recommended Actions</h3>
              <div className="space-y-3">
                {recommendedActions.map((action, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-gray-900">{action.title}</h4>
                      <span className={`px-2 py-1 rounded ${
                        action.priority === 'high' ? 'bg-red-100 text-red-700' :
                        action.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {action.priority}
                      </span>
                    </div>
                    <p className="text-gray-600">{action.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Create Response Plan
              </button>
              <button className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                Export Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}