import { useEffect } from "react";

interface Options {
  enabled: boolean;
  panelOpen: boolean;
  onReveal: () => void;
  onKnow: () => void;
  onDontKnow: () => void;
}

export function useFlashcardHotkeys({ enabled, panelOpen, onReveal, onKnow, onDontKnow }: Options) {
  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }

      switch (e.key) {
        case "ArrowUp":
        case "ArrowDown":
          e.preventDefault();
          onReveal();
          break;
        case "ArrowRight":
          if (panelOpen) {
            e.preventDefault();
            onKnow();
          }
          break;
        case "ArrowLeft":
          if (panelOpen) {
            e.preventDefault();
            onDontKnow();
          }
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, panelOpen, onReveal, onKnow, onDontKnow]);
}
