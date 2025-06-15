
import { toast } from "@/components/ui/sonner";

const API_URL = 'https://api.perplexity.ai/chat/completions';

export const runDeepSearch = async (prompt: string, apiKey: string): Promise<string> => {
  if (!apiKey) {
    throw new Error("Perplexity API key is not set.");
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant that provides comprehensive, factual, and well-sourced answers based on a deep search of the internet. Be precise and concise. Cite your sources when possible.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
      }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("Perplexity API Error:", errorData);
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.choices && data.choices.length > 0 && data.choices[0].message) {
      return data.choices[0].message.content;
    }
    
    return "I couldn't find a clear answer. Please try rephrasing your question."
  } catch (error) {
    console.error("Error running deep search:", error);
    toast.error("An error occurred during the deep search. Please check your API key and network connection.");
    return "Sorry, I encountered an error while performing the deep search. Please try again.";
  }
};
