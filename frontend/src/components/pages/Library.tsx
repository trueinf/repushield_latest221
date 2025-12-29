import { useState } from 'react';
import { Bookmark, Folder, FileText, User, Clock, CheckCircle, AlertCircle, Filter, Plus } from 'lucide-react';

interface SavedPost {
  id: string;
  title: string;
  platform: string;
  author: string;
  savedDate: string;
  owner: string;
  status: 'open' | 'in-review' | 'responded' | 'closed';
  tags: string[];
  narrative: string;
  topic: string;
  riskScore: number;
}

interface Collection {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  createdDate: string;
  owner: string;
}

interface Playbook {
  id: string;
  name: string;
  description: string;
  type: 'response' | 'escalation';
  lastUpdated: string;
}

export function Library() {
  const [activeTab, setActiveTab] = useState<'posts' | 'collections' | 'playbooks'>('posts');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const savedPosts: SavedPost[] = [
    {
      id: '1',
      title: 'Very disappointed with Democratic Party leadership on healthcare...',
      platform: 'Twitter',
      author: '@johnmitchell',
      savedDate: '2 hours ago',
      owner: 'Sarah Chen',
      status: 'in-review',
      tags: ['high-priority', 'healthcare'],
      narrative: 'Party out of touch with working class voters',
      topic: 'Healthcare Policy',
      riskScore: 72
    },
    {
      id: '2',
      title: 'Immigration stance is political suicide for moderates...',
      platform: 'Twitter',
      author: '@sarahwpolitics',
      savedDate: '5 hours ago',
      owner: 'Mike Johnson',
      status: 'open',
      tags: ['immigration', 'high-priority'],
      narrative: 'Immigration stance alienating moderate voters',
      topic: 'Immigration Reform',
      riskScore: 81
    },
    {
      id: '3',
      title: 'Democratic representative listened to our concerns...',
      platform: 'Reddit',
      author: 'u/grassroots_voter',
      savedDate: '1 day ago',
      owner: 'Sarah Chen',
      status: 'responded',
      tags: ['positive', 'grassroots'],
      narrative: 'Effective grassroots organization',
      topic: 'Party Leadership',
      riskScore: 25
    },
    {
      id: '4',
      title: 'Fact-checking Democratic Party job creation claims...',
      platform: 'Facebook',
      author: '@politicalwatchdog',
      savedDate: '2 days ago',
      owner: 'Alex Park',
      status: 'closed',
      tags: ['fact-check', 'economy'],
      narrative: 'Economic messaging unclear',
      topic: 'Economy & Jobs',
      riskScore: 76
    },
  ];

  const collections: Collection[] = [
    {
      id: '1',
      name: 'Healthcare Policy Crisis',
      description: 'Posts related to healthcare messaging challenges and voter concerns',
      itemCount: 45,
      createdDate: 'Dec 1, 2024',
      owner: 'Sarah Chen'
    },
    {
      id: '2',
      name: 'Immigration Messaging',
      description: 'Collection of immigration-related posts across platforms',
      itemCount: 32,
      createdDate: 'Nov 28, 2024',
      owner: 'Mike Johnson'
    },
    {
      id: '3',
      name: 'Climate Wins - Amplify',
      description: 'Positive climate action content to amplify and build on',
      itemCount: 28,
      createdDate: 'Nov 25, 2024',
      owner: 'Sarah Chen'
    },
  ];

  const playbooks: Playbook[] = [
    {
      id: '1',
      name: 'Economic Attack Response',
      description: 'Standard response protocol for attacks on economic record',
      type: 'response',
      lastUpdated: 'Dec 1, 2024'
    },
    {
      id: '2',
      name: 'Immigration Policy Defense',
      description: 'Talking points and response framework for immigration policy questions',
      type: 'response',
      lastUpdated: 'Nov 30, 2024'
    },
    {
      id: '3',
      name: 'Crisis Escalation Protocol',
      description: 'Steps for escalating high-risk narratives to leadership',
      type: 'escalation',
      lastUpdated: 'Nov 15, 2024'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-50 text-red-700 border-red-200';
      case 'in-review': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'responded': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'closed': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="w-4 h-4" />;
      case 'in-review': return <Clock className="w-4 h-4" />;
      case 'responded': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <CheckCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'bg-red-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-green-500';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900">Library</h1>
            <p className="text-gray-500 mt-1">Curated workspace for saved posts, collections, and playbooks</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="w-5 h-5" />
            <span>New Collection</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mt-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('posts')}
            className={`pb-3 px-2 border-b-2 transition-colors ${
              activeTab === 'posts'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Bookmark className="w-5 h-5" />
              <span>Saved Posts</span>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                {savedPosts.length}
              </span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('collections')}
            className={`pb-3 px-2 border-b-2 transition-colors ${
              activeTab === 'collections'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Folder className="w-5 h-5" />
              <span>Collections</span>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                {collections.length}
              </span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('playbooks')}
            className={`pb-3 px-2 border-b-2 transition-colors ${
              activeTab === 'playbooks'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              <span>Playbooks</span>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                {playbooks.length}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'posts' && (
          <div>
            {/* Filters */}
            <div className="mb-6 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5"
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="in-review">In Review</option>
                  <option value="responded">Responded</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <input
                type="text"
                placeholder="Search saved posts..."
                className="flex-1 max-w-md border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Saved Posts List */}
            <div className="space-y-4">
              {savedPosts.map((post) => (
                <div key={post.id} className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Bookmark className="w-5 h-5 text-blue-600" />
                        <h3 className="text-gray-900">{post.title}</h3>
                      </div>
                      <div className="flex items-center gap-4 text-gray-500">
                        <span>{post.platform}</span>
                        <span>{post.author}</span>
                        <span>{post.savedDate}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded text-white ${getRiskColor(post.riskScore)}`}>
                      {post.riskScore}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-gray-500">Topic</p>
                      <p className="text-gray-900 mt-1">{post.topic}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Narrative</p>
                      <p className="text-gray-900 mt-1">{post.narrative}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{post.owner}</span>
                      </div>
                      <span className={`flex items-center gap-1 px-3 py-1 rounded border ${getStatusColor(post.status)}`}>
                        {getStatusIcon(post.status)}
                        <span>{post.status}</span>
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                        View Details
                      </button>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Take Action
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'collections' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <div key={collection.id} className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Folder className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-gray-900 mb-1">{collection.name}</h3>
                    <p className="text-gray-600">{collection.description}</p>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Items</span>
                    <span className="text-gray-900">{collection.itemCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Created</span>
                    <span className="text-gray-900">{collection.createdDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Owner</span>
                    <span className="text-gray-900">{collection.owner}</span>
                  </div>
                </div>

                <button className="w-full mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
                  Open Collection
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'playbooks' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {playbooks.map((playbook) => (
              <div key={playbook.id} className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    playbook.type === 'response' ? 'bg-blue-50' : 'bg-orange-50'
                  }`}>
                    <FileText className={`w-5 h-5 ${
                      playbook.type === 'response' ? 'text-blue-600' : 'text-orange-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-gray-900">{playbook.name}</h3>
                      <span className={`px-2 py-0.5 rounded ${
                        playbook.type === 'response' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {playbook.type}
                      </span>
                    </div>
                    <p className="text-gray-600">{playbook.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-gray-500">Last updated: {playbook.lastUpdated}</span>
                  <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}