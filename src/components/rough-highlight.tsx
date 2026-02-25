"use client";

import { useEffect, useRef, useState } from "react";
import { RoughNotation, type RoughNotationProps } from "react-rough-notation";

type HighlightType = RoughNotationProps["type"];

interface RoughHighlightProps {
  children: React.ReactNode;
  type?: HighlightType;
  color?: string;
  strokeWidth?: number;
  padding?: number | [number, number] | [number, number, number, number];
  animationDuration?: number;
  className?: string;
}

export function RoughHighlight({
  children,
  type = "highlight",
  color = "rgba(168, 85, 247, 0.2)",
  strokeWidth = 2,
  padding = 2,
  animationDuration = 800,
  className,
}: RoughHighlightProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5, rootMargin: "-20px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <span ref={ref} className={className}>
      <RoughNotation
        type={type}
        show={show}
        color={color}
        strokeWidth={strokeWidth}
        padding={padding}
        animationDuration={animationDuration}
        multiline
      >
        {children}
      </RoughNotation>
    </span>
  );
}
