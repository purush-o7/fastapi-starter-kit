"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { motion } from "motion/react";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DiagramNode {
  id: string;
  label: string;
  sublabel?: string;
  icon?: LucideIcon;
  color: string;
  row: number;
  col: number;
  colSpan?: number;
  primary?: boolean;
}

export interface DiagramEdge {
  from: string;
  to: string;
  label?: string;
  animated?: boolean;
  dashed?: boolean;
}

interface ConceptDiagramProps {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  accentColor?: string;
  className?: string;
  columns?: number;
  rowHeight?: number;
}

function getNodeCenter(
  nodeId: string,
  nodeRects: Map<string, DOMRect>,
  containerRect: DOMRect | null
): { x: number; y: number } | null {
  const rect = nodeRects.get(nodeId);
  if (!rect || !containerRect) return null;
  return {
    x: rect.left - containerRect.left + rect.width / 2,
    y: rect.top - containerRect.top + rect.height / 2,
  };
}

export function ConceptDiagram({
  nodes,
  edges,
  accentColor = "purple",
  className,
  columns = 3,
  rowHeight = 80,
}: ConceptDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [edgePaths, setEdgePaths] = useState<
    { id: string; d: string; dashed: boolean; animated: boolean }[]
  >([]);

  const maxRow = useMemo(
    () => Math.max(...nodes.map((n) => n.row)) + 1,
    [nodes]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const recalc = () => {
      const containerRect = container.getBoundingClientRect();
      const nodeRects = new Map<string, DOMRect>();

      nodeRefs.current.forEach((el, id) => {
        if (el) nodeRects.set(id, el.getBoundingClientRect());
      });

      const paths = edges.map((edge) => {
        const from = getNodeCenter(edge.from, nodeRects, containerRect);
        const to = getNodeCenter(edge.to, nodeRects, containerRect);

        if (!from || !to) {
          return { id: `${edge.from}-${edge.to}`, d: "", dashed: !!edge.dashed, animated: !!edge.animated };
        }

        const midY = (from.y + to.y) / 2;
        const d = `M ${from.x} ${from.y} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y}`;

        return {
          id: `${edge.from}-${edge.to}`,
          d,
          dashed: !!edge.dashed,
          animated: !!edge.animated,
        };
      });

      setEdgePaths(paths);
    };

    // Small delay to let DOM settle
    const timer = setTimeout(recalc, 100);
    window.addEventListener("resize", recalc);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", recalc);
    };
  }, [edges, nodes]);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* SVG edges layer */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        {edgePaths.map((edge) =>
          edge.d ? (
            <g key={edge.id}>
              <motion.path
                d={edge.d}
                fill="none"
                className={cn(
                  "stroke-border",
                  edge.dashed ? "stroke-dasharray-[4,4]" : ""
                )}
                strokeWidth={1.5}
                strokeDasharray={edge.dashed ? "6 4" : undefined}
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              />
              {edge.animated && (
                <motion.circle
                  r={3}
                  className={`fill-${accentColor}-500`}
                  initial={{ offsetDistance: "0%" }}
                  animate={{ offsetDistance: "100%" }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  style={{
                    offsetPath: `path('${edge.d}')`,
                  }}
                />
              )}
            </g>
          ) : null
        )}
      </svg>

      {/* Nodes grid */}
      <div
        className="relative z-10 grid gap-3"
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gridTemplateRows: `repeat(${maxRow}, minmax(${rowHeight}px, auto))`,
        }}
      >
        {nodes.map((node, index) => {
          const NodeIcon = node.icon;
          return (
            <motion.div
              key={node.id}
              ref={(el) => {
                if (el) nodeRefs.current.set(node.id, el);
              }}
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.4,
                delay: index * 0.1,
                ease: [0.21, 0.47, 0.32, 0.98],
              }}
              className={cn(
                "rounded-lg border p-3 flex items-center gap-2.5",
                `border-${node.color}/30 bg-${node.color}/5`,
                node.primary && `border-${node.color}/50 shadow-sm`
              )}
              style={{
                gridColumn: `${node.col + 1} / span ${node.colSpan || 1}`,
                gridRow: node.row + 1,
              }}
            >
              {NodeIcon && (
                <div
                  className={cn(
                    "size-8 rounded-md flex items-center justify-center shrink-0",
                    `bg-${node.color}/10`
                  )}
                >
                  <NodeIcon className={cn("size-4", `text-${node.color}`)} />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{node.label}</p>
                {node.sublabel && (
                  <p className="text-xs text-muted-foreground truncate">
                    {node.sublabel}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
