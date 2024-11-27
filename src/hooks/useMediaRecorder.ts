import { useState, useEffect, useCallback, useRef } from "react";
import getContainer from "../utils/getContainer";

interface MediaRecorderEventHandlers {
  onDataAvailable?: (blob: Blob) => void;
  onStart?: () => void;
  onStop?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onError?: (error: DOMException) => void;
}

const defaultOptions: MediaRecorderOptions = { mimeType: "video/webm" };
const defaultEventHandlers: MediaRecorderEventHandlers = {};

function useMediaRecorder(
  stream: MediaStream | null,
  options: MediaRecorderOptions = defaultOptions,
  eventHandlers: MediaRecorderEventHandlers = defaultEventHandlers
) {
  const [state, setState] = useState<RecordingState | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedBlobsRef = useRef<Blob[]>([]);
  const objectURLRef = useRef<string | null>(null);

  const { mimeType } = options;

  const start = useCallback((timeSlice?: number) => mediaRecorderRef.current?.start(timeSlice), []);

  const pause = useCallback(() => mediaRecorderRef.current?.pause(), []);

  const resume = useCallback(() => mediaRecorderRef.current?.resume(), []);

  const stop = useCallback(() => mediaRecorderRef.current?.stop(), []);

  const save = useCallback(
    (fileName?: string) => {
      if (recordedBlobsRef.current.length === 0) {
        console.warn("useMediaRecorder: recordedBlobs is empty");
        return;
      }
      const blob = new Blob(recordedBlobsRef.current);
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64data = reader.result as string;
        const link = document.createElement("a");
        link.href = base64data;
        link.download = `${fileName || "recording-video"}.${getContainer(mimeType!)}`;
        link.click();
      };

      reader.readAsDataURL(blob);
    },
    [mimeType]
  );

  const getVideoURL = useCallback(() => {
    if (recordedBlobsRef.current.length === 0) {
      console.warn("useMediaRecorder: recordedBlobs is empty");
      return "";
    }
    if (objectURLRef.current) {
      URL.revokeObjectURL(objectURLRef.current);
      objectURLRef.current = null;
    }
    const blob = new Blob(recordedBlobsRef.current, { type: mimeType?.split(";")[0] });
    objectURLRef.current = URL.createObjectURL(blob);
    return objectURLRef.current;
  }, [mimeType]);

  useEffect(() => {
    if (!stream) return;

    if (!MediaRecorder.isTypeSupported(options.mimeType || "")) {
      console.error(`MIME type ${options.mimeType} is not supported.`);
      return;
    }

    const mediaRecorder = new MediaRecorder(stream, options);
    mediaRecorderRef.current = mediaRecorder;
    setState(mediaRecorder.state);

    const { onDataAvailable, onStart, onPause, onResume, onStop, onError } = eventHandlers;

    const handleDataAvailable = (event: BlobEvent) => {
      console.log("useMediaRecorder: data available event fired");
      if (event.data.size === 0) return;
      recordedBlobsRef.current.push(event.data);
      onDataAvailable?.(event.data);
    };

    const handleStart = () => {
      console.info("useMediaRecorder: start event fired");
      recordedBlobsRef.current = [];
      setState("recording");
      onStart?.();
    };

    const handlePause = () => {
      console.info("useMediaRecorder: pause event fired");
      setState("paused");
      onPause?.();
    };

    const handleResume = () => {
      console.info("useMediaRecorder: resume event fired");
      setState("recording");
      onResume?.();
    };

    const handleStop = () => {
      console.info("useMediaRecorder: stop event fired");
      setState("inactive");
      onStop?.();
    };

    const handleError = (event: Event) => {
      const errorEvent = event as ErrorEvent;
      onError?.(errorEvent.error as DOMException);
    };

    mediaRecorder.addEventListener("dataavailable", handleDataAvailable);
    mediaRecorder.addEventListener("start", handleStart);
    mediaRecorder.addEventListener("stop", handleStop);
    mediaRecorder.addEventListener("pause", handlePause);
    mediaRecorder.addEventListener("resume", handleResume);
    mediaRecorder.addEventListener("error", handleError);

    return () => {
      mediaRecorder.stop();

      mediaRecorder.removeEventListener("dataavailable", handleDataAvailable);
      mediaRecorder.removeEventListener("start", handleStart);
      mediaRecorder.removeEventListener("stop", handleStop);
      mediaRecorder.removeEventListener("pause", handlePause);
      mediaRecorder.removeEventListener("resume", handleResume);
      mediaRecorder.removeEventListener("error", handleError);

      mediaRecorderRef.current = null;
      recordedBlobsRef.current = [];
      setState(null);
    };
  }, [stream, options, eventHandlers]);

  useEffect(() => {
    return () => {
      if (objectURLRef.current) {
        URL.revokeObjectURL(objectURLRef.current);
        objectURLRef.current = null;
      }
    };
  }, []);

  return {
    start,
    stop,
    pause,
    resume,
    save,
    getVideoURL,
    state,
  };
}

export default useMediaRecorder;
