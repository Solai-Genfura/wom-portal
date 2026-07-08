'use client';

import React, { useState } from 'react';
import { Clipboard, Check } from 'lucide-react';

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0 transition-colors focus:outline-none"
      title={copied ? "Copied!" : "Copy to clipboard"}
      type="button"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-500" />
      ) : (
        <Clipboard className="h-3.5 w-3.5" />
      )}
    </button>
  );
}
