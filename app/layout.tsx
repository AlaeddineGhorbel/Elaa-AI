import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Ya Ghaffass", description: "Assistant vocal personnel" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="fr"><body>{children}</body></html>; }
