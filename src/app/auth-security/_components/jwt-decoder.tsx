"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { KeyRound, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const SEGMENTS = [
  {
    id: "header",
    label: "Header",
    encoded: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
    decoded: JSON.stringify({ alg: "HS256", typ: "JWT" }, null, 2),
    description: "Specifies the signing algorithm and token type.",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-400",
    highlight: "bg-amber-500/20",
    ring: "ring-amber-500/40",
    dot: "bg-amber-500",
  },
  {
    id: "payload",
    label: "Payload",
    encoded: "eyJzdWIiOiJ1c2VyMTIzIiwiZXhwIjoxNzE2MjM5MDIyfQ",
    decoded: JSON.stringify({ sub: "user123", exp: 1716239022 }, null, 2),
    description: "Contains the claims — user identity, roles, and expiration.",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    text: "text-yellow-400",
    highlight: "bg-yellow-500/20",
    ring: "ring-yellow-500/40",
    dot: "bg-yellow-500",
  },
  {
    id: "signature",
    label: "Signature",
    encoded: "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
    decoded: "HMACSHA256(\n  base64UrlEncode(header) + \".\" +\n  base64UrlEncode(payload),\n  secret\n)",
    description: "Verifies the token has not been tampered with.",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    text: "text-orange-400",
    highlight: "bg-orange-500/20",
    ring: "ring-orange-500/40",
    dot: "bg-orange-500",
  },
];

export function JwtDecoder() {
  const [activeSegment, setActiveSegment] = useState<string | null>(null);

  const toggleSegment = (id: string) => {
    setActiveSegment((prev) => (prev === id ? null : id));
  };

  return (
    <div className="w-full rounded-xl border bg-card/50 p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-5">
        <KeyRound className="size-4 text-amber-500" />
        <h3 className="text-sm font-semibold">JWT Decoder</h3>
      </div>

      {/* Encoded JWT string */}
      <div className="rounded-lg border bg-muted/30 p-4 mb-5 overflow-x-auto">
        <p className="text-[10px] text-muted-foreground/60 mb-2 font-mono uppercase tracking-wider">
          Encoded Token
        </p>
        <div className="flex flex-wrap items-center gap-0 font-mono text-xs leading-relaxed">
          {SEGMENTS.map((seg, index) => (
            <span key={seg.id} className="flex items-center">
              <button
                onClick={() => toggleSegment(seg.id)}
                className={cn(
                  "rounded px-1 py-0.5 transition-all duration-200 cursor-pointer break-all text-left",
                  activeSegment === seg.id
                    ? cn(seg.highlight, seg.text, "ring-1", seg.ring)
                    : cn(seg.text, "hover:opacity-80")
                )}
              >
                {seg.encoded}
              </button>
              {index < SEGMENTS.length - 1 && (
                <span className="text-muted-foreground/40 mx-0.5 select-none">.</span>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Decoded segments */}
      <div className="space-y-2">
        {SEGMENTS.map((seg) => {
          const isActive = activeSegment === seg.id;

          return (
            <motion.div
              key={seg.id}
              layout
              className={cn(
                "rounded-lg border overflow-hidden transition-colors duration-200",
                isActive ? cn(seg.bg, seg.border) : "border-border/50 bg-muted/20"
              )}
            >
              <button
                onClick={() => toggleSegment(seg.id)}
                className="w-full flex items-center justify-between px-4 py-3 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className={cn("size-2 rounded-full", seg.dot)} />
                  <span
                    className={cn(
                      "text-sm font-semibold transition-colors duration-200",
                      isActive ? seg.text : "text-foreground"
                    )}
                  >
                    {seg.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground/60">
                    {seg.description}
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: isActive ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown
                    className={cn(
                      "size-4 transition-colors duration-200",
                      isActive ? seg.text : "text-muted-foreground"
                    )}
                  />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {isActive && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
                    className="overflow-hidden"
                  >
                    <div className={cn("px-4 pb-4 border-t", seg.border)}>
                      <pre
                        className={cn(
                          "mt-3 rounded-md p-3 text-xs font-mono whitespace-pre-wrap",
                          seg.bg
                        )}
                      >
                        <code className={seg.text}>{seg.decoded}</code>
                      </pre>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Hint */}
      {!activeSegment && (
        <p className="text-[10px] text-muted-foreground/50 mt-3 text-center">
          Click a colored segment above or a card to decode that part of the JWT
        </p>
      )}
    </div>
  );
}
