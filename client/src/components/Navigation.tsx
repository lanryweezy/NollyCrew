import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
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
  X,
  Home,
  Briefcase,
  Users,
  Command
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

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
  const [path, setLocation] = useLocation();
  const { logout } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const roleColor = {
    actor: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    crew: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    producer: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
  };

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !isSearchOpen && isAuthenticated) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, isAuthenticated]);

  const quickActions = [
    { label: "Browse Jobs", icon: Briefcase, action: () => setLocation("/jobs") },
    { label: "Find Talent", icon: Users, action: () => setLocation("/talent") },
    { label: "My Projects", icon: Film, action: () => setLocation("/projects") },
    { label: "Messages", icon: MessageCircle, action: () => setLocation("/messages") },
    { label: "Profile", icon: User, action: () => setLocation("/profile") },
  ];

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
            {isAuthenticated && (
              <div className="hidden md:flex items-center gap-6">
                <Button 
                  variant={path === "/dashboard" ? "secondary" : "ghost"}
                  onClick={() => setLocation("/dashboard")}
                  data-testid="nav-dashboard"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
                <Button 
                  variant={path === "/jobs" ? "secondary" : "ghost"}
                  onClick={() => setLocation("/jobs")}
                  data-testid="nav-jobs"
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  Jobs
                </Button>
                <Button 
                  variant={path === "/talent" ? "secondary" : "ghost"}
                  onClick={() => setLocation("/talent")}
                  data-testid="nav-talent"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Talent
                </Button>
                <Button 
                  variant={path === "/projects" ? "secondary" : "ghost"}
                  onClick={() => setLocation("/projects")}
                  data-testid="nav-projects"
                >
                  <Film className="w-4 h-4 mr-2" />
                  Projects
                </Button>
                <Button 
                  variant={path === "/messages" ? "secondary" : "ghost"}
                  onClick={() => setLocation("/messages")}
                  data-testid="nav-messages"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Messages
                </Button>
                <Button 
                  variant={path === "/profile" ? "secondary" : "ghost"}
                  onClick={() => setLocation("/profile")}
                  data-testid="nav-profile"
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
              </div>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Compact Search */}
            {isAuthenticated && (
              <div className="hidden sm:flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setIsSearchOpen(true)}
                  data-testid="button-search"
                  className="relative"
                >
                  <Search className="w-4 h-4" />
                </Button>
                <div className="text-xs text-muted-foreground hidden lg:block">
                  Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">/</kbd> to search
                </div>
              </div>
            )}

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
                    <DropdownMenuItem 
                      data-testid="menu-profile"
                      onClick={() => setLocation("/profile")}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      data-testid="menu-settings"
                      onClick={() => setLocation("/profile?tab=settings")}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      data-testid="menu-logout"
                      onClick={() => {
                        logout();
                        setLocation("/");
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => setLocation("/login")}
                  data-testid="button-login"
                >
                  Log In
                </Button>
                <Button 
                  onClick={() => setLocation("/register")}
                  data-testid="button-signup"
                >
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
              {isAuthenticated ? (
                <>
                  <Button 
                    variant="ghost" 
                    className="justify-start" 
                    onClick={() => setLocation("/dashboard")}
                    data-testid="mobile-dashboard"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="justify-start" 
                    onClick={() => setLocation("/jobs")}
                    data-testid="mobile-jobs"
                  >
                    <Briefcase className="w-4 h-4 mr-2" />
                    Jobs
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="justify-start" 
                    onClick={() => setLocation("/talent")}
                    data-testid="mobile-talent"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Talent
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="justify-start" 
                    onClick={() => setLocation("/projects")}
                    data-testid="mobile-projects"
                  >
                    <Film className="w-4 h-4 mr-2" />
                    Projects
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="justify-start" 
                    onClick={() => setLocation("/messages")}
                    data-testid="mobile-messages"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Messages
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="justify-start" 
                    onClick={() => setLocation("/profile")}
                    data-testid="mobile-profile"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    className="justify-start" 
                    onClick={() => setLocation("/login")}
                    data-testid="mobile-login"
                  >
                    Log In
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="justify-start" 
                    onClick={() => setLocation("/register")}
                    data-testid="mobile-signup"
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Search Dialog */}
      <CommandDialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <CommandInput placeholder="Search jobs, talent, projects..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Quick Actions">
            {quickActions.map((action) => (
              <CommandItem
                key={action.label}
                onSelect={() => {
                  action.action();
                  setIsSearchOpen(false);
                }}
              >
                <action.icon className="mr-2 h-4 w-4" />
                <span>{action.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => { setLocation("/dashboard"); setIsSearchOpen(false); }}>
              <Home className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </CommandItem>
            <CommandItem onSelect={() => { setLocation("/jobs"); setIsSearchOpen(false); }}>
              <Briefcase className="mr-2 h-4 w-4" />
              <span>Jobs</span>
            </CommandItem>
            <CommandItem onSelect={() => { setLocation("/talent"); setIsSearchOpen(false); }}>
              <Users className="mr-2 h-4 w-4" />
              <span>Talent Search</span>
            </CommandItem>
            <CommandItem onSelect={() => { setLocation("/projects"); setIsSearchOpen(false); }}>
              <Film className="mr-2 h-4 w-4" />
              <span>Projects</span>
            </CommandItem>
            <CommandItem onSelect={() => { setLocation("/messages"); setIsSearchOpen(false); }}>
              <MessageCircle className="mr-2 h-4 w-4" />
              <span>Messages</span>
            </CommandItem>
            <CommandItem onSelect={() => { setLocation("/profile"); setIsSearchOpen(false); }}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </nav>
  );
}