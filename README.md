# Big Calendar + WebMCP Demo

This repo is a fork of [lramos33/big-calendar](https://github.com/lramos33/big-calendar) with WebMCP integration layered on top. It demonstrates how a regular web app can expose typed tools, prompts, and UI-backed actions to AI agents.

## What This Demo Shows

1. WebMCP tool registration with `useWebMCP` and `useWebMCPPrompt`
2. Dialog-backed create, update, and delete flows for AI-triggered actions
3. Browser-persisted calendar state using Dexie and IndexedDB
4. Cross-origin runtime initialization with `initializeWebModelContext`

## Quick Start

```bash
git clone https://github.com/WebMCP-org/big-calendar
cd big-calendar
npm install
npm run dev
```

Open `http://localhost:3000`.

To exercise the tools, connect with a WebMCP-capable client or embed the app in a parent page that can call its registered tools.

## Key Files

| File                                                            | What It Does                                                   |
| --------------------------------------------------------------- | -------------------------------------------------------------- |
| `src/app/layout.tsx`                                            | Initializes the WebMCP runtime and transport configuration     |
| `src/app/(calendar)/layout.tsx`                                 | Wires up the calendar providers, tools, and controlled dialogs |
| `src/calendar/components/calendar-webmcp-tools.tsx`             | Registers tools and starter prompts                            |
| `src/calendar/contexts/calendar-context.tsx`                    | Manages live calendar data backed by Dexie                     |
| `src/calendar/contexts/event-dialog-context.tsx`                | Coordinates dialog-driven human and AI flows                   |
| `src/calendar/components/dialogs/event-form-dialog-content.tsx` | Shared add/edit dialog form UI                                 |

## Available Tools

| Tool                | Description                                                        |
| ------------------- | ------------------------------------------------------------------ |
| `get_events`        | Query events by ID, date, month, user, or search text              |
| `get_calendar_info` | Return users, selected date, filters, colors, and display settings |
| `create_event`      | Open a prefilled add-event dialog and create an event              |
| `update_event`      | Open a prefilled edit dialog and persist event changes             |
| `delete_event`      | Open a confirmation dialog and delete an event                     |
| `navigate`          | Move the UI to today, a specific date, or an event                 |
| `configure`         | Change filters, badge style, and visible hours                     |

## Available Prompts

| Prompt             | Description                                            |
| ------------------ | ------------------------------------------------------ |
| `reschedule_event` | Find and move an event                                 |
| `create_meeting`   | Create a new meeting with the current calendar context |
| `show_this_week`   | Summarize the week and navigate the UI                 |

## Architecture Notes

- `@mcp-b/global` initializes runtime support and transport configuration.
- `@mcp-b/react-webmcp` registers tools from React client components.
- AI-triggered mutations open the same dialogs humans use, with a short countdown before auto-submit.
- Calendar data lives in IndexedDB so tool calls and UI interactions stay in sync without a backend.

## What Changed From the Original

The original calendar was a standalone UI. This fork adds:

- WebMCP runtime initialization
- Tool and prompt registration
- Dialog orchestration for AI-assisted mutations
- IndexedDB-backed persistence for events and users
- Calendar-specific navigation and configuration tools

## Related Repos

- [webMCP-Legit-exploration](https://github.com/WebMCP-org/webMCP-Legit-exploration)
- [mcp-ui-webmcp](https://github.com/WebMCP-org/mcp-ui-webmcp)
- [examples](https://github.com/WebMCP-org/examples)

## Learn More

- [WebMCP Docs](https://docs.mcp-b.ai)
- [Start Here](https://docs.mcp-b.ai/start-here/choose-your-path)
- [First React Tool](https://docs.mcp-b.ai/tutorials/first-react-tool)
- [@mcp-b/react-webmcp Overview](https://docs.mcp-b.ai/packages/react-webmcp/overview)
- [@mcp-b/global Overview](https://docs.mcp-b.ai/packages/global/overview)
- [Tool Design](https://docs.mcp-b.ai/explanation/design/tool-design)
- [Tool Schemas](https://docs.mcp-b.ai/how-to/use-schemas-and-structured-output)
- [Tutorials](https://docs.mcp-b.ai/tutorials)
- [Security and Human-in-the-Loop](https://docs.mcp-b.ai/explanation/design/security-and-human-in-the-loop)
- [W3C Proposal](https://github.com/webmachinelearning/webmcp)

## Credits

- Calendar UI: [Leonardo Ramos](https://github.com/lramos33)
- WebMCP integration: [WebMCP-org](https://github.com/WebMCP-org)
