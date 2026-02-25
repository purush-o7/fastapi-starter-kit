"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const METHOD_PILLS = {
  users: [
    { method: "GET", color: "bg-emerald-500" },
    { method: "POST", color: "bg-blue-500" },
    { method: "DELETE", color: "bg-red-500" },
  ],
  items: [
    { method: "GET", color: "bg-emerald-500" },
    { method: "POST", color: "bg-blue-500" },
    { method: "PUT", color: "bg-amber-500" },
  ],
  auth: [
    { method: "POST", color: "bg-blue-500" },
    { method: "GET", color: "bg-emerald-500" },
  ],
};

const ROUTERS = [
  { name: "users", prefix: "/users", pills: METHOD_PILLS.users },
  { name: "items", prefix: "/items", pills: METHOD_PILLS.items },
  { name: "auth", prefix: "/auth", pills: METHOD_PILLS.auth },
];

const DEPENDENCIES = [
  "get_db()",
  "get_current_user()",
  "verify_token()",
];

export function ArchitectureHeroViz() {
  return (
    <div className="w-full rounded-xl border bg-card/50 p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="size-2 rounded-full bg-purple-500" />
        <h3 className="text-sm font-semibold">Building Blocks of a FastAPI App</h3>
      </div>

      {/* Middleware outer border */}
      <motion.div
        className="relative rounded-xl border-2 border-dashed border-purple-500/30 p-4 sm:p-5"
        initial={{ opacity: 0, borderColor: "rgba(168,85,247,0)" }}
        whileInView={{ opacity: 1, borderColor: "rgba(168,85,247,0.3)" }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Middleware label */}
        <motion.div
          className="absolute -top-3 left-4 px-2 bg-card text-[10px] sm:text-xs font-mono text-purple-400 font-medium"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Middleware Stack
        </motion.div>

        {/* FastAPI App block */}
        <motion.div
          className="w-full rounded-lg bg-gradient-to-r from-purple-500/15 to-violet-500/15 border border-purple-500/30 px-4 py-3 mb-4"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
        >
          <div className="flex items-center gap-2">
            <div className="size-2.5 rounded-sm bg-purple-500" />
            <span className="text-sm font-semibold text-purple-400">
              FastAPI App
            </span>
            <span className="text-[10px] font-mono text-muted-foreground ml-auto">
              app = FastAPI()
            </span>
          </div>
        </motion.div>

        {/* Middle section: Routers + Dependencies */}
        <div className="flex gap-3 sm:gap-4">
          {/* Router blocks */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
            {ROUTERS.map((router, index) => (
              <motion.div
                key={router.name}
                className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-3"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.5,
                  delay: 0.6 + index * 0.15,
                  ease: "easeOut",
                }}
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="size-1.5 rounded-full bg-violet-400" />
                  <span className="text-xs font-semibold text-violet-400">
                    APIRouter
                  </span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground block mb-2">
                  {router.prefix}
                </span>
                {/* Method pills */}
                <div className="flex flex-wrap gap-1">
                  {router.pills.map((pill, pillIndex) => (
                    <motion.span
                      key={`${router.name}-${pill.method}-${pillIndex}`}
                      className={cn(
                        "text-[9px] font-bold text-white px-1.5 py-0.5 rounded",
                        pill.color
                      )}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 15,
                        delay: 1.0 + index * 0.15 + pillIndex * 0.08,
                      }}
                    >
                      {pill.method}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Dependencies block */}
          <motion.div
            className="hidden sm:flex flex-col w-36 shrink-0 rounded-lg border border-purple-500/20 bg-purple-500/5 p-3"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 1.1, ease: "easeOut" }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <div className="size-1.5 rounded-full bg-purple-400" />
              <span className="text-xs font-semibold text-purple-400">
                Dependencies
              </span>
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              {DEPENDENCIES.map((dep, i) => (
                <motion.div
                  key={dep}
                  className="text-[10px] font-mono text-muted-foreground bg-muted/40 rounded px-2 py-1 border border-border/50"
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 1.2 + i * 0.1 }}
                >
                  {dep}
                </motion.div>
              ))}
            </div>
            {/* Visual connector lines */}
            <div className="mt-2 flex items-center gap-1">
              <div className="h-px flex-1 bg-purple-500/20" />
              <span className="text-[8px] text-purple-400/60 font-mono">
                Depends()
              </span>
              <div className="h-px flex-1 bg-purple-500/20" />
            </div>
          </motion.div>
        </div>

        {/* Mobile dependencies (shown below routers on small screens) */}
        <motion.div
          className="sm:hidden mt-3 rounded-lg border border-purple-500/20 bg-purple-500/5 p-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 1.1 }}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <div className="size-1.5 rounded-full bg-purple-400" />
            <span className="text-xs font-semibold text-purple-400">
              Dependencies
            </span>
            <span className="text-[8px] text-purple-400/60 font-mono ml-auto">
              Depends()
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {DEPENDENCIES.map((dep, i) => (
              <motion.div
                key={dep}
                className="text-[10px] font-mono text-muted-foreground bg-muted/40 rounded px-2 py-1 border border-border/50"
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 1.2 + i * 0.1 }}
              >
                {dep}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom include hint */}
        <motion.div
          className="mt-3 flex items-center justify-center gap-2 text-[10px] text-muted-foreground/60"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          <span className="font-mono">
            app.include_router(users) | app.include_router(items) | app.include_router(auth)
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}
