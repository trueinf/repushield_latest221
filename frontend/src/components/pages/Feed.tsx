import { useState, useEffect } from 'react';
import { Twitter, Youtube, MessageCircle, Instagram, Bookmark, MessageSquare, ExternalLink, AlertCircle, TrendingUp, Users, Video, Facebook, HelpCircle, X, CheckCircle, XCircle, AlertTriangle, Copy, Share2, FileText, Loader2, BarChart3, Search } from 'lucide-react';
import { searchPosts, getAdminResponse, translateText, factCheckPost, type Post as ApiPost, type FactCheckClaim } from '../../utils/api';

interface Post {
  id: string;
  platform: 'twitter' | 'youtube' | 'reddit' | 'instagram' | 'facebook' | 'quora' | 'news';
  author: string;
  handle: string;
  timestamp: string;
  content: string;
  riskScore: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  badges: string[];
  reach: number;
  engagement: number;
  entity: string;
  // Risk calculation factors
  riskBreakdown?: {
    sentimentImpact: number;
    influenceImpact: number;
    topicSensitivity: number;
    narrativeThreat: number;
    misinformationRisk: number;
    viralityRisk: number;
  };
}

interface Claim {
  id: string;
  text: string;
  verdict: 'true' | 'false' | 'misleading' | 'unverified';
  confidence: 'high' | 'medium' | 'low';
  correctData?: string;
  sources: string[];
  explanation: string;
}

interface FactCheckState {
  step: 'loading' | 'claims' | 'results';
  claims: Claim[];
}

export function Feed() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [selectedSentiment, setSelectedSentiment] = useState<string>('all');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [factCheckPanel, setFactCheckPanel] = useState<{ post: Post; state: FactCheckState } | null>(null);
  const [copiedResponse, setCopiedResponse] = useState<string | null>(null);
  const [showPostResponse, setShowPostResponse] = useState(false);
  const [savedToLibrary, setSavedToLibrary] = useState(false);
  const [addedToCrisis, setAddedToCrisis] = useState(false);
  const [sharedWithTeam, setSharedWithTeam] = useState(false);
  const [markedAsFactChecked, setMarkedAsFactChecked] = useState(false);
  const [hoveredRiskScore, setHoveredRiskScore] = useState<string | null>(null);
  
  // Search state
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [adminResponse, setAdminResponse] = useState<string | null>(null);
  const [loadingAdminResponse, setLoadingAdminResponse] = useState<boolean>(false);
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [showTranslated, setShowTranslated] = useState<boolean>(false);
  const [publicResponseText, setPublicResponseText] = useState<string>('');

  // Load search state from localStorage on mount
  useEffect(() => {
    try {
      const savedKeyword = localStorage.getItem('feed_search_keyword');
      const savedResults = localStorage.getItem('feed_search_results');
      const savedHasSearched = localStorage.getItem('feed_has_searched');

      if (savedKeyword) {
        setSearchKeyword(savedKeyword);
      }
      if (savedResults) {
        const parsedResults = JSON.parse(savedResults);
        setSearchResults(parsedResults);
      }
      if (savedHasSearched === 'true') {
        setHasSearched(true);
      }
    } catch (error) {
      console.error('Error loading search state from localStorage:', error);
    }
  }, []);

  // Save search results to localStorage whenever they change
  useEffect(() => {
    if (hasSearched && searchResults.length > 0) {
      try {
        localStorage.setItem('feed_search_results', JSON.stringify(searchResults));
        localStorage.setItem('feed_search_keyword', searchKeyword);
        localStorage.setItem('feed_has_searched', 'true');
      } catch (error) {
        console.error('Error saving search state to localStorage:', error);
      }
    }
  }, [searchResults, searchKeyword, hasSearched]);

  // Fetch admin response when a post is selected
  useEffect(() => {
    if (selectedPost) {
      setLoadingAdminResponse(true);
      setAdminResponse(null);
      // Reset translation state when new post is selected
      setTranslatedContent(null);
      setShowTranslated(false);
      
      getAdminResponse(selectedPost.id)
        .then((response) => {
          setAdminResponse(response);
        })
        .catch((error) => {
          console.error('Error fetching admin response:', error);
        })
        .finally(() => {
          setLoadingAdminResponse(false);
        });
    } else {
      setAdminResponse(null);
      setTranslatedContent(null);
      setShowTranslated(false);
    }
  }, [selectedPost]);

  // Helper function to convert API Post to Feed Post format
  const convertApiPostToFeedPost = (apiPost: ApiPost): Post => {
    // Keep original platform (including 'news')
    return {
      ...apiPost,
      platform: (apiPost.platform || 'twitter') as 'twitter' | 'youtube' | 'reddit' | 'instagram' | 'facebook' | 'quora' | 'news',
      riskBreakdown: {
        sentimentImpact: Math.floor(Math.random() * 20),
        influenceImpact: Math.floor(Math.random() * 25),
        topicSensitivity: Math.floor(Math.random() * 15),
        narrativeThreat: Math.floor(Math.random() * 20),
        misinformationRisk: Math.floor(Math.random() * 10),
        viralityRisk: Math.floor(Math.random() * 10),
      },
    };
  };

  // Handle search
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!searchKeyword.trim()) {
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setHasSearched(true);

    try {
      const response = await searchPosts(searchKeyword.trim());
      
      if (response.success) {
        const convertedPosts = response.posts.map(convertApiPostToFeedPost);
        setSearchResults(convertedPosts);
        
        // Save to localStorage immediately after search
        try {
          localStorage.setItem('feed_search_results', JSON.stringify(convertedPosts));
          localStorage.setItem('feed_search_keyword', searchKeyword.trim());
          localStorage.setItem('feed_has_searched', 'true');
        } catch (error) {
          console.error('Error saving search to localStorage:', error);
        }
        
        if (response.errors && response.errors.length > 0) {
          console.warn('Some sources failed:', response.errors);
        }
      } else {
        setSearchError('Search failed. Please try again.');
        setSearchResults([]);
        // Clear localStorage on error
        localStorage.removeItem('feed_search_results');
        localStorage.removeItem('feed_search_keyword');
        localStorage.setItem('feed_has_searched', 'false');
      }
    } catch (error: any) {
      console.error('Search error:', error);
      setSearchError(error.message || 'Failed to search. Please try again.');
      setSearchResults([]);
      // Clear localStorage on error
      localStorage.removeItem('feed_search_results');
      localStorage.removeItem('feed_search_keyword');
      localStorage.setItem('feed_has_searched', 'false');
    } finally {
      setIsSearching(false);
    }
  };

  const posts: Post[] = [
    {
      id: '1',
      platform: 'twitter',
      author: 'John Mitchell',
      handle: '@johnmitchell',
      timestamp: '2 hours ago',
      content: 'Very disappointed with the Democratic Party leadership on healthcare. They promised universal coverage but delivered watered-down compromises. We need real change, not more empty promises. #HealthcareNow',
      riskScore: 72,
      sentiment: 'negative',
      badges: ['High reach', 'Trending'],
      reach: 45000,
      engagement: 892,
      entity: 'Democratic Party',
      riskBreakdown: {
        sentimentImpact: 15,  // High negativity, disappointment tone
        influenceImpact: 12,  // Moderate reach (45k followers)
        topicSensitivity: 14,  // Healthcare is high sensitivity
        narrativeThreat: 18,  // Broken promises narrative rising
        misinformationRisk: 6,  // Unverified claim about "promises"
        viralityRisk: 7  // Trending, good engagement ratio
      }
    },
    {
      id: '2',
      platform: 'youtube',
      author: 'Political Analysis Today',
      handle: '@politicstoday',
      timestamp: '4 hours ago',
      content: 'In-depth analysis: The Democratic Party\'s economic record - jobs data looks strong, but how much credit can they really take? Mixed economic signals complicate the narrative.',
      riskScore: 58,
      sentiment: 'neutral',
      badges: ['Fact-check recommended', 'High reach'],
      reach: 120000,
      engagement: 3421,
      entity: 'Democratic Party',
      riskBreakdown: {
        sentimentImpact: 8,  // Neutral but questioning
        influenceImpact: 20,  // High reach (120k views), verified channel
        topicSensitivity: 10,  // Economic policy - medium sensitivity
        narrativeThreat: 12,  // Economic credit narrative
        misinformationRisk: 4,  // Mixed data interpretation
        viralityRisk: 4  // Moderate engagement
      }
    },
    {
      id: '3',
      platform: 'reddit',
      author: 'grassroots_voter',
      handle: 'u/grassroots_voter',
      timestamp: '6 hours ago',
      content: 'Just attended a town hall with my Democratic representative. Honestly impressed - they listened to our concerns about immigration and actually seemed to take notes. This is what democracy looks like.',
      riskScore: 25,
      sentiment: 'positive',
      badges: [],
      reach: 8500,
      engagement: 234,
      entity: 'Democratic Party',
      riskBreakdown: {
        sentimentImpact: 2,  // Positive sentiment
        influenceImpact: 6,  // Low reach
        topicSensitivity: 8,  // Immigration can be sensitive
        narrativeThreat: 3,  // Positive narrative
        misinformationRisk: 1,  // Personal experience
        viralityRisk: 5  // Decent engagement for size
      }
    },
    {
      id: '4',
      platform: 'twitter',
      author: 'Sarah Williams',
      handle: '@sarahwpolitics',
      timestamp: '8 hours ago',
      content: 'The Democratic Party\'s immigration stance is political suicide. Too far left for swing voters, and they\'re going to lose the midterms because of it. Moderates feel abandoned.',
      riskScore: 81,
      sentiment: 'negative',
      badges: ['High reach', 'Sensitive topic'],
      reach: 67000,
      engagement: 1234,
      entity: 'Democratic Party',
      riskBreakdown: {
        sentimentImpact: 18,  // Highly negative, "political suicide"
        influenceImpact: 16,  // High reach (67k followers)
        topicSensitivity: 15,  // Immigration - very high sensitivity
        narrativeThreat: 19,  // "Too far left" narrative is damaging
        misinformationRisk: 5,  // Speculative predictions
        viralityRisk: 8  // High engagement, controversial
      }
    },
    {
      id: '5',
      platform: 'instagram',
      author: 'Climate Action Now',
      handle: '@climateactionnow',
      timestamp: '10 hours ago',
      content: 'The Democratic Party is leading the way on climate legislation! Historic investments in clean energy and green jobs. This is what bold leadership looks like 🌍💚 #ClimateAction #GreenNewDeal',
      riskScore: 15,
      sentiment: 'positive',
      badges: ['High reach'],
      reach: 95000,
      engagement: 5678,
      entity: 'Democratic Party',
      riskBreakdown: {
        sentimentImpact: 1,  // Positive sentiment
        influenceImpact: 8,  // High reach but supportive
        topicSensitivity: 2,  // Climate - lower risk when positive
        narrativeThreat: 2,  // Positive narrative
        misinformationRisk: 1,  // Supportive content
        viralityRisk: 1  // Low risk virality
      }
    },
    {
      id: '6',
      platform: 'facebook',
      author: 'Political Watchdog',
      handle: '@politicalwatchdog',
      timestamp: '12 hours ago',
      content: 'Fact-checking the Democratic Party\'s claims about job creation. The numbers are misleading - many of these jobs were pandemic recovery, not new growth. Voters deserve the truth.',
      riskScore: 76,
      sentiment: 'negative',
      badges: ['Fact-check recommended', 'Trending'],
      reach: 180000,
      engagement: 8934,
      entity: 'Democratic Party',
      riskBreakdown: {
        sentimentImpact: 14,  // Negative, accusatory
        influenceImpact: 22,  // Very high reach (180k followers)
        topicSensitivity: 12,  // Jobs/economy - high sensitivity
        narrativeThreat: 16,  // "Misleading numbers" narrative
        misinformationRisk: 7,  // Claims of data manipulation
        viralityRisk: 5  // Trending, good engagement
      }
    },
    {
      id: '7',
      platform: 'quora',
      author: 'Policy Expert',
      handle: '@policyexpert',
      timestamp: '14 hours ago',
      content: 'Question: Is the Democratic Party still the party of the working class? Answer: Based on recent policy priorities and messaging, they seem increasingly out of touch with blue-collar voters. The disconnect is growing.',
      riskScore: 68,
      sentiment: 'negative',
      badges: ['High reach'],
      reach: 52000,
      engagement: 1456,
      entity: 'Democratic Party',
      riskBreakdown: {
        sentimentImpact: 13,  // Negative, "out of touch"
        influenceImpact: 14,  // Moderate-high reach
        topicSensitivity: 11,  // Class/working class - sensitive
        narrativeThreat: 17,  // "Out of touch" narrative growing
        misinformationRisk: 5,  // Subjective interpretation
        viralityRisk: 8  // Question format drives engagement
      }
    },
  ];

  // Apply filters to posts
  const getFilteredPosts = (posts: Post[]): Post[] => {
    let filtered = [...posts];

    // Filter by platform
    if (selectedPlatforms.length > 0) {
      filtered = filtered.filter(post => selectedPlatforms.includes(post.platform));
    }

    // Filter by risk level
    if (selectedRisk !== 'all') {
      filtered = filtered.filter(post => {
        const score = post.riskScore || 0;
        switch (selectedRisk) {
          case 'high':
            return score >= 8; // High risk: 8-10
          case 'medium':
            return score >= 4 && score < 8; // Medium risk: 4-7
          case 'low':
            return score < 4; // Low risk: 1-3
          default:
            return true;
        }
      });
    }

    // Filter by sentiment
    if (selectedSentiment !== 'all') {
      filtered = filtered.filter(post => post.sentiment === selectedSentiment);
    }

    return filtered;
  };

  // Use search results if available, otherwise show empty state (no mock data)
  const displayPosts = hasSearched ? getFilteredPosts(searchResults) : [];

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter': return <Twitter className="w-5 h-5" />;
      case 'youtube': return <Youtube className="w-5 h-5" />;
      case 'reddit': return <MessageCircle className="w-5 h-5" />;
      case 'instagram': return <Instagram className="w-5 h-5" />;
      case 'facebook': return <Facebook className="w-5 h-5" />;
      case 'quora': return <HelpCircle className="w-5 h-5" />;
      case 'news': return <FileText className="w-5 h-5" />;
      default: return null;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'twitter': return '#2563EB';
      case 'youtube': return '#DC2626';
      case 'reddit': return '#F97316';
      case 'instagram': return '#16A34A';
      case 'facebook': return '#3B5998';
      case 'quora': return '#B92B27';
      case 'news': return '#DC2626';
      default: return '#9CA3AF';
    }
  };

  const getRiskColor = (score: number) => {
    // 1-10 scale: 1=positive, 10=negative
    if (score >= 8) return '#DC2626'; // High risk (8-10)
    if (score >= 4) return '#F97316'; // Medium risk (4-7)
    return '#16A34A'; // Low risk (1-3)
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return { bg: '#D1FAE5', text: '#16A34A' };
      case 'negative': return { bg: '#FEE2E2', text: '#DC2626' };
      default: return { bg: '#F3F4F6', text: '#9CA3AF' };
    }
  };

  // Fact Check Handler
  const handleFactCheck = async (post: Post) => {
    // Step 1: Show loading state
    setFactCheckPanel({
      post,
      state: { step: 'loading', claims: [] }
    });

    try {
      // Fetch admin response first (for recommended responses section)
      const adminResponse = await getAdminResponse(post.id);
      if (adminResponse) {
        setPublicResponseText(adminResponse);
      } else {
        // If no admin response, check if post is high-risk
        if (post.riskScore < 80) { // High risk is score >= 8 (80/100 in UI)
          setPublicResponseText('No admin response generated. Admin responses are only created for high-risk posts (score >= 8).');
        } else {
          setPublicResponseText('No admin response available. The system may still be processing this post.');
        }
      }

      // Step 2: Show claims extraction state
      setFactCheckPanel({
        post,
        state: {
          step: 'claims',
          claims: []
        }
      });

      // Step 3: Perform fact-check via API
      const factCheckResult = await factCheckPost(post.id, post.content);

      if (factCheckResult && factCheckResult.claims.length > 0) {
        // Convert FactCheckClaim[] to Claim[]
        const claims: Claim[] = factCheckResult.claims;

        setFactCheckPanel({
          post,
          state: {
            step: 'results',
            claims
          }
        });
      } else {
        // No claims extracted or error occurred
        const fallbackClaim: Claim = {
          id: '1',
          text: post.content.substring(0, 500),
          verdict: factCheckResult?.hasEvidence ? 'unverified' : 'unverified',
          confidence: 'low',
          correctData: undefined,
          sources: [],
          explanation: factCheckResult?.hasEvidence 
            ? 'Claims were extracted but could not be analyzed. Evidence may be insufficient or the analysis encountered an error.'
            : 'No evidence available for fact-checking. Evidence is only collected for high-risk posts (score >= 8).'
        };

        setFactCheckPanel({
          post,
          state: {
            step: 'results',
            claims: [fallbackClaim]
          }
        });
      }
    } catch (error) {
      console.error('Error performing fact-check:', error);
      
      // Show error state
      const errorClaim: Claim = {
        id: 'error',
        text: post.content.substring(0, 500),
        verdict: 'unverified',
        confidence: 'low',
        correctData: undefined,
        sources: [],
        explanation: 'An error occurred while fact-checking this post. Please try again later.'
      };

      setFactCheckPanel({
        post,
        state: {
          step: 'results',
          claims: [errorClaim]
        }
      });
    }
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'true': return <CheckCircle className="w-5 h-5" style={{ color: '#16A34A' }} />;
      case 'false': return <XCircle className="w-5 h-5" style={{ color: '#DC2626' }} />;
      case 'misleading': return <AlertTriangle className="w-5 h-5" style={{ color: '#F97316' }} />;
      case 'unverified': return <AlertCircle className="w-5 h-5" style={{ color: '#9CA3AF' }} />;
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'true': return { bg: '#D1FAE5', text: '#16A34A', label: 'True' };
      case 'false': return { bg: '#FEE2E2', text: '#DC2626', label: 'False' };
      case 'misleading': return { bg: '#FED7AA', text: '#F97316', label: 'Misleading' };
      case 'unverified': return { bg: '#F3F4F6', text: '#9CA3AF', label: 'Unverified' };
      default: return { bg: '#F3F4F6', text: '#9CA3AF', label: 'Unknown' };
    }
  };

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case 'high': return { bg: '#D1FAE5', text: '#16A34A', label: 'High Confidence' };
      case 'medium': return { bg: '#FED7AA', text: '#F97316', label: 'Medium Confidence' };
      case 'low': return { bg: '#FEE2E2', text: '#DC2626', label: 'Low Confidence' };
      default: return { bg: '#F3F4F6', text: '#9CA3AF', label: 'Unknown' };
    }
  };

  // Copy handler
  const handleCopyResponse = (text: string, type: string) => {
    // Create a temporary textarea element
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    
    try {
      textarea.select();
      document.execCommand('copy');
      setCopiedResponse(type);
      setTimeout(() => setCopiedResponse(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    } finally {
      document.body.removeChild(textarea);
    }
  };


  // Helper function to get source URL
  const getSourceUrl = (sourceName: string) => {
    // If sourceName is already a URL, return it directly
    if (sourceName.startsWith('http://') || sourceName.startsWith('https://')) {
      return sourceName;
    }
    // Otherwise, try to find a matching URL from a mapping (fallback)
    const sourceUrls: { [key: string]: string } = {
      'Democratic Party Platform 2020': 'https://democrats.org/where-we-stand/party-platform/',
      'Congressional Budget Office Analysis': 'https://www.cbo.gov/topics/health-care',
      'Center for Medicare Services': 'https://www.cms.gov/',
      'Congressional Research Service': 'https://crsreports.congress.gov/'
    };
    return sourceUrls[sourceName] || '#';
  };

  // Quick Action handlers
  const handleSaveToLibrary = () => {
    setSavedToLibrary(true);
    setTimeout(() => setSavedToLibrary(false), 2000);
  };

  const handleAddToCrisis = () => {
    setAddedToCrisis(true);
    setTimeout(() => setAddedToCrisis(false), 2000);
  };

  const handleShareWithTeam = () => {
    setSharedWithTeam(true);
    setTimeout(() => setSharedWithTeam(false), 2000);
  };

  const handleMarkAsFactChecked = () => {
    setMarkedAsFactChecked(true);
    setTimeout(() => {
      setMarkedAsFactChecked(false);
      setFactCheckPanel(null);
    }, 1500);
  };

  return (
    <div className="flex h-full" style={{ backgroundColor: '#F7F9FA' }}>
      {/* Feed List */}
      <div className={`${selectedPost ? 'w-1/2' : 'w-full'} flex flex-col`} style={{ borderRight: '1px solid #E0E6EA' }}>
        {/* Filters */}
        <div className="bg-white p-5 space-y-4" style={{ borderBottom: '1px solid #E0E6EA' }}>
          <h1 style={{ color: '#1A1F26', fontWeight: '600', fontSize: '1.5rem' }}>Feed</h1>
          
          {/* Search Info */}
          {hasSearched && (
            <div className="mt-2 mb-4 flex items-center justify-between">
              <p className="text-sm" style={{ color: '#5C6C75' }}>
                Showing {searchResults.length} post{searchResults.length !== 1 ? 's' : ''} for "{searchKeyword}"
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchKeyword('');
                  setSearchResults([]);
                  setHasSearched(false);
                  setSearchError(null);
                  localStorage.removeItem('feed_search_results');
                  localStorage.removeItem('feed_search_keyword');
                  localStorage.setItem('feed_has_searched', 'false');
                }}
                className="px-4 py-2 rounded-lg border font-medium transition-all hover:bg-gray-50"
                style={{ 
                  border: '1px solid #E0E6EA', 
                  color: '#5C6C75',
                  fontSize: '0.875rem'
                }}
              >
                Clear Search
              </button>
            </div>
          )}
          {searchError && (
            <p className="mt-2 mb-4 text-sm" style={{ color: '#DC2626' }}>
              {searchError}
            </p>
          )}
          
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <label className="block mb-2" style={{ color: '#5C6C75', fontSize: '0.8125rem', fontWeight: '500' }}>Platform</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'twitter', label: 'Twitter' },
                  { key: 'youtube', label: 'Youtube' },
                  { key: 'reddit', label: 'Reddit' },
                  { key: 'instagram', label: 'Instagram' },
                  { key: 'facebook', label: 'Facebook' },
                  { key: 'news', label: 'News' }
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => {
                      if (selectedPlatforms.includes(key)) {
                        setSelectedPlatforms(selectedPlatforms.filter(p => p !== key));
                      } else {
                        setSelectedPlatforms([...selectedPlatforms, key]);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg transition-all flex items-center"
                    style={{
                      border: '1px solid',
                      borderColor: selectedPlatforms.includes(key) ? '#0084BF' : '#E0E6EA',
                      backgroundColor: selectedPlatforms.includes(key) ? '#E6F4FA' : 'white',
                      color: selectedPlatforms.includes(key) ? '#0084BF' : '#5C6C75',
                      fontSize: '0.8125rem',
                      fontWeight: '500'
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                      {getPlatformIcon(key)}
                      <span className="ml-1.5">{label}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block mb-2" style={{ color: '#5C6C75', fontSize: '0.8125rem', fontWeight: '500' }}>Risk Level</label>
              <select
                value={selectedRisk}
                onChange={(e) => setSelectedRisk(e.target.value)}
                className="px-3 py-1.5 rounded-lg border"
                style={{ border: '1px solid #E0E6EA', color: '#3D4A52', fontSize: '0.8125rem', backgroundColor: 'white' }}
              >
                <option value="all">All Levels</option>
                <option value="high">High Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="low">Low Risk</option>
              </select>
            </div>

            <div>
              <label className="block mb-2" style={{ color: '#5C6C75', fontSize: '0.8125rem', fontWeight: '500' }}>Sentiment</label>
              <select
                value={selectedSentiment}
                onChange={(e) => setSelectedSentiment(e.target.value)}
                className="px-3 py-1.5 rounded-lg border"
                style={{ border: '1px solid #E0E6EA', color: '#3D4A52', fontSize: '0.8125rem', backgroundColor: 'white' }}
              >
                <option value="all">All Sentiments</option>
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
              </select>
            </div>
          </div>
        </div>

        {/* Posts */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {displayPosts.length === 0 && hasSearched && !isSearching ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="w-12 h-12 mb-4" style={{ color: '#9CA3AF' }} />
              <p style={{ color: '#5C6C75', fontSize: '1rem' }}>No posts found for "{searchKeyword}"</p>
              <p style={{ color: '#9CA3AF', fontSize: '0.875rem', marginTop: '8px' }}>Try a different search term</p>
            </div>
          ) : displayPosts.length === 0 && !hasSearched ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Search className="w-12 h-12 mb-4" style={{ color: '#9CA3AF' }} />
              <p style={{ color: '#5C6C75', fontSize: '1rem' }}>Enter a search term to find posts</p>
            </div>
          ) : (
            <>
            {displayPosts.map((post) => {
            const sentimentColors = getSentimentColor(post.sentiment);
            return (
              <div
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="bg-white rounded-lg p-5 cursor-pointer transition-all hover:shadow-md"
                style={{
                  border: selectedPost?.id === post.id ? '2px solid #0084BF' : '1px solid #E0E6EA',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.08)'
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div style={{ color: getPlatformColor(post.platform) }}>
                      {getPlatformIcon(post.platform)}
                    </div>
                    <div>
                      <p style={{ color: '#1A1F26', fontWeight: '600', fontSize: '0.875rem' }}>{post.author}</p>
                      <p style={{ color: '#7A8A94', fontSize: '0.8125rem' }}>{post.handle} · {post.timestamp}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <span 
                        className="px-2.5 py-1 rounded text-white cursor-pointer" 
                        style={{ 
                          backgroundColor: getRiskColor(post.riskScore),
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}
                        onMouseEnter={() => setHoveredRiskScore(post.id)}
                        onMouseLeave={() => setHoveredRiskScore(null)}
                      >
                                   {post.riskScore}/10
                      </span>
                      
                      {/* Risk Breakdown Tooltip */}
                      {hoveredRiskScore === post.id && post.riskBreakdown && (
                        <div 
                          className="absolute right-0 mt-2 p-4 rounded-xl shadow-2xl z-50"
                          style={{ 
                            backgroundColor: 'white', 
                            border: '2px solid #E5E7EB',
                            width: '280px',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                          }}
                        >
                          <h4 style={{ color: '#071525', fontWeight: '600', marginBottom: '12px', fontSize: '0.875rem' }}>
                            Risk Score Breakdown
                          </h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span style={{ color: '#5C6C75', fontSize: '0.8125rem' }}>Sentiment Impact</span>
                              <span style={{ color: '#071525', fontWeight: '600', fontSize: '0.8125rem' }}>
                                {post.riskBreakdown.sentimentImpact}/20
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span style={{ color: '#5C6C75', fontSize: '0.8125rem' }}>Influence Impact</span>
                              <span style={{ color: '#071525', fontWeight: '600', fontSize: '0.8125rem' }}>
                                {post.riskBreakdown.influenceImpact}/25
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span style={{ color: '#5C6C75', fontSize: '0.8125rem' }}>Topic Sensitivity</span>
                              <span style={{ color: '#071525', fontWeight: '600', fontSize: '0.8125rem' }}>
                                {post.riskBreakdown.topicSensitivity}/15
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span style={{ color: '#5C6C75', fontSize: '0.8125rem' }}>Narrative Threat</span>
                              <span style={{ color: '#071525', fontWeight: '600', fontSize: '0.8125rem' }}>
                                {post.riskBreakdown.narrativeThreat}/20
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span style={{ color: '#5C6C75', fontSize: '0.8125rem' }}>Misinformation Risk</span>
                              <span style={{ color: '#071525', fontWeight: '600', fontSize: '0.8125rem' }}>
                                {post.riskBreakdown.misinformationRisk}/10
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span style={{ color: '#5C6C75', fontSize: '0.8125rem' }}>Virality Risk</span>
                              <span style={{ color: '#071525', fontWeight: '600', fontSize: '0.8125rem' }}>
                                {post.riskBreakdown.viralityRisk}/10
                              </span>
                            </div>
                            <div className="pt-2 mt-2" style={{ borderTop: '1px solid #E5E7EB' }}>
                              <div className="flex items-center justify-between">
                                <span style={{ color: '#071525', fontWeight: '600', fontSize: '0.875rem' }}>Total Risk</span>
                                <span 
                                  className="px-2 py-1 rounded" 
                                  style={{ 
                                    backgroundColor: getRiskColor(post.riskScore),
                                    color: 'white',
                                    fontWeight: '600',
                                    fontSize: '0.875rem'
                                  }}
                                >
                                  {post.riskScore}/10
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <p style={{ color: '#3D4A52', fontSize: '0.875rem', lineHeight: '1.6' }} className="mb-3">{post.content}</p>

                {/* Hashtags */}
                {(post as any).hashtags && (post as any).hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {(post as any).hashtags.map((tag: string, idx: number) => (
                      <span key={idx} className="px-2.5 py-1 rounded" style={{ 
                        backgroundColor: '#E6F4FA', 
                        color: '#0084BF',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Media/Images */}
                {(post as any).media && (post as any).media.length > 0 && (
                  <div className="mb-3 grid gap-2" style={{ 
                    gridTemplateColumns: (post as any).media.length === 1 ? 'minmax(0, 350px)' : 'repeat(2, minmax(0, 250px))', 
                    maxWidth: '100%',
                    width: 'fit-content'
                  }}>
                    {(post as any).media.slice(0, 4).map((mediaItem: any, idx: number) => (
                      <div key={idx} className="relative rounded-lg overflow-hidden" style={{ height: '150px', width: '250px', maxWidth: '100%', backgroundColor: '#F3F4F6' }}>
                        {mediaItem.type === 'image' || mediaItem.type === 'gif' ? (
                          <img 
                            src={mediaItem.url} 
                            alt={`Media ${idx + 1}`}
                            className="h-full w-full object-contain cursor-pointer hover:opacity-90 transition-opacity"
                            style={{ height: '150px', width: '250px', maxWidth: '100%', objectFit: 'contain', backgroundColor: '#F3F4F6' }}
                            onClick={() => window.open(mediaItem.url, '_blank')}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200" style={{ height: '150px', width: '250px', maxWidth: '100%' }}>
                            <Video className="w-6 h-6" style={{ color: '#9CA3AF' }} />
                            <span className="ml-2" style={{ color: '#7A8A94', fontSize: '0.75rem' }}>Video</span>
                          </div>
                        )}
                      </div>
                    ))}
                    {(post as any).media.length > 4 && (
                      <div className="relative rounded-lg overflow-hidden flex items-center justify-center bg-gray-200" style={{ height: '150px', width: '250px', maxWidth: '100%' }}>
                        <span style={{ color: '#7A8A94', fontSize: '0.875rem', fontWeight: '500' }}>
                          +{(post as any).media.length - 4} more
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Badges */}
                {post.badges.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.badges.map((badge, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded" style={{ 
                        backgroundColor: '#E6F4FA', 
                        color: '#0084BF',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}>
                        {badge}
                      </span>
                    ))}
                  </div>
                )}

                {/* Stats & Actions */}
                <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #E0E6EA' }}>
                  <div className="flex items-center gap-4" style={{ color: '#7A8A94', fontSize: '0.8125rem' }}>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{post.reach.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>{post.engagement.toLocaleString()}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded" style={{ backgroundColor: sentimentColors.bg, color: sentimentColors.text, fontSize: '0.75rem', fontWeight: '500' }}>
                      {post.sentiment}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <button className="p-2 rounded-lg hover:bg-gray-50 transition-colors" style={{ color: '#7A8A94' }}>
                      <AlertCircle className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-gray-50 transition-colors" style={{ color: '#7A8A94' }}>
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-gray-50 transition-colors" style={{ color: '#7A8A94' }}>
                      <Bookmark className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-gray-50 transition-colors" style={{ color: '#7A8A94' }}>
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
            </>
          )}
        </div>
      </div>

      {/* Detail Panel */}
      {selectedPost && (
        <div className="w-1/2 bg-white overflow-y-auto">
          <div className="sticky top-0 bg-white p-6 flex items-center justify-between" style={{ borderBottom: '1px solid #E5E7EB' }}>
            <h2 style={{ color: '#071525' }}>Post Details</h2>
            <button
              onClick={() => setSelectedPost(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="p-6 space-y-8">
            {/* Post Header */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div style={{ color: getPlatformColor(selectedPost.platform) }}>
                  {getPlatformIcon(selectedPost.platform)}
                </div>
                <div>
                  <p style={{ color: '#071525', fontWeight: '500' }}>{selectedPost.author}</p>
                  <p style={{ color: '#9CA3AF' }}>{selectedPost.handle}</p>
                </div>
              </div>
              <div className="flex items-start justify-between gap-4 mb-3">
                <p style={{ color: '#334155', flex: 1 }}>{showTranslated && translatedContent ? translatedContent : selectedPost.content}</p>
                <button
                  onClick={async () => {
                    if (showTranslated && translatedContent) {
                      // Toggle back to original
                      setShowTranslated(false);
                    } else {
                      // Translate
                      setIsTranslating(true);
                      try {
                        const translated = await translateText(selectedPost.content);
                        if (translated) {
                          setTranslatedContent(translated);
                          setShowTranslated(true);
                        } else {
                          alert('Translation failed. Please try again.');
                        }
                      } catch (error) {
                        console.error('Translation error:', error);
                        alert('Translation failed. Please try again.');
                      } finally {
                        setIsTranslating(false);
                      }
                    }
                  }}
                  disabled={isTranslating}
                  className="px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  style={{
                    backgroundColor: showTranslated ? '#9CA3AF' : '#0084BF',
                    color: 'white',
                    fontSize: '0.875rem',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => {
                    if (!isTranslating && !showTranslated) {
                      e.currentTarget.style.backgroundColor = '#006A9B';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isTranslating && !showTranslated) {
                      e.currentTarget.style.backgroundColor = '#0084BF';
                    }
                  }}
                >
                  {isTranslating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Translating...
                    </>
                  ) : showTranslated ? (
                    'Show Original'
                  ) : (
                    'Translate'
                  )}
                </button>
              </div>
              
              {/* Hashtags in detail panel */}
              {(selectedPost as any).hashtags && (selectedPost as any).hashtags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {(selectedPost as any).hashtags.map((tag: string, idx: number) => (
                    <span key={idx} className="px-2.5 py-1 rounded" style={{ 
                      backgroundColor: '#E6F4FA', 
                      color: '#0084BF',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Media in detail panel */}
              {(selectedPost as any).media && (selectedPost as any).media.length > 0 && (
                <div className="mt-4 grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(0, 250px))', maxWidth: '100%', width: 'fit-content' }}>
                  {(selectedPost as any).media.map((mediaItem: any, idx: number) => (
                    <div key={idx} className="relative rounded-lg overflow-hidden" style={{ height: '180px', width: '250px', maxWidth: '100%', backgroundColor: '#F3F4F6' }}>
                      {mediaItem.type === 'image' || mediaItem.type === 'gif' ? (
                        <img 
                          src={mediaItem.url} 
                          alt={`Media ${idx + 1}`}
                          className="h-full w-full object-contain cursor-pointer hover:opacity-90 transition-opacity"
                          style={{ height: '180px', width: '250px', maxWidth: '100%', objectFit: 'contain', backgroundColor: '#F3F4F6' }}
                          onClick={() => window.open(mediaItem.url, '_blank')}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200" style={{ height: '180px', width: '250px', maxWidth: '100%' }}>
                          <Video className="w-8 h-8 mb-2" style={{ color: '#9CA3AF' }} />
                          <span style={{ color: '#7A8A94', fontSize: '0.75rem' }}>Video</span>
                          <a 
                            href={mediaItem.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="mt-2 px-2 py-1 rounded text-white text-xs hover:opacity-90"
                            style={{ backgroundColor: '#0084BF' }}
                          >
                            Open
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              <p style={{ color: '#9CA3AF' }} className="mt-2">{selectedPost.timestamp}</p>
            </div>

            {/* Detailed Breakdown */}
            <div className="rounded-2xl p-5 space-y-4" style={{ backgroundColor: '#F9FAFB' }}>
              <h3 style={{ color: '#071525' }}>Analysis Breakdown</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p style={{ color: '#9CA3AF' }}>Risk Score</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-3 py-1.5 rounded-xl text-white" style={{ backgroundColor: getRiskColor(selectedPost.riskScore) }}>
                      {selectedPost.riskScore}/10
                    </span>
                    <span style={{ color: '#071525' }}>
                      {selectedPost.riskScore >= 8 ? 'High' : selectedPost.riskScore >= 4 ? 'Medium' : 'Low'}
                    </span>
                  </div>
                </div>

                <div>
                  <p style={{ color: '#9CA3AF' }}>Sentiment</p>
                  <span className="inline-block px-3 py-1.5 rounded-xl mt-2" style={{
                    backgroundColor: getSentimentColor(selectedPost.sentiment).bg,
                    color: getSentimentColor(selectedPost.sentiment).text
                  }}>
                    {selectedPost.sentiment}
                  </span>
                </div>

                <div>
                  <p style={{ color: '#9CA3AF' }}>Reach</p>
                  <p style={{ color: '#071525', fontWeight: '500' }} className="mt-2">{selectedPost.reach.toLocaleString()}</p>
                </div>

                <div>
                  <p style={{ color: '#9CA3AF' }}>Engagement</p>
                  <p style={{ color: '#071525', fontWeight: '500' }} className="mt-2">{selectedPost.engagement.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Suggested Response */}
            <div>
              <h3 style={{ color: '#071525' }} className="mb-3">Suggested Response</h3>
              {loadingAdminResponse ? (
                <div className="rounded-xl p-5 flex items-center justify-center" style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', minHeight: '100px' }}>
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#0084BF' }} />
                    <p style={{ color: '#7A8A94' }}>Generating admin response...</p>
                  </div>
                </div>
              ) : adminResponse ? (
                <div className="rounded-xl p-5" style={{ backgroundColor: '#F0F9FF', border: '1px solid #BAE6FD' }}>
                  <p style={{ color: '#334155', fontSize: '0.875rem', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                    {adminResponse}
                  </p>
                  <div className="flex items-center gap-2 mt-4">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(adminResponse);
                        setCopiedResponse(selectedPost.id);
                        setTimeout(() => setCopiedResponse(null), 2000);
                      }}
                      className="px-4 py-2 rounded-lg text-white transition-all hover:opacity-90 flex items-center gap-2"
                      style={{ backgroundColor: '#0084BF' }}
                    >
                      <Copy className="w-4 h-4" />
                      {copiedResponse === selectedPost.id ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl p-5" style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                  <p style={{ color: '#7A8A94', fontSize: '0.875rem' }}>
                    {selectedPost.riskScore >= 8 
                      ? 'Generating admin response... This may take a moment.'
                      : 'Admin response is only generated for posts with a risk score of 8 or higher (high-risk).'}
                  </p>
                </div>
              )}
            </div>

            {/* Topic Tags */}
            <div>
              <h3 style={{ color: '#071525' }} className="mb-3">Related Topics</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-4 py-2 rounded-xl" style={{ backgroundColor: '#E2ECFF', color: '#2563EB' }}>Product Quality</span>
                <span className="px-4 py-2 rounded-xl" style={{ backgroundColor: '#E2ECFF', color: '#2563EB' }}>Customer Service</span>
                <span className="px-4 py-2 rounded-xl" style={{ backgroundColor: '#E2ECFF', color: '#2563EB' }}>Pricing</span>
              </div>
            </div>

            {/* Narrative Associations */}
            <div>
              <h3 style={{ color: '#071525' }} className="mb-3">Associated Narratives</h3>
              <div className="space-y-2">
                <div className="p-4 rounded-xl" style={{ border: '1px solid #E5E7EB' }}>
                  <p style={{ color: '#071525', fontWeight: '500' }}>Brand prioritizes profit over quality</p>
                  <p style={{ color: '#9CA3AF' }} className="mt-1">Criticality: 78</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div>
              <h3 style={{ color: '#071525' }} className="mb-4">Actions</h3>
              <div className="space-y-3">
                <button className="w-full px-4 py-3 rounded-xl text-white transition-all hover:opacity-90" style={{ background: 'linear-gradient(135deg, #2563EB 0%, #06B6D4 100%)' }} onClick={() => handleFactCheck(selectedPost)}>
                  Fact Check
                </button>
                <button className="w-full px-4 py-3 rounded-xl transition-all hover:bg-gray-50" style={{ border: '1px solid #E5E7EB', color: '#334155' }}>
                  Draft Response
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fact Check Sliding Panel */}
      {factCheckPanel && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
          onClick={() => setFactCheckPanel(null)}
        >
          <div 
            className="bg-white w-full max-w-4xl h-full max-h-[90vh] overflow-y-auto animate-slideIn"
            style={{ borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white p-6 flex items-center justify-between" style={{ borderBottom: '2px solid #E5E7EB', borderRadius: '16px 16px 0 0' }}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#E6F4FA' }}>
                  <AlertCircle className="w-6 h-6" style={{ color: '#0084BF' }} />
                </div>
                <div>
                  <h2 style={{ color: '#071525', fontWeight: '600', fontSize: '1.25rem' }}>Fact Check Analysis</h2>
                  <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>AI-powered claim verification</p>
                </div>
              </div>
              <button
                onClick={() => setFactCheckPanel(null)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                style={{ color: '#9CA3AF' }}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Step 1: Post Context */}
              <div className="rounded-xl p-5" style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                <h3 style={{ color: '#071525', fontWeight: '600', marginBottom: '12px' }}>Post Being Analyzed</h3>
                <div className="flex items-center gap-3 mb-3">
                  <div style={{ color: getPlatformColor(factCheckPanel.post.platform) }}>
                    {getPlatformIcon(factCheckPanel.post.platform)}
                  </div>
                  <div>
                    <p style={{ color: '#071525', fontWeight: '500', fontSize: '0.875rem' }}>{factCheckPanel.post.author}</p>
                    <p style={{ color: '#9CA3AF', fontSize: '0.8125rem' }}>{factCheckPanel.post.handle} · {factCheckPanel.post.timestamp}</p>
                  </div>
                </div>
                <p style={{ color: '#334155', fontSize: '0.875rem', lineHeight: '1.6' }}>{factCheckPanel.post.content}</p>
              </div>

              {/* Step 2: Loading or Claims Extraction */}
              {factCheckPanel.state.step === 'loading' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: '#0084BF' }} />
                      <p style={{ color: '#071525', fontWeight: '600', fontSize: '1.125rem' }}>Analyzing Post Content...</p>
                      <p style={{ color: '#9CA3AF', marginTop: '8px' }}>Extracting claims and verifiable statements</p>
                    </div>
                  </div>
                </div>
              )}

              {factCheckPanel.state.step === 'claims' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: '#0084BF' }} />
                      <p style={{ color: '#071525', fontWeight: '600', fontSize: '1.125rem' }}>Verifying Claims...</p>
                      <p style={{ color: '#9CA3AF', marginTop: '8px' }}>Cross-referencing with fact databases and official sources</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Results */}
              {factCheckPanel.state.step === 'results' && (
                <>
                  {/* Extracted Claims Title */}
                  <div>
                    <h3 style={{ color: '#071525', fontWeight: '600', fontSize: '1.125rem', marginBottom: '4px' }}>Extracted Claims</h3>
                    <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>{factCheckPanel.state.claims.length} verifiable claims identified</p>
                  </div>

                  {/* Claim Cards */}
                  <div className="space-y-5">
                    {factCheckPanel.state.claims.map((claim, index) => {
                      const verdictStyle = getVerdictColor(claim.verdict);
                      const confidenceBadge = getConfidenceBadge(claim.confidence);
                      
                      return (
                        <div key={claim.id} className="rounded-xl p-6" style={{ border: '2px solid #E5E7EB', backgroundColor: 'white' }}>
                          {/* Claim Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 rounded-lg" style={{ backgroundColor: '#E6F4FA', color: '#0084BF', fontWeight: '600', fontSize: '0.875rem' }}>
                                CLAIM {index + 1}
                              </span>
                              <span className="px-3 py-1 rounded-lg" style={{ backgroundColor: confidenceBadge.bg, color: confidenceBadge.text, fontSize: '0.75rem', fontWeight: '600' }}>
                                {confidenceBadge.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: verdictStyle.bg }}>
                              {getVerdictIcon(claim.verdict)}
                              <span style={{ color: verdictStyle.text, fontWeight: '600', fontSize: '0.875rem' }}>
                                {verdictStyle.label}
                              </span>
                            </div>
                          </div>

                          {/* Evidence/Claim Text */}
                          <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
                            {(claim as any).evidenceItem?.title ? (
                              <div>
                                <p style={{ color: '#071525', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px' }}>
                                  {(claim as any).evidenceItem.title}
                                </p>
                                {(claim as any).evidenceItem.snippet && (
                                  <p style={{ color: '#334155', fontSize: '0.9375rem', lineHeight: '1.6' }}>
                                    {(claim as any).evidenceItem.snippet}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p style={{ color: '#071525', fontSize: '0.9375rem', lineHeight: '1.6', fontStyle: 'italic' }}>
                                "{claim.text}"
                              </p>
                            )}
                          </div>

                          {/* Verdict Details */}
                          <div className="space-y-4">
                            {/* Correct Data */}
                            {claim.correctData && (
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <BarChart3 className="w-4 h-4" style={{ color: '#0084BF' }} />
                                  <h4 style={{ color: '#071525', fontWeight: '600', fontSize: '0.875rem' }}>Correct Data:</h4>
                                </div>
                                <p style={{ color: '#334155', fontSize: '0.875rem', lineHeight: '1.6' }}>
                                  {claim.correctData}
                                </p>
                              </div>
                            )}

                            {/* Sources */}
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <FileText className="w-4 h-4" style={{ color: '#0084BF' }} />
                                <h4 style={{ color: '#071525', fontWeight: '600', fontSize: '0.875rem' }}>Sources:</h4>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {claim.sources && claim.sources.length > 0 ? (
                                  claim.sources.map((source, idx) => {
                                    // Check if source is already a URL
                                    const isUrl = source.startsWith('http://') || source.startsWith('https://');
                                    const url = isUrl ? source : getSourceUrl(source);
                                    // Use evidence item URL if available, otherwise use source
                                    const actualUrl = (claim as any).evidenceItem?.url || url;
                                    const displayName = isUrl 
                                      ? new URL(source).hostname.replace('www.', '')
                                      : (source.length > 50 ? source.substring(0, 50) + '...' : source);
                                    return (
                                      <span key={idx} className="px-3 py-1.5 rounded-lg" style={{ backgroundColor: '#E6F4FA', color: '#0084BF', fontSize: '0.8125rem' }}>
                                        <a href={actualUrl} target="_blank" rel="noopener noreferrer" title={source}>
                                          {displayName}
                                        </a>
                                      </span>
                                    );
                                  })
                                ) : (
                                  <span style={{ color: '#9CA3AF', fontSize: '0.8125rem' }}>No sources available</span>
                                )}
                              </div>
                            </div>

                            {/* Explanation */}
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <MessageSquare className="w-4 h-4" style={{ color: '#0084BF' }} />
                                <h4 style={{ color: '#071525', fontWeight: '600', fontSize: '0.875rem' }}>Explanation:</h4>
                              </div>
                              <p style={{ color: '#334155', fontSize: '0.875rem', lineHeight: '1.6' }}>
                                {claim.explanation}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Recommended Responses */}
                  <div className="mt-8 space-y-4">
                    <h3 style={{ color: '#071525', fontWeight: '600', fontSize: '1.125rem' }}>Recommended Responses</h3>
                    
                    {/* Public Response */}
                    <div className="rounded-xl p-5" style={{ border: '2px solid #E5E7EB', backgroundColor: '#F0F9FF' }}>
                      <div className="flex items-center gap-2 mb-3">
                        <MessageSquare className="w-5 h-5" style={{ color: '#0084BF' }} />
                        <h4 style={{ color: '#071525', fontWeight: '600' }}>Public Response</h4>
                        <span className="ml-auto px-2 py-1 rounded text-xs" style={{ backgroundColor: '#E6F4FA', color: '#0084BF', fontWeight: '600' }}>
                          For Spokespeople & Social Media
                        </span>
                      </div>
                      <p style={{ color: '#334155', fontSize: '0.875rem', lineHeight: '1.6', marginBottom: '12px' }}>
                        {publicResponseText || 'No admin response available. Admin responses are generated for high-risk posts based on evidence collected.'}
                      </p>
                      <div className="flex gap-3">
                        <button 
                          className="px-4 py-2 rounded-lg flex items-center gap-2 transition-colors" 
                          style={{ 
                            border: '1px solid #0084BF', 
                            backgroundColor: copiedResponse === 'Public' ? '#0084BF' : 'transparent',
                            color: copiedResponse === 'Public' ? 'white' : '#0084BF'
                          }} 
                          onClick={() => handleCopyResponse(publicResponseText || 'No admin response available.', 'Public')}
                        >
                          {copiedResponse === 'Public' ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              <span>Copy Response</span>
                            </>
                          )}
                        </button>
                        <button 
                          className="px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition-colors text-white" 
                          style={{ backgroundColor: '#0084BF' }}
                          onClick={() => setShowPostResponse(true)}
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>Post Response</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Post Response Modal */}
      {showPostResponse && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
          onClick={() => setShowPostResponse(false)}
        >
          <div 
            className="bg-white w-full max-w-2xl rounded-xl overflow-hidden"
            style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 flex items-center justify-between" style={{ borderBottom: '2px solid #E5E7EB' }}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#E6F4FA' }}>
                  <MessageSquare className="w-6 h-6" style={{ color: '#0084BF' }} />
                </div>
                <div>
                  <h2 style={{ color: '#071525', fontWeight: '600', fontSize: '1.25rem' }}>Post Public Response</h2>
                  <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>Select platform and publish your response</p>
                </div>
              </div>
              <button
                onClick={() => setShowPostResponse(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                style={{ color: '#9CA3AF' }}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Platform Selection */}
              <div>
                <label className="block mb-3" style={{ color: '#071525', fontWeight: '600' }}>Select Platform</label>
                <div className="grid grid-cols-3 gap-3">
                  {['twitter', 'facebook', 'instagram'].map((platform) => (
                    <button
                      key={platform}
                      className="px-4 py-3 rounded-lg border-2 transition-all hover:border-blue-400 flex items-center gap-2 justify-center"
                      style={{ borderColor: '#E0E6EA' }}
                    >
                      <div style={{ color: getPlatformColor(platform) }}>
                        {getPlatformIcon(platform)}
                      </div>
                      <span style={{ color: '#334155', fontWeight: '500', fontSize: '0.875rem' }}>
                        {platform.charAt(0).toUpperCase() + platform.slice(1)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Response Text */}
              <div>
                <label className="block mb-2" style={{ color: '#071525', fontWeight: '600' }}>Response Message</label>
                <textarea
                  className="w-full rounded-xl p-4 focus:outline-none focus:ring-2 transition-all"
                  style={{ border: '2px solid #E5E7EB', color: '#334155', minHeight: '150px' }}
                  defaultValue={publicResponseText || ''}
                  placeholder="Edit your response message..."
                />
                <p style={{ color: '#9CA3AF', fontSize: '0.8125rem', marginTop: '8px' }}>
                  Character count: {(publicResponseText || '').length}
                </p>
              </div>

              {/* Scheduling Options */}
              <div className="rounded-xl p-4" style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4" style={{ accentColor: '#0084BF' }} />
                  <span style={{ color: '#334155', fontSize: '0.875rem' }}>Schedule for later</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4" style={{ borderTop: '1px solid #E5E7EB' }}>
                <button
                  className="flex-1 px-6 py-3 rounded-xl transition-all hover:bg-gray-100"
                  style={{ border: '1px solid #E5E7EB', color: '#334155', fontWeight: '500' }}
                  onClick={() => setShowPostResponse(false)}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 px-6 py-3 rounded-xl text-white transition-all hover:opacity-90 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #0084BF 0%, #06B6D4 100%)', fontWeight: '600' }}
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Publish Response</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}