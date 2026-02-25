"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Folder, FolderOpen, FileCode, FileText, FileKey, ChevronRight, File } from "lucide-react";
import { cn } from "@/lib/utils";
import autoAnimate from "@formkit/auto-animate";

interface FileNode {
  name: string;
  type: "file" | "folder";
  category?: string;
  description: string;
  children?: FileNode[];
}

const CATEGORY_COLORS: Record<string, { text: string; bg: string; border: string; label: string }> = {
  entry: { text: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", label: "Entry" },
  router: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", label: "Router" },
  schema: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "Schema" },
  model: { text: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", label: "Model" },
  config: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "Config" },
  env: { text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", label: "Secret" },
};

const FILE_TREE: FileNode = {
  name: "my_api", type: "folder", category: "entry", description: "Project root — contains all application code",
  children: [
    { name: "main.py", type: "file", category: "entry", description: "App entry point — creates FastAPI() and includes all routers" },
    { name: "database.py", type: "file", category: "model", description: "Engine, SessionLocal, Base, and get_db() dependency" },
    { name: "config.py", type: "file", category: "config", description: "Pydantic Settings class — loads .env automatically" },
    { name: ".env", type: "file", category: "env", description: "Secrets and config values — gitignored, never committed" },
    { name: "requirements.txt", type: "file", category: "config", description: "Pinned package versions for reproducible installs" },
    {
      name: "routers", type: "folder", category: "router", description: "Endpoint definitions grouped by domain",
      children: [
        { name: "__init__.py", type: "file", description: "Makes this a Python package" },
        { name: "users.py", type: "file", category: "router", description: "All /users endpoints — APIRouter with CRUD operations" },
        { name: "items.py", type: "file", category: "router", description: "All /items endpoints — APIRouter with CRUD operations" },
      ],
    },
    {
      name: "schemas", type: "folder", category: "schema", description: "Pydantic models for request/response validation",
      children: [
        { name: "__init__.py", type: "file", description: "Makes this a Python package" },
        { name: "user.py", type: "file", category: "schema", description: "UserCreate, UserOut, UserUpdate — Pydantic schemas" },
        { name: "item.py", type: "file", category: "schema", description: "ItemCreate, ItemOut — Pydantic schemas" },
      ],
    },
    {
      name: "models", type: "folder", category: "model", description: "SQLAlchemy ORM models — one class per database table",
      children: [
        { name: "__init__.py", type: "file", description: "Makes this a Python package" },
        { name: "user.py", type: "file", category: "model", description: "User table — id, name, email, is_active columns" },
        { name: "item.py", type: "file", category: "model", description: "Item table — id, title, price, owner_id columns" },
      ],
    },
    { name: "crud.py", type: "file", category: "config", description: "CRUD helper functions — create, read, update, delete" },
  ],
};

function getFileIcon(node: FileNode) {
  if (node.type === "folder") return null;
  if (node.name === ".env") return FileKey;
  if (node.name.endsWith(".txt")) return FileText;
  if (node.name.endsWith(".py")) return FileCode;
  return File;
}

function TreeNode({
  node,
  path,
  depth,
  expanded,
  selected,
  onToggle,
  onSelect,
}: {
  node: FileNode;
  path: string;
  depth: number;
  expanded: Set<string>;
  selected: string | null;
  onToggle: (path: string) => void;
  onSelect: (path: string, node: FileNode) => void;
}) {
  const childRef = useRef<HTMLDivElement>(null);
  const isExpanded = expanded.has(path);
  const isSelected = selected === path;
  const catColor = node.category ? CATEGORY_COLORS[node.category] : null;
  const Icon = node.type === "folder" ? (isExpanded ? FolderOpen : Folder) : getFileIcon(node);

  useEffect(() => {
    if (childRef.current) autoAnimate(childRef.current, { duration: 200 });
  }, []);

  return (
    <div>
      <button
        onClick={() => {
          if (node.type === "folder") onToggle(path);
          onSelect(path, node);
        }}
        className={cn(
          "w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-left transition-colors cursor-pointer group",
          isSelected ? "bg-rose-500/10 border border-rose-500/20" : "hover:bg-muted/30 border border-transparent",
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {node.type === "folder" && (
          <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.15 }}>
            <ChevronRight className="size-3 text-muted-foreground/40" />
          </motion.div>
        )}
        {node.type === "file" && <div className="w-3" />}
        {Icon && <Icon className={cn("size-3.5 shrink-0", catColor?.text || "text-muted-foreground/40")} />}
        <span className={cn("text-xs font-mono", isSelected ? "text-foreground font-medium" : "text-foreground/60")}>
          {node.name}
        </span>
        {catColor && (
          <span className={cn("text-[8px] font-mono ml-auto opacity-0 group-hover:opacity-100 transition-opacity rounded px-1.5 py-0.5", catColor.bg, catColor.text)}>
            {catColor.label}
          </span>
        )}
      </button>
      {node.type === "folder" && (
        <div ref={childRef}>
          {isExpanded && node.children?.map((child) => (
            <TreeNode
              key={child.name}
              node={child}
              path={`${path}/${child.name}`}
              depth={depth + 1}
              expanded={expanded}
              selected={selected}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ProjectExplorerViz() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["my_api"]));
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<FileNode | null>(null);

  const toggleFolder = (path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path); else next.add(path);
      return next;
    });
  };

  const selectNode = (path: string, node: FileNode) => {
    setSelected(path);
    setSelectedNode(node);
  };

  return (
    <div className="w-full rounded-2xl border border-border/50 bg-gradient-to-b from-card/80 to-card/40 overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg width="100%" height="100%" className="opacity-[0.03]">
          <defs><pattern id="proj-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.7" fill="currentColor" /></pattern></defs>
          <rect width="100%" height="100%" fill="url(#proj-dots)" />
        </svg>
      </div>

      <div className="relative">
        <div className="px-5 sm:px-6 pt-5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <FolderOpen className="size-4 text-rose-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Project Explorer</h3>
              <p className="text-[10px] text-muted-foreground/50 font-mono">click files to see what belongs inside</p>
            </div>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />

        <div className="px-5 sm:px-6 py-4">
          <div className="rounded-xl border border-border/30 bg-muted/10 p-2 max-h-[320px] overflow-y-auto">
            <TreeNode
              node={FILE_TREE}
              path="my_api"
              depth={0}
              expanded={expanded}
              selected={selected}
              onToggle={toggleFolder}
              onSelect={selectNode}
            />
          </div>

          {/* Description panel */}
          <AnimatePresence mode="wait">
            {selectedNode && (
              <motion.div
                key={selected}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="mt-3 rounded-xl border border-border/30 bg-muted/10 p-4 flex items-start gap-3"
              >
                {selectedNode.category && CATEGORY_COLORS[selectedNode.category] && (
                  <span className={cn("text-[9px] font-mono rounded px-2 py-1 shrink-0 mt-0.5",
                    CATEGORY_COLORS[selectedNode.category].bg,
                    CATEGORY_COLORS[selectedNode.category].text,
                    CATEGORY_COLORS[selectedNode.category].border,
                    "border"
                  )}>
                    {CATEGORY_COLORS[selectedNode.category].label}
                  </span>
                )}
                <div>
                  <span className="text-xs font-mono font-semibold text-foreground/70 block">{selectedNode.name}</span>
                  <span className="text-xs text-muted-foreground/60 mt-0.5 block">{selectedNode.description}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="px-5 sm:px-6 py-3 border-t border-border/20 bg-muted/5 flex items-center gap-3 flex-wrap">
          {Object.entries(CATEGORY_COLORS).slice(0, 5).map(([key, color]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className={cn("size-1.5 rounded-full", color.bg.replace("/10", ""))} />
              <span className="text-[9px] text-muted-foreground/40 font-mono">{color.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
