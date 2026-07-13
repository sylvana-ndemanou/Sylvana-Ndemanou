"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

// App Router re-mounts template.tsx on every navigation, so this gives each
// page a subtle, smooth entrance transition.
export default function Template({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
