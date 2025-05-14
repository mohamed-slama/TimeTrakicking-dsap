import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import { Clock, BarChart3, Building, Folder, Users, Home, LogOut } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import React from "react";

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const [location] = useLocation();
  
  // Fetch current user
  const { data: currentUser } = useQuery<User>({
    queryKey: ['/api/users/1'], // For demo purposes, we're using user with ID 1
  });

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Time Entries', href: '/time-entries', icon: Clock },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Clients', href: '/clients', icon: Building },
    { name: 'Projects', href: '/projects', icon: Folder },
    { name: 'Team', href: '/team', icon: Users },
  ];

  // Check if currentUser exists and has the required properties
  const userProfile = currentUser ? (
    <div className="pt-6 mt-6 border-t border-gray-700">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <img 
            className="h-8 w-8 rounded-full" 
            src={currentUser.avatarUrl || "https://via.placeholder.com/40"} 
            alt={`${currentUser.fullName}'s profile`} 
          />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-white">{currentUser.fullName}</p>
          <p className="text-xs font-medium text-gray-400">{currentUser.role}</p>
        </div>
      </div>
      <div className="mt-4">
        <div
          className="flex items-center px-4 py-2 text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors cursor-pointer"
          onClick={() => {
            // Handle sign out logic
          }}
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span>Sign out</span>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className={cn("flex-col h-full bg-gray-800", className)}>
      <div className="flex items-center justify-center h-16 px-4 bg-gray-900">
        <div className="flex items-center">
          <Clock className="text-blue-500 h-6 w-6 mr-2" />
          <span className="text-white font-semibold text-lg">TimeTrack Pro</span>
        </div>
      </div>
      
      <div className="flex flex-col flex-grow px-4 py-4 overflow-y-auto">
        <div className="flex flex-col space-y-6">
          <nav className="flex-1 space-y-2">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    "flex items-center px-4 py-2 rounded-md transition-colors cursor-pointer",
                    location === item.href
                      ? "text-white bg-gray-700"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  )}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <span>{item.name}</span>
                </div>
              </Link>
            ))}
          </nav>
        </div>
        
        {userProfile}
      </div>
    </div>
  );
};

export default Sidebar;