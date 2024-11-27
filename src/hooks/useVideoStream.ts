import { useEffect, useState } from "react";

function useVideoStream(videoConstraints: boolean | MediaTrackConstraints = true) {
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [isVideoStreamError, setIsVideoStreamError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const getVideoStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints });
        if (isMounted) {
          setVideoStream(stream);
          setIsVideoStreamError(false);
        } else {
          stream.getTracks().forEach((track) => track.stop());
        }
      } catch (e) {
        console.error(e);
        if (isMounted) {
          setVideoStream(null);
          setIsVideoStreamError(true);
        }
      }
    };

    videoConstraints && getVideoStream();

    return () => {
      isMounted = false;
    };
  }, [videoConstraints]);

  useEffect(() => {
    return () => videoStream?.getTracks().forEach((track) => track.stop());
  }, [videoStream]);

  return { videoStream, isVideoStreamError };
}

export default useVideoStream;
