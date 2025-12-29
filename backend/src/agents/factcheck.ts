// Fact-check agent: Uses evidence data directly from database to display fact-check details

import { getEvidence } from '../database/operations';
import { EvidenceRow } from '../database/supabase';

export interface FactCheckClaim {
  id: string;
  text: string;
  verdict: 'true' | 'false' | 'misleading' | 'unverified';
  confidence: 'high' | 'medium' | 'low';
  correctData?: string;
  sources: string[];
  explanation: string;
  evidenceItem?: {
    title?: string | null;
    url?: string | null;
    snippet?: string | null;
  };
}

export interface FactCheckResult {
  claims: FactCheckClaim[];
  hasEvidence: boolean;
}

// Convert evidence data to fact-check claims format
function convertEvidenceToClaims(evidence: EvidenceRow[], postContent: string): FactCheckClaim[] {
  if (evidence.length === 0) {
    // No evidence available - return the post as a single unverified claim
    return [{
      id: 'claim-1',
      text: postContent.substring(0, 500),
      verdict: 'unverified',
      confidence: 'low',
      correctData: undefined,
      sources: [],
      explanation: 'No evidence available for fact-checking. Evidence is only collected for high-risk posts (score >= 8).',
    }];
  }

  // Convert each evidence item to a claim
  const claims: FactCheckClaim[] = evidence.map((ev, index) => {
    // Extract snippet from evidence_data if not directly available
    let evidenceSnippet = ev.snippet;
    let evidenceUrl = ev.url;
    let evidenceTitle = ev.title;

    // Try to get additional data from evidence_data JSONB field
    if (ev.evidence_data) {
      try {
        const evidenceData = typeof ev.evidence_data === 'string' 
          ? JSON.parse(ev.evidence_data) 
          : ev.evidence_data;
        
        // Use evidence_data values if main fields are missing
        if (!evidenceSnippet && evidenceData.text_block) {
          evidenceSnippet = evidenceData.text_block;
        }
        if (!evidenceSnippet && evidenceData.snippet) {
          evidenceSnippet = evidenceData.snippet;
        }
        if (!evidenceUrl && evidenceData.url) {
          evidenceUrl = evidenceData.url;
        }
        if (!evidenceTitle && evidenceData.title) {
          evidenceTitle = evidenceData.title;
        }
      } catch (e) {
        // Ignore parsing errors
        console.warn(`Error parsing evidence_data for evidence ${ev.id}:`, e);
      }
    }

    // Use evidence title as claim text, or snippet, or fallback
    const claimText = evidenceTitle 
      ? evidenceTitle.replace(/^AI Summary:\s*/i, '') // Remove "AI Summary:" prefix if present
      : (evidenceSnippet || `Evidence ${index + 1}: Related Information`);

    // Determine confidence based on evidence quality
    let confidence: 'high' | 'medium' | 'low' = 'medium';
    if (evidenceSnippet && evidenceSnippet.length > 150 && evidenceUrl) {
      confidence = 'high';
    } else if (evidenceSnippet && evidenceSnippet.length > 50) {
      confidence = 'medium';
    } else {
      confidence = 'low';
    }

    // Evidence provides context - default to unverified (user can review)
    // Since we're not using AI to analyze, we show evidence as-is
    const verdict: 'true' | 'false' | 'misleading' | 'unverified' = 'unverified';

    // Build sources list - prioritize URL, then title
    const sources: string[] = [];
    if (evidenceUrl) {
      sources.push(evidenceUrl);
    }
    if (evidenceTitle && !sources.includes(evidenceTitle)) {
      sources.push(evidenceTitle);
    }

    // Build explanation from evidence snippet
    let explanation = '';
    if (evidenceSnippet) {
      explanation = evidenceSnippet;
    } else if (evidenceTitle) {
      explanation = `Evidence collected from ${ev.source || 'Google AI Mode'}: ${evidenceTitle}`;
    } else {
      explanation = `Evidence collected from ${ev.source || 'Google AI Mode'}.`;
    }

    // Use snippet as correctData/context
    const correctData = evidenceSnippet || undefined;

    return {
      id: `claim-${index + 1}`,
      text: claimText,
      verdict,
      confidence,
      correctData,
      sources: sources.length > 0 ? sources : ['Unknown source'],
      explanation,
      evidenceItem: {
        title: evidenceTitle,
        url: evidenceUrl,
        snippet: evidenceSnippet,
      },
    };
  });

  return claims;
}

// Main fact-check function - uses evidence directly without OpenAI
export async function factCheckPost(postId: string, postContent: string): Promise<FactCheckResult> {
  try {
    // Get evidence from database
    const evidence = await getEvidence(postId);

    // Convert evidence to claims format
    const claims = convertEvidenceToClaims(evidence, postContent);

    return {
      claims,
      hasEvidence: evidence.length > 0,
    };
  } catch (error: any) {
    console.error(`Error fact-checking post ${postId}: ${error.message}`);
    return {
      claims: [],
      hasEvidence: false,
    };
  }
}
