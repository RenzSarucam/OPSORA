import {
  LayoutDashboard,
  FolderKanban,
  Server,
  Container,
  BellRing,
  ScrollText,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/servers", label: "Servers", icon: Server },
  { href: "/containers", label: "Containers", icon: Container },
  { href: "/alerts", label: "Alerts", icon: BellRing },
  { href: "/activity", label: "Activity", icon: ScrollText },
];