'use client';

interface MediaPanelProps {
  content?: {
    type: 'image' | 'graph' | 'chart' | 'diagram';
    url?: string;
    data?: object;
    caption?: string;
  } | null;
}

export default function MediaPanel({ content }: MediaPanelProps) {
  if (!content) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-900 text-slate-400">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-lg font-medium">No Media Content</p>
          <p className="text-sm mt-1">Visual content will appear here when the AI provides graphs, images, or diagrams</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Content Display */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
        {content.type === 'image' && content.url && (
          <div className="max-w-full max-h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={content.url} 
              alt={content.caption || 'Interview visual'} 
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        )}

        {content.type === 'graph' && (
          <div className="w-full h-full bg-slate-800 rounded-lg p-4 flex items-center justify-center">
            <div className="text-center text-slate-400">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-sm">Graph visualization</p>
              {content.caption && <p className="text-xs mt-1">{content.caption}</p>}
            </div>
          </div>
        )}

        {content.type === 'chart' && (
          <div className="w-full h-full bg-slate-800 rounded-lg p-4 flex items-center justify-center">
            <div className="text-center text-slate-400">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              <p className="text-sm">Chart visualization</p>
              {content.caption && <p className="text-xs mt-1">{content.caption}</p>}
            </div>
          </div>
        )}

        {content.type === 'diagram' && (
          <div className="w-full h-full bg-slate-800 rounded-lg p-4 flex items-center justify-center">
            <div className="text-center text-slate-400">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              <p className="text-sm">Diagram</p>
              {content.caption && <p className="text-xs mt-1">{content.caption}</p>}
            </div>
          </div>
        )}
      </div>

      {/* Caption */}
      {content.caption && (
        <div className="px-4 py-3 border-t border-slate-700/50 bg-slate-800/50">
          <p className="text-sm text-slate-300 text-center">{content.caption}</p>
        </div>
      )}
    </div>
  );
}

