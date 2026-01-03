'use client';

import { useState, useCallback, useRef } from 'react';
import { devLogger } from '@/lib/devLogger';
import DevIndicator from './DevIndicator';

interface CodeEditorPanelProps {
  onSubmit: (content: string | object) => void;
}

type Language = 'javascript' | 'python' | 'java' | 'cpp' | 'sql' | 'typescript';

const LANGUAGE_CONFIG: Record<Language, { name: string; extension: string; placeholder: string }> = {
  javascript: {
    name: 'JavaScript',
    extension: 'js',
    placeholder: '// Write your JavaScript code here\nfunction solution(input) {\n  // Your code here\n  return result;\n}'
  },
  python: {
    name: 'Python',
    extension: 'py',
    placeholder: '# Write your Python code here\ndef solution(input):\n    # Your code here\n    return result'
  },
  java: {
    name: 'Java',
    extension: 'java',
    placeholder: '// Write your Java code here\npublic class Solution {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}'
  },
  cpp: {
    name: 'C++',
    extension: 'cpp',
    placeholder: '// Write your C++ code here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}'
  },
  sql: {
    name: 'SQL',
    extension: 'sql',
    placeholder: '-- Write your SQL query here\nSELECT *\nFROM table_name\nWHERE condition;'
  },
  typescript: {
    name: 'TypeScript',
    extension: 'ts',
    placeholder: '// Write your TypeScript code here\nfunction solution(input: any): any {\n  // Your code here\n  return result;\n}'
  }
};

export default function CodeEditorPanel({ onSubmit }: CodeEditorPanelProps) {
  const [language, setLanguage] = useState<Language>('python');
  const [code, setCode] = useState(LANGUAGE_CONFIG.python.placeholder);
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [showCodeIndicator, setShowCodeIndicator] = useState(false);
  const lastCodeRef = useRef<string>('');

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    setCode(LANGUAGE_CONFIG[newLang].placeholder);
    setOutput('');
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    
    // Throttled logging for code detection
    if (newCode !== lastCodeRef.current && newCode.trim().length > 0) {
      lastCodeRef.current = newCode;
      const lineCount = newCode.split('\n').length;
      setShowCodeIndicator(true);
      devLogger.logCodeDetected(language, lineCount);
    }
  };

  const handleRun = useCallback(async () => {
    setIsRunning(true);
    setOutput('Running...\n');
    
    // Simulate code execution (in production, this would call a secure sandbox)
    setTimeout(() => {
      setOutput(`[${LANGUAGE_CONFIG[language].name}] Code executed.\n\n// Note: Live code execution requires a secure sandbox environment.\n// Your code has been saved for review.`);
      setIsRunning(false);
    }, 1000);
  }, [language]);

  const handleSubmit = useCallback(() => {
    onSubmit({
      type: 'code',
      language,
      code,
      timestamp: new Date().toISOString()
    });
  }, [code, language, onSubmit]);

  // Simple syntax highlighting for display (basic keywords)
  const getLineNumbers = () => {
    const lines = code.split('\n');
    return lines.map((_, i) => i + 1).join('\n');
  };

  return (
    <div className="h-full flex flex-col bg-slate-900">
      <DevIndicator type="code" visible={showCodeIndicator} />
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-slate-700/50 bg-slate-850">
        {/* Language Selector */}
        <select
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value as Language)}
          className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Object.entries(LANGUAGE_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>{config.name}</option>
          ))}
        </select>

        <div className="flex-1" />

        {/* Actions */}
        <button
          onClick={handleRun}
          disabled={isRunning}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50"
        >
          {isRunning ? (
            <>
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Running...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Run
            </>
          )}
        </button>

        <button
          onClick={handleSubmit}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Submit Code
        </button>
      </div>

      {/* Editor */}
      <div className="flex-1 flex overflow-hidden">
        {/* Code Editor Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Line Numbers */}
          <div className="w-12 bg-slate-850 text-slate-500 text-sm font-mono py-3 text-right pr-3 select-none overflow-hidden border-r border-slate-700/50">
            <pre>{getLineNumbers()}</pre>
          </div>

          {/* Code Input */}
          <textarea
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            className="flex-1 bg-slate-900 text-slate-100 font-mono text-sm p-3 resize-none focus:outline-none overflow-auto"
            spellCheck={false}
            placeholder={LANGUAGE_CONFIG[language].placeholder}
          />
        </div>
      </div>

      {/* Output Panel */}
      {output && (
        <div className="h-32 border-t border-slate-700/50 bg-slate-850 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-1 border-b border-slate-700/30">
            <span className="text-xs text-slate-400 font-medium">Output</span>
            <button
              onClick={() => setOutput('')}
              className="text-xs text-slate-500 hover:text-slate-300"
            >
              Clear
            </button>
          </div>
          <pre className="p-3 text-sm font-mono text-slate-300 overflow-auto h-full">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}

