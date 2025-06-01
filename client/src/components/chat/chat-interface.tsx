"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";
import { ChatMessage } from "@/components/chat/chat-message";
import { useApiClient } from "@/hooks/use-api-client";
import { streamChat, type ChatMessage as ApiChatMessage } from "@/lib/api/chat";
import * as React from "react";
import { AudioRecorderButton } from "@/components/chat/audio-recorder-button";

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
  const [isSpeechProcessing, setIsSpeechProcessing] = useState(false);
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
          <div className="relative flex items-center gap-3 bg-background border border-border rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:border-ring transition-all">
            <div className="flex-1 relative">
              <Input
                placeholder={isSpeechProcessing ? "Processing speech..." : "Message AI Assistant..."}
                value={inputValue}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setInputValue(e.target.value)
                }
                onKeyDown={handleKeyPress}
                disabled={isLoading || isSpeechProcessing}
                className="flex-1 w-full border-0 bg-transparent px-4 py-3 text-sm focus:ring-0 focus:outline-none focus-visible:ring-0 placeholder:text-muted-foreground h-12"
              />
              {isSpeechProcessing && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              )}
            </div>
            <AudioRecorderButton
              apiClient={apiClient}
              onTranscriptionReceived={(text) => setInputValue(text)}
              onProcessingStateChange={setIsSpeechProcessing}
              disabled={isLoading}
              className="mr-2"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              size="icon"
              className="h-8 w-8 rounded-lg mr-3"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
