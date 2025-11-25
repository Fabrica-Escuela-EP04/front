import { LayoutDashboard, Users, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface AppSideBarProps{
    name: string,
    lastName: string,
    email: string,
    onLogoutHandle: () => void;
}

export function AppSidebar({name, lastName, email, onLogoutHandle}:AppSideBarProps) {

    const menuItems = [
    /*{
      title: "Dashboard",
      icon: LayoutDashboard,
      url: "#",
    },*/
    {
      title: "Admin. Consultorios",
      icon: Users,
      url: "#",
      active: true,
    } ,
    {
      title: "Cerrar Sesion",
      icon: LogOut,
      onClick: onLogoutHandle,
    },
  ];

  return (
    <Sidebar className="border-r border-medical-border">
      <SidebarHeader className="border-b border-medical-border p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-medical-primary text-medical-primary-foreground">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-7 w-7"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M12 8v8m-4-4h8" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-medical-dark">Medical</h1>
            <p className="text-sm font-semibold text-medical-dark">Admin</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={item.active}
                className="w-full justify-start gap-3 px-3 py-2.5 text-base"
              >
                {item.onClick ? (
                  <button
                    onClick={item.onClick}
                    className="flex w-full items-center gap-3 text-left"
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.title}</span>
                  </button>
                ) : (
                  <a href={item.url}>
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.title}</span>
                  </a>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-medical-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-medical-light-gray text-medical-dark font-semibold">
            {name[0].toUpperCase() +lastName[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-medical-dark truncate">{name}  {lastName}</p>
            <p className="text-xs text-medical-gray truncate">{email}</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}