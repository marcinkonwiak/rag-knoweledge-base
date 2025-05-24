import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Message } from "./chat-interface";

interface ChatMessageProps {
  message: Message;
  isLoading?: boolean;
}

export function ChatMessage({ message, isLoading = false }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex w-full mb-4", isUser ? "justify-end" : "justify-start")}>
      <div className={cn(
        "flex gap-3 max-w-[85%] md:max-w-[70%]",
        isUser ? "flex-row-reverse" : "flex-row"
      )}>
        <Avatar className="h-8 w-8 shrink-0 mt-1">
          <AvatarFallback className={cn(
            "text-xs",
            isUser 
              ? "bg-blue-600 text-white" 
              : "bg-green-600 text-white"
          )}>
            {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>
        
        <div className={cn(
          "rounded-2xl px-4 py-3 shadow-sm",
          isUser 
            ? "bg-blue-600 text-white rounded-br-md" 
            : "bg-gray-100 dark:bg-gray-800 text-foreground rounded-bl-md"
        )}>
          <div className="text-sm leading-relaxed">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <span>Thinking</span>
                <div className="flex space-x-1">
                  <div className="h-1.5 w-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="h-1.5 w-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="h-1.5 w-1.5 bg-current rounded-full animate-bounce"></div>
                </div>
              </div>
            ) : (
              <div className="whitespace-pre-wrap break-words">{message.content}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
