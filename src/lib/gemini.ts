
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const API_KEY = "AIzaSyBE-SkmQO-yqDyn51HaenX8Xw3BCLjCcM0";

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-latest",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
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

export const runChat = async (prompt: string, history: { role: string, parts: { text: string }[] }[], file?: File) => {
  try {
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
        const promptForImage = prompt || "What's in this image?";
        const result = await chatSession.sendMessage([promptForImage, imagePart]);
        return result.response.text();
    } else {
        const result = await chatSession.sendMessage(prompt);
        return result.response.text();
    }
  } catch (error) {
    console.error("Error running chat:", error);
    return "Sorry, I encountered an error. Please try again.";
  }
};
