import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Briefcase, 
  Users, 
  Film, 
  MessageCircle, 
  User, 
  Command,
  BarChart3,
  Search,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  userRole?: "actor" | "crew" | "producer";
  userName?: string;
}

export default function MobileMenu({ 
  isOpen, 
  onClose,
  isAuthenticated,
  userRole = "actor",
  userName = "John Doe"
}: MobileMenuProps) {
  const [, setLocation] = useLocation();
  const { logout } = useAuth();
  
  const roleColor = {
    actor: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    crew: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    producer: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
  };

  const menuItems = [
    { label: "Dashboard", icon: Home, path: "/dashboard" },
    { label: "Jobs", icon: Briefcase, path: "/jobs" },
    { label: "Talent", icon: Users, path: "/talent" },
    { label: "Projects", icon: Film, path: "/projects" },
    { label: "Messages", icon: MessageCircle, path: "/messages" },
    { label: "Profile", icon: User, path: "/profile" },
    { label: "Calendar", icon: Command, path: "/calendar" },
    { label: "Analytics", icon: BarChart3, path: "/analytics" },
    { label: "Collaboration", icon: Users, path: "/collaboration" },
  ];

  if (!isOpen) return null;

  return (
    <div className="md:hidden fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Menu Panel */}
      <div className="fixed top-0 right-0 bottom-0 w-4/5 max-w-sm bg-background border-l shadow-lg flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold">NC</span>
            </div>
            {isAuthenticated && (
              <div>
                <div className="font-medium text-sm">{userName}</div>
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${roleColor[userRole]}`}
                >
                  {userRole}
                </Badge>
              </div>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {isAuthenticated ? (
              <>
                {menuItems.map((item) => (
                  <Button
                    key={item.path}
                    variant="ghost"
                    className="w-full justify-start h-12"
                    onClick={() => {
                      setLocation(item.path);
                      onClose();
                    }}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </Button>
                ))}
                
                <div className="pt-4">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => {
                      // Open search dialog
                      onClose();
                    }}
                  >
                    <Search className="w-5 h-5 mr-3" />
                    Search...
                  </Button>
                </div>
                
                <div className="pt-4 border-t">
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-12 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      logout();
                      setLocation("/");
                      onClose();
                    }}
                  >
                    <X className="w-5 h-5 mr-3" />
                    Log Out
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-12"
                  onClick={() => {
                    setLocation("/login");
                    onClose();
                  }}
                >
                  <User className="w-5 h-5 mr-3" />
                  Log In
                </Button>
                <Button
                  variant="default"
                  className="w-full h-12"
                  onClick={() => {
                    setLocation("/register");
                    onClose();
                  }}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t text-center text-xs text-muted-foreground">
          © 2024 NollyCrew
        </div>
      </div>
    </div>
  );
}