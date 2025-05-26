import type { ApiClient } from "./client";

export interface ChatMessage {
  role: "user" | "ai";
  content: string;
}

export interface ChatRequest {
  query: string;
  history: ChatMessage[];
}

export interface ChatDelta {
  v: string;
}

export interface ChatDone {}

export type ChatEvent =
  | { type: "delta"; data: ChatDelta }
  | { type: "done"; data: ChatDone }
  | { type: "error"; error: string };

export class ChatStream {
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private decoder = new TextDecoder();
  private buffer = "";
  private currentEventType: string | null = null;

  constructor(private response: Response) {}

  async *stream(): AsyncGenerator<ChatEvent> {
    if (!this.response.body) {
      yield { type: "error", error: "No response body" };
      return;
    }

    this.reader = this.response.body.getReader();

    try {
      while (true) {
        const { done, value } = await this.reader.read();

        if (done) break;

        this.buffer += this.decoder.decode(value, { stream: true });

        const lines = this.buffer.split("\n");
        this.buffer = lines.pop() || "";

        for (const line of lines) {
          const event = this.parseSSELine(line);
          if (event) {
            yield event;
          }
        }
      }
    } catch (error) {
      yield {
        type: "error",
        error: error instanceof Error ? error.message : "Stream error",
      };
    } finally {
      this.reader?.releaseLock();
    }
  }

  private parseSSELine(line: string): ChatEvent | null {
    const trimmed = line.trim();
    if (!trimmed) return null;

    if (trimmed.startsWith("event: ")) {
      this.currentEventType = trimmed.substring(7);
      return null;
    }

    if (trimmed.startsWith("data: ")) {
      const data = trimmed.substring(6);

      if (!data || data === "{}") {
        if (this.currentEventType === "done") {
          return { type: "done", data: {} };
        }
        return null;
      }

      try {
        const parsed = JSON.parse(data);

        if (this.currentEventType === "delta") {
          if (typeof parsed === "object" && typeof parsed.v === "string") {
            return { type: "delta", data: parsed as ChatDelta };
          } else {
            return { type: "error", error: "Invalid delta format" };
          }
        } else if (this.currentEventType === "done") {
          return { type: "done", data: parsed as ChatDone };
        }
      } catch (error) {
        return { type: "error", error: "Failed to parse SSE data" };
      }
    }

    return null;
  }

  async close(): Promise<void> {
    this.reader?.cancel();
  }
}

export async function streamChat(
  apiClient: ApiClient,
  request: ChatRequest,
): Promise<ChatStream> {
  const response = await apiClient.streamPost("/documents/chat", request);
  return new ChatStream(response);
}
