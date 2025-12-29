import { useState } from 'react';
import { Building, Hash, Link, Sliders, Bell, Plus, Edit, Trash2, Check, X } from 'lucide-react';

export function Configuration() {
  const [activeTab, setActiveTab] = useState<'entities' | 'sources' | 'scoring' | 'alerts'>('entities');

  const entities = [
    { id: '1', name: 'Democratic Party', type: 'Organization', handles: '@TheDemocrats, @DNC', priority: 'High', keywords: 'Democratic Party, Democrats, DNC, Dems' },
    { id: '2', name: 'Party Chair', type: 'Individual', handles: '@PartyChair', priority: 'High', keywords: 'Party Chair, DNC Chair, Chairman' },
    { id: '3', name: 'Senate Leadership', type: 'Organization', handles: '@SenateDems', priority: 'High', keywords: 'Senate Democrats, Senate Leadership, Dem Senators' },
    { id: '4', name: 'House Caucus', type: 'Organization', handles: '@HouseDemocrats', priority: 'Medium', keywords: 'House Democrats, Democratic Caucus, House Leadership' },
  ];

  const sources = [
    { id: '1', name: 'Twitter', status: 'connected', frequency: 'Real-time', lastSync: '2 min ago' },
    { id: '2', name: 'YouTube', status: 'connected', frequency: 'Every 15 min', lastSync: '10 min ago' },
    { id: '3', name: 'Reddit', status: 'connected', frequency: 'Every 10 min', lastSync: '5 min ago' },
    { id: '4', name: 'Instagram', status: 'connected', frequency: 'Every 30 min', lastSync: '15 min ago' },
    { id: '5', name: 'Facebook', status: 'connected', frequency: 'Every 20 min', lastSync: '12 min ago' },
    { id: '6', name: 'Quora', status: 'pending', frequency: 'Not configured', lastSync: 'Never' },
  ];

  const scoringWeights = [
    { name: 'Sentiment', weight: 35, description: 'Emotional tone of the content' },
    { name: 'Reach', weight: 25, description: 'Follower count and potential audience' },
    { name: 'Engagement', weight: 20, description: 'Likes, shares, comments interaction' },
    { name: 'Topic Sensitivity', weight: 15, description: 'Sensitivity of discussed topics' },
    { name: 'Author Influence', weight: 5, description: 'Authority and credibility of author' },
  ];

  const sensitiveTopics = [
    { name: 'Safety & Health', multiplier: '2.0x', enabled: true },
    { name: 'Ethics & Integrity', multiplier: '1.8x', enabled: true },
    { name: 'Politics', multiplier: '1.5x', enabled: true },
    { name: 'Religion', multiplier: '1.5x', enabled: false },
    { name: 'Legal Issues', multiplier: '2.0x', enabled: true },
  ];

  const alertRules = [
    { id: '1', name: 'High Risk Spike', condition: 'Risk score > 80', action: 'Email + Slack', status: 'active' },
    { id: '2', name: 'Volume Surge', condition: 'Mentions > 100 in 1 hour', action: 'Email', status: 'active' },
    { id: '3', name: 'Negative Trend', condition: 'Negative sentiment > 60% for 2 hours', action: 'Slack', status: 'active' },
    { id: '4', name: 'VIP Mention', condition: 'High-priority entity mentioned', action: 'SMS + Email', status: 'paused' },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <h1 className="text-gray-900">Configuration</h1>
        <p className="text-gray-500 mt-1">Manage monitoring settings, scoring models, and alert rules</p>

        {/* Tabs */}
        <div className="flex gap-4 mt-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('entities')}
            className={`pb-3 px-2 border-b-2 transition-colors ${
              activeTab === 'entities'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              <span>Entities & Keywords</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('sources')}
            className={`pb-3 px-2 border-b-2 transition-colors ${
              activeTab === 'sources'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Link className="w-5 h-5" />
              <span>Sources & Integrations</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('scoring')}
            className={`pb-3 px-2 border-b-2 transition-colors ${
              activeTab === 'scoring'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5" />
              <span>Scoring Models</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`pb-3 px-2 border-b-2 transition-colors ${
              activeTab === 'alerts'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              <span>Alerts & Thresholds</span>
            </div>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'entities' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">Manage the people, brands, and organizations you're monitoring</p>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus className="w-5 h-5" />
                <span>Add Entity</span>
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-gray-700">Name</th>
                    <th className="text-left px-6 py-3 text-gray-700">Type</th>
                    <th className="text-left px-6 py-3 text-gray-700">Handles</th>
                    <th className="text-left px-6 py-3 text-gray-700">Keywords</th>
                    <th className="text-left px-6 py-3 text-gray-700">Priority</th>
                    <th className="text-left px-6 py-3 text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entities.map((entity, idx) => (
                    <tr key={entity.id} className={idx !== entities.length - 1 ? 'border-b border-gray-200' : ''}>
                      <td className="px-6 py-4 text-gray-900">{entity.name}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                          {entity.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{entity.handles || '-'}</td>
                      <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{entity.keywords}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded ${
                          entity.priority === 'High' 
                            ? 'bg-red-50 text-red-700' 
                            : 'bg-orange-50 text-orange-700'
                        }`}>
                          {entity.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button className="p-2 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-red-600 rounded hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'sources' && (
          <div>
            <div className="mb-6">
              <p className="text-gray-600">Connect and manage your social media data sources</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sources.map((source) => (
                <div key={source.id} className="bg-white border border-gray-200 rounded-lg p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-gray-900 mb-1">{source.name}</h3>
                      <span className={`inline-block px-2 py-1 rounded ${
                        source.status === 'connected' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {source.status}
                      </span>
                    </div>
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Link className="w-5 h-5 text-gray-600" />
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Polling frequency</span>
                      <span className="text-gray-900">{source.frequency}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Last sync</span>
                      <span className="text-gray-900">{source.lastSync}</span>
                    </div>
                  </div>

                  {source.status === 'connected' ? (
                    <div className="flex gap-2">
                      <button className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                        Configure
                      </button>
                      <button className="flex-1 px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-lg hover:bg-red-100">
                        Disconnect
                      </button>
                    </div>
                  ) : (
                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Connect
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'scoring' && (
          <div className="space-y-8">
            {/* Scoring Weights */}
            <div>
              <h2 className="text-gray-900 mb-4">Reputation Risk Score Formula</h2>
              <p className="text-gray-600 mb-6">Adjust the weight of each factor in calculating the overall reputation risk score (0-100)</p>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
                {scoringWeights.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-gray-900">{item.name}</p>
                        <p className="text-gray-500">{item.description}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={item.weight}
                          className="w-32"
                          readOnly
                        />
                        <span className="text-gray-900 w-12 text-right">{item.weight}%</span>
                      </div>
                    </div>
                    {idx !== scoringWeights.length - 1 && <div className="border-b border-gray-200 mt-4" />}
                  </div>
                ))}

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">
                      {scoringWeights.reduce((sum, item) => sum + item.weight, 0)}%
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Save Changes
                  </button>
                  <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    Reset to Default
                  </button>
                </div>
              </div>
            </div>

            {/* Sensitive Topics */}
            <div>
              <h2 className="text-gray-900 mb-4">Topic Sensitivity Multipliers</h2>
              <p className="text-gray-600 mb-6">Apply additional weight to posts discussing sensitive topics</p>
              
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-6 py-3 text-gray-700">Topic Category</th>
                      <th className="text-left px-6 py-3 text-gray-700">Risk Multiplier</th>
                      <th className="text-left px-6 py-3 text-gray-700">Status</th>
                      <th className="text-left px-6 py-3 text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sensitiveTopics.map((topic, idx) => (
                      <tr key={idx} className={idx !== sensitiveTopics.length - 1 ? 'border-b border-gray-200' : ''}>
                        <td className="px-6 py-4 text-gray-900">{topic.name}</td>
                        <td className="px-6 py-4 text-gray-900">{topic.multiplier}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded ${
                            topic.enabled 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {topic.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button className="p-2 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className={`p-2 rounded ${
                              topic.enabled 
                                ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' 
                                : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                            }`}>
                              {topic.enabled ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">Configure automated alerts for critical reputation events</p>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus className="w-5 h-5" />
                <span>Create Alert Rule</span>
              </button>
            </div>

            <div className="space-y-4">
              {alertRules.map((rule) => (
                <div key={rule.id} className="bg-white border border-gray-200 rounded-lg p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Bell className="w-5 h-5 text-blue-600" />
                        <h3 className="text-gray-900">{rule.name}</h3>
                        <span className={`px-2 py-1 rounded ${
                          rule.status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {rule.status}
                        </span>
                      </div>
                      <div className="ml-8 space-y-1">
                        <p className="text-gray-600">
                          <span className="text-gray-500">Condition:</span> {rule.condition}
                        </p>
                        <p className="text-gray-600">
                          <span className="text-gray-500">Action:</span> {rule.action}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 rounded hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className={`px-4 py-2 rounded ${
                        rule.status === 'active'
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}>
                        {rule.status === 'active' ? 'Pause' : 'Activate'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Alert Channels */}
            <div className="mt-8">
              <h2 className="text-gray-900 mb-4">Notification Channels</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-gray-900">Email</h3>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded">Active</span>
                  </div>
                  <p className="text-gray-600 mb-4">alerts@repushield.com</p>
                  <button className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    Configure
                  </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-gray-900">Slack</h3>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded">Active</span>
                  </div>
                  <p className="text-gray-600 mb-4">#reputation-alerts</p>
                  <button className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    Configure
                  </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-gray-900">SMS</h3>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">Not configured</span>
                  </div>
                  <p className="text-gray-600 mb-4">Send critical alerts via SMS</p>
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Set Up
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}