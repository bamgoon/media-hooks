import { useSyncExternalStore } from "react";

const mediaDevicesStore = (() => {
  const subscribers = new Set<() => void>();
  let snapshot = {
    devices: [] as MediaDeviceInfo[],
    cameras: [] as MediaDeviceInfo[],
    microphones: [] as MediaDeviceInfo[],
    speakers: [] as MediaDeviceInfo[],
  };

  const updateDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter((device) => device.kind === "videoinput");
      const microphones = devices.filter((device) => device.kind === "audioinput");
      const speakers = devices.filter((device) => device.kind === "audiooutput");

      snapshot = {
        devices,
        cameras,
        microphones,
        speakers,
      };
    } catch (error) {
      console.error("Failed to enumerate devices:", error);
      snapshot = {
        devices: [],
        cameras: [],
        microphones: [],
        speakers: [],
      };
    }

    // callback을 호출함으로써 모든 구독자에게 알림(useSyncExternalStore에게 상태 변경 알림)
    subscribers.forEach((callback) => callback());
  };

  const init = () => {
    // 장치 변경 이벤트 리스너 등록
    navigator.mediaDevices.addEventListener("devicechange", updateDevices);

    // 권한 변경 이벤트 리스너 등록
    if (navigator.permissions) {
      ["camera", "microphone"].forEach((name) => {
        navigator.permissions
          .query({ name: name as PermissionName })
          .then((status) => {
            status.onchange = updateDevices;
          })
          .catch((error) => {
            console.warn(`Permission '${name}' not supported:`, error);
          });
      });
    }

    updateDevices();
  };

  init();

  return {
    subscribe: (callback: () => void) => {
      subscribers.add(callback);
      return () => subscribers.delete(callback);
    },
    getSnapshot: () => snapshot,
  };
})();

function useMediaDevices() {
  return useSyncExternalStore(mediaDevicesStore.subscribe, mediaDevicesStore.getSnapshot);
}

export default useMediaDevices;
