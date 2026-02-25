import type { Metadata } from "next";
export const metadata: Metadata = { title: "Middleware", description: "Process requests and responses globally before they reach your endpoints in FastAPI." };
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
