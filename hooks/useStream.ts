import { useState, useCallback, useRef } from 'react';
import { streamGenerate } from '../services/anthropic';

interface StreamState {
  text: string;
  isStreaming: boolean;
  isComplete: boolean;
  error: string | null;
  phase: 'idle' | 'generating' | 'structuring' | 'complete';
}

export function useStream() {
  const [state, setState] = useState<StreamState>({
    text: '',
    isStreaming: false,
    isComplete: false,
    error: null,
    phase: 'idle',
  });
  const abortRef = useRef<AbortController | null>(null);

  const start = useCallback(async (prompt: string) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setState({ text: '', isStreaming: true, isComplete: false, error: null, phase: 'generating' });

    let fullText = '';
    let tokenCount = 0;

    await streamGenerate(
      prompt,
      (token) => {
        fullText += token;
        tokenCount++;
        if (tokenCount > 200) {
          setState((prev) => ({ ...prev, phase: 'structuring' }));
        }
        setState((prev) => ({ ...prev, text: prev.text + token }));
      },
      (complete) => {
        setState({ text: complete, isStreaming: false, isComplete: true, error: null, phase: 'complete' });
      },
      (err) => {
        setState({ text: fullText, isStreaming: false, isComplete: false, error: err.message, phase: 'idle' });
      },
      abortRef.current.signal
    );
  }, []);

  const reset = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    setState({ text: '', isStreaming: false, isComplete: false, error: null, phase: 'idle' });
  }, []);

  const abort = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    setState((prev) => ({ ...prev, isStreaming: false, phase: 'idle' }));
  }, []);

  return { ...state, start, reset, abort };
}
