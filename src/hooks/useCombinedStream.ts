import { useState, useEffect } from "react";

function useCombinedStream(inputStreams: (MediaStream | null)[]): MediaStream | null {
  const [combinedStream, setCombinedStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (inputStreams.every((stream) => stream === null)) {
      return;
    }

    const newStream = new MediaStream();

    inputStreams.forEach((stream) => {
      if (stream) {
        stream.getTracks().forEach((track) => {
          newStream.addTrack(track.clone());
        });
      }
    });

    setCombinedStream(newStream);

    return () => {
      newStream.getTracks().forEach((track) => {
        track.stop();
        newStream.removeTrack(track);
      });
      setCombinedStream(null);
    };
  }, [inputStreams]);

  return combinedStream;
}

export default useCombinedStream;
