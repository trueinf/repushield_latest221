// Translation agent: Translates posts to English using OpenAI

import OpenAI from 'openai';

const openaiApiKey = process.env.OPENAI_API_KEY;

const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

export async function translateToEnglish(text: string): Promise<string | null> {
  if (!openai) {
    console.warn('OpenAI API key not configured, skipping translation');
    return null;
  }

  try {
    // Check if text is already in English (simple heuristic)
    // We'll let OpenAI handle language detection
    const systemPrompt = `You are a translation assistant. Translate the given text to English. 
If the text is already in English, return it as-is.
If the text is in another language, translate it to clear, natural English.
Preserve the tone and style of the original text.
Return ONLY the translated text, nothing else.`;

    const userPrompt = `Translate this text to English:\n\n"${text.substring(0, 1000)}"`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const translatedText = completion.choices[0]?.message?.content?.trim();
    
    if (!translatedText) {
      console.warn('Translation returned empty response');
      return null;
    }

    return translatedText;
  } catch (error: any) {
    console.error('Translation error:', error.message);
    return null;
  }
}


