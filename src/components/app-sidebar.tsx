"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Zap,
  ChevronRight,
  Route,
  Braces,
  GitFork,
  AlertTriangle,
  Shield,
  Timer,
  Database,
  Signpost,
  Variable,
  HelpCircle,
  FileInput,
  FileCheck,
  FileOutput,
  FolderTree,
  Syringe,
  Layers,
  Ban,
  Settings,
  KeyRound,
  Key,
  Bolt,
  ListTodo,
  HardDrive,
  Upload,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { SiteCredits } from "@/components/site-credits";

type TopicItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

type Category = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  topics: TopicItem[];
};

const basicsCategories: Category[] = [
  {
    label: "Routing",
    href: "/routing",
    icon: Route,
    topics: [
      { href: "/routing/path-operations", label: "Path Operations", icon: Signpost },
      { href: "/routing/path-parameters", label: "Path Parameters", icon: Variable },
      { href: "/routing/query-parameters", label: "Query Parameters", icon: HelpCircle },
    ],
  },
  {
    label: "Data Handling",
    href: "/data-handling",
    icon: Braces,
    topics: [
      { href: "/data-handling/request-body", label: "Request Body", icon: FileInput },
      { href: "/data-handling/pydantic-models", label: "Pydantic Models", icon: FileCheck },
      { href: "/data-handling/response-model", label: "Response Model", icon: FileOutput },
    ],
  },
];

const coreCategories: Category[] = [
  {
    label: "Architecture",
    href: "/architecture",
    icon: GitFork,
    topics: [
      { href: "/architecture/api-router", label: "APIRouter", icon: FolderTree },
      { href: "/architecture/dependency-injection", label: "Dependency Injection", icon: Syringe },
      { href: "/architecture/middleware", label: "Middleware", icon: Layers },
    ],
  },
  {
    label: "Error Handling",
    href: "/error-handling",
    icon: AlertTriangle,
    topics: [
      { href: "/error-handling/http-exceptions", label: "HTTP Exceptions", icon: Ban },
      { href: "/error-handling/custom-handlers", label: "Custom Handlers", icon: Settings },
    ],
  },
];

const advancedCategories: Category[] = [
  {
    label: "Auth & Security",
    href: "/auth-security",
    icon: Shield,
    topics: [
      { href: "/auth-security/oauth2-jwt", label: "OAuth2 & JWT", icon: KeyRound },
      { href: "/auth-security/api-keys", label: "API Keys", icon: Key },
    ],
  },
  {
    label: "Background & Async",
    href: "/background-async",
    icon: Timer,
    topics: [
      { href: "/background-async/async-endpoints", label: "Async Endpoints", icon: Bolt },
      { href: "/background-async/background-tasks", label: "Background Tasks", icon: ListTodo },
    ],
  },
  {
    label: "Database & Files",
    href: "/database-files",
    icon: Database,
    topics: [
      { href: "/database-files/database-integration", label: "Database Integration", icon: HardDrive },
      { href: "/database-files/file-uploads", label: "File Uploads", icon: Upload },
    ],
  },
];

function CategoryItem({
  category,
  pathname,
}: {
  category: Category;
  pathname: string;
}) {
  const isActive =
    pathname === category.href ||
    category.topics.some((t) => pathname === t.href);

  return (
    <Collapsible asChild defaultOpen={isActive}>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname === category.href} tooltip={category.label} className="group/btn">
          <Link href={category.href}>
            <category.icon className="transition-transform duration-200 group-hover/btn:scale-110" />
            <span>{category.label}</span>
          </Link>
        </SidebarMenuButton>
        <CollapsibleTrigger asChild>
          <SidebarMenuAction className="data-[state=open]:rotate-90 transition-transform duration-200">
            <ChevronRight />
          </SidebarMenuAction>
        </CollapsibleTrigger>
        <CollapsibleContent className="transition-all duration-200 ease-in-out data-[state=closed]:opacity-0 data-[state=open]:opacity-100">
          <SidebarMenuSub>
            {category.topics.map((topic) => (
              <SidebarMenuSubItem key={topic.href}>
                <SidebarMenuSubButton
                  asChild
                  isActive={pathname === topic.href}
                  className="transition-all duration-150 hover:translate-x-0.5"
                >
                  <Link href={topic.href}>
                    <span className="font-mono text-xs">{topic.label}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2">
          <Zap className="size-5" />
          <div>
            <p className="text-sm font-semibold leading-none">What is FastAPI</p>
            <p className="text-xs text-muted-foreground">
              Interactive Guide
            </p>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Basics</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {basicsCategories.map((category) => (
                <CategoryItem
                  key={category.href}
                  category={category}
                  pathname={pathname}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Core Patterns</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {coreCategories.map((category) => (
                <CategoryItem
                  key={category.href}
                  category={category}
                  pathname={pathname}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Advanced</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {advancedCategories.map((category) => (
                <CategoryItem
                  key={category.href}
                  category={category}
                  pathname={pathname}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <SiteCredits />
      </SidebarFooter>
    </Sidebar>
  );
}
