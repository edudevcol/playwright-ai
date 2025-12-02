export enum StepStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export enum ActionType {
  NAVIGATE = 'NAVIGATE',
  CLICK = 'CLICK',
  FILL = 'FILL',
  ASSERT = 'ASSERT',
  WAIT = 'WAIT',
  HOVER = 'HOVER',
  UNKNOWN = 'UNKNOWN'
}

export interface AutomationStep {
  id: string;
  order: number;
  description: string;
  actionType: ActionType;
  targetElement?: string;
  simulatedSelector?: string;
  value?: string; // For input fields
  url?: string; // The URL where this action happens
  reasoning?: string; // Why the AI chose this selector
  pageContext: string; // POM: The page object name (e.g., "LoginPage")
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  relatedStepId?: string;
}

// Dictionary of filename -> code content
export type GeneratedFiles = Record<string, string>;

export interface ProcessState {
  isProcessing: boolean;
  currentUrl: string;
  steps: AutomationStep[];
  chatHistory: ChatMessage[];
  generatedFiles: GeneratedFiles | null;
  error: string | null;
}