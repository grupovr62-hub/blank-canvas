import { Bell, User, Search, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-card border-b border-border px-4 md:px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex items-center gap-4 flex-1 max-w-lg ml-12 md:ml-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar..."
              className="pl-10 text-sm"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-4 h-4 md:w-5 md:h-5" />
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              3
            </Badge>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary flex items-center justify-center">
                  <User className="w-3 h-3 md:w-4 md:h-4 text-primary-foreground" />
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-sm font-medium">
                    {user?.user_metadata?.full_name || 'Usuário'}
                  </p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-popover border border-border">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Perfil</DropdownMenuItem>
              <DropdownMenuItem>Configurações</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}