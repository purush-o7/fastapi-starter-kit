"use client";

import { useState, useEffect } from "react";
import { Check, Copy, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";

type HighlighterInstance = {
  codeToHtml: (code: string, options: { lang: string; theme: string }) => string;
};

let highlighterPromise: Promise<HighlighterInstance> | null = null;

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = import("shiki").then((shiki) =>
      shiki.createHighlighter({
        themes: ["vitesse-dark"],
        langs: [
          "python",
          "javascript",
          "typescript",
          "jsx",
          "tsx",
          "css",
          "html",
          "json",
          "bash",
          "shell",
        ],
      })
    );
  }
  return highlighterPromise;
}

function detectLang(filename?: string): string {
  if (!filename) return "python";
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    py: "python",
    js: "javascript",
    jsx: "jsx",
    ts: "typescript",
    tsx: "tsx",
    css: "css",
    html: "html",
    json: "json",
    sh: "bash",
    bash: "bash",
  };
  return map[ext] ?? "python";
}

export function CodeBlock({
  code,
  filename,
}: {
  code: string;
  filename?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getHighlighter().then((highlighter) => {
      if (cancelled) return;
      const lang = detectLang(filename);
      const result = highlighter.codeToHtml(code.trim(), {
        lang,
        theme: "vitesse-dark",
      });
      setHtml(result);
    });
    return () => {
      cancelled = true;
    };
  }, [code, filename]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    trackEvent("code_copied", { filename: filename || "unnamed" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group/code relative rounded-xl border border-border/40 overflow-hidden my-4 bg-[#1c1e26] shadow-sm">
      {filename && (
        <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.03] px-4 py-2">
          <div className="flex items-center gap-2">
            <FileCode className="size-3.5 text-zinc-500" />
            <span className="text-xs text-zinc-400 font-mono">{filename}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-zinc-500 hover:text-zinc-300 opacity-0 group-hover/code:opacity-100 transition-opacity"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="size-3.5 text-emerald-400" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </Button>
        </div>
      )}
      {!filename && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 size-7 text-zinc-500 hover:text-zinc-300 opacity-0 group-hover/code:opacity-100 transition-opacity z-10"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="size-3.5 text-emerald-400" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </Button>
      )}
      {html ? (
        <div
          className="overflow-x-auto p-4 text-[13px] leading-relaxed [&_pre]:!bg-transparent [&_pre]:!m-0 [&_pre]:!p-0 [&_code]:!bg-transparent"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed font-mono text-zinc-300">
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}
