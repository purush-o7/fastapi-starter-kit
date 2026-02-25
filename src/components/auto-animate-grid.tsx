"use client";

import { useRef, useEffect } from "react";
import autoAnimate from "@formkit/auto-animate";

export function AutoAnimateGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  const parent = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (parent.current) {
      autoAnimate(parent.current, { duration: 400, easing: "ease-out" });
    }
  }, []);
  return <div ref={parent} className={className}>{children}</div>;
}
