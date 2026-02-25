import type { Metadata } from "next";
export const metadata: Metadata = { title: "Dependency Injection", description: "Share logic across endpoints using FastAPI's Depends() system." };
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
