import type { ReactNode } from "react";

/**
 * Vector paths of the Sylvana Ndemanou monogram (from public/logo_source.svg).
 * Shared by the static <Logo> and the animated <AnimatedLogo> (line-draw).
 */
export const LOGO_PATHS: readonly string[] = [
  "M25.5693 1.50034H150.966",
  "M40.7239 74.7467H115.308",
  "M1.50024 149.194H128.68",
  "M77.8675 1.50034L40.7239 74.7467",
  "M77.8677 1.50034L115.308 74.7467",
  "M9.20312 11.7304L40.2031 74.1637",
  "M150.966 1.50034L115.308 74.7467",
  "M56.2031 45.303L77.8676 74.7466",
  "M100.203 45.303L77.8677 74.7466",
  "M77.8677 74.7467V149.194",
  "M40.7239 74.7467L77.8675 149.194",
  "M115.308 74.7467L77.8677 149.194",
  "M40.7239 74.7467L1.50024 149.194",
  "M115.203 74.1637L146.703 135.419",
  "M25.7031 1.71747C25.7031 1.71747 18.3295 2.20079 11.2031 9.2126C4.07674 16.2244 2.20313 26.5803 2.20312 36.4965C2.20313 46.4127 6.20668 55.9228 13.3331 62.9346C20.4594 69.9464 31.1249 74.7527 41.2031 74.7527",
  "M114.703 74.7527C124.869 74.7527 136.116 77.0254 143.305 84.2876C150.494 91.5499 154.532 101.4 154.532 111.67C154.532 121.94 150.703 131.296 144.203 139.542C137.703 147.788 128.203 148.966 128.203 148.966",
];

/**
 * Sylvana Ndemanou monogram (line-art mark). Uses currentColor so it inherits
 * the surrounding text color and adapts to light/dark themes.
 */
export function Logo({
  className,
  title = "Sylvana Ndemanou",
}: {
  className?: string;
  title?: string;
}): ReactNode {
  return (
    <svg
      viewBox="0 0 157 151"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={className}
      stroke="currentColor"
      strokeWidth={4}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {LOGO_PATHS.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
