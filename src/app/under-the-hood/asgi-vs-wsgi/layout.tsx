import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ASGI vs WSGI",
  description: "Learn the difference between ASGI and WSGI server protocols and why FastAPI requires ASGI.",
  openGraph: {
    title: "ASGI vs WSGI",
    description: "Learn the difference between ASGI and WSGI server protocols and why FastAPI requires ASGI.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
