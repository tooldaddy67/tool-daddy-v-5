
'use client';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInput,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { History, BookOpen, LayoutDashboard } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { TOOL_CATEGORIES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { UserAuthButton } from './user-auth-button';
import { useFirebase } from '@/firebase';
import { useSettings } from '@/components/settings-provider';

const BOOTSTRAP_ADMIN_EMAILS = ['admin@tooldaddy.com'];

const Logo = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 420 420"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn("w-8 h-8 transition-all duration-300", className)}
    aria-label="Tool Daddy Logo"
    role="img"
  >
    <title>Tool Daddy Logo</title>
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


  const { user } = useFirebase();
  const { settings } = useSettings();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    user.getIdTokenResult().then((result) => {
      if (result.claims.admin === true) {
        setIsAdmin(true);
      } else if (BOOTSTRAP_ADMIN_EMAILS.includes(user.email || '')) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    }).catch(() => setIsAdmin(false));
  }, [user]);

  return (
    <Sidebar
      className="border-r border-border/20 glass-panel transition-all duration-300"
      collapsible="icon"
      variant="sidebar"
    >
      <SidebarHeader className="p-0 pt-2">
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-4 group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:px-0"
        >
          <Logo className="group-data-[state=collapsed]:w-7 group-data-[state=collapsed]:h-7" />
          <span className="font-bold text-lg font-headline truncate group-data-[state=collapsed]:hidden">
            {settings.siteTitle || 'Tool Daddy'}
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <div className="mb-2 group-data-[state=collapsed]:hidden">
          <SidebarInput
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {isAdmin && (
          <SidebarMenu className="mb-4">
            <SidebarMenuItem>
              <Link href="/admin/dashboard" prefetch={true} className="w-full">
                <SidebarMenuButton
                  isActive={pathname.startsWith('/admin')}
                  tooltip="Admin Dashboard"
                  className="bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
                >
                  <LayoutDashboard className="shrink-0" />
                  <span className="group-data-[state=collapsed]:hidden">Admin Panel</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        )}

        {filteredCategories.map((category) => (
          <SidebarGroup key={category.name}>
            <SidebarGroupLabel className="group-data-[state=collapsed]:hidden">
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
                        <span className="group-data-[state=collapsed]:hidden">{tool.name}</span>
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
                        <span className={cn("ml-1 group-data-[state=collapsed]:hidden", pathname === tool.href && "font-bold")}>{tool.name}</span>
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
            <Link href="/blog" prefetch={true}>
              <SidebarMenuButton
                isActive={pathname.startsWith('/blog')}
                tooltip="Blog"
              >
                <BookOpen />
                <span className="group-data-[state=collapsed]:hidden">Blog</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
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
                <span className="group-data-[state=collapsed]:hidden">History</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className={cn("p-2 border-t border-border/10", settings.sidebarStyle === 'mini' && "flex justify-center")}>
        <UserAuthButton />
      </SidebarFooter>
    </Sidebar>
  );
}
