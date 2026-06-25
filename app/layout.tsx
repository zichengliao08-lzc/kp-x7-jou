import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Daily Compass",
  description: "Your personal daily journal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
