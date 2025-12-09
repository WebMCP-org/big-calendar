'use client'

/**
 * Root Layout - WebMCP Demo Application
 *
 * @see https://docs.mcp-b.ai/frameworks/react for Next.js integration
 */

import "@/styles/globals.css";
import '@mcp-b/global';

import { Analytics } from "@vercel/analytics/react";
import { inter } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import { Header } from "@/components/layout/header";
import { getTheme } from "@/cookies/get";

export default function Layout({ children }: { children: React.ReactNode }) {
  const theme = getTheme();
  return (
    <html lang="en-US" className={cn(inter.variable, theme)} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Header />
        <Analytics />
        {children}
      </body>
    </html>
  );
}
