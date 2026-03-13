import { useEffect, useState, useRef } from "react";
import { Platform } from "react-native";

/**
 * Returns true when the app is online, false when offline.
 * On web uses navigator.onLine; on native uses @react-native-community/netinfo when available.
 */
export function useNetworkStatus(): boolean {
  const [isConnected, setIsConnected] = useState(true);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (typeof navigator !== "undefined" && "onLine" in navigator) {
      setIsConnected(navigator.onLine);
      const onOnline = () => setIsConnected(true);
      const onOffline = () => setIsConnected(false);
      window.addEventListener("online", onOnline);
      window.addEventListener("offline", onOffline);
      return () => {
        window.removeEventListener("online", onOnline);
        window.removeEventListener("offline", onOffline);
      };
    }
    if (Platform.OS !== "web") {
      import("@react-native-community/netinfo")
        .then((NetInfo) => {
          const unsub = NetInfo.default.addEventListener((state: { isConnected?: boolean | null }) => {
            setIsConnected(state.isConnected ?? true);
          });
          unsubscribeRef.current = unsub;
        })
        .catch(() => {});
      return () => {
        unsubscribeRef.current?.();
        unsubscribeRef.current = null;
      };
    }
    return undefined;
  }, []);

  return isConnected;
}
