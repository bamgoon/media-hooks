import { useEffect } from "react";

const MAX_ATTEMPT = 3;

type Options = {
  video?: boolean;
  audio?: boolean;
};

function useRequestPermission(options: Options = {}) {
  const { video = true, audio = true } = options;

  useEffect(() => {
    if (!video && !audio) return;

    const requestMedia = async (attempt = 1) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video, audio });
        stream.getTracks().forEach((track) => track.stop());
      } catch (error) {
        if (attempt < MAX_ATTEMPT) {
          console.warn(`getUserMedia 재시도 ${attempt}:`, error);
          requestMedia(attempt + 1);
        } else {
          console.error("getUserMedia 실패:", error);
        }
      }
    };

    requestMedia();
  }, [video, audio]);
}

export default useRequestPermission;
