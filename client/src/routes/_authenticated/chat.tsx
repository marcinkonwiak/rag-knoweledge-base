import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header.tsx";
import { ChatInterface } from "@/components/chat/chat-interface.tsx";

export const Route = createFileRoute("/_authenticated/chat")({
  component: Chat,
});

function Chat() {
  return (
    <div className="flex flex-col h-full">
      <AppHeader breadcrumbTitle={"Chat"} />
      <div className="flex-1 overflow-hidden">
        <ChatInterface />
      </div>
    </div>
  );
}
