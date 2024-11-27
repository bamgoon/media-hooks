import { useEffect, useRef, useState } from "react";

function usePermissionChangeListener(handlePermissionChange?: () => void) {
  const [permissionStatus, setPermissionStatus] = useState<{
    camPermission: PermissionState | null;
    micPermission: PermissionState | null;
  }>({
    camPermission: null,
    micPermission: null,
  });

  const cameraStatus = useRef<PermissionStatus>();
  const microphoneStatus = useRef<PermissionStatus>();

  useEffect(() => {
    async function checkPermissions() {
      try {
        const camera = await navigator.permissions.query({ name: "camera" as PermissionName });
        const microphone = await navigator.permissions.query({ name: "microphone" as PermissionName });

        cameraStatus.current = camera;
        microphoneStatus.current = microphone;

        setPermissionStatus({
          camPermission: cameraStatus.current.state,
          micPermission: microphoneStatus.current.state,
        });

        cameraStatus.current.onchange = () => {
          setPermissionStatus((prevStatus) => ({
            ...prevStatus,
            camPermission: camera.state,
          }));
          if (typeof handlePermissionChange === "function") {
            handlePermissionChange();
          }
        };

        microphoneStatus.current.onchange = () => {
          setPermissionStatus((prevStatus) => ({
            ...prevStatus,
            micPermission: microphone.state,
          }));
          if (typeof handlePermissionChange === "function") {
            handlePermissionChange();
          }
        };
      } catch (error) {
        console.error("Permission check failed", error);
      }
    }

    checkPermissions();

    return () => {
      if (cameraStatus.current) {
        cameraStatus.current.onchange = null;
      }
      if (microphoneStatus.current) {
        microphoneStatus.current.onchange = null;
      }
    };
  }, [handlePermissionChange]);

  return permissionStatus;
}

export default usePermissionChangeListener;
