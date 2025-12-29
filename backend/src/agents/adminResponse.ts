// Admin response generation agent: Generates admin-style responses using OpenAI

import OpenAI from 'openai';
import { collectEvidence, type EvidenceResult } from './evidence.js';

const openaiApiKey = process.env.OPENAI_API_KEY;

const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

export async function generateAdminResponse(
  postText: string,
  postScore: number,
  evidence: EvidenceResult[]
): Promise<string | null> {
  if (!openai) {
    console.warn('OpenAI API key not configured, skipping admin response generation');
    return null;
  }

  try {
    // Prepare evidence text
    let evidenceText = 'No evidence found from search.';
    if (evidence.length > 0) {
      evidenceText = evidence.map((e, i) => 
        `EVIDENCE ${i + 1}:\nTitle: ${e.title}\nURL: ${e.url}\n${e.snippet || e.text_block || ''}\n---`
      ).join('\n\n');
    }

    const systemPrompt = `You are a professional administrator responding to social media posts on behalf of the person/organization mentioned. 
Generate a professional admin-style response based on the evidence provided from Google AI search results.
Write as if you are the admin/representative responding to this post.
Use ONLY the evidence provided from the Google AI search results.
Generate exactly 2-3 sentences (not more, not less).
Be professional, clear, and evidence-based.
Address the specific claim in the post directly.
Reference specific facts from the evidence when possible.
Make it sound like an official admin response.`;

    const userPrompt = `Post text: "${postText.substring(0, 500)}"

Evidence from search:
${evidenceText}

Generate a professional admin response to this post based on the evidence. Keep it to 2-3 sentences.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.6,
      max_tokens: 200,
    });

    const responseText = completion.choices[0]?.message?.content?.trim() || null;
    
    if (responseText) {
      console.log(`Generated admin response for post (score: ${postScore})`);
    }
    
    return responseText;
  } catch (error: any) {
    console.error(`Error generating admin response: ${error.message}`);
    return null;
  }
}

// Main function: Collect evidence and generate response for high-risk posts
export async function processHighRiskPost(
  postText: string,
  postScore: number,
  postId: string
): Promise<{ evidence: EvidenceResult[]; response: string | null }> {
  // Collect evidence first
  const evidence = await collectEvidence(postText);
  
  // Generate admin response based on post + evidence
  const response = await generateAdminResponse(postText, postScore, evidence);
  
  return { evidence, response };
}




