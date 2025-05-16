"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger, // Added import
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Home, LayoutGrid, PackagePlus, Wand2, Settings, Code2, PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/app-generator", label: "App Generator", icon: LayoutGrid },
  { href: "/module-creator", label: "Module Creator", icon: PackagePlus },
  { href: "/configurator", label: "Configurator", icon: Wand2 },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2 ">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-primary text-primary-foreground group-data-[collapsible=icon]:hidden">
            <Code2 className="h-5 w-5" />
          </Button>
           <h2 className="text-lg font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            CI4 Studio
          </h2>
          <SidebarTrigger className="ml-auto hidden md:flex group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:mx-auto" />
        </div>
      </SidebarHeader>
      <SidebarContent className="flex-1 p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label, side: 'right', align: 'center' }}
                  className={cn(
                    "justify-start",
                    pathname === item.href && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                  )}
                >
                  <a>
                    <item.icon className="h-5 w-5" />
                    <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2 border-t border-sidebar-border">
         <Separator className="my-2 group-data-[collapsible=icon]:hidden"/>
        <SidebarMenu>
           <SidebarMenuItem>
            <SidebarMenuButton 
              asChild
              tooltip={{ children: "Settings", side: 'right', align: 'center' }}
              className="justify-start"
            >
              <Link href="#">
                <Settings className="h-5 w-5" />
                <span className="group-data-[collapsible=icon]:hidden">Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
