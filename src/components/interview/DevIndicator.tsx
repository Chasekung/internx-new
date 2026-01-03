'use client';

import { useEffect, useState } from 'react';

interface DevIndicatorProps {
  type: 'math' | 'code' | 'converted';
  visible: boolean;
}

export default function DevIndicator({ type, visible }: DevIndicatorProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!visible) {
      setShow(false);
      return;
    }

    // Only show in development
    if (process.env.NODE_ENV !== 'development') return;

    setShow(true);
    const timer = setTimeout(() => setShow(false), 2000);
    return () => clearTimeout(timer);
  }, [visible]);

  if (!show || process.env.NODE_ENV === 'production') return null;

  const labels = {
    math: 'Math detected ✓',
    code: 'Code detected ✓',
    converted: 'Converted for AI ✓'
  };

  const colors = {
    math: 'bg-blue-500/20 border-blue-500/50 text-blue-300',
    code: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300',
    converted: 'bg-purple-500/20 border-purple-500/50 text-purple-300'
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] pointer-events-none">
      <div className={`px-3 py-1.5 rounded-lg border text-xs font-mono ${colors[type]} animate-fade-in`}>
        {labels[type]}
      </div>
    </div>
  );
}

