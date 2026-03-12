"use client";

/**
 * Root Layout - WebMCP Demo Application
 *
 * This calendar can be embedded in cross-origin iframes.
 * The initializeWebModelContext call enables parent pages to access the calendar's tools.
 *
 * @see https://docs.mcp-b.ai/tutorials/first-react-tool for React-based integration patterns
 * @see https://docs.mcp-b.ai/packages/global/overview for runtime initialization and transport configuration
 */

import "@/styles/globals.css";
import { initializeWebModelContext } from "@mcp-b/global";

import { Analytics } from "@vercel/analytics/react";
import { inter } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import { Header } from "@/components/layout/header";
import { getTheme } from "@/cookies/get";

// Enable cross-origin iframe embedding by allowing any parent origin
initializeWebModelContext({
  transport: {
    tabServer: { allowedOrigins: ["*"] },
    iframeServer: { allowedOrigins: ["*"] },
  },
});

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
