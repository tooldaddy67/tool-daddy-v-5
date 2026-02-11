
'use client';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInput,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { History } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { TOOL_CATEGORIES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useState } from 'react';
import { UserAuthButton } from './user-auth-button';

const Logo = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 420 420"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="shrink-0"
  >
    <path d="M128 341.333C128 304.6 154.6 278 181.333 278H234.667C261.4 278 288 304.6 288 341.333V341.333C288 378.067 261.4 404.667 234.667 404.667H181.333C154.6 404.667 128 378.067 128 341.333V341.333Z" fill="#F87171" />
    <path d="M288 170.667C288 133.933 314.6 107.333 341.333 107.333H384V404.667H341.333C314.6 404.667 288 378.067 288 341.333V170.667Z" fill="#F87171" />
    <path d="M150 256C183.5 204 250 204 282 256C314 308 380.5 308 414 256" stroke="white" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);


export default function AppSidebar() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = TOOL_CATEGORIES.map(category => ({
    ...category,
    tools: category.tools.filter(tool =>
      tool.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => category.tools.length > 0);


  return (
    <Sidebar
      className="border-r border-border/20 glass-panel"
      collapsible="icon"
      variant="sidebar"
    >
      <SidebarHeader>
        <Link
          href="/"
          className="flex items-center gap-2 justify-center group-data-[collapsible=icon]:justify-center"
        >
          <Logo />
          <span className="font-bold text-lg font-headline group-data-[collapsible=icon]:hidden">
            Tool Daddy
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <div className="mb-2">
          <SidebarInput
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <UserAuthButton />
        </div>

        {filteredCategories.map((category) => (
          <SidebarGroup key={category.name}>
            <SidebarGroupLabel className="group-data-[collapsible=icon]:-mt-0">
              {category.name}
            </SidebarGroupLabel>
            <SidebarMenu>
              {category.tools.map((tool) => (
                <SidebarMenuItem key={tool.name}>
                  {tool.isExternal ? (
                    <a href={tool.href} target="_blank" rel="noopener noreferrer" className="w-full">
                      <SidebarMenuButton
                        tooltip={{
                          children: tool.name,
                          className: 'bg-accent text-accent-foreground',
                        }}
                      >
                        <tool.icon className="shrink-0" />
                        <span>{tool.name}</span>
                      </SidebarMenuButton>
                    </a>
                  ) : (
                    <Link href={tool.href} prefetch={true} className="w-full">
                      <SidebarMenuButton
                        className={cn(
                          "transition-all duration-300 group",
                          pathname === tool.href ? "text-primary bg-primary/5" : "hover:text-primary"
                        )}
                        tooltip={{
                          children: tool.name,
                          className: 'bg-accent text-accent-foreground',
                        }}
                      >
                        <div className={cn(
                          "p-1.5 rounded-md transition-all duration-300 glow-island flex items-center justify-center",
                          pathname === tool.href ? "bg-primary/20 glow-sm" : "bg-transparent"
                        )}
                          style={{ '--glow-color': 'hsla(var(--primary), 0.4)' } as React.CSSProperties}
                        >
                          <tool.icon className="shrink-0 h-4 w-4" />
                        </div>
                        <span className={cn("ml-1", pathname === tool.href && "font-bold")}>{tool.name}</span>
                      </SidebarMenuButton>
                    </Link>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}

        <SidebarSeparator />

        <SidebarMenu className="mt-2">
          <SidebarMenuItem>
            <Link href="/history" prefetch={true} className="w-full">
              <SidebarMenuButton
                isActive={pathname === '/history'}
                tooltip={{
                  children: 'History',
                  className: 'bg-accent text-accent-foreground',
                }}
              >
                <History className="shrink-0" />
                <span>History</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
