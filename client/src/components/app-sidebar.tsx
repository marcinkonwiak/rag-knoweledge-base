import * as React from "react";
import { Command } from "lucide-react";

import { NavItems } from "@/components/nav-items.tsx";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // const { user, logout } = useAuth();

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Knowledge Base</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavItems />
      </SidebarContent>
      <SidebarFooter>
        {/*<NavUser*/}
        {/*  user={{*/}
        {/*    name: user?.name || "",*/}
        {/*    email: user?.username || "",*/}
        {/*  }}*/}
        {/*  logout={logout}*/}
        {/*/>*/}
      </SidebarFooter>
    </Sidebar>
  );
}
