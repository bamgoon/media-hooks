import { useEffect, useState } from "react";

function useMediaStream(
  videoConstraints: boolean | MediaTrackConstraints = true,
  audioConstraints: boolean | MediaTrackConstraints = true
) {
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    let isMounted = true;

    const getMediaStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: audioConstraints,
        });
        if (isMounted) {
          setMediaStream(stream);
        } else {
          stream.getTracks().forEach((track) => track.stop());
        }
      } catch {
        if (isMounted) {
          setMediaStream(null);
        }
      }
    };

    getMediaStream();

    return () => {
      isMounted = false;
    };
  }, [videoConstraints, audioConstraints]);

  useEffect(() => {
    return () => mediaStream?.getTracks().forEach((track) => track.stop());
  }, [mediaStream]);

  return mediaStream;
}

export default useMediaStream;
