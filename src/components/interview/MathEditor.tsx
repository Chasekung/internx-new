'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

export interface MathStep {
  id: string;
  content: MathContent;
  explanation?: string;
}

export interface MathContent {
  type: 'equation' | 'expression' | 'text';
  parts: MathPart[];
}

export interface MathPart {
  type: 'number' | 'variable' | 'operator' | 'function' | 'fraction' | 'power' | 'root' | 'parentheses' | 'text';
  value: string;
  children?: MathPart[]; // For fractions, powers, roots
  numerator?: MathPart[];
  denominator?: MathPart[];
  base?: MathPart[];
  exponent?: MathPart[];
  radicand?: MathPart[];
  content?: MathPart[];
}

interface MathEditorProps {
  onStepAdd: (step: MathStep) => void;
  onStepRemove: (id: string) => void;
  steps: MathStep[];
  onSubmit: () => void;
}

export default function MathEditor({ onStepAdd, onStepRemove, steps, onSubmit }: MathEditorProps) {
  const [currentStep, setCurrentStep] = useState<MathContent>({
    type: 'equation',
    parts: []
  });
  const [currentExplanation, setCurrentExplanation] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const editorRef = useRef<HTMLDivElement>(null);

  // Convert structured math to display format
  const renderMathPart = (part: MathPart): string => {
    switch (part.type) {
      case 'number':
      case 'variable':
      case 'text':
        return part.value;
      case 'operator':
        const opMap: Record<string, string> = {
          '+': '+',
          '-': '−',
          '*': '×',
          '/': '÷',
          '=': '=',
          '<': '<',
          '>': '>',
          '<=': '≤',
          '>=': '≥',
          '!=': '≠'
        };
        return opMap[part.value] || part.value;
      case 'function':
        return `${part.value}(`;
      case 'fraction':
        if (part.numerator && part.denominator) {
          const num = part.numerator.map(renderMathPart).join('');
          const den = part.denominator.map(renderMathPart).join('');
          return `(${num})/(${den})`;
        }
        return '';
      case 'power':
        if (part.base && part.exponent) {
          const base = part.base.map(renderMathPart).join('');
          const exp = part.exponent.map(renderMathPart).join('');
          return `${base}${exp}`;
        }
        return '';
      case 'root':
        if (part.radicand) {
          const rad = part.radicand.map(renderMathPart).join('');
          return `√(${rad})`;
        }
        return '';
      case 'parentheses':
        if (part.content) {
          const content = part.content.map(renderMathPart).join('');
          return `(${content})`;
        }
        return '';
      default:
        return '';
    }
  };

  const renderMathContent = (content: MathContent): string => {
    return content.parts.map(renderMathPart).join(' ');
  };

  // Parse user input into structured format
  const parseInput = useCallback((input: string): MathPart[] => {
    const parts: MathPart[] = [];
    let i = 0;
    
    while (i < input.length) {
      const char = input[i];
      
      // Numbers
      if (char >= '0' && char <= '9' || char === '.') {
        let num = '';
        while (i < input.length && ((input[i] >= '0' && input[i] <= '9') || input[i] === '.')) {
          num += input[i];
          i++;
        }
        parts.push({ type: 'number', value: num });
        continue;
      }
      
      // Variables (single letters)
      if ((char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z')) {
        parts.push({ type: 'variable', value: char });
        i++;
        continue;
      }
      
      // Operators
      if (['+', '-', '*', '/', '=', '<', '>'].includes(char)) {
        let op = char;
        if (i + 1 < input.length) {
          const twoChar = char + input[i + 1];
          if (['<=', '>=', '!='].includes(twoChar)) {
            op = twoChar;
            i++;
          }
        }
        parts.push({ type: 'operator', value: op });
        i++;
        continue;
      }
      
      // Functions
      if (char === 's' && input.substring(i, i + 4) === 'sqrt') {
        parts.push({ type: 'function', value: 'sqrt' });
        i += 4;
        continue;
      }
      
      // Parentheses
      if (char === '(') {
        let depth = 1;
        let j = i + 1;
        while (j < input.length && depth > 0) {
          if (input[j] === '(') depth++;
          if (input[j] === ')') depth--;
          j++;
        }
        const content = input.substring(i + 1, j - 1);
        parts.push({
          type: 'parentheses',
          content: parseInput(content)
        });
        i = j;
        continue;
      }
      
      // Skip spaces
      if (char === ' ') {
        i++;
        continue;
      }
      
      // Default: treat as text
      parts.push({ type: 'text', value: char });
      i++;
    }
    
    return parts;
  }, []);

  // Handle keyboard input
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleAddStep();
    }
  }, []);

  const handleInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    const text = e.currentTarget.textContent || '';
    const parsed = parseInput(text);
    setCurrentStep({
      type: 'equation',
      parts: parsed
    });
  }, [parseInput]);

  const insertSymbol = (symbol: string) => {
    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(symbol));
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Trigger input event
        const event = new Event('input', { bubbles: true });
        editorRef.current.dispatchEvent(event);
      } else {
        editorRef.current.textContent += symbol;
        const event = new Event('input', { bubbles: true });
        editorRef.current.dispatchEvent(event);
      }
    }
  };

  const insertFraction = () => {
    if (editorRef.current) {
      const text = editorRef.current.textContent || '';
      const parts = parseInput(text);
      
      // Find last number or variable to use as numerator
      let numerator: MathPart[] = [];
      if (parts.length > 0) {
        const last = parts[parts.length - 1];
        if (last.type === 'number' || last.type === 'variable') {
          numerator = [last];
          parts.pop();
        }
      }
      
      // Add fraction structure
      parts.push({
        type: 'fraction',
        numerator: numerator.length > 0 ? numerator : [{ type: 'number', value: '1' }],
        denominator: [{ type: 'number', value: '1' }]
      });
      
      setCurrentStep({
        type: 'equation',
        parts
      });
      
      // Update display
      editorRef.current.textContent = renderMathContent({ type: 'equation', parts });
    }
  };

  const handleAddStep = () => {
    if (currentStep.parts.length === 0) return;
    
    const newStep: MathStep = {
      id: `step-${Date.now()}`,
      content: { ...currentStep },
      explanation: currentExplanation || undefined
    };
    
    onStepAdd(newStep);
    setCurrentStep({ type: 'equation', parts: [] });
    setCurrentExplanation('');
    if (editorRef.current) {
      editorRef.current.textContent = '';
    }
  };

  const mathSymbols = [
    { label: '+', value: '+' },
    { label: '−', value: '-' },
    { label: '×', value: '*' },
    { label: '÷', value: '/' },
    { label: '=', value: '=' },
    { label: '√', value: 'sqrt(' },
    { label: '²', value: '^2' },
    { label: '³', value: '^3' },
    { label: '(', value: '(' },
    { label: ')', value: ')' },
    { label: '≤', value: '<=' },
    { label: '≥', value: '>=' },
    { label: '≠', value: '!=' },
  ];

  const greekLetters = ['α', 'β', 'γ', 'δ', 'θ', 'π', 'λ', 'μ', 'σ', 'φ', 'ω'];

  return (
    <div className="h-full flex flex-col bg-slate-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700/50 bg-slate-850">
        <h3 className="text-sm font-medium text-slate-300">Mathematical Work</h3>
        <button
          onClick={onSubmit}
          disabled={steps.length === 0}
          className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-white font-medium disabled:opacity-50"
        >
          Submit Work
        </button>
      </div>

      {/* Steps List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {steps.length === 0 ? (
          <div className="text-center text-slate-500 py-8">
            <p className="text-sm">Start typing your mathematical work below.</p>
          </div>
        ) : (
          steps.map((step, index) => (
            <div key={step.id} className="bg-slate-800 rounded-lg p-3 border border-slate-700">
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs text-slate-400">Step {index + 1}</span>
                <button
                  onClick={() => onStepRemove(step.id)}
                  className="text-red-400 hover:text-red-300 text-xs"
                >
                  Remove
                </button>
              </div>
              <div className="bg-white/5 rounded p-3 mb-2 text-lg font-mono min-h-[2rem]">
                {renderMathContent(step.content)}
              </div>
              {step.explanation && (
                <p className="text-xs text-slate-400 italic">{step.explanation}</p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-700/50 bg-slate-850">
        {/* Symbol Toolbar */}
        <div className="px-4 py-2 border-b border-slate-700/30 overflow-x-auto">
          <div className="flex gap-1 flex-wrap">
            {mathSymbols.map((sym, i) => (
              <button
                key={i}
                onClick={() => insertSymbol(sym.value)}
                className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-white whitespace-nowrap"
                title={sym.value}
              >
                {sym.label}
              </button>
            ))}
            <button
              onClick={insertFraction}
              className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-white"
              title="Fraction"
            >
              Fraction
            </button>
            <div className="w-px h-6 bg-slate-600 mx-1" />
            {greekLetters.map((letter, i) => (
              <button
                key={i}
                onClick={() => insertSymbol(letter)}
                className="px-2 py-1 bg-slate-700/50 hover:bg-slate-600 text-slate-300 rounded text-xs"
              >
                {letter}
              </button>
            ))}
          </div>
        </div>

        {/* Math Input */}
        <div className="p-4 space-y-2">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Type your math here (natural typing)</label>
            <div
              ref={editorRef}
              contentEditable
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              className="w-full min-h-[80px] bg-slate-800 border border-slate-700 rounded px-3 py-2 text-lg text-white focus:outline-none focus:border-blue-500 font-mono"
              style={{ whiteSpace: 'pre-wrap' }}
              suppressContentEditableWarning
            />
            <p className="text-xs text-slate-500 mt-1">Tip: Type naturally like "2x + 3 = 7" or "sqrt(16)"</p>
          </div>

          {/* Live Preview */}
          {currentStep.parts.length > 0 && (
            <div className="bg-slate-800 border border-slate-700 rounded p-3">
              <p className="text-xs text-slate-400 mb-1">Preview:</p>
              <div className="bg-white/5 rounded p-2 text-lg font-mono">
                {renderMathContent(currentStep)}
              </div>
            </div>
          )}

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Explanation (Optional)</label>
            <input
              type="text"
              value={currentExplanation}
              onChange={(e) => setCurrentExplanation(e.target.value)}
              placeholder="Explain this step..."
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={handleAddStep}
            disabled={currentStep.parts.length === 0}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Step (Ctrl+Enter)
          </button>
        </div>
      </div>
    </div>
  );
}

