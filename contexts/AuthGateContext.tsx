import React, { createContext, useContext, useState, useCallback, useRef, useEffect, useMemo, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { AuthGateModal, type GateContext } from "@/components/AuthGateModal";
import { track } from "@/lib/analytics";

type AuthGateContextValue = {
  /** If user is guest and attempts a commit action, show gate. Otherwise run the action. After signup, action is re-run. */
  requireAuth: (context: GateContext, action: () => void) => void;
  showGate: (context: GateContext) => void;
};

const AuthGateContext = createContext<AuthGateContextValue | undefined>(undefined);

export function useAuthGate() {
  const ctx = useContext(AuthGateContext);
  if (ctx === undefined) {
    throw new Error("useAuthGate must be used within AuthGateProvider");
  }
  return ctx;
}

/** Returns true if user is signed in (not guest). */
export function useIsGuest(): boolean {
  const { user } = useAuth();
  return !user;
}

export function AuthGateProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [gateVisible, setGateVisible] = useState(false);
  const [gateContext, setGateContext] = useState<GateContext>("join");
  const pendingActionRef = useRef<(() => void) | null>(null);

  const showGate = useCallback((context: GateContext) => {
    track({ name: "gate_modal_shown", context });
    setGateContext(context);
    setGateVisible(true);
  }, []);

  const requireAuth = useCallback(
    (context: GateContext, action: () => void) => {
      if (user) {
        action();
      } else {
        pendingActionRef.current = action;
        showGate(context);
      }
    },
    [user, showGate]
  );

  useEffect(() => {
    if (user && pendingActionRef.current) {
      const fn = pendingActionRef.current;
      pendingActionRef.current = null;
      setGateVisible(false);
      fn();
    }
  }, [user]);

  const closeGate = useCallback(() => {
    pendingActionRef.current = null;
    setGateVisible(false);
  }, []);

  const contextValue = useMemo(
    () => ({ requireAuth, showGate }),
    [requireAuth, showGate]
  );

  return (
    <>
      <AuthGateContext.Provider value={contextValue}>
        {children}
      </AuthGateContext.Provider>
      <AuthGateModal
        visible={gateVisible}
        onClose={closeGate}
        context={gateContext}
      />
    </>
  );
}
