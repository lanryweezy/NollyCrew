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
  Command,
  BarChart3
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
import Notifications from "@/components/Notifications";
import MobileMenu from "@/components/MobileMenu";

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

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [path]);

  return (
    <nav className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2" data-testid="logo">
              <Film className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold font-serif hidden sm:block">NollyCrew</span>
              <span className="text-xl font-bold font-serif sm:hidden">NC</span>
            </div>

            {/* Desktop Navigation */}
            {isAuthenticated && (
              <div className="hidden md:flex items-center gap-1 lg:gap-2 xl:gap-4">
                <Button 
                  variant={path === "/dashboard" ? "secondary" : "ghost"}
                  onClick={() => setLocation("/dashboard")}
                  data-testid="nav-dashboard"
                  className="text-xs sm:text-sm"
                >
                  <Home className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
                <Button 
                  variant={path === "/jobs" ? "secondary" : "ghost"}
                  onClick={() => setLocation("/jobs")}
                  data-testid="nav-jobs"
                  className="text-xs sm:text-sm"
                >
                  <Briefcase className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Jobs</span>
                </Button>
                <Button 
                  variant={path === "/talent" ? "secondary" : "ghost"}
                  onClick={() => setLocation("/talent")}
                  data-testid="nav-talent"
                  className="text-xs sm:text-sm"
                >
                  <Users className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Talent</span>
                </Button>
                <Button 
                  variant={path === "/projects" ? "secondary" : "ghost"}
                  onClick={() => setLocation("/projects")}
                  data-testid="nav-projects"
                  className="text-xs sm:text-sm"
                >
                  <Film className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Projects</span>
                </Button>
                <Button 
                  variant={path === "/messages" ? "secondary" : "ghost"}
                  onClick={() => setLocation("/messages")}
                  data-testid="nav-messages"
                  className="text-xs sm:text-sm"
                >
                  <MessageCircle className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Messages</span>
                </Button>
                <Button 
                  variant={path === "/profile" ? "secondary" : "ghost"}
                  onClick={() => setLocation("/profile")}
                  data-testid="nav-profile"
                  className="text-xs sm:text-sm"
                >
                  <User className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Profile</span>
                </Button>
                <Button 
                  variant={path === "/calendar" ? "secondary" : "ghost"}
                  onClick={() => setLocation("/calendar")}
                  data-testid="nav-calendar"
                  className="text-xs sm:text-sm"
                >
                  <Command className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Calendar</span>
                </Button>
                <Button 
                  variant={path === "/analytics" ? "secondary" : "ghost"}
                  onClick={() => setLocation("/analytics")}
                  data-testid="nav-analytics"
                  className="text-xs sm:text-sm"
                >
                  <BarChart3 className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Analytics</span>
                </Button>
                <Button 
                  variant={path === "/collaboration" ? "secondary" : "ghost"}
                  onClick={() => setLocation("/collaboration")}
                  data-testid="nav-collaboration"
                  className="text-xs sm:text-sm"
                >
                  <Users className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Collab</span>
                </Button>
              </div>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2 sm:gap-4">
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
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
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="p-0">
                    <Notifications />
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Messages */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative hidden sm:flex"
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
                      <div className="hidden lg:block text-left">
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
                  className="text-xs sm:text-sm"
                >
                  Log In
                </Button>
                <Button 
                  onClick={() => setLocation("/register")}
                  data-testid="button-signup"
                  className="text-xs sm:text-sm"
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
              onClick={() => setIsMobileMenuOpen(true)}
              data-testid="button-mobile-menu"
            >
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <MobileMenu 
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          isAuthenticated={isAuthenticated}
          userRole={userRole}
          userName={userName}
        />
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
            <CommandItem onSelect={() => { setLocation("/calendar"); setIsSearchOpen(false); }}>
              <Command className="mr-2 h-4 w-4" />
              <span>Calendar</span>
            </CommandItem>
            <CommandItem onSelect={() => { setLocation("/analytics"); setIsSearchOpen(false); }}>
              <BarChart3 className="mr-2 h-4 w-4" />
              <span>Analytics</span>
            </CommandItem>
            <CommandItem onSelect={() => { setLocation("/collaboration"); setIsSearchOpen(false); }}>
              <Users className="mr-2 h-4 w-4" />
              <span>Collaboration</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </nav>
  );
}