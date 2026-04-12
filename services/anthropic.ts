import { ANTHROPIC_API_KEY } from '@env';
import { SYSTEM_PROMPT } from '../constants/prompts';
import { APP_CONFIG } from '../constants/config';

export async function streamGenerate(
  prompt: string,
  onToken: (token: string) => void,
  onComplete: (fullText: string) => void,
  onError: (error: Error) => void,
  signal?: AbortSignal
): Promise<void> {
  const apiKey = ANTHROPIC_API_KEY;

  if (!apiKey || apiKey === 'your_api_key_here') {
    onError(new Error('API_KEY_MISSING'));
    return;
  }

  try {
    const response = await fetch(`${APP_CONFIG.apiBaseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': APP_CONFIG.anthropicVersion,
        'x-api-key': apiKey,
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: APP_CONFIG.model,
        max_tokens: APP_CONFIG.maxTokens,
        stream: true,
        messages: [{ role: 'user', content: prompt }],
        system: SYSTEM_PROMPT,
      }),
      signal,
    });

    if (!response.ok) {
      if (response.status === 429) {
        onError(new Error('RATE_LIMIT'));
        return;
      }
      onError(new Error(`API_ERROR_${response.status}`));
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onError(new Error('NO_STREAM'));
      return;
    }

    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
              const token = parsed.delta.text;
              fullText += token;
              onToken(token);
            }
          } catch {
            // skip malformed lines
          }
        }
      }
    }

    onComplete(fullText);
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') return;
    onError(err instanceof Error ? err : new Error('UNKNOWN_ERROR'));
  }
}

export async function generateOnce(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    streamGenerate(prompt, () => {}, resolve, reject);
  });
}
