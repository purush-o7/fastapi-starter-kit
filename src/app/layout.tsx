import type { Metadata } from "next";
import { Instrument_Serif, DM_Sans, JetBrains_Mono } from "next/font/google";
import Providers from "./providers";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { TopicNav } from "@/components/topic-nav";
import { TableOfContents } from "@/components/table-of-contents";
import { Github } from "lucide-react";
import { PageTransition } from "@/components/page-transition";
import { KeyboardProvider } from "@/components/keyboard-provider";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://fastapi101.vercel.app"),
  title: {
    default: "What is FastAPI — Interactive Guide",
    template: "%s | What is FastAPI",
  },
  description:
    "Interactive learning guide for FastAPI core concepts — routing, Pydantic models, dependency injection, async, database integration, and more with Python examples.",
  keywords: [
    "FastAPI",
    "Python",
    "API",
    "REST API",
    "Pydantic",
    "async",
    "ASGI",
    "web framework",
    "tutorial",
    "interactive guide",
  ],
  authors: [{ name: "Purushottam Reddy" }],
  creator: "Purushottam Reddy",
  openGraph: {
    type: "website",
    siteName: "What is FastAPI",
    locale: "en_US",
    title: "What is FastAPI — Interactive Guide",
    description:
      "Learn FastAPI through failure-first, interactive examples. Routing, validation, auth, databases, and more.",
  },
  twitter: {
    card: "summary_large_image",
    title: "What is FastAPI — Interactive Guide",
    description:
      "Learn FastAPI through failure-first, interactive examples. Routing, validation, auth, databases, and more.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${instrumentSerif.variable} ${dmSans.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <Providers>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="max-h-svh overflow-hidden">
              <KeyboardProvider>
                <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur-sm px-4">
                  <SidebarTrigger className="-ml-1" />
                  <Separator orientation="vertical" className="mr-2 !h-4" />
                  <BreadcrumbNav />
                  <div className="ml-auto flex items-center gap-1">
                    <a
                      href="https://github.com/purush-o7/what-is-fastapi"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground h-7 w-7"
                    >
                      <Github className="size-4" />
                      <span className="sr-only">GitHub</span>
                    </a>
                    <ThemeToggle />
                  </div>
                </header>
                <div className="flex flex-1 min-h-0 overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-6 lg:p-10 min-w-0">
                    <PageTransition>
                      {children}
                    </PageTransition>
                    <TopicNav />
                  </div>
                  <TableOfContents />
                </div>
              </KeyboardProvider>
            </SidebarInset>
          </SidebarProvider>
        </Providers>
      </body>
    </html>
  );
}
