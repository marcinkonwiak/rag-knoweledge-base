import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";
import { ApiClient } from "@/lib/api/client";

interface AudioRecorderButtonProps {
  apiClient: ApiClient | null;
  onTranscriptionReceived: (text: string) => void;
  onProcessingStateChange?: (isProcessing: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function AudioRecorderButton({
                                      apiClient,
                                      onTranscriptionReceived,
                                      onProcessingStateChange,
                                      disabled = false,
                                      className = "",
                                    }: AudioRecorderButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimeoutRef = useRef<number | null>(null);

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mimeType = 'audio/webm';
      const mediaRecorder = new MediaRecorder(stream, { mimeType });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        await sendAudioToServer(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);

      recordingTimeoutRef.current = window.setTimeout(() => {
        if (isRecording) {
          stopRecording();
        }
      }, 30000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please check your browser permissions and make sure your microphone is connected.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
        recordingTimeoutRef.current = null;
      }

      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
      onProcessingStateChange?.(true);
    }
  };

  const sendAudioToServer = async (audioBlob: Blob) => {
    if (!apiClient) {
      setIsProcessing(false);
      onProcessingStateChange?.(false);
      return;
    }

    try {
      const file = new File([audioBlob], "recording.webm", { type: "audio/webm" });
      const response = await apiClient.uploadFile<{ text: string; confidence: number | null }>(
        "/speech-to-text/",
        file,
        { language: "pl-PL" }
      );

      if (response.text) {
        onTranscriptionReceived(response.text);
      }
    } catch (error) {
      console.error("Error sending audio to server:", error);
      alert("Could not process your speech. Please try again or check your internet connection.");
    } finally {
      setIsProcessing(false);
      onProcessingStateChange?.(false);
    }
  };

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || isProcessing}
      size="icon"
      variant={isRecording ? "destructive" : "outline"}
      className={`h-8 w-8 rounded-lg ${isRecording ? "animate-pulse" : ""} ${className}`}
      title={isRecording ? "Stop recording" : "Start voice recording"}
    >
      <Mic className="h-4 w-4" />
    </Button>
  );
}
