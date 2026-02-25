"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface TocItem {
  id: string;
  text: string;
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const pathname = usePathname();
  const scrollContainerRef = useRef<Element | null>(null);

  const scanHeadings = useCallback(() => {
    const container = document.querySelector(
      "[data-slot='sidebar-inset'] .overflow-y-auto"
    );
    scrollContainerRef.current = container;

    const root = container || document;
    const elements = root.querySelectorAll("h2");
    const items: TocItem[] = [];

    elements.forEach((el, i) => {
      if (!el.id) {
        el.id = `section-${i}`;
      }
      items.push({
        id: el.id,
        text: el.textContent || "",
      });
    });

    setHeadings(items);
    setActiveId("");
  }, []);

  useEffect(() => {
    const timeout = setTimeout(scanHeadings, 100);
    return () => clearTimeout(timeout);
  }, [pathname, scanHeadings]);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible?.target.id) {
          setActiveId(visible.target.id);
        }
      },
      {
        root: scrollContainerRef.current,
        rootMargin: "-80px 0px -70% 0px",
        threshold: 0,
      }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 3) return null;

  return (
    <aside className="hidden xl:flex w-56 shrink-0 flex-col border-l">
      <nav className="flex-1 overflow-y-auto py-6 px-4">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 mb-2 font-medium">
            On this page
          </p>
          {headings.map((heading) => (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(heading.id);
                if (el && scrollContainerRef.current) {
                  const container = scrollContainerRef.current;
                  const elTop = el.getBoundingClientRect().top;
                  const containerTop =
                    container.getBoundingClientRect().top;
                  container.scrollBy({
                    top: elTop - containerTop - 80,
                    behavior: "smooth",
                  });
                }
              }}
              className={cn(
                "block text-xs py-1 pl-3 border-l-2 transition-all duration-200 truncate",
                activeId === heading.id
                  ? "border-foreground text-foreground font-medium"
                  : "border-transparent text-muted-foreground/60 hover:text-muted-foreground hover:border-muted-foreground/30"
              )}
            >
              {heading.text}
            </a>
          ))}
        </div>
      </nav>
    </aside>
  );
}
