
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const API_KEY = "AIzaSyBE-SkmQO-yqDyn51HaenX8Xw3BCLjCcM0";

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-latest",
});

const getGenerationConfig = (responseLength: string = 'adaptive', codeDetailLevel: string = 'comprehensive') => {
  let maxTokens = 8192;
  let temperature = 1;
  
  switch (responseLength) {
    case 'brief':
      maxTokens = 2048;
      break;
    case 'detailed':
      maxTokens = 16384;
      break;
    case 'adaptive':
    default:
      maxTokens = 8192;
      break;
  }

  switch (codeDetailLevel) {
    case 'minimal':
      temperature = 0.7;
      break;
    case 'enterprise':
      maxTokens = Math.max(maxTokens, 16384);
      temperature = 0.8;
      break;
    case 'comprehensive':
    default:
      maxTokens = Math.max(maxTokens, 12288);
      temperature = 1;
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
    
    // Adjust temperature based on user creativity setting
    if (settings.aiCreativity !== undefined) {
      generationConfig.temperature = settings.aiCreativity;
    }

    // Enhance prompts based on settings
    let enhancedPrompt = prompt;
    
    if (settings.codeDetailLevel === 'comprehensive' || settings.codeDetailLevel === 'enterprise') {
      if (prompt.includes('code') || prompt.includes('build') || prompt.includes('create')) {
        enhancedPrompt = `${prompt}

IMPORTANT INSTRUCTIONS FOR CODE GENERATION:
- Generate production-ready, fully functional code
- Include comprehensive error handling and edge cases
- Add detailed comments and documentation
- Implement proper TypeScript types and interfaces
- Include unit tests where appropriate
- Follow best practices and design patterns
- Make the code scalable and maintainable
- Include proper styling with Tailwind CSS
- Ensure responsive design principles
- Add accessibility features (ARIA labels, keyboard navigation)
${settings.codeDetailLevel === 'enterprise' ? '- Include security considerations and performance optimizations\n- Add logging and monitoring capabilities\n- Implement proper state management patterns' : ''}

Generate complete, working solutions rather than placeholder code.`;
      }
    }

    if (settings.responseLength === 'detailed') {
      enhancedPrompt = `${enhancedPrompt}

Please provide a comprehensive and detailed response with thorough explanations, examples, and step-by-step guidance where applicable.`;
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
    return "Sorry, I encountered an error. Please try again.";
  }
};
