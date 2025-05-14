import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - hidden on mobile unless toggled */}
      <div 
        className={cn(
          "fixed inset-0 z-40 md:relative md:z-auto transition-all duration-300 ease-in-out",
          isSidebarOpen ? "block" : "hidden md:block"
        )}
      >
        <div 
          className="absolute inset-0 bg-gray-600 bg-opacity-75 md:hidden"
          onClick={toggleSidebar}
        ></div>
        <div className="relative z-10 w-64 h-full">
          <Sidebar />
        </div>
      </div>

      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        <TopBar onMenuClick={toggleSidebar} />
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
