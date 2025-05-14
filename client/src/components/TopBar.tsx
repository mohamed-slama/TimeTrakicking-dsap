import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, Bell, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopBarProps {
  onMenuClick: () => void;
  className?: string;
}

const TopBar = ({ onMenuClick, className }: TopBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className={cn("relative z-10 flex-shrink-0 flex h-16 bg-white shadow", className)}>
      <Button
        type="button"
        variant="ghost"
        className="px-4 border-r border-gray-200 text-gray-500 md:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>
      
      <div className="flex-1 px-4 flex justify-between">
        <div className="flex-1 flex items-center">
          <div className="max-w-xl w-full">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="search"
                className="block w-full pl-10 pr-3 py-2"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <div className="ml-4 flex items-center md:ml-6">
          <Button
            variant="ghost"
            className="p-1 ml-3 text-gray-400 rounded-full hover:text-gray-500"
          >
            <Bell className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            className="md:hidden p-2 ml-3 text-gray-400 rounded-full hover:text-gray-500"
          >
            <img
              className="h-8 w-8 rounded-full"
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              alt="User profile picture"
            />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
