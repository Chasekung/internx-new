'use client';

import { useState, useCallback } from 'react';
import WhiteboardPanel from './WhiteboardPanel';
import CodeEditorPanel from './CodeEditorPanel';
import MathPanel from './MathPanel';
import MediaPanel from './MediaPanel';

export type WorkspaceTab = 'whiteboard' | 'code' | 'math' | 'media';

interface InterviewWorkspaceProps {
  activeTab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
  onSubmit: (type: WorkspaceTab, content: string | object) => void;
  currentQuestion: string;
  questionType?: 'coding' | 'math' | 'whiteboard' | 'writing' | 'design' | null;
  mediaContent?: {
    type: 'image' | 'graph' | 'chart' | 'diagram';
    url?: string;
    data?: object;
    caption?: string;
  } | null;
}

export default function InterviewWorkspace({
  activeTab,
  onTabChange,
  onSubmit,
  currentQuestion,
  questionType,
  mediaContent
}: InterviewWorkspaceProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const tabs: { id: WorkspaceTab; label: string; icon: string }[] = [
    { id: 'whiteboard', label: 'Whiteboard', icon: '📋' },
    { id: 'code', label: 'Code', icon: '💻' },
    { id: 'math', label: 'Math', icon: '📐' },
    { id: 'media', label: 'Media', icon: '📊' },
  ];

  const handleSubmit = useCallback((content: string | object) => {
    onSubmit(activeTab, content);
  }, [activeTab, onSubmit]);

  return (
    <div className={`flex flex-col h-full bg-slate-900/95 backdrop-blur-xl rounded-xl border border-slate-700/50 overflow-hidden ${
      isFullscreen ? 'fixed inset-4 z-50' : ''
    }`}>
      {/* Workspace Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700/50 bg-slate-800/50">
        {/* Tabs */}
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              } ${
                questionType && 
                ((questionType === 'coding' && tab.id === 'code') ||
                 (questionType === 'math' && tab.id === 'math') ||
                 (questionType === 'whiteboard' && tab.id === 'whiteboard') ||
                 (questionType === 'design' && tab.id === 'whiteboard'))
                  ? 'ring-2 ring-amber-500 ring-opacity-50'
                  : ''
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Current Question Display */}
      {currentQuestion && (
        <div className="px-4 py-3 border-b border-slate-700/30 bg-slate-800/30">
          <p className="text-sm text-slate-300 line-clamp-2">
            <span className="text-blue-400 font-medium">Question: </span>
            {currentQuestion}
          </p>
        </div>
      )}

      {/* Workspace Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'whiteboard' && (
          <WhiteboardPanel onSubmit={handleSubmit} />
        )}
        {activeTab === 'code' && (
          <CodeEditorPanel onSubmit={handleSubmit} />
        )}
        {activeTab === 'math' && (
          <MathPanel onSubmit={handleSubmit} />
        )}
        {activeTab === 'media' && (
          <MediaPanel content={mediaContent} />
        )}
      </div>

      {/* Submit Button (for non-whiteboard tabs) */}
      {activeTab !== 'whiteboard' && activeTab !== 'media' && (
        <div className="px-4 py-3 border-t border-slate-700/50 bg-slate-800/50">
          <button
            onClick={() => handleSubmit('')}
            className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Submit Answer
          </button>
        </div>
      )}
    </div>
  );
}

