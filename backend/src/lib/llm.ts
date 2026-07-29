import dotenv from 'dotenv';
dotenv.config();

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: any; // Allow string or array of objects
}

/**
 * Fallback LLM Dispatcher
 * Tries OpenRouter first. If it fails, falls back to Google Gemini.
 */
export async function generateAIResponse(messages: Message[]): Promise<string> {
  let openRouterError;

  // 1. Try OpenRouter
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey === 'your_openrouter_api_key') {
      throw new Error('OPENROUTER_API_KEY is missing or invalid');
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash", // Specify a vision-capable model explicitly if we have images, or use auto
        messages: messages
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    if (data?.choices?.[0]?.message?.content) {
      return data.choices[0].message.content;
    } else {
      throw new Error('OpenRouter response format invalid');
    }
  } catch (err) {
    console.warn("OpenRouter failed, attempting Gemini fallback...", err);
    openRouterError = err;
  }

  // 2. Fallback to Google Gemini
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key') {
      throw new Error('GEMINI_API_KEY is missing or invalid');
    }

    let systemInstruction = "";
    const contents: any[] = [];

    for (const msg of messages) {
      if (msg.role === 'system') {
        systemInstruction += typeof msg.content === 'string' ? msg.content + "\n" : JSON.stringify(msg.content) + "\n";
      } else {
        let parts = [];
        if (typeof msg.content === 'string') {
          parts.push({ text: msg.content });
        } else if (Array.isArray(msg.content)) {
          for (const item of msg.content) {
            if (item.type === 'text') {
              parts.push({ text: item.text });
            } else if (item.type === 'image_url') {
              const url = item.image_url.url;
              const mimeMatch = url.match(/^data:(image\/\w+);base64,/);
              if (mimeMatch) {
                parts.push({
                  inlineData: {
                    mimeType: mimeMatch[1],
                    data: url.replace(/^data:image\/\w+;base64,/, '')
                  }
                });
              }
            }
          }
        }

        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts
        });
      }
    }

    const payload: any = { contents };
    if (systemInstruction) {
      payload.systemInstruction = {
        parts: [{ text: systemInstruction.trim() }]
      };
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Gemini response format invalid');
    }
  } catch (err) {
    console.error("Gemini fallback also failed:", err);
    throw new Error('All LLM providers failed. Last error: ' + (err as Error).message);
  }
}
