"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { ChatMessage } from "@/components/chat/chat-message";
import { useApiClient } from "@/hooks/use-api-client";
import { streamChat, type ChatMessage as ApiChatMessage } from "@/lib/api/chat";
import * as React from "react";

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(
    null,
  );
  const { apiClient } = useApiClient();

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !apiClient) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const query = inputValue.trim();
    setInputValue("");
    setIsLoading(true);

    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: Message = {
      id: aiMessageId,
      content: "",
      role: "assistant",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, aiMessage]);
    setStreamingMessageId(aiMessageId);

    try {
      const history: ApiChatMessage[] = messages.map((msg) => ({
        role: msg.role === "user" ? "user" : "ai",
        content: msg.content,
      }));

      const chatStream = await streamChat(apiClient, {
        query,
        history,
      });

      let accumulatedContent = "";

      for await (const event of chatStream.stream()) {
        if (event.type === "delta") {
          accumulatedContent += event.data.v;

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId
                ? { ...msg, content: accumulatedContent }
                : msg,
            ),
          );
        } else if (event.type === "done") {
          break;
        } else if (event.type === "error") {
          console.error("Chat stream error:", event.error);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId
                ? {
                    ...msg,
                    content:
                      "Sorry, there was an error processing your request. Please try again.",
                  }
                : msg,
            ),
          );
          break;
        }
      }

      await chatStream.close();
    } catch (error) {
      console.error("Failed to stream chat:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? {
                ...msg,
                content:
                  "Sorry, there was an error processing your request. Please try again.",
              }
            : msg,
        ),
      );
    } finally {
      setIsLoading(false);
      setStreamingMessageId(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Ask a question
            </div>
          ) : (
            <div className="space-y-1">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isLoading={
                    streamingMessageId === message.id && message.content === ""
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Input Area */}
      <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-4xl mx-auto p-4">
          <div className="relative flex items-end gap-3 bg-background border border-border rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:border-ring transition-all">
            <Textarea
              placeholder="Message AI Assistant..."
              value={inputValue}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setInputValue(e.target.value)
              }
              onKeyDown={handleKeyPress}
              disabled={isLoading}
              className="flex-1 min-h-[52px] max-h-32 border-0 resize-none bg-transparent px-4 py-3 text-sm focus:ring-0 focus:outline-none focus-visible:ring-0 placeholder:text-muted-foreground"
              rows={1}
              style={{
                resize: "none",
                overflow: "hidden",
                height: "auto",
                minHeight: "52px",
              }}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              size="icon"
              className="m-2 h-8 w-8 rounded-lg"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            AI can make mistakes. Check important information.
          </p>
        </div>
      </div>
    </div>
  );
}
