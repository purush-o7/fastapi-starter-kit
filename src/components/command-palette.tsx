"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  Globe,
  Terminal,
  FileKey,
  FolderTree,
  FileText,
  Route,
  Signpost,
  Variable,
  FileInput,
  Braces,
  FileCheck,
  Cookie,
  GitFork,
  Syringe,
  Layers,
  Ban,
  Settings,
  AlertTriangle,
  HelpCircle,
  Shield,
  KeyRound,
  Key,
  Gauge,
  Zap,
  ListTodo,
  Radio,
  Timer,
  Database,
  HardDrive,
  Upload,
  BookOpen,
  Cpu,
  RefreshCw,
  ArrowLeftRight,
  Server,
  TestTube,
} from "lucide-react";

const SECTIONS = [
  {
    label: "Fundamentals",
    items: [
      { href: "/fundamentals/what-is-an-api", label: "What is an API?", icon: Globe },
      { href: "/fundamentals/python-setup", label: "Python Setup", icon: Terminal },
      { href: "/fundamentals/environment-variables", label: "Environment Variables", icon: FileKey },
      { href: "/fundamentals/project-structure", label: "Project Structure", icon: FolderTree },
      { href: "/fundamentals/auto-generated-docs", label: "Auto-Generated Docs", icon: FileText },
    ],
  },
  {
    label: "Routing",
    items: [
      { href: "/routing/path-operations", label: "Path Operations", icon: Route },
      { href: "/routing/path-parameters", label: "Path Parameters", icon: Signpost },
      { href: "/routing/query-parameters", label: "Query Parameters", icon: Variable },
    ],
  },
  {
    label: "Data Handling",
    items: [
      { href: "/data-handling/request-body", label: "Request Body", icon: FileInput },
      { href: "/data-handling/pydantic-models", label: "Pydantic Models", icon: Braces },
      { href: "/data-handling/response-model", label: "Response Model", icon: FileCheck },
      { href: "/data-handling/headers-cookies", label: "Headers & Cookies", icon: Cookie },
    ],
  },
  {
    label: "Architecture",
    items: [
      { href: "/architecture/api-router", label: "APIRouter", icon: GitFork },
      { href: "/architecture/dependency-injection", label: "Dependency Injection", icon: Syringe },
      { href: "/architecture/middleware", label: "Middleware", icon: Layers },
      { href: "/architecture/cors", label: "CORS", icon: Ban },
      { href: "/architecture/lifespan", label: "Lifespan Events", icon: Settings },
    ],
  },
  {
    label: "Error Handling",
    items: [
      { href: "/error-handling/http-exceptions", label: "HTTP Exceptions", icon: AlertTriangle },
      { href: "/error-handling/custom-handlers", label: "Custom Handlers", icon: HelpCircle },
    ],
  },
  {
    label: "Auth & Security",
    items: [
      { href: "/auth-security/oauth2-jwt", label: "OAuth2 & JWT", icon: Shield },
      { href: "/auth-security/api-keys", label: "API Keys", icon: Key },
      { href: "/auth-security/rate-limiting", label: "Rate Limiting", icon: Gauge },
    ],
  },
  {
    label: "Background & Async",
    items: [
      { href: "/background-async/async-endpoints", label: "Async Endpoints", icon: Zap },
      { href: "/background-async/background-tasks", label: "Background Tasks", icon: ListTodo },
      { href: "/background-async/websockets", label: "WebSockets", icon: Radio },
    ],
  },
  {
    label: "Database",
    items: [
      { href: "/database/sqlalchemy-models", label: "SQLAlchemy Models", icon: Database },
      { href: "/database/sessions", label: "Database Sessions", icon: HardDrive },
      { href: "/database/alembic-migrations", label: "Alembic Migrations", icon: Upload },
      { href: "/database/crud-operations", label: "CRUD Operations", icon: BookOpen },
    ],
  },
  {
    label: "Under the Hood",
    items: [
      { href: "/under-the-hood/event-loop", label: "The Event Loop", icon: RefreshCw },
      { href: "/under-the-hood/asgi-vs-wsgi", label: "ASGI vs WSGI", icon: ArrowLeftRight },
      { href: "/under-the-hood/uvicorn-gunicorn", label: "Uvicorn & Gunicorn", icon: Server },
    ],
  },
  {
    label: "Testing",
    items: [
      { href: "/testing/pytest", label: "Testing with pytest", icon: TestTube },
    ],
  },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden sm:inline-flex items-center gap-2 rounded-md border border-border/50 bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
      >
        <span>Search topics...</span>
        <kbd className="pointer-events-none inline-flex h-5 items-center gap-0.5 rounded border border-border/50 bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground/70">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search Topics"
        description="Search across all FastAPI topics"
        showCloseButton={false}
      >
        <CommandInput placeholder="Search topics..." />
        <CommandList>
          <CommandEmpty>No topics found.</CommandEmpty>
          {SECTIONS.map((section) => (
            <CommandGroup key={section.label} heading={section.label}>
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem
                    key={item.href}
                    value={`${item.label} ${section.label}`}
                    onSelect={() => handleSelect(item.href)}
                  >
                    <Icon className="size-4 text-muted-foreground" />
                    <span>{item.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
