from pydantic import BaseModel


class SSEEvent(BaseModel):
    event_name: str

    def to_sse(self) -> bytes:
        return (
            f"event: {self.event_name}\n"
            f"data: {self.model_dump_json(exclude={'event_name'})}\n\n"
        ).encode()


class AgentDelta(SSEEvent):
    v: str
    event_name: str = "delta"


class AgentDone(SSEEvent):
    event_name: str = "done"
