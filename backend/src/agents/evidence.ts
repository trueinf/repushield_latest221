// Evidence collection agent: Fetches evidence from SerpAPI Google AI Mode for posts with score >= 8 (high-risk)

export interface EvidenceResult {
  title: string;
  url: string;
  snippet?: string;
  text_block?: string;
}

export async function collectEvidence(postText: string): Promise<EvidenceResult[]> {
  const serpApiKey = process.env.SERPAPI_KEY;
  
  if (!serpApiKey) {
    console.warn('SERPAPI_KEY not configured, skipping evidence collection');
    return [];
  }

  try {
    // Use Google AI Mode API - just send the post text as query
    const query = postText.substring(0, 200).trim(); // Limit query length
    const url = `https://serpapi.com/search.json?engine=google_ai_mode&q=${encodeURIComponent(query)}&api_key=${serpApiKey}`;
    
    const response = await fetch(url, {
      method: 'GET',
    });

    if (response.status !== 200) {
      console.warn(`SerpAPI HTTP ${response.status} for evidence collection`);
      return [];
    }

    const data = await response.json();
    const evidence: EvidenceResult[] = [];

    // Extract text_blocks (AI-generated content)
    const textBlocks = data.text_blocks || [];
    for (const block of textBlocks.slice(0, 3)) {
      if (block.type === 'paragraph' && block.snippet) {
        evidence.push({
          title: `AI Summary: ${block.snippet.substring(0, 100)}`,
          url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
          snippet: block.snippet,
          text_block: block.snippet,
        });
      }
    }

    // Extract references (source URLs)
    const references = data.references || [];
    for (const ref of references.slice(0, 5)) {
      if (ref.link) {
        evidence.push({
          title: ref.title || ref.source || 'Reference',
          url: ref.link,
          snippet: ref.snippet,
        });
      }
    }

    console.log(`Collected ${evidence.length} evidence items for post`);
    return evidence;
  } catch (error: any) {
    console.error(`Error collecting evidence: ${error.message}`);
    return [];
  }
}

