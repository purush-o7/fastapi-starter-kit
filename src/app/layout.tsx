import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
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

const outfit = Outfit({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "What is FastAPI — Interactive Guide",
    template: "%s | What is FastAPI",
  },
  description:
    "Interactive learning guide for FastAPI core concepts with Python examples",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${jetbrainsMono.variable} antialiased`}
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
