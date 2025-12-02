import React, { useState, useEffect } from 'react';
import { Copy, Check, FileCode, Download, FileText } from 'lucide-react';
import { GeneratedFiles } from '../types';

interface CodeViewerProps {
  files: GeneratedFiles | null;
  isGenerating: boolean;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ files, isGenerating }) => {
  const [activeFile, setActiveFile] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (files) {
        // Default to the spec file or the first file
        const specFile = Object.keys(files).find(f => f.includes('.spec.'));
        setActiveFile(specFile || Object.keys(files)[0] || '');
    }
  }, [files]);

  const handleCopy = () => {
    if (files && activeFile) {
      navigator.clipboard.writeText(files[activeFile]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    // Since we can't easily zip in browser without libs, we download the active file
    if (files && activeFile) {
        const element = document.createElement("a");
        const file = new Blob([files[activeFile]], {type: 'text/javascript'});
        element.href = URL.createObjectURL(file);
        element.download = activeFile.split('/').pop() || "file.js";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }
  };

  if (!files && !isGenerating) return null;

  const fileList = files ? Object.keys(files).sort() : [];

  return (
    <div className="w-full h-full bg-slate-900 rounded-xl border border-slate-800 overflow-hidden flex flex-col min-h-[400px]">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
        <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <FileCode className="w-4 h-4 text-indigo-400" />
          Generated POM Solution
        </h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleDownload}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Download Active File"
            disabled={!files}
          >
            <Download className="w-4 h-4" />
          </button>
          <button 
            onClick={handleCopy}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Copy Active File"
            disabled={!files}
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar / Tabs */}
        {files && !isGenerating && (
            <div className="w-48 bg-slate-950 border-r border-slate-800 flex flex-col overflow-y-auto custom-scrollbar">
                <div className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Files</div>
                {fileList.map(fileName => (
                    <button
                        key={fileName}
                        onClick={() => setActiveFile(fileName)}
                        className={`text-left px-3 py-2 text-xs font-mono truncate flex items-center gap-2 transition-colors border-l-2 ${
                            activeFile === fileName 
                            ? 'bg-slate-900 text-indigo-400 border-indigo-500' 
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border-transparent'
                        }`}
                    >
                        {fileName.includes('pages/') ? <FileText className="w-3 h-3" /> : <FileCode className="w-3 h-3 text-yellow-500" />}
                        {fileName.split('/').pop()}
                    </button>
                ))}
            </div>
        )}

        {/* Code Editor Area */}
        <div className="flex-1 relative bg-[#0d1117] overflow-auto custom-scrollbar">
          {isGenerating ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-500">
               <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
               <span className="font-mono text-sm animate-pulse">Architecting Page Objects...</span>
            </div>
          ) : (
            files && activeFile && (
                <div className="p-4">
                    <div className="text-xs text-slate-500 font-mono mb-2 select-none opacity-50">{activeFile}</div>
                    <pre className="font-mono text-sm text-slate-300 leading-relaxed whitespace-pre">
                        <code>{files[activeFile]}</code>
                    </pre>
                </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeViewer;