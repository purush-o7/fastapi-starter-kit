import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CORS",
  description: "Configure Cross-Origin Resource Sharing to allow your frontend to communicate with your FastAPI backend.",
  openGraph: {
    title: "CORS",
    description: "Configure Cross-Origin Resource Sharing to allow your frontend to communicate with your FastAPI backend.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
