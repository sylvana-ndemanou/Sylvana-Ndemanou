import type { ReactNode } from "react";

/**
 * Minimal monochrome "Notion" mark (an N in a rounded square) that matches the
 * outline style / API of the lucide icons used elsewhere.
 */
export function NotionIcon({
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
      <rect x="3.5" y="3.5" width="17" height="17" rx="3.5" />
      <path d="M9 16V8l6 8V8" />
    </svg>
  );
}
