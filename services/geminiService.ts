import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AutomationStep, ActionType, GeneratedFiles } from "../types";

// Safe access to process.env for browser environments
const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

// Configuration
const TIMEOUT_MS = 45000; // Increased for multi-step generation
const MAX_RETRIES = 2;
const RETRY_DELAY_BASE = 1000;

// Helper to enforce timeout
const withTimeout = <T>(promise: Promise<T>, ms: number, timeoutError = "Request timed out"): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(timeoutError)), ms);
    promise
      .then(value => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch(reason => {
        clearTimeout(timer);
        reject(reason);
      });
  });
};

// Helper for delay
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to clean JSON string from markdown
const cleanJson = (text: string): string => {
  if (!text) return "{}";
  let clean = text.trim();
  clean = clean.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/```$/, '');
  return clean.trim();
};

// Safe UUID generator
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

interface InstructionResult {
  steps: AutomationStep[];
  responseMessage: string;
  newUrl: string;
}

// --- HEURISTICS ---
const tryLocalHeuristics = (instruction: string, currentUrl: string): InstructionResult | null => {
  const lower = instruction.toLowerCase().trim();

  // Regex for explicit simple navigation
  const navRegex = /^(?:navigate\s+to|go\s+to|open|visit|visitar|navegar\s+a|ir\s+a)\s+(https?:\/\/[^\s]+|[a-zA-Z0-9.-]+\.[a-z]{2,})(\s*)?$/i;

  const match = lower.match(navRegex);

  if (match && match[1]) {
    let url = match[1];
    if (!url.startsWith('http')) {
      url = 'https://' + url;
    }

    // Heuristic POM context guessing
    let pageContext = "BasePage";
    if (url.includes("saucedemo")) pageContext = "LoginPage";
    else if (url.includes("login")) pageContext = "LoginPage";
    else if (url.includes("cart")) pageContext = "CartPage";
    else if (url.includes("inventory") || url.includes("product")) pageContext = "InventoryPage";

    const step: AutomationStep = {
      id: generateId(),
      order: 0,
      description: instruction,
      actionType: ActionType.NAVIGATE,
      targetElement: "Browser Window",
      simulatedSelector: "/",
      value: url,
      url: url,
      reasoning: "Fast-tracked: Detected direct navigation.",
      pageContext: pageContext
    };

    return {
      steps: [step],
      newUrl: url,
      responseMessage: `Navigating to ${url} (${pageContext})`
    };
  }

  return null;
};

export const processUserInstruction = async (
  instruction: string,
  currentUrl: string,
  previousSteps: AutomationStep[]
): Promise<InstructionResult> => {

  const localResult = tryLocalHeuristics(instruction, currentUrl);
  if (localResult) {
    localResult.steps[0].order = previousSteps.length + 1;
    return localResult;
  }

  if (!apiKey) {
    console.warn("API Key is missing.");
  }

  const model = "gemini-2.5-flash";

  // Context for the AI to understand the flow
  const contextSummary = previousSteps.map(s =>
    `[${s.pageContext}] ${s.actionType} -> ${s.targetElement}`
  ).join('\n');

  const prompt = `
    You are a Playwright Automation Expert generating a Page Object Model (POM) test.
    
    User Instruction: "${instruction}"
    Current URL: ${currentUrl}
    Previous Steps:
    ${contextSummary || "Start of test"}

    TASK:
    1. Break down the User Instruction into a SEQUENCE of atomic Playwright actions.
    2. Example: If user says "Login", generate 3 steps: FILL username, FILL password, CLICK login.
    3. If user says "valid credentials" and you don't know them, use generic placeholders (e.g. "standard_user", "secret_sauce" for SauceDemo, or "user"/"password123").
    4. **Simulate scraping**: Infer optimal selectors based on standard web patterns (IDs, data-test-id, aria-label).
    5. Identify the 'pageContext' (Page Object Class Name) for EACH step.

    Output JSON ONLY with this structure:
    {
      "steps": [
        {
          "actionType": "NAVIGATE|CLICK|FILL|ASSERT|WAIT",
          "targetElement": "Human readable name (e.g. Username Input)",
          "simulatedSelector": "Robust selector (e.g. #user-name)",
          "value": "Input text or URL (optional)",
          "reasoning": "Why this selector?",
          "pageContext": "LoginPage"
        }
      ],
      "newUrl": "Predicted URL after ALL steps completed",
      "responseMessage": "Summary of actions taken"
    }
  `;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await withTimeout(
        ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.1 // Lower temperature for more deterministic multi-step logic
          }
        }),
        TIMEOUT_MS,
        `Request timed out`
      ) as GenerateContentResponse;

      if (!result.text) throw new Error("Empty response");

      const cleanedText = cleanJson(result.text);
      let data;
      try {
        data = JSON.parse(cleanedText);
      } catch (e) {
        throw new Error("Failed to parse AI JSON response");
      }

      // Validate data structure
      if (!data.steps || !Array.isArray(data.steps)) {
        // Fallback if AI returns single object instead of array
        if (data.actionType) {
          data.steps = [data];
        } else {
          throw new Error("Invalid JSON structure");
        }
      }

      let nextUrl = data.newUrl || currentUrl;
      // Basic URL cleanup
      if (nextUrl && nextUrl !== 'about:blank' && !nextUrl.startsWith('http') && nextUrl.includes('.')) {
        nextUrl = `https://${nextUrl}`;
      }

      // Map response to AutomationStep objects
      const newSteps: AutomationStep[] = data.steps.map((s: any, index: number) => ({
        id: generateId(),
        order: previousSteps.length + 1 + index,
        description: instruction, // All steps share the parent instruction description or could be specific
        actionType: s.actionType || ActionType.UNKNOWN,
        targetElement: s.targetElement || "Unknown Element",
        simulatedSelector: s.simulatedSelector || "body",
        value: s.value,
        reasoning: s.reasoning || "AI Generated Sequence",
        url: nextUrl, // Approximate URL for these steps
        pageContext: s.pageContext || "BasePage"
      }));

      return {
        steps: newSteps,
        responseMessage: data.responseMessage || `Executed ${newSteps.length} steps.`,
        newUrl: nextUrl
      };

    } catch (error: any) {
      console.warn(`Attempt ${attempt} failed:`, error.message);
      lastError = error;
      if (attempt < MAX_RETRIES) await wait(RETRY_DELAY_BASE * attempt);
    }
  }

  throw lastError || new Error("AI unresponsive.");
};

export const generateCode = async (steps: AutomationStep[]): Promise<GeneratedFiles> => {
  if (!apiKey) throw new Error("API Key is missing");
  const model = "gemini-2.5-flash";

  // Minify steps for prompt
  const simpleSteps = steps.map(s => ({
    page: s.pageContext,
    action: s.actionType,
    selector: s.simulatedSelector,
    value: s.value,
    desc: s.description,
    target: s.targetElement
  }));

  const prompt = `
    You are a Playwright Architecture Generator. 
    Create a robust Page Object Model (POM) project in **JavaScript (ES Modules)**.

    SCENARIO STEPS:
    ${JSON.stringify(simpleSteps, null, 2)}

    REQUIREMENTS:
    1. Output a JSON object where keys are file paths and values are file content.
    2. Structure:
       - 'tests/scenario.spec.js': The main test file. Imports pages, runs the test.
       - 'pages/[PageName].js': One file per unique 'page' found in steps.
    3. Page Objects must be Javascript classes exporting a default or named class. 
    4. Use 'import/export' syntax (type="module").
    5. In Page Objects, create semantic methods (e.g., login(user, pass), addToCart()) that group the raw steps.
       - IMPORTANT: If you see consecutive FILL/CLICK steps on the same page (like Login), group them into a single method (e.g. login()).
    6. Return ONLY valid JSON.

    Example Output format:
    {
      "tests/scenario.spec.js": "import { test } from '@playwright/test'; ...",
      "pages/LoginPage.js": "export class LoginPage { ... }"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const cleanedText = cleanJson(response.text || "{}");
    return JSON.parse(cleanedText);
  } catch (e) {
    console.error("Code Gen Error", e);
    return {
      "error.log": "Failed to generate code. Please try again."
    };
  }
};
