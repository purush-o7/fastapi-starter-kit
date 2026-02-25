import type { Metadata } from "next";
export const metadata: Metadata = { title: "Background Tasks", description: "Run tasks after returning a response in FastAPI — emails, cleanup, notifications." };
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
