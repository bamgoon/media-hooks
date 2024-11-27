import { useEffect, useRef, useState } from "react";

function useReplaceableStream(inputStream: MediaStream | null, options = { video: true, audio: true }) {
  const videoSenderRef = useRef<RTCRtpSender | null>(null);
  const audioSenderRef = useRef<RTCRtpSender | null>(null);
  const [replaceableStream, setReplaceableStream] = useState<MediaStream | null>(null);

  const hiddenVideoRef = useRef<HTMLVideoElement | null>(null);

  // options은 반응형 값으로 설정되어서는 안 됨.
  const { video, audio } = options;

  useEffect(() => {
    const senderPC = new RTCPeerConnection();
    const receiverPC = new RTCPeerConnection();

    senderPC.onnegotiationneeded = async () => {
      const offer = await senderPC.createOffer();
      await senderPC.setLocalDescription(offer);
      await receiverPC.setRemoteDescription(offer);

      const answer = await receiverPC.createAnswer();
      await receiverPC.setLocalDescription(answer);
      await senderPC.setRemoteDescription(answer);
    };

    senderPC.onicecandidate = ({ candidate }) => {
      if (candidate) receiverPC.addIceCandidate(candidate);
    };

    receiverPC.onicecandidate = ({ candidate }) => {
      if (candidate) senderPC.addIceCandidate(candidate);
    };

    receiverPC.ontrack = (event) => {
      setReplaceableStream((prevStream) => {
        let newStream;
        if (prevStream) {
          newStream = new MediaStream([...prevStream.getTracks().map((track) => track.clone()), event.track]);
        } else {
          newStream = new MediaStream([event.track]);
        }
        return newStream;
      });
    };

    if (video) videoSenderRef.current = senderPC.addTransceiver("video", { direction: "sendonly" }).sender;
    if (audio) audioSenderRef.current = senderPC.addTransceiver("audio", { direction: "sendonly" }).sender;

    return () => {
      senderPC.close();
      receiverPC.close();
      videoSenderRef.current = null;
      audioSenderRef.current = null;
    };
  }, [video, audio]);

  useEffect(() => {
    const replaceTracks = async () => {
      if (!inputStream) return;

      if (videoSenderRef.current) {
        const videoTrack = inputStream.getVideoTracks()[0];
        if (videoTrack) videoTrack.contentHint = "detail";
        videoSenderRef.current.replaceTrack(videoTrack);
      }

      if (audioSenderRef.current) {
        const audioTrack = inputStream.getAudioTracks()[0];
        if (audioTrack) audioTrack.contentHint = "speech";
        audioSenderRef.current.replaceTrack(audioTrack);
      }
    };

    replaceTracks();
  }, [inputStream]);

  useEffect(() => {
    // replaceableStream을 소비(consume)하도록 숨겨진 비디오 요소에 연결
    if (replaceableStream) {
      hiddenVideoRef.current = document.createElement("video");
      hiddenVideoRef.current.srcObject = replaceableStream;
    }

    return () => {
      if (hiddenVideoRef.current) {
        hiddenVideoRef.current.srcObject = null;
        hiddenVideoRef.current = null;
      }
      replaceableStream?.getTracks().forEach((track) => {
        track.stop();
        replaceableStream?.removeTrack(track);
      });
    };
  }, [replaceableStream]);

  return replaceableStream;
}

export default useReplaceableStream;
