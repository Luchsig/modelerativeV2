import { useEffect } from "react";

export function useKeyPress(targetKey: string, handler: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === targetKey) handler();
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [targetKey, handler]);
}
