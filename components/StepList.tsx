import React, { useState } from 'react';
import { AutomationStep, ActionType } from '../types';
import { MousePointer2, Globe, Type, CheckCircle2, Trash2, Edit2, Save, X, Target, Plus, Layers } from 'lucide-react';

interface StepListProps {
  steps: AutomationStep[];
  onUpdateStep: (id: string, updates: Partial<AutomationStep>) => void;
  onDeleteStep: (id: string) => void;
  onAddStep: () => void;
}

const StepList: React.FC<StepListProps> = ({ steps = [], onUpdateStep, onDeleteStep, onAddStep }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ selector: string; value: string; actionType: ActionType; pageContext: string }>({ 
    selector: '', 
    value: '',
    actionType: ActionType.CLICK,
    pageContext: ''
  });

  const startEditing = (step: AutomationStep) => {
    setEditingId(step.id);
    setEditForm({ 
      selector: step.simulatedSelector || '', 
      value: step.value || '',
      actionType: step.actionType,
      pageContext: step.pageContext || 'BasePage'
    });
  };

  const saveStep = (id: string) => {
    onUpdateStep(id, {
      simulatedSelector: editForm.selector,
      value: editForm.value,
      actionType: editForm.actionType,
      pageContext: editForm.pageContext
    });
    setEditingId(null);
  };

  const getIcon = (type: ActionType) => {
    switch (type) {
      case ActionType.NAVIGATE: return <Globe className="w-4 h-4 text-blue-400" />;
      case ActionType.CLICK: return <MousePointer2 className="w-4 h-4 text-orange-400" />;
      case ActionType.FILL: return <Type className="w-4 h-4 text-green-400" />;
      case ActionType.ASSERT: return <CheckCircle2 className="w-4 h-4 text-purple-400" />;
      default: return <Target className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-t border-slate-800">
      <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between sticky top-0 z-10">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Scenario Steps ({steps.length})</h3>
        <button
          onClick={onAddStep}
          className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-400 text-xs font-medium transition-colors border border-slate-700 hover:border-indigo-500"
        >
          <Plus className="w-3 h-3" />
          Add
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2 min-h-[200px]">
        {steps.length === 0 && (
           <div className="flex flex-col items-center justify-center h-full text-slate-600 py-10">
              <p className="text-sm">No steps yet.</p>
              <p className="text-xs mt-1">Describe the flow to begin.</p>
           </div>
        )}

        {steps.map((step, index) => (
          <div 
            key={step.id}
            className={`group relative flex flex-col gap-2 p-3 rounded-lg border transition-all ${
              editingId === step.id 
                ? 'bg-slate-800 border-indigo-500/50 ring-1 ring-indigo-500/20' 
                : 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 min-w-[1.5rem] h-6 flex items-center justify-center rounded bg-slate-900 border border-slate-800 text-slate-400">
                <span className="text-[10px] font-mono">{index + 1}</span>
              </div>
              
              <div className="flex-1 min-w-0">
                {/* Header: Action and Element Name */}
                <div className="flex items-center gap-2 mb-1">
                  {getIcon(step.actionType)}
                  {editingId === step.id ? (
                    <select 
                       value={editForm.actionType}
                       onChange={(e) => setEditForm(prev => ({ ...prev, actionType: e.target.value as ActionType }))}
                       className="bg-slate-950 border border-slate-700 rounded text-xs text-slate-200 p-1 outline-none focus:border-indigo-500"
                    >
                      {Object.values(ActionType).map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-xs font-bold text-slate-300 bg-slate-900/50 px-1.5 py-0.5 rounded border border-slate-800">
                        {step.actionType}
                    </span>
                  )}
                  <span className="text-sm text-slate-200 truncate font-medium">
                    {step.targetElement || 'Action'}
                  </span>
                </div>

                {/* POM Context Badge */}
                {!editingId && (
                    <div className="flex items-center gap-1 mb-2">
                        <Layers className="w-3 h-3 text-indigo-400" />
                        <span className="text-[10px] text-indigo-300 font-mono bg-indigo-500/10 px-1.5 rounded border border-indigo-500/20">
                            {step.pageContext}
                        </span>
                    </div>
                )}
                
                {/* Edit Mode */}
                {editingId === step.id ? (
                  <div className="space-y-2 mt-2 animate-in fade-in slide-in-from-top-1 duration-200 border-t border-slate-700 pt-2">
                     <div>
                       <label className="text-[10px] text-indigo-400 uppercase font-bold mb-1 block">Page Object (Class Name)</label>
                       <input
                        type="text"
                        value={editForm.pageContext}
                        onChange={(e) => setEditForm(prev => ({ ...prev, pageContext: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                       <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Selector</label>
                       <input
                        type="text"
                        value={editForm.selector}
                        onChange={(e) => setEditForm(prev => ({ ...prev, selector: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs text-emerald-400 font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    {(editForm.actionType === ActionType.FILL || editForm.actionType === ActionType.NAVIGATE) && (
                      <div>
                        <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Value / URL</label>
                        <input
                          type="text"
                          value={editForm.value}
                          onChange={(e) => setEditForm(prev => ({ ...prev, value: e.target.value }))}
                          className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    )}
                    <div className="flex gap-2 pt-1">
                        <button 
                            onClick={() => saveStep(step.id)}
                            className="flex items-center gap-1 px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium transition-colors"
                        >
                            <Save className="w-3 h-3" /> Save
                        </button>
                        <button 
                            onClick={() => setEditingId(null)}
                            className="flex items-center gap-1 px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-xs font-medium transition-colors"
                        >
                            <X className="w-3 h-3" /> Cancel
                        </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5 mt-1">
                    <div className="flex items-center gap-2">
                      <code className="text-[10px] text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 font-mono max-w-[200px] truncate" title={step.simulatedSelector}>
                        {step.simulatedSelector || 'N/A'}
                      </code>
                      {step.value && (
                        <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 font-mono truncate max-w-[100px]">
                          "{step.value}"
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                    onClick={() => startEditing(step)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded"
                    title="Edit Step"
                    disabled={editingId !== null}
                >
                    <Edit2 className="w-3 h-3" />
                </button>
                <button 
                    onClick={() => onDeleteStep(step.id)}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded"
                    title="Delete Step"
                    disabled={editingId !== null}
                >
                    <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepList;