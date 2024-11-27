import { useEffect } from "react";

function useDeviceChangeListener(handleDevicesChange: () => void) {
  useEffect(() => {
    navigator.mediaDevices.addEventListener("devicechange", handleDevicesChange);

    return () => navigator.mediaDevices.removeEventListener("devicechange", handleDevicesChange);
  }, [handleDevicesChange]);
}

export default useDeviceChangeListener;
