'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { devLogger } from '@/lib/devLogger';
import DevIndicator from './DevIndicator';

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
  type: 'number' | 'variable' | 'operator' | 'function' | 'fraction' | 'power' | 'root' | 'parentheses' | 'text' | 'subscript';
  value: string;
  children?: MathPart[];
  numerator?: MathPart[];
  denominator?: MathPart[];
  base?: MathPart[];
  exponent?: MathPart[];
  radicand?: MathPart[];
  content?: MathPart[];
  subscript?: MathPart[];
}

interface MathEditorProps {
  onStepAdd: (step: MathStep) => void;
  onStepRemove: (id: string) => void;
  steps: MathStep[];
  onSubmit: () => void;
}

// Comprehensive function library
const MATH_FUNCTIONS = {
  // Basic
  basic: ['log', 'ln', 'exp'],
  
  // Trigonometry
  trig: ['sin', 'cos', 'tan', 'sec', 'csc', 'cot'],
  
  // Inverse Trig
  inverseTrig: ['arcsin', 'arccos', 'arctan', 'arcsec', 'arccsc', 'arccot'],
  
  // Hyperbolic
  hyperbolic: ['sinh', 'cosh', 'tanh', 'sech', 'csch', 'coth'],
  
  // Inverse Hyperbolic
  inverseHyperbolic: ['arsinh', 'arcosh', 'artanh'],
  
  // Statistics
  statistics: ['mean', 'median', 'mode', 'std', 'var', 'min', 'max', 'sum', 'prod'],
  
  // Probability
  probability: ['binom', 'poisson', 'normal', 'gamma', 'beta', 'chi2'],
  
  // Calculus
  calculus: ['diff', 'integral', 'lim', 'limsup', 'liminf'],
  
  // Linear Algebra
  linearAlgebra: ['det', 'trace', 'rank', 'eigenval', 'eigenvec', 'transpose', 'inverse'],
  
  // Special Functions
  special: ['erf', 'erfc', 'gamma', 'beta', 'zeta', 'bessel'],
  
  // List/Array Operations
  listOps: ['length', 'first', 'last', 'nth', 'append', 'concat']
};

export default function MathEditorEnhanced({ onStepAdd, onStepRemove, steps, onSubmit }: MathEditorProps) {
  const [currentStep, setCurrentStep] = useState<MathContent>({
    type: 'equation',
    parts: []
  });
  const [currentExplanation, setCurrentExplanation] = useState('');
  const [showMathIndicator, setShowMathIndicator] = useState(false);
  const [showConvertedIndicator, setShowConvertedIndicator] = useState(false);
  const [activeFunctionCategory, setActiveFunctionCategory] = useState<keyof typeof MATH_FUNCTIONS>('basic');
  const editorRef = useRef<HTMLDivElement>(null);
  const lastContentRef = useRef<string>('');

  // Render math part with vertical fraction formatting
  const renderMathPart = (part: MathPart): JSX.Element | string => {
    switch (part.type) {
      case 'number':
      case 'variable':
      case 'text':
        return <span>{part.value}</span>;
      
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
          '!=': '≠',
          'approx': '≈'
        };
        return <span>{opMap[part.value] || part.value}</span>;
      
      case 'function':
        return <span className="italic">{part.value}(</span>;
      
      case 'fraction':
        if (part.numerator && part.denominator) {
          const num = part.numerator.map((p, i) => {
            const rendered = renderMathPart(p);
            return typeof rendered === 'string' ? <span key={i}>{rendered}</span> : <span key={i}>{rendered}</span>;
          });
          const den = part.denominator.map((p, i) => {
            const rendered = renderMathPart(p);
            return typeof rendered === 'string' ? <span key={i}>{rendered}</span> : <span key={i}>{rendered}</span>;
          });
          return (
            <span className="inline-flex flex-col items-center mx-1 leading-tight">
              <span className="border-b border-current pb-0.5 px-1">{num}</span>
              <span className="pt-0.5 px-1">{den}</span>
            </span>
          );
        }
        return '';
      
      case 'power':
        if (part.base && part.exponent) {
          const base = part.base.map((p, i) => {
            const rendered = renderMathPart(p);
            return typeof rendered === 'string' ? <span key={i}>{rendered}</span> : <span key={i}>{rendered}</span>;
          });
          const exp = part.exponent.map((p, i) => {
            const rendered = renderMathPart(p);
            return typeof rendered === 'string' ? <span key={i} className="text-xs align-super">{rendered}</span> : <span key={i} className="text-xs align-super">{rendered}</span>;
          });
          return <span>{base}<sup className="text-xs">{exp}</sup></span>;
        }
        return '';
      
      case 'root':
        if (part.radicand) {
          const rad = part.radicand.map((p, i) => {
            const rendered = renderMathPart(p);
            return typeof rendered === 'string' ? <span key={i}>{rendered}</span> : <span key={i}>{rendered}</span>;
          });
          return <span className="inline-flex items-center">√<span className="border-t border-current ml-0.5">{rad}</span></span>;
        }
        return '';
      
      case 'parentheses':
        if (part.content) {
          const content = part.content.map((p, i) => {
            const rendered = renderMathPart(p);
            return typeof rendered === 'string' ? <span key={i}>{rendered}</span> : <span key={i}>{rendered}</span>;
          });
          return <span>({content})</span>;
        }
        return '';
      
      case 'subscript':
        if (part.subscript) {
          const base = part.value;
          const sub = part.subscript.map((p, i) => (
            <span key={i} className="text-xs align-sub">{renderMathPart(p)}</span>
          ));
          return <span>{base}<sub>{sub}</sub></span>;
        }
        return '';
      
      default:
        return '';
    }
  };

  const renderMathContent = (content: MathContent): JSX.Element => {
    return (
      <span className="flex items-center gap-1 flex-wrap">
        {content.parts.map((part, i) => (
          <span key={i}>{renderMathPart(part)}</span>
        ))}
      </span>
    );
  };

  // Enhanced parsing with better fraction and function detection
  const parseInput = useCallback((input: string): MathPart[] => {
    const parts: MathPart[] = [];
    let i = 0;
    
    while (i < input.length) {
      const char = input[i];
      
      // Check for functions (all categories)
      let matchedFunction = false;
      for (const category of Object.values(MATH_FUNCTIONS)) {
        for (const func of category) {
          if (input.substring(i, i + func.length) === func && 
              (i + func.length >= input.length || !/[a-zA-Z0-9]/.test(input[i + func.length]))) {
            parts.push({ type: 'function', value: func });
            i += func.length;
            matchedFunction = true;
            break;
          }
        }
        if (matchedFunction) break;
      }
      if (matchedFunction) continue;
      
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
      
      // Variables
      if ((char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z')) {
        parts.push({ type: 'variable', value: char });
        i++;
        continue;
      }
      
      // Operators
      if (['+', '-', '*', '/', '='].includes(char)) {
        parts.push({ type: 'operator', value: char });
        i++;
        continue;
      }
      
      // Fractions: a/b format
      if (char === '/' && parts.length > 0) {
        const prevPart = parts[parts.length - 1];
        if (prevPart.type === 'number' || prevPart.type === 'variable') {
          // Look ahead for denominator
          let j = i + 1;
          let den = '';
          while (j < input.length && (input[j] >= '0' && input[j] <= '9' || 
                 (input[j] >= 'a' && input[j] <= 'z') || (input[j] >= 'A' && input[j] <= 'Z'))) {
            den += input[j];
            j++;
          }
          
          if (den) {
            // Convert to fraction structure
            parts.pop(); // Remove numerator
            parts.push({
              type: 'fraction',
              numerator: [prevPart],
              denominator: [{ type: 'number', value: den }]
            });
            i = j;
            continue;
          }
        }
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
      
      // Powers: x^2 or x^y
      if (char === '^') {
        if (parts.length > 0) {
          const prevPart = parts[parts.length - 1];
          let j = i + 1;
          let exp = '';
          if (j < input.length && input[j] === '(') {
            // Multi-character exponent
            j++;
            let depth = 1;
            while (j < input.length && depth > 0) {
              if (input[j] === '(') depth++;
              if (input[j] === ')') depth--;
              j++;
            }
            exp = input.substring(i + 2, j - 1);
          } else {
            // Single character exponent
            while (j < input.length && (input[j] >= '0' && input[j] <= '9' || 
                   (input[j] >= 'a' && input[j] <= 'z') || (input[j] >= 'A' && input[j] <= 'Z'))) {
              exp += input[j];
              j++;
            }
          }
          
          if (exp) {
            parts.pop();
            parts.push({
              type: 'power',
              base: [prevPart],
              exponent: parseInput(exp)
            });
            i = j;
            continue;
          }
        }
      }
      
      // Square root: sqrt(...)
      if (char === 's' && input.substring(i, i + 4) === 'sqrt') {
        parts.push({ type: 'function', value: 'sqrt' });
        i += 4;
        continue;
      }
      
      // Skip spaces
      if (char === ' ') {
        i++;
        continue;
      }
      
      // Default: text
      parts.push({ type: 'text', value: char });
      i++;
    }
    
    return parts;
  }, []);

  const handleInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    const text = e.currentTarget.textContent || '';
    
    // Throttle logging
    if (text !== lastContentRef.current && text.trim().length > 0) {
      lastContentRef.current = text;
      const parsed = parseInput(text);
      setCurrentStep({
        type: 'equation',
        parts: parsed
      });
      
      // Log math detection
      if (parsed.length > 0) {
        setShowMathIndicator(true);
        const content = text;
        devLogger.logMathDetected(content, 1);
      }
    }
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
        
        const event = new Event('input', { bubbles: true });
        editorRef.current.dispatchEvent(event);
      } else {
        editorRef.current.textContent += symbol;
        const event = new Event('input', { bubbles: true });
        editorRef.current.dispatchEvent(event);
      }
    }
  };

  const insertFunction = (func: string) => {
    insertSymbol(func + '(');
  };

  const insertFraction = () => {
    if (editorRef.current) {
      const text = editorRef.current.textContent || '';
      const parts = parseInput(text);
      
      // Find last number/variable for numerator
      let numerator: MathPart[] = [];
      if (parts.length > 0) {
        const last = parts[parts.length - 1];
        if (last.type === 'number' || last.type === 'variable') {
          numerator = [last];
          parts.pop();
        }
      }
      
      // Add fraction
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
      editorRef.current.textContent = text + '/';
      const event = new Event('input', { bubbles: true });
      editorRef.current.dispatchEvent(event);
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
    
    // Log conversion
    setShowConvertedIndicator(true);
    devLogger.logMathConverted('', 1);
  };

  const functionCategories: Array<{ key: keyof typeof MATH_FUNCTIONS; label: string }> = [
    { key: 'basic', label: 'Basic' },
    { key: 'trig', label: 'Trig' },
    { key: 'inverseTrig', label: 'Inv Trig' },
    { key: 'hyperbolic', label: 'Hyperbolic' },
    { key: 'inverseHyperbolic', label: 'Inv Hyper' },
    { key: 'statistics', label: 'Statistics' },
    { key: 'probability', label: 'Probability' },
    { key: 'calculus', label: 'Calculus' },
    { key: 'linearAlgebra', label: 'Linear Alg' },
    { key: 'special', label: 'Special' },
    { key: 'listOps', label: 'List Ops' }
  ];

  const mathSymbols = [
    { label: '+', value: '+' },
    { label: '−', value: '-' },
    { label: '×', value: '*' },
    { label: '÷', value: '/' },
    { label: '=', value: '=' },
    { label: '√', value: 'sqrt(' },
    { label: '²', value: '^2' },
    { label: '³', value: '^3' },
    { label: 'ⁿ', value: '^' },
    { label: '(', value: '(' },
    { label: ')', value: ')' },
    { label: '≤', value: '<=' },
    { label: '≥', value: '>=' },
    { label: '≠', value: '!=' },
    { label: '≈', value: 'approx' },
  ];

  const greekLetters = ['α', 'β', 'γ', 'δ', 'ε', 'θ', 'λ', 'μ', 'σ', 'φ', 'ω', 'π', 'Δ', 'Σ', 'Ω'];

  return (
    <div className="h-full flex flex-col bg-slate-900 text-white">
      <DevIndicator type="math" visible={showMathIndicator} />
      <DevIndicator type="converted" visible={showConvertedIndicator} />
      
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
              <div className="bg-white/5 rounded p-3 mb-2 text-lg min-h-[2rem] flex items-center">
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
        {/* Function Categories */}
        <div className="px-4 py-2 border-b border-slate-700/30">
          <div className="flex items-center gap-1 mb-2 overflow-x-auto">
            {functionCategories.map(cat => (
              <button
                key={cat.key}
                onClick={() => setActiveFunctionCategory(cat.key)}
                className={`px-2 py-1 rounded text-xs whitespace-nowrap ${
                  activeFunctionCategory === cat.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="flex gap-1 flex-wrap">
            {MATH_FUNCTIONS[activeFunctionCategory].map((func, i) => (
              <button
                key={i}
                onClick={() => insertFunction(func)}
                className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-white"
              >
                {func}
              </button>
            ))}
          </div>
        </div>

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
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  e.preventDefault();
                  handleAddStep();
                }
              }}
              className="w-full min-h-[80px] bg-slate-800 border border-slate-700 rounded px-3 py-2 text-lg text-white focus:outline-none focus:border-blue-500 font-mono"
              style={{ whiteSpace: 'pre-wrap' }}
              suppressContentEditableWarning
            />
            <p className="text-xs text-slate-500 mt-1">Tip: Type naturally like "2x + 3 = 7" or "sin(pi/2)"</p>
          </div>

          {/* Live Preview */}
          {currentStep.parts.length > 0 && (
            <div className="bg-slate-800 border border-slate-700 rounded p-3">
              <p className="text-xs text-slate-400 mb-1">Preview:</p>
              <div className="bg-white/5 rounded p-2 text-lg min-h-[2rem] flex items-center">
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

