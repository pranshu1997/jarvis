"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

const FOCUS_KEY = "jarvis_focus_mode";

interface FocusModeContextValue {
  focusMode: boolean;
  toggleFocusMode: () => void;
  setFocusMode: (on: boolean) => void;
}

const FocusModeContext = createContext<FocusModeContextValue>({
  focusMode: false,
  toggleFocusMode: () => {},
  setFocusMode: () => {},
});

export function FocusModeProvider({ children }: { children: ReactNode }) {
  const [focusMode, setFocusModeState] = useState(false);

  useEffect(() => {
    setFocusModeState(localStorage.getItem(FOCUS_KEY) === "1");
  }, []);

  const setFocusMode = useCallback((on: boolean) => {
    localStorage.setItem(FOCUS_KEY, on ? "1" : "0");
    setFocusModeState(on);
  }, []);

  const toggleFocusMode = useCallback(() => {
    setFocusMode(!focusMode);
  }, [focusMode, setFocusMode]);

  return (
    <FocusModeContext.Provider value={{ focusMode, toggleFocusMode, setFocusMode }}>
      {children}
    </FocusModeContext.Provider>
  );
}

export function useFocusMode() {
  return useContext(FocusModeContext);
}
