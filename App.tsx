import React, { useState } from 'react';
import Header from './components/Header';
import ChatPanel from './components/ChatPanel';
import BrowserMockup from './components/BrowserMockup';
import CodeViewer from './components/CodeViewer';
import StepList from './components/StepList';
import { processUserInstruction, generateCode } from './services/geminiService';
import { ProcessState, ChatMessage, AutomationStep, ActionType } from './types';

// Safe UUID generator for browser compatibility
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

const App: React.FC = () => {
  const [state, setState] = useState<ProcessState>({
    isProcessing: false,
    currentUrl: 'about:blank',
    steps: [],
    chatHistory: [],
    generatedFiles: null,
    error: null
  });

  const [showCode, setShowCode] = useState(false);

  const handleSendMessage = async (instruction: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: instruction
    };

    setState(prev => ({
      ...prev,
      chatHistory: [...prev.chatHistory, userMessage],
      isProcessing: true,
      error: null
    }));

    try {
      // Perform step(s)
      const result = await processUserInstruction(
        instruction,
        state.currentUrl,
        state.steps
      );

      const aiMessage: ChatMessage = {
        id: generateId(),
        role: 'ai',
        content: result.responseMessage
      };

      setState(prev => ({
        ...prev,
        isProcessing: false,
        chatHistory: [...prev.chatHistory, aiMessage],
        currentUrl: result.newUrl,
        // Append all new steps found by the AI
        steps: [...prev.steps, ...result.steps]
      }));

    } catch (error: any) {
      console.error(error);
      const errorMessage = error.message || "Unknown error occurred";

      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: errorMessage,
        chatHistory: [...prev.chatHistory, {
          id: generateId(),
          role: 'ai',
          content: `⚠️ ${errorMessage}. You can try again or add the step manually below.`
        }]
      }));
    }
  };

  const handleGenerateCode = async () => {
    setState(prev => ({ ...prev, isProcessing: true }));
    try {
      const files = await generateCode(state.steps);
      setState(prev => ({
        ...prev,
        isProcessing: false,
        generatedFiles: files
      }));
      setShowCode(true);
    } catch (error) {
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: "Failed to generate code."
      }));
    }
  };

  const handleUpdateStep = (id: string, updates: Partial<AutomationStep>) => {
    setState(prev => ({
      ...prev,
      steps: prev.steps.map(step => step.id === id ? { ...step, ...updates } : step)
    }));
  };

  const handleDeleteStep = (id: string) => {
    setState(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== id)
    }));
  };

  const handleAddStep = () => {
    const newStep: AutomationStep = {
      id: generateId(),
      order: state.steps.length + 1,
      description: "Manual Step",
      actionType: ActionType.CLICK,
      targetElement: "Target Element",
      simulatedSelector: ".my-selector",
      value: "",
      url: state.currentUrl,
      reasoning: "Manually added by user",
      pageContext: "BasePage"
    };

    setState(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
  };

  return (
    // Root Container
    // h-screen locks the viewport height. 
    // The main scrollbar will appear on the 'main' element if content exceeds viewport.
    <div className="h-screen flex flex-col bg-slate-950 text-slate-200 font-sans overflow-hidden">
      <Header />

      {/* Main Content Area */}
      {/* overflow-y-auto ensures that if the content (min-h-[800px]) is larger than the screen, we scroll here. */}
      {/* We removed lg:overflow-hidden to fix the "no scroll on desktop" issue. */}
      <main className="flex-1 flex flex-col overflow-y-auto">

        {/* Container */}
        {/* lg:h-full tries to fill the screen for that 'app' feel on large monitors. */}
        {/* lg:min-h-[800px] ensures that on small laptops, the layout doesn't crush, triggering the parent scroll. */}
        <div className="container mx-auto px-4 py-6 lg:h-full lg:min-h-[800px]">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-full">

            {/* Left Column: Browser & Steps OR Code Viewer */}
            <div className="lg:col-span-8 flex flex-col lg:h-full gap-4">
              {showCode ? (
                <div className="h-[600px] lg:h-full flex flex-col">
                  <div className="flex justify-between items-center mb-4 shrink-0">
                    <h2 className="text-xl font-bold text-white">Generated POM Structure</h2>
                    <button
                      onClick={() => setShowCode(false)}
                      className="text-sm text-indigo-400 hover:text-indigo-300 underline"
                    >
                      Back to Browser
                    </button>
                  </div>
                  <CodeViewer files={state.generatedFiles} isGenerating={state.isProcessing} />
                </div>
              ) : (
                <div className="flex flex-col gap-6 lg:h-full">
                  {/* Browser Section */}
                  {/* lg:flex-[3]: Takes 3 parts of available vertical space */}
                  {/* lg:min-h-[300px]: Prevents shrinking too small, ensuring usability */}
                  <div className="w-full h-auto min-h-[300px] lg:flex-[3] lg:h-auto lg:min-h-[300px]">
                    <BrowserMockup
                      currentUrl={state.currentUrl}
                      steps={state.steps}
                      isProcessing={state.isProcessing}
                    />
                  </div>

                  {/* Steps Section */}
                  {/* lg:flex-[2]: Takes 2 parts of available vertical space */}
                  {/* lg:overflow-hidden: Keeps the rounded corners / border clean, internal scroll is inside StepList */}
                  <div className="w-full h-auto min-h-[300px] lg:flex-[2] lg:h-auto lg:min-h-[300px] lg:overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-sm">
                    <StepList
                      steps={state.steps}
                      onUpdateStep={handleUpdateStep}
                      onDeleteStep={handleDeleteStep}
                      onAddStep={handleAddStep}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Chat */}
            {/* Fixed height on mobile, Full height on desktop with min safety */}
            <div className="lg:col-span-4 flex flex-col lg:h-full h-[600px] lg:min-h-[600px] pb-6 lg:pb-0">
              <ChatPanel
                messages={state.chatHistory}
                onSendMessage={handleSendMessage}
                onGenerateCode={handleGenerateCode}
                isProcessing={state.isProcessing}
                hasSteps={state.steps.length > 0}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;