
import React from 'react';
import { User, Bot } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChatBubbleProps {
  message: {
    role: 'user' | 'model';
    parts: Array<{ text: string }>;
  };
}

export const ChatBubble = ({ message }: ChatBubbleProps) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex gap-3 mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-purple-500">
            <Bot className="w-4 h-4 text-white" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div
        className={`max-w-[80%] p-3 rounded-lg ${
          isUser
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-900 border'
        }`}
      >
        <div className="text-sm whitespace-pre-wrap">
          {message.parts[0]?.text || ''}
        </div>
      </div>
      
      {isUser && (
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-blue-500">
            <User className="w-4 h-4 text-white" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};
