import Link from "next/link";
import { ArrowUpRight, Calendar, BookOpen, Github, ExternalLink } from "lucide-react";

import { ToggleTheme } from "@/components/layout/change-theme";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  return (
    <header className="mx-auto flex h-[88px] w-full max-w-screen-2xl items-center justify-center">
      <div className="my-3 flex h-14 w-full items-center justify-between px-8">
        <div className="flex items-center gap-3.5">
          <div className="flex size-12 items-center justify-center rounded-full border p-3">
            <Calendar className="size-6 text-foreground" />
          </div>

          <div className="space-y-1">
            <p className="text-lg font-medium leading-6">Big Calendar</p>
            <p className="text-sm text-muted-foreground">
              WebMCP Demo
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {/* WebMCP Docs Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5">
                <BookOpen size={16} />
                Docs
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Getting Started</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href="https://docs.mcp-b.ai/quickstart" target="_blank" className="cursor-pointer">
                  <ExternalLink size={14} className="mr-2" />
                  Quick Start
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="https://docs.mcp-b.ai/concepts/overview" target="_blank" className="cursor-pointer">
                  <ExternalLink size={14} className="mr-2" />
                  Core Concepts
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="https://docs.mcp-b.ai/concepts/architecture" target="_blank" className="cursor-pointer">
                  <ExternalLink size={14} className="mr-2" />
                  Architecture Overview
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuLabel>Packages</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href="https://docs.mcp-b.ai/packages/react-webmcp" target="_blank" className="cursor-pointer">
                  <ExternalLink size={14} className="mr-2" />
                  @mcp-b/react-webmcp
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="https://docs.mcp-b.ai/packages/global" target="_blank" className="cursor-pointer">
                  <ExternalLink size={14} className="mr-2" />
                  @mcp-b/global
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="https://docs.mcp-b.ai/calling-tools/embedded-agent" target="_blank" className="cursor-pointer">
                  <ExternalLink size={14} className="mr-2" />
                  Embedded Agent
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuLabel>Guides</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href="https://docs.mcp-b.ai/best-practices" target="_blank" className="cursor-pointer">
                  <ExternalLink size={14} className="mr-2" />
                  Best Practices
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="https://docs.mcp-b.ai/concepts/schemas" target="_blank" className="cursor-pointer">
                  <ExternalLink size={14} className="mr-2" />
                  Tool Schemas & Validation
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="https://docs.mcp-b.ai/security" target="_blank" className="cursor-pointer">
                  <ExternalLink size={14} className="mr-2" />
                  Security Best Practices
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="https://docs.mcp-b.ai" target="_blank" className="cursor-pointer font-medium">
                  <BookOpen size={14} className="mr-2" />
                  View All Documentation
                  <ArrowUpRight size={12} className="ml-auto" />
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Live Demo Link */}
          <Button variant="ghost" size="sm" asChild>
            <Link
              href="https://docs.mcp-b.ai/live-tool-examples"
              target="_blank"
              className="gap-1.5"
            >
              Live Demo
              <ArrowUpRight size={14} />
            </Link>
          </Button>

          {/* Examples Link */}
          <Button variant="ghost" size="sm" asChild>
            <Link
              href="https://docs.mcp-b.ai/examples"
              target="_blank"
              className="gap-1.5"
            >
              Examples
              <ArrowUpRight size={14} />
            </Link>
          </Button>

          <div className="mx-2 h-6 w-px bg-border" />

          {/* GitHub */}
          <Button size="icon" variant="ghost" asChild>
            <Link href="https://github.com/WebMCP-org" target="_blank" title="View on GitHub">
              <Github size={18} />
            </Link>
          </Button>

          {/* X/Twitter */}
          <Button size="icon" variant="ghost" asChild>
            <Link href="https://x.com/AlexNahasDev" target="_blank" title="Follow on X">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
                <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
              </svg>
            </Link>
          </Button>

          <ToggleTheme />
        </div>
      </div>
    </header>
  );
}
