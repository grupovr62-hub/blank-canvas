import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Calendar,
  ClipboardList,
  Package,
  Settings,
  BarChart3,
  Menu,
  X,
  Factory,
  Scissors,
  Shirt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const menuItems = [
  { title: "Dashboard", url: "/", icon: BarChart3 },
  { title: "Tecidos", url: "/tecidos", icon: Package },
  { title: "Produção", url: "/producao", icon: ClipboardList },
  { title: "Kanban", url: "/kanban", icon: Scissors },
  { title: "Calendário", url: "/calendario", icon: Calendar },
  
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

// Navigation content component
function SidebarContent({ onItemClick }: { onItemClick?: () => void }) {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="bg-sidebar border-r border-sidebar-border h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center space-x-2">
          <Factory className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">JeansPro</h1>
            <p className="text-xs text-sidebar-foreground/60">Sistema de Produção</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const active = isActive(item.url);
            return (
              <li key={item.title}>
                <NavLink
                  to={item.url}
                  onClick={onItemClick}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    active && "bg-primary text-primary-foreground shadow-sm",
                    !active && "text-sidebar-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{item.title}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="text-xs text-sidebar-foreground/60 text-center">
          Versão 1.0.0
          <br />
          Sistema de Produção
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();

  // Mobile sidebar with Sheet
  if (isMobile) {
    return (
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden fixed top-4 left-4 z-50 bg-background/80 backdrop-blur-sm border"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent onItemClick={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop sidebar
  return (
    <div
      className={cn(
        "bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col hidden md:flex",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <Factory className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-lg font-bold text-sidebar-foreground">JeansPro</h1>
                <p className="text-xs text-sidebar-foreground/60">Sistema de Produção</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const active = location.pathname === item.url;
            return (
              <li key={item.title}>
                <NavLink
                  to={item.url}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    active && "bg-primary text-primary-foreground shadow-sm",
                    !active && "text-sidebar-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && <span className="font-medium">{item.title}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="text-xs text-sidebar-foreground/60 text-center">
            Versão 1.0.0
            <br />
            Sistema de Produção
          </div>
        </div>
      )}
    </div>
  );
}