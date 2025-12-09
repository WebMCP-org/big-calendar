"use client";

/**
 * WebMCP Embedded Agent Component
 *
 * @see https://docs.mcp-b.ai/calling-tools/embedded-agent for configuration
 */

import dynamic from "next/dynamic";

const EmbeddedAgent = dynamic(
  () => import("@mcp-b/embedded-agent/web-component").then(mod => mod.EmbeddedAgent),
  { ssr: false }
);

export function CalendarEmbeddedAgent() {
  return (
    <EmbeddedAgent
      appId="big-calendar-demo"
      devMode={{
        anthropicApiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || "",
      }}
    />
  );
}
