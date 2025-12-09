# Big Calendar + WebMCP Demo

This is a fork of [lramos33/big-calendar](https://github.com/lramos33/big-calendar) with WebMCP integration added. It demonstrates how to make a web app controllable by AI agents.

## What's WebMCP?

WebMCP is a W3C standard (currently incubating) that adds `navigator.modelContext` to browsers. This API lets websites expose JavaScript functions as "tools" that AI agents can discover and call.

```typescript
// Register a tool that AI agents can call
navigator.modelContext.registerTool({
  name: "create_event",
  description: "Create a calendar event",
  inputSchema: { title: z.string(), date: z.string() },
  async execute({ title, date }) {
    // Your existing code
    await createEvent(title, date);
    return { content: [{ type: "text", text: "Event created" }] };
  }
});
```

The `@mcp-b/global` package polyfills this API until browsers ship native support.

## What This Demo Shows

1. **Tool Registration** - 15 tools for calendar CRUD, navigation, and settings
2. **React Integration** - Using `useWebMCP` hook from `@mcp-b/react-webmcp`
3. **Embedded Agent** - Drop-in AI chat widget from `@mcp-b/embedded-agent`
4. **Next.js Setup** - Polyfill placement, client components, SSR handling

## Quick Start

```bash
git clone https://github.com/WebMCP-org/big-calendar
cd big-calendar
npm install
cp .env.example .env  # Add NEXT_PUBLIC_ANTHROPIC_API_KEY
npm run dev
```

Open http://localhost:3000. Click the chat widget. Ask it to create an event.

## Key Files

| File | What It Does |
|------|--------------|
| `src/app/layout.tsx` | Imports `@mcp-b/global` polyfill (must be first) |
| `src/app/(calendar)/layout.tsx` | Renders tools component + embedded agent |
| `src/calendar/components/calendar-webmcp-tools.tsx` | Registers all 15 tools |
| `src/components/embedded-agent.tsx` | Renders the AI chat widget |

## How Tools Are Registered

```tsx
// src/calendar/components/calendar-webmcp-tools.tsx
"use client";

import { useWebMCP } from "@mcp-b/react-webmcp";
import { z } from "zod";
import { useCalendar } from "@/calendar/contexts/calendar-context";

export function CalendarWebMCPTools() {
  const { events, setLocalEvents } = useCalendar();

  // This registers a tool that AI agents can call
  useWebMCP({
    name: "get_events",
    description: "Get calendar events for a specific month",
    inputSchema: {
      month: z.string().describe("Month in YYYY-MM format"),
    },
    handler: async ({ month }) => {
      const filtered = events.filter(e => e.startDate.startsWith(month));
      return { events: filtered };
    },
  });

  useWebMCP({
    name: "create_event",
    description: "Create a new calendar event",
    inputSchema: {
      title: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      color: z.enum(["blue", "green", "red", "yellow", "purple", "orange"]),
    },
    handler: async ({ title, startDate, endDate, color }) => {
      const newEvent = { id: Date.now(), title, startDate, endDate, color };
      setLocalEvents(prev => [...prev, newEvent]);
      return { success: true, eventId: newEvent.id };
    },
  });

  return null; // This component just registers tools, renders nothing
}
```

## How the Embedded Agent Works

```tsx
// src/components/embedded-agent.tsx
"use client";

import dynamic from "next/dynamic";

// Must use dynamic import with ssr: false - uses browser APIs
const EmbeddedAgent = dynamic(
  () => import("@mcp-b/embedded-agent/web-component").then(m => m.EmbeddedAgent),
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
```

For production, remove `devMode` and use your app ID from [webmcp.ai](https://webmcp.ai).

## Next.js Gotchas

1. **Root layout must be a client component** - The polyfill needs browser APIs
2. **Import `@mcp-b/global` first** - Before any other imports in root layout
3. **Tools need React Context** - Register them inside your providers
4. **Embedded agent needs `ssr: false`** - It accesses `window`

```tsx
// src/app/layout.tsx
'use client'

import '@mcp-b/global'; // MUST be first import
import "./globals.css";
// ... rest of imports
```

## Available Tools

| Tool | Description |
|------|-------------|
| `get_events` | Get events filtered by month |
| `get_event_by_id` | Get single event details |
| `create_event` | Create new event |
| `update_event` | Update existing event |
| `delete_event` | Delete event |
| `get_users` | List available users |
| `get_calendar_state` | Get current date, selected date, filters |
| `get_todays_events` | Get today's schedule |
| `get_event_colors` | List available colors |
| `navigate_to_date` | Jump to specific date |
| `navigate_to_today` | Jump to today |
| `navigate_to_event` | Show specific event |
| `set_user_filter` | Filter by user |
| `set_badge_variant` | Change event display style |
| `set_visible_hours` | Adjust time range |

## What Changed From the Original

The original [big-calendar](https://github.com/lramos33/big-calendar) is a standalone calendar UI. This fork adds:

- `@mcp-b/global` - Polyfill for `navigator.modelContext`
- `@mcp-b/react-webmcp` - React hooks for tool registration
- `@mcp-b/embedded-agent` - AI chat widget
- `calendar-webmcp-tools.tsx` - Tool definitions
- `embedded-agent.tsx` - Agent component
- Modified layouts to wire everything together

The calendar itself is unchanged. WebMCP just exposes its functionality to AI agents.

## Other WebMCP Demos

- [webMCP-Legit-exploration](https://github.com/WebMCP-org/webMCP-Legit-exploration) - Collaboration with Legit Control
- [mcp-ui-webmcp](https://github.com/WebMCP-org/mcp-ui-webmcp) - Bidirectional MCP-UI integration
- [examples](https://github.com/WebMCP-org/examples) - More WebMCP examples

## Learn More

- [WebMCP Docs](https://docs.mcp-b.ai) - Full documentation
- [Quick Start](https://docs.mcp-b.ai/quickstart) - Add WebMCP to your site
- [React Integration](https://docs.mcp-b.ai/packages/react-webmcp) - useWebMCP hook
- [Best Practices](https://docs.mcp-b.ai/best-practices) - Tool design guidelines
- [W3C Proposal](https://github.com/webmachinelearning/webmcp) - The standard

## Credits

- Calendar UI: [Leonardo Ramos](https://github.com/lramos33)
- WebMCP: [WebMCP-org](https://github.com/WebMCP-org)
