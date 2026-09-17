import { useState, useCallback } from 'react';
import { copyToClipboard } from '../lib/clipboard';

/**
 * Copy helper dengan transient "copied" state (auto-reset 1.5s).
 * pakai: const [copied, copy] = useCopyToClipboard();
 */
export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
    return ok;
  }, []);

  return [copied, copy];
}
