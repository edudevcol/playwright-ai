import React, { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';

interface InstructionInputProps {
  onSubmit: (instruction: string) => void;
  isProcessing: boolean;
}

const InstructionInput: React.FC<InstructionInputProps> = ({ onSubmit, isProcessing }) => {
  const [instruction, setInstruction] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (instruction.trim() && !isProcessing) {
      onSubmit(instruction);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl opacity-30 group-hover:opacity-60 transition duration-500 blur"></div>
        <div className="relative flex items-start gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
          <div className="pt-3 pl-3">
            <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
          </div>
          <textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="Describe your test case... (e.g. 'Go to Amazon, search for a mechanical keyboard, and click the first result')"
            className="w-full bg-transparent text-slate-200 placeholder-slate-500 p-3 focus:outline-none font-sans resize-none h-24"
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={!instruction.trim() || isProcessing}
            className={`self-end m-2 p-3 rounded-lg flex items-center gap-2 font-medium transition-all duration-200 ${
              !instruction.trim() || isProcessing
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/25'
            }`}
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Processing</span>
              </span>
            ) : (
              <>
                <span>Generate</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InstructionInput;