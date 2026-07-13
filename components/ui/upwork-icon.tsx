import type { ReactNode } from "react";

/**
 * Minimal monochrome "Upwork" mark ("up" in a rounded square) matching the
 * outline style / API of the lucide icons used elsewhere.
 */
export function UpworkIcon({
  className,
  strokeWidth = 2,
}: {
  className?: string;
  strokeWidth?: number;
}): ReactNode {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
      <path d="M7.5 9v3.2a2.3 2.3 0 0 0 4.4 1l.5-1.4" />
      <path d="M11.7 11.2a2.4 2.4 0 1 0 4.8 0 2.4 2.4 0 0 0-4.8 0Z" />
      <path d="M7.5 15.5V9" />
    </svg>
  );
}
