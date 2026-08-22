"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";

export function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  const initial = user?.name?.charAt(0)?.toUpperCase() ?? "A";

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 md:px-6">
      <div className="flex items-center gap-2 md:hidden">
        <Image src="/opsora-icon.png" alt="" width={24} height={24} className="h-6 w-6" />
        <span className="text-lg font-semibold uppercase tracking-tight">Opsora</span>
      </div>

      <div className="hidden md:block" />

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
    </header>
  );
}