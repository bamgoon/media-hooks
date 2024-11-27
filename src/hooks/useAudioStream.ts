import { useEffect, useState } from "react";

function useAudioStream(audioConstraints: boolean | MediaTrackConstraints = true) {
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [isAudioStreamError, setIsAudioStreamError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const getAudioStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });
        if (isMounted) {
          setAudioStream(stream);
          setIsAudioStreamError(false);
        } else {
          stream.getTracks().forEach((track) => track.stop());
        }
      } catch (e) {
        console.error(e);
        if (isMounted) {
          setAudioStream(null);
          setIsAudioStreamError(true);
        }
      }
    };

    audioConstraints && getAudioStream();

    return () => {
      isMounted = false;
    };
  }, [audioConstraints]);

  useEffect(() => {
    return () => audioStream?.getTracks().forEach((track) => track.stop());
  }, [audioStream]);

  return { audioStream, isAudioStreamError };
}

export default useAudioStream;
