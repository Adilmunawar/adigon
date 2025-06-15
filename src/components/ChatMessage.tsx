
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
        "flex items-start gap-3 py-4",
        isUser && "justify-end"
      )}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
          <Bot size={20} />
        </div>
      )}
      <div
        className={cn(
          "max-w-md rounded-xl px-4 py-3 text-sm",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        )}
      >
        {message.parts.map((part, index) => (
          <p key={index}>{part.text}</p>
        ))}
        {message.imageUrl && (
            <img src={message.imageUrl} alt="Generated content" className="mt-2 rounded-lg max-w-full h-auto" />
        )}
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <User size={20} />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
