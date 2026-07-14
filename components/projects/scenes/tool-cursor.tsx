import type { ReactNode } from "react";

/**
 * A small labelled cursor (pointer + name pill) used to "drive" the animated
 * tool scenes — inspired by the React Bits "User Cursor" effect. Purely visual;
 * the parent scene positions and animates the wrapper.
 */
export function ToolCursor({
  name = "Sylvana",
  color = "#c8a86a",
}: {
  name?: string;
  color?: string;
}): ReactNode {
  return (
    <div style={{ position: "relative", width: 0, height: 0 }}>
      <svg
        width="22"
        height="24"
        viewBox="0 0 22 24"
        fill="none"
        style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.35))" }}
        aria-hidden="true"
      >
        <path
          d="M3 2.2 L3 19.5 L7.7 15.2 L10.9 21.6 L13.7 20.4 L10.6 14.2 L16.8 14.1 Z"
          fill={color}
          stroke="#ffffff"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
      </svg>
      <span
        style={{
          position: "absolute",
          left: 15,
          top: 17,
          whiteSpace: "nowrap",
          borderRadius: 6,
          padding: "2px 7px",
          fontSize: 11,
          fontWeight: 600,
          lineHeight: 1.3,
          color: "#1a1a1a",
          background: color,
          boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
        }}
      >
        {name}
      </span>
    </div>
  );
}
