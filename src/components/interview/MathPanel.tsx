'use client';

import { useState, useCallback } from 'react';
import MathWorkArea from './MathWorkArea';
import { type MathStep } from './MathEditor';

interface MathPanelProps {
  onSubmit: (content: string | object) => void;
}

export default function MathPanel({ onSubmit }: MathPanelProps) {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'calculator' | 'work'>('work');

  const insertSymbol = (value: string) => {
    setExpression(prev => prev + value);
  };

  const handleWorkSubmit = useCallback((steps: MathStep[]) => {
    // Submit the structured math steps (will be converted to LaTeX internally)
    onSubmit(steps);
  }, [onSubmit]);

  const evaluate = useCallback(() => {
    try {
      // Basic math evaluation (for demonstration)
      // In production, use a proper math library like math.js
      let expr = expression
        .replace(/π/g, 'Math.PI')
        .replace(/e(?![a-z])/g, 'Math.E')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/\^/g, '**');

      // Safely evaluate (only for basic math)
      const evaluated = Function('"use strict"; return (' + expr + ')')();
      setResult(String(evaluated));
    } catch {
      setResult('Error: Invalid expression');
    }
  }, [expression]);


  // Calculator symbols
  const calcSymbols = [
    { label: '÷', value: '/' },
    { label: '×', value: '*' },
    { label: '√', value: 'sqrt(' },
    { label: 'π', value: 'π' },
    { label: '^', value: '^' },
    { label: '(', value: '(' },
    { label: ')', value: ')' },
    { label: 'sin', value: 'sin(' },
    { label: 'cos', value: 'cos(' },
    { label: 'tan', value: 'tan(' },
  ];

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Tab Selector */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-700/50 bg-slate-850">
        <div className="flex bg-slate-800 rounded-lg p-0.5">
          <button
            onClick={() => setActiveTab('work')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'work'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📝 Work Area (Submit Here)
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'calculator'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🧮 Calculator
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'work' ? (
        <MathWorkArea onSubmit={handleWorkSubmit} />
      ) : (
        <div className="flex-1 flex flex-col">
          {/* Calculator Symbol Toolbar */}
          <div className="px-4 py-2 border-b border-slate-700/30 bg-slate-850/50 overflow-x-auto">
            <div className="flex gap-1 flex-wrap">
              {calcSymbols.map((s, i) => (
                <button
                  key={i}
                  onClick={() => insertSymbol(s.value)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-sm font-medium transition-colors"
                  title={s.value}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Calculator Input */}
          <div className="flex-1 p-4 overflow-auto space-y-4">
            <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-3 text-xs text-amber-300">
              ⚠️ This calculator is for quick calculations only. Use the <strong>Work Area</strong> tab to submit your step-by-step mathematical work.
            </div>
            
            <textarea
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              className="w-full h-32 bg-slate-800 border border-slate-700 rounded-lg p-4 text-xl font-mono text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter expression: e.g., 2*sqrt(16) + 3^2"
            />
            
            <button
              onClick={evaluate}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium"
            >
              Calculate
            </button>

            {result && (
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <p className="text-sm text-slate-400 mb-1">Result:</p>
                <p className="text-3xl font-mono text-emerald-400">{result}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

