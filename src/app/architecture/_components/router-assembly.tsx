"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FolderTree, RotateCcw, Server, Box } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Data ─── */
interface RouteEntry {
  method: string;
  path: string;
  handler: string;
}

interface RouterConfig {
  name: string;
  file: string;
  prefix: string;
  tags: string[];
  deps?: string;
  color: string;        // tailwind color name
  borderClass: string;
  bgClass: string;
  textClass: string;
  prefixClass: string;  // for highlighting prefix in resolved URL
  methodColors: Record<string, string>;
  routes: RouteEntry[];
}

interface Scenario {
  id: string;
  label: string;
  routers: RouterConfig[];
  detail: string;
}

const METHOD_STYLES: Record<string, string> = {
  GET: "text-emerald-400 bg-emerald-500/10",
  POST: "text-blue-400 bg-blue-500/10",
  PUT: "text-amber-400 bg-amber-500/10",
  DELETE: "text-red-400 bg-red-500/10",
};

const SCENARIOS: Scenario[] = [
  {
    id: "simple",
    label: "Simple",
    routers: [
      {
        name: "items",
        file: "routers/items.py",
        prefix: "/items",
        tags: ["items"],
        color: "purple",
        borderClass: "border-purple-500/25",
        bgClass: "bg-purple-500/5",
        textClass: "text-purple-400",
        prefixClass: "text-purple-400",
        methodColors: {},
        routes: [
          { method: "GET", path: "/", handler: "list_items" },
          { method: "GET", path: "/{item_id}", handler: "get_item" },
          { method: "POST", path: "/", handler: "create_item" },
        ],
      },
    ],
    detail: "One router mounted with prefix — all its routes are namespaced under /items",
  },
  {
    id: "multi",
    label: "Multi-Router",
    routers: [
      {
        name: "items",
        file: "routers/items.py",
        prefix: "/items",
        tags: ["items"],
        color: "purple",
        borderClass: "border-purple-500/25",
        bgClass: "bg-purple-500/5",
        textClass: "text-purple-400",
        prefixClass: "text-purple-400",
        methodColors: {},
        routes: [
          { method: "GET", path: "/", handler: "list_items" },
          { method: "GET", path: "/{item_id}", handler: "get_item" },
          { method: "POST", path: "/", handler: "create_item" },
        ],
      },
      {
        name: "users",
        file: "routers/users.py",
        prefix: "/users",
        tags: ["users"],
        color: "blue",
        borderClass: "border-blue-500/25",
        bgClass: "bg-blue-500/5",
        textClass: "text-blue-400",
        prefixClass: "text-blue-400",
        methodColors: {},
        routes: [
          { method: "GET", path: "/", handler: "list_users" },
          { method: "GET", path: "/{user_id}", handler: "get_user" },
        ],
      },
    ],
    detail: "Two routers with different prefixes — endpoints are isolated by module",
  },
  {
    id: "deps",
    label: "With Dependencies",
    routers: [
      {
        name: "items",
        file: "routers/items.py",
        prefix: "/items",
        tags: ["items"],
        color: "purple",
        borderClass: "border-purple-500/25",
        bgClass: "bg-purple-500/5",
        textClass: "text-purple-400",
        prefixClass: "text-purple-400",
        methodColors: {},
        routes: [
          { method: "GET", path: "/", handler: "list_items" },
          { method: "POST", path: "/", handler: "create_item" },
        ],
      },
      {
        name: "admin",
        file: "routers/admin.py",
        prefix: "/admin",
        tags: ["admin"],
        deps: "Depends(verify_admin)",
        color: "amber",
        borderClass: "border-amber-500/25",
        bgClass: "bg-amber-500/5",
        textClass: "text-amber-400",
        prefixClass: "text-amber-400",
        methodColors: {},
        routes: [
          { method: "GET", path: "/stats", handler: "admin_stats" },
          { method: "DELETE", path: "/users/{id}", handler: "delete_user" },
        ],
      },
    ],
    detail: "Admin router has shared dependencies — verify_admin runs on every admin route automatically",
  },
];

/* ─── Component ─── */
export function RouterAssembly() {
  const [selectedId, setSelectedId] = useState("simple");
  const [mountedCount, setMountedCount] = useState(0);
  const [revealedRoutes, setRevealedRoutes] = useState<number[]>([]);
  const [showApp, setShowApp] = useState(false);
  const [done, setDone] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const sc = SCENARIOS.find((s) => s.id === selectedId)!;

  const clear = useCallback(() => { timersRef.current.forEach(clearTimeout); timersRef.current = []; }, []);
  const t = useCallback((fn: () => void, ms: number) => { timersRef.current.push(setTimeout(fn, ms)); }, []);

  const run = useCallback((s: Scenario) => {
    clear();
    setShowApp(false);
    setMountedCount(0);
    setRevealedRoutes(s.routers.map(() => 0));
    setDone(false);

    let delay = 300;

    // Show app
    t(() => setShowApp(true), delay);
    delay += 500;

    // Mount each router, then reveal its routes one by one
    s.routers.forEach((router, ri) => {
      t(() => setMountedCount(ri + 1), delay);
      delay += 450;

      router.routes.forEach((_, routeIdx) => {
        const idx = routeIdx;
        t(() => {
          setRevealedRoutes((prev) => {
            const next = [...prev];
            next[ri] = idx + 1;
            return next;
          });
        }, delay);
        delay += 280;
      });

      delay += 300;
    });

    // Done
    t(() => setDone(true), delay);
  }, [clear, t]);

  useEffect(() => { run(sc); return clear; }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalRoutes = sc.routers.reduce((sum, r) => sum + r.routes.length, 0);

  return (
    <div className="w-full rounded-2xl border bg-card/30 overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b bg-muted/20">
        <div className="flex items-center gap-2.5">
          <motion.div
            className="size-2 rounded-full"
            animate={{
              backgroundColor: done ? "rgb(16,185,129)" : showApp ? "rgb(168,85,247)" : "rgba(168,85,247,0.4)",
              scale: !done && showApp ? [1, 1.4, 1] : 1,
            }}
            transition={{ scale: { repeat: Infinity, duration: 0.8 } }}
          />
          <span className="text-xs font-semibold tracking-wide">Router Assembly</span>
        </div>
        <button onClick={() => run(sc)} className="text-muted-foreground/40 hover:text-foreground transition-colors p-1 cursor-pointer">
          <RotateCcw className="size-3.5" />
        </button>
      </div>

      {/* ── Scenario Tabs ── */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex gap-1">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedId(s.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer relative",
                selectedId === s.id ? "text-foreground" : "text-muted-foreground/50 hover:text-muted-foreground"
              )}
            >
              {selectedId === s.id && (
                <motion.div
                  layoutId="router-tab"
                  className="absolute inset-0 rounded-lg bg-purple-500/10 border border-purple-500/20"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Visualization ── */}
      <div className="relative px-4 sm:px-5 py-5">
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* App node */}
        <AnimatePresence>
          {showApp && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="relative"
            >
              {/* App header bar */}
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border bg-card border-border/50 mb-1">
                <div className="size-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <Server className="size-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-[11px] sm:text-xs font-semibold">app = FastAPI()</p>
                  <p className="text-[9px] font-mono text-muted-foreground/40">main.py</p>
                </div>
              </div>

              {/* Router cards */}
              <div className="ml-4 sm:ml-6 border-l border-border/30 pl-4 sm:pl-5 mt-2 space-y-3">
                {sc.routers.map((router, ri) => {
                  const isMounted = ri < mountedCount;
                  const revealed = revealedRoutes[ri] || 0;

                  return (
                    <AnimatePresence key={router.name}>
                      {isMounted && (
                        <motion.div
                          initial={{ opacity: 0, x: -12, scale: 0.97 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                          {/* include_router line */}
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-[10px] font-mono text-muted-foreground/40 mb-1.5"
                          >
                            app.include_router(<span className={router.textClass}>{router.name}</span>.router)
                          </motion.p>

                          {/* Router card */}
                          <div className={cn(
                            "rounded-xl border overflow-hidden bg-card",
                            router.borderClass
                          )}>
                            {/* Router header */}
                            <div className={cn("flex items-center gap-2.5 px-3.5 py-2.5 border-b", router.borderClass)}>
                              <div className={cn("size-7 rounded-lg flex items-center justify-center border", router.bgClass, router.borderClass)}>
                                <Box className={cn("size-3.5", router.textClass)} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={cn("text-[11px] font-semibold", router.textClass)}>
                                    {router.name}.router
                                  </span>
                                  <span className="text-[9px] font-mono text-muted-foreground/35">
                                    prefix=&quot;{router.prefix}&quot;
                                  </span>
                                  {router.deps && (
                                    <span className="text-[9px] font-mono text-amber-400/50 hidden sm:inline">
                                      {router.deps}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[9px] font-mono text-muted-foreground/30 mt-0.5">
                                  {router.file}
                                </p>
                              </div>
                              {/* Tag badges */}
                              <div className="flex gap-1">
                                {router.tags.map((tag) => (
                                  <span key={tag} className={cn(
                                    "text-[8px] font-mono px-1.5 py-0.5 rounded border",
                                    router.bgClass, router.borderClass, router.textClass
                                  )}>
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Route list */}
                            <div className="px-3.5 py-2 space-y-[3px]">
                              {router.routes.map((route, routeIdx) => {
                                if (routeIdx >= revealed) return null;
                                const resolvedPath = router.prefix + route.path;
                                const methodStyle = METHOD_STYLES[route.method] || "text-muted-foreground";

                                return (
                                  <motion.div
                                    key={route.handler}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex items-center gap-2 py-[3px] group"
                                  >
                                    <span className={cn(
                                      "text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded tracking-wider shrink-0",
                                      methodStyle
                                    )}>
                                      {route.method}
                                    </span>
                                    <span className="text-[10px] sm:text-[11px] font-mono text-muted-foreground/60">
                                      <span className={cn("font-semibold", router.prefixClass)}>{router.prefix}</span>
                                      <span className="text-foreground/70">{route.path}</span>
                                    </span>
                                    <span className="flex-1 mx-1 border-b border-dotted border-border/20 min-w-[8px] hidden sm:block" />
                                    <span className="text-[9px] font-mono text-muted-foreground/25 hidden sm:block shrink-0">
                                      {route.handler}()
                                    </span>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Result Footer ── */}
      <AnimatePresence mode="wait">
        {done && (
          <motion.div
            key={selectedId + "-result"}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 py-3.5 border-t bg-emerald-500/5 border-emerald-500/15 flex items-center gap-3">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="size-8 rounded-xl flex items-center justify-center text-[10px] font-bold font-mono shrink-0 bg-emerald-500/15 text-emerald-400"
              >
                {totalRoutes}
              </motion.div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-emerald-400">
                  {totalRoutes} routes registered across {sc.routers.length} router{sc.routers.length > 1 ? "s" : ""}
                </p>
                <p className="text-[9px] font-mono text-muted-foreground/50 mt-0.5">
                  {sc.routers.map((r) => `${r.prefix}/* → ${r.name}.router`).join("  ·  ")}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Description ── */}
      <div className="px-5 py-2.5 border-t bg-muted/8">
        <AnimatePresence mode="wait">
          <motion.p
            key={selectedId}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.2 }}
            className="text-[10px] text-muted-foreground/50"
          >
            {sc.detail}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
