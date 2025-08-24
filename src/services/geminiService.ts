
import { GoogleGenerativeAI } from '@google/generative-ai';

// Pre-configured API keys for the application
const API_KEYS = [
  'AIzaSyBnZCzRjQRc3wDgGDdC1kCLwcbGJRYuyMc',
  'AIzaSyC_cnrlsxeIx7i3MjIe5rl9QFbyk0qKlgA',
  'AIzaSyDkCxExhTKwUAASINusHXMAFDZAhsLhC40',
  'AIzaSyCrosJpaddyi6Upxj0bnApPT-spZUh2yMs',
  'AIzaSyBa2T4Kb2Mty6vSdoQ9NKDPCCNb6SIbFjk'
];

class GeminiService {
  private clients: GoogleGenerativeAI[];
  private currentKeyIndex: number = 0;
  
  constructor() {
    this.clients = API_KEYS.map(key => new GoogleGenerativeAI(key));
  }
  
  private getNextClient(): GoogleGenerativeAI {
    const client = this.clients[this.currentKeyIndex];
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.clients.length;
    return client;
  }
  
  async generateResponse(
    prompt: string, 
    systemPrompt: string = "You are AdiGon AI, a helpful and creative assistant.",
    fileData?: any
  ): Promise<string> {
    const maxRetries = API_KEYS.length;
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        const client = this.getNextClient();
        const model = client.getGenerativeModel({ 
          model: "gemini-1.5-flash",
          systemInstruction: systemPrompt
        });
        
        let result;
        if (fileData?.file) {
          const imagePart = {
            inlineData: {
              data: fileData.base64,
              mimeType: fileData.file.type
            }
          };
          result = await model.generateContent([prompt, imagePart]);
        } else {
          result = await model.generateContent(prompt);
        }
        
        return result.response.text();
      } catch (error) {
        console.warn(`API key ${attempt + 1} failed, trying next...`, error);
        attempt++;
        
        if (attempt >= maxRetries) {
          throw new Error('All API keys exhausted. Please try again later.');
        }
      }
    }
    
    throw new Error('Failed to generate response');
  }
  
  async generateStreamingResponse(
    prompt: string,
    systemPrompt: string = "You are AdiGon AI, a helpful and creative assistant.",
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    try {
      const client = this.getNextClient();
      const model = client.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: systemPrompt
      });
      
      const result = await model.generateContentStream(prompt);
      let fullResponse = '';
      
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullResponse += chunkText;
        if (onChunk) {
          onChunk(chunkText);
        }
      }
      
      return fullResponse;
    } catch (error) {
      console.error('Streaming failed, falling back to regular generation:', error);
      return this.generateResponse(prompt, systemPrompt);
    }
  }
}

export const geminiService = new GeminiService();
