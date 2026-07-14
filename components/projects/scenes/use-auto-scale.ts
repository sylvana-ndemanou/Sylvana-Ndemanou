import { useLayoutEffect, useState, type RefObject } from "react";

/**
 * Measures a container and returns a scale factor so a fixed-size (design-px)
 * inner canvas fits its width. Lets each scene lay everything out in real
 * pixels (consistent sizes + generous spacing) and simply scale to fit.
 */
export function useAutoScale(
  ref: RefObject<HTMLElement | null>,
  designWidth: number
): number {
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = (): void => {
      const w = el.clientWidth;
      if (w) setScale(Math.min(1, w / designWidth));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, designWidth]);

  return scale;
}
