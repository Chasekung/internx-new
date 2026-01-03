'use client';

import { useState, useCallback } from 'react';
import MathEditorEnhanced, { type MathStep } from './MathEditorEnhanced';

interface MathWorkAreaProps {
  onSubmit: (steps: MathStep[]) => void;
}

export default function MathWorkArea({ onSubmit }: MathWorkAreaProps) {
  const [steps, setSteps] = useState<MathStep[]>([]);

  const handleStepAdd = useCallback((step: MathStep) => {
    setSteps(prev => [...prev, step]);
  }, []);

  const handleStepRemove = useCallback((id: string) => {
    setSteps(prev => prev.filter(s => s.id !== id));
  }, []);

  const handleSubmit = useCallback(() => {
    if (steps.length === 0) {
      alert('Please add at least one step before submitting.');
      return;
    }
    onSubmit(steps);
  }, [steps, onSubmit]);

  return (
    <MathEditorEnhanced
      steps={steps}
      onStepAdd={handleStepAdd}
      onStepRemove={handleStepRemove}
      onSubmit={handleSubmit}
    />
  );
}
