import { useEffect } from "react";

export function useHotkeys(keys: string, callback: () => void) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? event.metaKey : event.ctrlKey;
      
      const parts = keys.toLowerCase().split('+');
      const key = parts[parts.length - 1];
      const needsModifier = parts.includes('mod') || parts.includes('ctrl') || parts.includes('cmd');

      if (
        event.key.toLowerCase() === key &&
        (needsModifier ? modifier : true)
      ) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [keys, callback]);
}
