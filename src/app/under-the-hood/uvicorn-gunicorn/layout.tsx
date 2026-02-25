import type { Metadata } from "next";
export const metadata: Metadata = { title: "Uvicorn & Gunicorn", description: "ASGI server vs process manager — when to use Uvicorn, Gunicorn, or both in production." };
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
