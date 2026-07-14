import { useSyncExternalStore } from "react";

function subscribe(cb: () => void): () => void {
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => obs.disconnect();
}
function snapshot(): boolean {
  return document.documentElement.classList.contains("dark");
}

/** Tracks the site's dark mode (the `.dark` class on <html>) so scenes can
 * render a coherent dark variant. */
export function useIsDark(): boolean {
  return useSyncExternalStore(subscribe, snapshot, () => false);
}
