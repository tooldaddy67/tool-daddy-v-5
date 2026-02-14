
"use client";

import { MobileHeader } from "@/components/mobile/mobile-header";
import { usePathname } from "next/navigation";
import { DesktopOnlyRoast } from "@/components/mobile/desktop-only-roast";

const RESTRICTED_MOBILE_TOOLS = [
  "/simple-notepad",
  "/drawing-canvas",
  "/ipv4-subnet-calculator",
  "/ipv4-address-converter",
  "/ipv4-range-expander",
  "/mac-address-lookup",
  "/mac-address-generator",
  "/ipv6-ula-generator",
  "/token-generator",
  "/hash-text",
  "/bcrypt-generator",
  "/uuids-generator",
  "/ulid-generator",
  "/encrypt-decrypt-text",
  "/bip39-generator",
  "/hmac-generator",
  "/rsa-key-generator",
  "/password-strength-analyser",
  "/pdf-signature-checker",
  "/date-time-converter",
  "/math-evaluator",
  "/dna-to-mrna-converter",
  "/japanese-name-converter",
  "/benchmark-builder",
  "/metadata-extractor",
  "/about",
  "/buy-me-a-coffee"
];

import { ToolErrorBoundary } from "@/components/tool-error-boundary";
import { useRecentTools } from "@/hooks/use-recent-tools";
import { ALL_TOOLS_CATEGORIES } from "@/lib/tools-data";
import { useEffect } from "react";

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { addRecentTool } = useRecentTools();
  const isRestricted = RESTRICTED_MOBILE_TOOLS.some(path => pathname === path);
  const toolName = pathname.split('/').pop()?.replace(/-/g, ' ');

  // Track recent tool access
  useEffect(() => {
    // Find the tool in ALL_TOOLS_CATEGORIES to get the correct name (case sensitive)
    const tool = ALL_TOOLS_CATEGORIES.flatMap(cat => cat.tools).find(t => t.href === pathname);
    if (tool) {
      addRecentTool(tool.name);
    }
  }, [pathname, addRecentTool]);

  return (
    <div className="flex-1 w-full h-full relative">
      <div className="md:hidden">
        <MobileHeader />
      </div>
      <div className="md:mt-0 mt-8">
        <ToolErrorBoundary toolName={toolName}>
          <div className="hidden md:block">
            {children}
          </div>
          <div className="md:hidden">
            {isRestricted ? <DesktopOnlyRoast /> : children}
          </div>
        </ToolErrorBoundary>
      </div>
    </div>
  );
}

