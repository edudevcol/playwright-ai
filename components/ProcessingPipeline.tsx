import React from 'react';
import { AutomationStep, ActionType } from '../types';
import { MousePointer2, Globe, Type, CheckCircle2, Loader2, Target, Search, Eye } from 'lucide-react';

interface ProcessingPipelineProps {
  steps: AutomationStep[];
  isAnalyzing: boolean;
  isScraping: boolean; // Visual state for simulated scraping
}

const ProcessingPipeline: React.FC<ProcessingPipelineProps> = ({ steps, isAnalyzing, isScraping }) => {
  const getIcon = (type: ActionType) => {
    switch (type) {
      case ActionType.NAVIGATE: return <Globe className="w-4 h-4 text-blue-400" />;
      case ActionType.CLICK: return <MousePointer2 className="w-4 h-4 text-orange-400" />;
      case ActionType.FILL: return <Type className="w-4 h-4 text-green-400" />;
      case ActionType.ASSERT: return <CheckCircle2 className="w-4 h-4 text-purple-400" />;
      case ActionType.WAIT: return <Eye className="w-4 h-4 text-yellow-400" />;
      default: return <Target className="w-4 h-4 text-slate-400" />;
    }
  };

  if (steps.length === 0 && !isAnalyzing) return null;

  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden flex flex-col h-full min-h-[400px]">
      <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <Search className="w-4 h-4" />
          Intent Analysis & Selector Optimization
        </h2>
        {isAnalyzing && <span className="text-xs text-indigo-400 animate-pulse">Analyzing Intent...</span>}
        {!isAnalyzing && isScraping && <span className="text-xs text-emerald-400 animate-pulse">Simulating DOM Scan...</span>}
      </div>

      <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar flex-1">
        {isAnalyzing && (
          <div className="flex items-center gap-3 text-slate-500 p-4 rounded-lg border border-dashed border-slate-700">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="font-mono text-sm">Decomposing natural language instruction...</span>
          </div>
        )}

        {steps.map((step, index) => (
          <div 
            key={step.id}
            className="group flex items-start gap-4 p-4 rounded-lg bg-slate-800/40 border border-slate-700/50 hover:border-indigo-500/30 transition-all animate-in fade-in slide-in-from-bottom-2 duration-500"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="mt-1 min-w-[2rem] h-8 flex items-center justify-center rounded-md bg-slate-800 border border-slate-700 group-hover:border-indigo-500/50 transition-colors">
              {getIcon(step.actionType)}
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-200">
                  {step.actionType} <span className="text-slate-400">→</span> {step.targetElement}
                </h3>
                <span className="text-xs font-mono text-slate-500">Step {index + 1}</span>
              </div>
              
              <p className="text-sm text-slate-400">{step.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div className="bg-slate-950/50 p-2 rounded border border-slate-800">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1 font-semibold">Target Selector</div>
                  <code className="text-xs text-emerald-400 font-mono break-all">
                    {step.simulatedSelector}
                  </code>
                </div>
                
                <div className="bg-slate-950/50 p-2 rounded border border-slate-800">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1 font-semibold">AI Reasoning</div>
                  <p className="text-xs text-slate-400 italic">
                    "{step.reasoning}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProcessingPipeline;