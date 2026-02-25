"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Eye, EyeOff, ShieldCheck, ShieldX, KeyRound, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type View = "structure" | "signing" | "tampering";

const HEADER_JSON = '{\n  "alg": "HS256",\n  "typ": "JWT"\n}';
const PAYLOAD_JSON = '{\n  "sub": "user123",\n  "name": "Alice",\n  "exp": 1716239022\n}';

const SEGMENTS = [
  {
    id: "header",
    label: "Header",
    encoded: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
    decoded: HEADER_JSON,
    purpose: "Tells the server which algorithm was used to sign the token",
    color: "#f59e0b",
    colorName: "amber",
  },
  {
    id: "payload",
    label: "Payload",
    encoded: "eyJzdWIiOiJ1c2VyMTIzIiwibmFtZSI6IkFsaWNlIiwiZXhwIjoxNzE2MjM5MDIyfQ",
    decoded: PAYLOAD_JSON,
    purpose: "Your data — user ID, name, roles, expiry. Anyone can read this!",
    color: "#eab308",
    colorName: "yellow",
  },
  {
    id: "signature",
    label: "Signature",
    encoded: "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
    decoded: "HMACSHA256(\n  base64(header) + \".\" + base64(payload),\n  SECRET_KEY\n)",
    purpose: "Proves the token hasn't been modified — only the server can create this",
    color: "#f97316",
    colorName: "orange",
  },
];

const MISCONCEPTIONS = [
  {
    myth: "JWT tokens are encrypted",
    reality: "JWTs are only signed, not encrypted. The payload is base64-encoded — anyone can decode and read it. Never put passwords or secrets in the payload.",
    icon: Eye,
    dangerous: true,
  },
  {
    myth: "You can revoke a JWT instantly",
    reality: "JWTs are stateless — there's no server-side session to delete. A token stays valid until it expires. Use short expiry times and refresh tokens as a workaround.",
    icon: AlertTriangle,
    dangerous: true,
  },
  {
    myth: "Longer secret keys are always better",
    reality: "Key length matters, but algorithm choice matters more. HS256 needs at least 256 bits (32 chars). Beyond that, switching to RS256 (asymmetric) is more impactful than a longer key.",
    icon: KeyRound,
    dangerous: false,
  },
  {
    myth: "JWTs replace sessions entirely",
    reality: "JWTs work great for API auth, but for traditional web apps with logout and 'remember me', server-side sessions can be simpler and more secure.",
    icon: ShieldCheck,
    dangerous: false,
  },
];

function SegmentPill({
  segment,
  isActive,
  onClick,
  showDecoded,
}: {
  segment: typeof SEGMENTS[0];
  isActive: boolean;
  onClick: () => void;
  showDecoded: boolean;
}) {
  return (
    <motion.button
      onClick={onClick}
      layout
      className={cn(
        "rounded-xl border-2 overflow-hidden transition-colors duration-300 cursor-pointer text-left w-full",
        isActive
          ? `border-${segment.colorName}-500/40 bg-${segment.colorName}-500/8`
          : "border-border/20 bg-muted/5 hover:bg-muted/15"
      )}
      style={isActive ? { borderColor: `${segment.color}40`, backgroundColor: `${segment.color}08` } : {}}
    >
      <div className="px-4 py-3 flex items-center gap-3">
        <div className="size-3 rounded-full shrink-0" style={{ backgroundColor: segment.color }} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={isActive ? { color: segment.color } : {}}>
            {segment.label}
          </p>
          <p className="text-[11px] text-muted-foreground/50 mt-0.5">{segment.purpose}</p>
        </div>
      </div>

      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 border-t" style={{ borderColor: `${segment.color}20` }}>
              <pre className="mt-3 rounded-lg p-3 text-xs font-mono whitespace-pre-wrap leading-relaxed"
                style={{ backgroundColor: `${segment.color}08` }}
              >
                <code style={{ color: segment.color }}>
                  {showDecoded ? segment.decoded : segment.encoded}
                </code>
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

export function JwtAnatomy() {
  const [activeId, setActiveId] = useState<string | null>("header");
  const [showDecoded, setShowDecoded] = useState(true);
  const [view, setView] = useState<View>("structure");
  const [tampered, setTampered] = useState(false);

  const toggle = useCallback((id: string) => {
    setActiveId((prev) => (prev === id ? null : id));
  }, []);

  return (
    <div className="w-full rounded-2xl border bg-card/30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b bg-muted/20">
        <div className="flex items-center gap-2.5">
          <div className="size-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-sm font-semibold tracking-wide">JWT Anatomy</span>
        </div>
      </div>

      {/* View tabs */}
      <div className="px-5 py-2.5 border-b border-border/20 bg-muted/5 flex items-center gap-0.5">
        {([
          { id: "structure" as View, label: "Structure" },
          { id: "signing" as View, label: "How Signing Works" },
          { id: "tampering" as View, label: "Tamper Detection" },
        ]).map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setView(tab.id); setTampered(false); }}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer relative",
              view === tab.id ? "text-foreground" : "text-muted-foreground/40 hover:text-muted-foreground/70"
            )}
          >
            {view === tab.id && (
              <motion.div
                layoutId="jwt-view"
                className="absolute inset-0 rounded-md bg-amber-500/10 border border-amber-500/20"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="px-5 py-6">
        <AnimatePresence mode="wait">
          {/* ===== STRUCTURE VIEW ===== */}
          {view === "structure" && (
            <motion.div
              key="structure"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {/* Encoded token bar */}
              <div className="rounded-xl border bg-muted/20 p-4 mb-5 overflow-x-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-muted-foreground/40 uppercase tracking-widest">
                    Encoded Token
                  </span>
                  <button
                    onClick={() => setShowDecoded((d) => !d)}
                    className="flex items-center gap-1.5 text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors cursor-pointer"
                  >
                    {showDecoded ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
                    {showDecoded ? "Decoded" : "Encoded"}
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-0 font-mono text-xs leading-relaxed">
                  {SEGMENTS.map((seg, i) => (
                    <span key={seg.id} className="flex items-center">
                      <button
                        onClick={() => toggle(seg.id)}
                        className={cn(
                          "rounded px-1 py-0.5 transition-all duration-200 cursor-pointer break-all text-left",
                          activeId === seg.id ? "ring-1" : "hover:opacity-70"
                        )}
                        style={{
                          color: seg.color,
                          ...(activeId === seg.id ? { backgroundColor: `${seg.color}15`, ringColor: `${seg.color}40` } : {}),
                        }}
                      >
                        {seg.encoded}
                      </button>
                      {i < SEGMENTS.length - 1 && (
                        <span className="text-muted-foreground/30 mx-0.5 select-none text-lg font-bold">.</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              {/* Segment cards */}
              <div className="space-y-2">
                {SEGMENTS.map((seg) => (
                  <SegmentPill
                    key={seg.id}
                    segment={seg}
                    isActive={activeId === seg.id}
                    onClick={() => toggle(seg.id)}
                    showDecoded={showDecoded}
                  />
                ))}
              </div>

              {!activeId && (
                <p className="text-[11px] text-muted-foreground/40 mt-4 text-center">
                  Click a segment to inspect its contents
                </p>
              )}
            </motion.div>
          )}

          {/* ===== SIGNING VIEW ===== */}
          {view === "signing" && (
            <motion.div
              key="signing"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <p className="text-sm text-muted-foreground/70">
                The signature is created by hashing the header and payload together with a secret key. Only someone with the secret can create a valid signature.
              </p>

              {/* Visual formula */}
              <div className="rounded-xl border bg-muted/10 p-5 space-y-4">
                {/* Inputs */}
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-lg px-3 py-2 text-xs font-mono border"
                    style={{ backgroundColor: "#f59e0b08", borderColor: "#f59e0b30", color: "#f59e0b" }}
                  >
                    base64(header)
                  </motion.div>
                  <span className="text-muted-foreground/30 text-lg font-bold">+</span>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-muted-foreground/30 text-lg font-bold font-mono"
                  >
                    &quot;.&quot;
                  </motion.div>
                  <span className="text-muted-foreground/30 text-lg font-bold">+</span>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-lg px-3 py-2 text-xs font-mono border"
                    style={{ backgroundColor: "#eab30808", borderColor: "#eab30830", color: "#eab308" }}
                  >
                    base64(payload)
                  </motion.div>
                </div>

                {/* Arrow down */}
                <div className="flex justify-center">
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                    className="w-px h-8 bg-gradient-to-b from-amber-500/40 to-orange-500/40"
                  />
                </div>

                {/* HMAC function */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="rounded-xl border-2 border-dashed border-orange-500/25 bg-orange-500/5 p-4 text-center"
                >
                  <p className="text-xs font-mono font-semibold text-orange-400 mb-1">HMACSHA256( )</p>
                  <p className="text-[11px] text-muted-foreground/50">
                    Hashes everything above with your <span className="text-red-400 font-semibold">SECRET_KEY</span>
                  </p>
                </motion.div>

                {/* Arrow down */}
                <div className="flex justify-center">
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: 0.6, duration: 0.3 }}
                    className="w-px h-8 bg-gradient-to-b from-orange-500/40 to-emerald-500/40"
                  />
                </div>

                {/* Result */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7, type: "spring", stiffness: 300 }}
                  className="rounded-xl border-2 border-emerald-500/25 bg-emerald-500/5 p-4 text-center"
                >
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <ShieldCheck className="size-4 text-emerald-400" />
                    <p className="text-xs font-semibold text-emerald-400">Valid Signature</p>
                  </div>
                  <p className="text-[11px] font-mono text-emerald-400/60 break-all">
                    SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
                  </p>
                </motion.div>
              </div>

              <div className="rounded-lg bg-red-500/5 border border-red-500/15 px-4 py-3 flex items-start gap-3">
                <AlertTriangle className="size-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground/70 leading-relaxed">
                  <span className="text-red-400 font-semibold">The SECRET_KEY never leaves the server.</span> If someone gets your secret key, they can forge tokens for any user. Store it in environment variables, never in code.
                </p>
              </div>
            </motion.div>
          )}

          {/* ===== TAMPERING VIEW ===== */}
          {view === "tampering" && (
            <motion.div
              key="tampering"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <p className="text-sm text-muted-foreground/70">
                What happens if someone modifies the payload? The signature won&apos;t match anymore, and the server will reject the token.
              </p>

              {/* Interactive tamper demo */}
              <div className="rounded-xl border bg-muted/10 p-5">
                {/* Original payload */}
                <div className="mb-4">
                  <span className="text-[11px] font-mono text-muted-foreground/40 uppercase tracking-widest">Original Payload</span>
                  <div className="mt-2 rounded-lg p-3 text-xs font-mono border"
                    style={{ backgroundColor: "#eab30808", borderColor: "#eab30830", color: "#eab308" }}
                  >
                    {`{"sub": "user123", "role": "user"}`}
                  </div>
                </div>

                {/* Tamper button */}
                <div className="flex justify-center mb-4">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setTampered(!tampered)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer",
                      tampered
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/15"
                        : "bg-red-500/10 text-red-400 border-red-500/25 hover:bg-red-500/15"
                    )}
                  >
                    {tampered ? "Undo Tampering" : 'Change role to "admin"'}
                  </motion.button>
                </div>

                {/* Tampered payload */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={tampered ? "tampered" : "original"}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                  >
                    {tampered && (
                      <div className="mb-4">
                        <span className="text-[11px] font-mono text-red-400/60 uppercase tracking-widest">Tampered Payload</span>
                        <div className="mt-2 rounded-lg p-3 text-xs font-mono border bg-red-500/8 border-red-500/25">
                          <span className="text-yellow-400">{`{"sub": "user123", "role": "`}</span>
                          <span className="text-red-400 font-bold underline decoration-wavy">admin</span>
                          <span className="text-yellow-400">{`"}`}</span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Signature check result */}
                <motion.div
                  layout
                  className={cn(
                    "rounded-xl border-2 p-4 flex items-center gap-3 transition-colors duration-300",
                    tampered
                      ? "border-red-500/30 bg-red-500/5"
                      : "border-emerald-500/25 bg-emerald-500/5"
                  )}
                >
                  <motion.div
                    key={tampered ? "bad" : "good"}
                    initial={{ scale: 0, rotate: -15 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  >
                    {tampered ? (
                      <ShieldX className="size-8 text-red-400" />
                    ) : (
                      <ShieldCheck className="size-8 text-emerald-400" />
                    )}
                  </motion.div>
                  <div>
                    <p className={cn(
                      "text-sm font-semibold",
                      tampered ? "text-red-400" : "text-emerald-400"
                    )}>
                      {tampered ? "Signature Invalid!" : "Signature Valid"}
                    </p>
                    <p className="text-[11px] text-muted-foreground/50 mt-0.5 leading-relaxed">
                      {tampered
                        ? "The payload was modified but the signature was created from the original data. The server recalculates HMAC and gets a different result → token rejected."
                        : "The signature matches the header + payload. The token has not been tampered with."
                      }
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Misconceptions section */}
      <div className="px-5 py-5 border-t bg-muted/10">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="size-3.5 text-amber-400" />
          <span className="text-xs font-semibold text-muted-foreground/70">Common JWT Misconceptions</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {MISCONCEPTIONS.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={cn(
                "rounded-xl border p-3.5 space-y-2",
                m.dangerous ? "border-red-500/15 bg-red-500/3" : "border-border/20 bg-muted/5"
              )}
            >
              <div className="flex items-start gap-2">
                <m.icon className={cn(
                  "size-3.5 shrink-0 mt-0.5",
                  m.dangerous ? "text-red-400" : "text-amber-400"
                )} />
                <div>
                  <p className="text-xs font-semibold line-through decoration-red-400/50 text-muted-foreground/60">
                    {m.myth}
                  </p>
                  <p className="text-[11px] text-muted-foreground/50 mt-1 leading-relaxed">
                    {m.reality}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
