import { NavLink, useLocation } from "react-router"
import {
  LayoutDashboard,
  Users,
  Gift,
  Megaphone,
  Settings,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const navItems = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Customers", path: "/customers", icon: Users },
  { label: "Rewards", path: "/rewards", icon: Gift },
  { label: "Campaigns", path: "/campaigns", icon: Megaphone },
  { label: "Settings", path: "/settings", icon: Settings },
]

export function AppSidebar() {
  const location = useLocation()

  function isActive(path: string) {
    if (path === "/") return location.pathname === "/"
    return location.pathname.startsWith(path)
  }

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-bold">
            N
          </div>
          <div>
            <p className="text-sm font-semibold">Nail Store</p>
            <p className="text-xs text-muted-foreground">Loyalty Manager</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild isActive={isActive(item.path)}>
                    <NavLink to={item.path}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
