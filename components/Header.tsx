import React from 'react';
import { Bot, Terminal } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between py-6 px-8 border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Playwright AI <span className="text-indigo-400">Architect</span></h1>
          <p className="text-xs text-slate-400 font-mono">Natural Language to Automation Code</p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
        <Terminal className="w-4 h-4" />
        <span>v1.0.0</span>
      </div>
    </header>
  );
};

export default Header;