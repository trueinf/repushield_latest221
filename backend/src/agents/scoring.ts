// Scoring agent: Scores posts from 1-10 (1=positive, 10=negative) using OpenAI LLM

import OpenAI from 'openai';

const openaiApiKey = process.env.OPENAI_API_KEY;

const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

export async function scorePost(content: string, platform: string): Promise<number> {
  // If OpenAI is not configured, fallback to neutral score
  if (!openai) {
    console.warn('OpenAI API key not configured, using fallback score');
    return 5;
  }

  try {
    const systemPrompt = `You are a sentiment analysis expert. Analyze social media posts and score them from 1 to 10 where:
- Score 1-3: Very positive, supportive, appreciative, praising, expressing love/joy
- Score 4-5: Neutral or slightly positive/negative, balanced, factual
- Score 6-7: Moderately negative, critical, concerned, disappointed
- Score 8-10: Very negative, hateful, blaming, attacking, extreme criticism, accusations

Consider factors like:
- Overall sentiment (positive, neutral, negative)
- Intensity of emotion
- Presence of hatred, blame, or extreme criticism
- Tone and language used

Respond with ONLY a single integer from 1 to 10, nothing else.`;

    const userPrompt = `Analyze this ${platform} post and assign a score from 1-10 (1=positive, 10=negative):

"${content.substring(0, 1000)}"

Respond with only the integer score (1-10):`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3, // Lower temperature for more consistent scoring
      max_tokens: 10,
    });

    const responseText = completion.choices[0]?.message?.content?.trim();
    
    if (!responseText) {
      console.warn('OpenAI returned empty response, using fallback score');
      return 5;
    }

    // Extract integer from response
    const scoreMatch = responseText.match(/\b([1-9]|10)\b/);
    if (scoreMatch) {
      const score = parseInt(scoreMatch[1], 10);
      // Ensure score is within valid range
      return Math.max(1, Math.min(10, score));
    }

    console.warn(`Could not parse score from OpenAI response: "${responseText}", using fallback`);
    return 5;
  } catch (error: any) {
    console.error('Error scoring post with OpenAI:', error.message);
    // Fallback to neutral score on error
    return 5;
  }
}

// Determine sentiment from score (1-10 scale: 1=positive, 10=negative)
export function scoreToSentiment(score: number): 'positive' | 'neutral' | 'negative' {
  if (score <= 3) return 'positive';  // 1-3 = positive
  if (score >= 8) return 'negative';  // 8-10 = negative
  return 'neutral'; // 4-7 = neutral
}

