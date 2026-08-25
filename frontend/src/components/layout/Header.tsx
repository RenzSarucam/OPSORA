"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, Moon, Sun } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { navItems } from "@/components/layout/navItems";
import { NotificationBell } from "@/components/layout/NotificationBell";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  const initial = user?.name?.charAt(0)?.toUpperCase() ?? "A";

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 md:px-6">
      <div className="flex items-center gap-1 md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon-sm">
                <Menu />
              </Button>
            }
          />
          <DropdownMenuContent align="start">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname?.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <DropdownMenuItem key={item.href} render={<Link href={item.href} />}>
                  <Icon className={active ? "text-primary" : undefined} />
                  {item.label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
        <Image src="/opsora-icon.png" alt="" width={24} height={24} className="h-6 w-6" />
        <span className="text-lg font-semibold uppercase tracking-tight">Opsora</span>
      </div>

      <div className="hidden md:block" />

      <div className="flex items-center gap-2">
        <NotificationBell />

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={toggleTheme}
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              />
            }
          >
            {theme === "dark" ? <Sun /> : <Moon />}
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium hover:bg-accent">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-primary/20 text-primary text-xs">
                {initial}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline">{user?.name ?? "Admin"}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}