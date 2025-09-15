import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Film, 
  Search, 
  Bell, 
  MessageCircle, 
  User, 
  Settings, 
  LogOut,
  Menu,
  X 
} from "lucide-react";

export interface NavigationProps {
  isAuthenticated?: boolean;
  userRole?: "actor" | "crew" | "producer";
  userName?: string;
  userAvatar?: string;
  notifications?: number;
  messages?: number;
}

export default function Navigation({ 
  isAuthenticated = false,
  userRole = "actor",
  userName = "John Doe",
  userAvatar,
  notifications = 3,
  messages = 2 
}: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const roleColor = {
    actor: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    crew: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    producer: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2" data-testid="logo">
              <Film className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold font-serif">NollyCrew</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Button variant="ghost" data-testid="nav-discover">
                Discover
              </Button>
              <Button variant="ghost" data-testid="nav-projects">
                Projects
              </Button>
              <Button variant="ghost" data-testid="nav-jobs">
                Jobs
              </Button>
              <Button variant="ghost" data-testid="nav-community">
                Community
              </Button>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <Button 
              variant="ghost" 
              size="icon"
              className="hidden sm:flex"
              data-testid="button-search"
            >
              <Search className="w-4 h-4" />
            </Button>

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative"
                  data-testid="button-notifications"
                >
                  <Bell className="w-4 h-4" />
                  {notifications > 0 && (
                    <Badge className="absolute -top-1 -right-1 w-5 h-5 text-xs p-0 flex items-center justify-center bg-destructive">
                      {notifications}
                    </Badge>
                  )}
                </Button>

                {/* Messages */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative"
                  data-testid="button-messages"
                >
                  <MessageCircle className="w-4 h-4" />
                  {messages > 0 && (
                    <Badge className="absolute -top-1 -right-1 w-5 h-5 text-xs p-0 flex items-center justify-center bg-destructive">
                      {messages}
                    </Badge>
                  )}
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="flex items-center gap-2 h-auto p-2"
                      data-testid="button-user-menu"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={userAvatar} alt={userName} />
                        <AvatarFallback>
                          {userName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden sm:block text-left">
                        <div className="text-sm font-medium">{userName}</div>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${roleColor[userRole]}`}
                        >
                          {userRole}
                        </Badge>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem data-testid="menu-profile">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem data-testid="menu-settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem data-testid="menu-logout">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" data-testid="button-login">
                  Log In
                </Button>
                <Button data-testid="button-signup">
                  Sign Up
                </Button>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <Button 
              variant="ghost" 
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t py-4">
            <div className="flex flex-col gap-2">
              <Button variant="ghost" className="justify-start" data-testid="mobile-discover">
                Discover
              </Button>
              <Button variant="ghost" className="justify-start" data-testid="mobile-projects">
                Projects
              </Button>
              <Button variant="ghost" className="justify-start" data-testid="mobile-jobs">
                Jobs
              </Button>
              <Button variant="ghost" className="justify-start" data-testid="mobile-community">
                Community
              </Button>
              <Button variant="ghost" className="justify-start" data-testid="mobile-search">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}