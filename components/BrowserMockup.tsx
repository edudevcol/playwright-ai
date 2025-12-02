import React, { useState, useEffect } from 'react';
import { Globe, Lock, RefreshCw, ChevronLeft, ChevronRight, MousePointer2, Type, Eye, ExternalLink, Terminal, MonitorOff, Monitor, AlertCircle } from 'lucide-react';
import { AutomationStep, ActionType } from '../types';

interface BrowserMockupProps {
  currentUrl: string;
  steps: AutomationStep[];
  isProcessing: boolean;
}

const BrowserMockup: React.FC<BrowserMockupProps> = ({ currentUrl, steps, isProcessing }) => {
  const lastStep = steps.length > 0 ? steps[steps.length - 1] : null;
  
  // Default to headless/console mode to avoid X-Frame-Options issues (SauceDemo blocks iframes)
  const [viewMode, setViewMode] = useState<'visual' | 'headless'>('headless');
  
  const getActionIcon = (type: ActionType) => {
    switch (type) {
      case ActionType.CLICK: return <MousePointer2 className="w-8 h-8 text-orange-400" />;
      case ActionType.FILL: return <Type className="w-8 h-8 text-green-400" />;
      case ActionType.ASSERT: return <Eye className="w-8 h-8 text-purple-400" />;
      case ActionType.NAVIGATE: return <Globe className="w-8 h-8 text-blue-400" />;
      default: return null;
    }
  };

  const handleOpenExternal = () => {
    if (currentUrl && currentUrl !== 'about:blank') {
      window.open(currentUrl, '_blank');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl border border-slate-800 shadow-2xl overflow-hidden">
      {/* Browser Chrome / Toolbar */}
      <div className="bg-slate-950 border-b border-slate-800 p-3 flex items-center gap-4 shrink-0">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
        </div>
        
        {/* Mode Toggle */}
        <div className="flex bg-slate-900 rounded-lg p-0.5 border border-slate-800">
            <button 
                onClick={() => setViewMode('headless')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'headless' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                title="Console / Headless Mode"
            >
                <Terminal className="w-3 h-3" />
            </button>
            <button 
                onClick={() => setViewMode('visual')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'visual' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                title="Visual Simulation (May be blocked by some sites)"
            >
                <Monitor className="w-3 h-3" />
            </button>
        </div>

        <div className="flex-1 bg-slate-900 rounded-md border border-slate-800 px-3 py-1.5 text-sm text-slate-400 flex items-center gap-2 font-mono shadow-inner">
          <Lock className="w-3 h-3 text-emerald-500" />
          <span className="truncate select-all">{currentUrl}</span>
        </div>
        
        <button 
          onClick={handleOpenExternal}
          className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded transition-colors shadow-lg shadow-indigo-500/20"
          title="Open in a real browser tab to monitor"
        >
          <span>Open Live Tab</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {/* Viewport Area */}
      <div className="flex-1 relative bg-slate-950 flex items-center justify-center overflow-hidden">
        
        {/* MODE: HEADLESS (Safe, Robust) */}
        {viewMode === 'headless' && (
            <div className="w-full h-full p-6 flex flex-col font-mono text-sm">
                <div className="text-slate-500 mb-4 flex items-center gap-2">
                    <Terminal className="w-4 h-4" />
                    <span>[Playwright Process Log]</span>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                    {steps.length === 0 && (
                        <div className="text-slate-600 italic">Waiting for instructions...</div>
                    )}
                    {steps.map((step, i) => (
                        <div key={step.id} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                            <span className="text-slate-600 select-none">
                                {new Date().toLocaleTimeString([], {hour12:false, hour:'2-digit', minute:'2-digit', second:'2-digit'})}
                            </span>
                            <div className="flex-1">
                                <span className={`font-bold mr-2 ${
                                    step.actionType === 'NAVIGATE' ? 'text-blue-400' :
                                    step.actionType === 'CLICK' ? 'text-orange-400' :
                                    step.actionType === 'FILL' ? 'text-green-400' : 'text-purple-400'
                                }`}>
                                    [{step.pageContext}]
                                </span>
                                <span className="text-slate-300">
                                    {step.description}
                                </span>
                                <div className="ml-4 mt-1 text-xs text-slate-500">
                                    Selector: <span className="text-emerald-500">{step.simulatedSelector}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {isProcessing && (
                        <div className="flex gap-3 animate-pulse">
                             <span className="text-slate-600 select-none">
                                {new Date().toLocaleTimeString([], {hour12:false, hour:'2-digit', minute:'2-digit', second:'2-digit'})}
                            </span>
                            <span className="text-indigo-400">Analyzing intent &amp; Simulating DOM scrape...</span>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* MODE: VISUAL (Legacy Iframe) */}
        {viewMode === 'visual' && (
             currentUrl && currentUrl !== 'about:blank' ? (
                <>
                    <iframe 
                        key={currentUrl}
                        src={currentUrl} 
                        className="w-full h-full border-none bg-white"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                        title="Live Browser"
                    />
                     
                     {/* Info Overlay for Blocked Sites */}
                     <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 text-slate-300 text-xs px-4 py-2 rounded-full border border-slate-700 shadow-lg flex items-center gap-2 backdrop-blur-sm pointer-events-none opacity-80 hover:opacity-100 transition-opacity">
                        <AlertCircle className="w-3 h-3 text-yellow-500" />
                        <span>Site may block this view. Use Headless mode or 'Open Live Tab'.</span>
                     </div>

                     <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                        {lastStep && !isProcessing && (
                            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-2xl flex flex-col items-center gap-2 text-center animate-out fade-out duration-1000 delay-1000 fill-mode-forwards">
                                {getActionIcon(lastStep.actionType)}
                                <span className="text-white font-bold">{lastStep.actionType}</span>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center text-slate-500 gap-4">
                    <MonitorOff className="w-12 h-12 opacity-20" />
                    <p>No URL Loaded</p>
                </div>
            )
        )}

      </div>
    </div>
  );
};

export default BrowserMockup;