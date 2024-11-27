import { useEffect, useMemo, useRef, useState } from "react";
import useVideoStream from "./hooks/useVideoStream";
import useAudioStream from "./hooks/useAudioStream";
import useCombinedStream from "./hooks/useCombinedStream";
import useMediaRecorder from "./hooks/useMediaRecorder";
import useReplaceableStream from "./hooks/useReplaceableStream";
import useRequestPermission from "./hooks/useRequestPermission";
import useMediaDevices from "./hooks/useMediaDevices";

function App() {
  const { cameras: cams, microphones: mics } = useMediaDevices();
  const [selectedCamId, setSelectedCamId] = useState<string>();
  const [selectedMicId, setSelectedMicId] = useState<string>();

  const recordedVideoRef = useRef<HTMLVideoElement>(null);

  useRequestPermission({ video: true, audio: true });

  const { videoStream } = useVideoStream(
    useMemo(() => (selectedCamId ? { deviceId: { exact: selectedCamId } } : false), [selectedCamId])
  );
  const { audioStream } = useAudioStream(
    useMemo(() => (selectedMicId ? { deviceId: { exact: selectedMicId } } : false), [selectedMicId])
  );
  const combinedStream = useCombinedStream(useMemo(() => [videoStream, audioStream], [videoStream, audioStream]));

  const replaceableStream = useReplaceableStream(combinedStream);

  const { state, start, pause, resume, stop, save, getVideoURL } = useMediaRecorder(
    replaceableStream,
    useMemo(() => ({ mimeType: "video/mp4;codecs=avc1.4D401E" }), [])
  );

  const show = () => {
    if (recordedVideoRef.current) {
      recordedVideoRef.current.src = getVideoURL();
    }
  };

  useEffect(() => {
    setSelectedCamId((prev) => {
      if (cams.some((cam) => cam.deviceId === prev)) {
        return prev;
      }
      return cams[0]?.deviceId || "";
    });
  }, [cams]);

  useEffect(() => {
    setSelectedMicId((prev) => {
      if (mics.some((mic) => mic.deviceId === prev)) {
        return prev;
      }
      return mics[0]?.deviceId || "";
    });
  }, [mics]);

  return (
    <>
      <div style={{ display: "flex", gap: "10px" }}>
        <div>
          <h2>Recorded Video</h2>
          <video ref={recordedVideoRef} autoPlay controls width={400} height={300} />
        </div>
      </div>

      <select value={selectedCamId} onChange={(e) => setSelectedCamId(e.target.value)}>
        {cams.map((cam) => (
          <option key={cam.deviceId} value={cam.deviceId}>
            {cam.label}
          </option>
        ))}
      </select>
      <select value={selectedMicId} onChange={(e) => setSelectedMicId(e.target.value)}>
        {mics.map((mic) => (
          <option key={mic.deviceId} value={mic.deviceId}>
            {mic.label}
          </option>
        ))}
      </select>

      <br />
      <br />

      {state === "inactive" && <button onClick={() => start(1000)}>Start</button>}
      {state === "recording" && <button onClick={pause}>Pause</button>}
      {state === "paused" && <button onClick={resume}>Resume</button>}
      {(state === "recording" || state === "paused") && <button onClick={stop}>Stop</button>}

      <br />

      <button onClick={show}>Show</button>
      <button onClick={() => save()}>Save</button>
    </>
  );
}

export default App;
