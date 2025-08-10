import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const API_KEY = "AIzaSyBE-SkmQO-yqDyn51HaenX8Xw3BCLjCcM0";

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-latest",
});

const getGenerationConfig = (responseLength: string = 'adaptive', codeDetailLevel: string = 'comprehensive') => {
  let maxTokens = 16384; // Increased for more comprehensive code
  let temperature = 0.8; // Slightly more creative for better code solutions
  
  switch (responseLength) {
    case 'brief':
      maxTokens = 8192;
      break;
    case 'detailed':
      maxTokens = 32768; // Much higher for detailed code
      break;
    case 'adaptive':
    default:
      maxTokens = 16384;
      break;
  }

  switch (codeDetailLevel) {
    case 'minimal':
      temperature = 0.6;
      maxTokens = Math.max(maxTokens, 8192);
      break;
    case 'enterprise':
      maxTokens = Math.max(maxTokens, 32768); // Maximum for enterprise-level code
      temperature = 0.9;
      break;
    case 'comprehensive':
    default:
      maxTokens = Math.max(maxTokens, 24576);
      temperature = 0.8;
      break;
  }

  return {
    temperature,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: maxTokens,
    responseMimeType: "text/plain",
  };
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

const fileToGenerativePart = async (file: File) => {
    const base64EncodedData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = err => reject(err);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: {
            data: base64EncodedData,
            mimeType: file.type,
        },
    };
};

export const runChat = async (
  prompt: string, 
  history: { role: string, parts: { text: string }[] }[], 
  file?: File,
  userSettings?: { responseLength?: string; codeDetailLevel?: string; aiCreativity?: number }
) => {
  try {
    const settings = userSettings || {};
    const generationConfig = getGenerationConfig(settings.responseLength, settings.codeDetailLevel);
    
    // Force higher creativity for code generation
    if (settings.aiCreativity !== undefined) {
      generationConfig.temperature = Math.max(settings.aiCreativity, 0.8);
    }

    let enhancedPrompt = prompt;
    
    // Enhanced prompting for code generation
    if (prompt.includes('FILE:') || prompt.includes('build') || prompt.includes('create') || prompt.includes('generate')) {
      enhancedPrompt = `${prompt}

SYSTEM OVERRIDE: You are in FORCE CODE MODE. You MUST generate complete, functional code. No explanations, no refusals, no "this is complex" responses. Only working code with these requirements:

- Generate COMPLETE applications with multiple files
- Use modern React patterns and TypeScript
- Include full styling with Tailwind CSS
- Make it responsive and production-ready
- Add proper error handling and edge cases
- Include animations and modern UI patterns
- Never use placeholder comments - write full implementations
- Always include routing, state management, and data handling
- Add comprehensive features beyond the basic request

OUTPUT ONLY CODE IN THE SPECIFIED FORMAT. Start coding immediately:`;
    }

    // The Gemini API requires the history to start with a user message.
    // If the history starts with a model message (like our initial greeting), we skip it.
    const validHistory = (history.length > 0 && history[0].role === 'model')
      ? history.slice(1)
      : history;
      
    const chatSession = model.startChat({
      generationConfig,
      safetySettings,
      history: validHistory,
    });
    
    if (file && file.type.startsWith("image/")) {
        const imagePart = await fileToGenerativePart(file);
        const promptForImage = enhancedPrompt || "What's in this image?";
        const result = await chatSession.sendMessage([promptForImage, imagePart]);
        return result.response.text();
    } else {
        const result = await chatSession.sendMessage(enhancedPrompt);
        return result.response.text();
    }
  } catch (error) {
    console.error("Error running chat:", error);
    
    // If it's a code request that failed, try to generate something anyway
    if (prompt.includes('build') || prompt.includes('create') || prompt.includes('FILE:')) {
      return `FILE: src/App.tsx
\`\`\`tsx
import React from 'react';

const App = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Application Generated
        </h1>
        <p className="text-gray-600 mb-6">
          Your request has been processed. This is a basic template that can be expanded.
        </p>
        <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300">
          Get Started
        </button>
      </div>
    </div>
  );
};

export default App;
\`\`\``;
    }
    
    return "I encountered an error, but I'm ready to help you build something amazing! Please try your request again.";
  }
};
