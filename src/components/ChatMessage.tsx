
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

export interface Message {
  role: "user" | "model";
  parts: { text: string }[];
  imageUrl?: string;
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex items-start gap-4 py-4 animate-fade-in-up",
        isUser && "justify-end"
      )}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary ring-2 ring-primary/40">
          <Bot size={24} />
        </div>
      )}
      <div
        className={cn(
          "max-w-xl rounded-2xl px-5 py-3 text-base shadow-md",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        )}
      >
        {message.parts.map((part, index) => (
          <p key={index} className="leading-relaxed">{part.text}</p>
        ))}
        {message.imageUrl && (
            <img src={message.imageUrl} alt="Generated content" className="mt-3 rounded-xl max-w-full h-auto" />
        )}
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center ring-2 ring-border">
          <User size={24} />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
