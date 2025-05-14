import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import TimeFilterBar from "@/components/TimeFilterBar";
import QuickStats from "@/components/QuickStats";
import ChartSection from "@/components/ChartSection";
import RecentTimeEntries from "@/components/RecentTimeEntries";
import TeamWorkload from "@/components/TeamWorkload";
import TimeEntryModal from "@/components/TimeEntryModal";
import { useToast } from "@/hooks/use-toast";
import { subDays, startOfWeek, endOfWeek } from "date-fns";

const Dashboard = () => {
  const { toast } = useToast();
  const [isTimeEntryModalOpen, setIsTimeEntryModalOpen] = useState(false);
  const [selectedTimeEntryId, setSelectedTimeEntryId] = useState<number | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    period: "thisWeek",
    startDate: startOfWeek(new Date()).toISOString().split('T')[0],
    endDate: endOfWeek(new Date()).toISOString().split('T')[0],
    userId: undefined as number | undefined,
  });
  
  // For demo purposes, we're using user with ID 1
  const currentUserId = 1;
  
  // Fetch time entries with filters
  const { data: timeEntries, isLoading: isLoadingTimeEntries } = useQuery({
    queryKey: ['/api/time-entries', filters],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.userId) queryParams.append('userId', filters.userId.toString());
      
      const response = await fetch(`/api/time-entries?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch time entries');
      return response.json();
    },
  });
  
  // Fetch users, clients, and projects to augment the time entry data
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['/api/users'],
  });
  
  const { data: clients, isLoading: isLoadingClients } = useQuery({
    queryKey: ['/api/clients'],
  });
  
  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ['/api/projects'],
  });
  
  // Prepare enriched time entries with user, client, and project details
  const enrichedTimeEntries = timeEntries?.map(entry => ({
    ...entry,
    user: users?.find(user => user.id === entry.userId),
    client: clients?.find(client => client.id === entry.clientId),
    project: projects?.find(project => project.id === entry.projectId),
  })) || [];
  
  // Fetch report summary data for stats
  const { data: reportSummary, isLoading: isLoadingReportSummary } = useQuery({
    queryKey: ['/api/reports/summary', filters],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.userId) queryParams.append('userId', filters.userId.toString());
      
      const response = await fetch(`/api/reports/summary?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch report summary');
      return response.json();
    },
  });
  
  // Mock stats data when report summary is loading
  const statsData = {
    totalHours: reportSummary?.totalHours || 0,
    totalHoursChange: 12, // Mock data for demo
    activeProjects: projects?.filter(p => p.isActive).length || 0,
    activeProjectsChange: -2, // Mock data for demo
    overtimeHours: 12, // Mock data for demo
    overtimeHoursChange: 8, // Mock data for demo
    utilizationRate: 86, // Mock data for demo
    utilizationRateChange: 5, // Mock data for demo
  };
  
  // Prepare chart data
  const chartColors = [
    "rgba(59, 130, 246, 0.7)", // blue
    "rgba(16, 185, 129, 0.7)", // green
    "rgba(139, 92, 246, 0.7)", // purple
    "rgba(249, 115, 22, 0.7)", // orange
    "rgba(236, 72, 153, 0.7)", // pink
    "rgba(14, 165, 233, 0.7)", // sky
  ];
  
  // Project chart data
  const projectChartData = projects?.map((project, index) => ({
    name: project.name,
    hours: reportSummary?.byProject?.[project.id] || 0,
    color: chartColors[index % chartColors.length],
  })).filter(item => item.hours > 0).sort((a, b) => b.hours - a.hours).slice(0, 6) || [];
  
  // Client chart data
  const clientChartData = clients?.map((client, index) => ({
    name: client.name,
    hours: reportSummary?.byClient?.[client.id] || 0,
    color: chartColors[index % chartColors.length],
  })).filter(item => item.hours > 0).sort((a, b) => b.hours - a.hours).slice(0, 6) || [];
  
  // Mock team workload data
  const teamWorkloadData = users?.map(user => ({
    id: user.id,
    fullName: user.fullName,
    role: user.role,
    avatarUrl: user.avatarUrl,
    hours: reportSummary?.byUser?.[user.id] || 0,
    target: 40, // Assuming 40-hour work week
  })) || [];
  
  // Delete time entry mutation
  const deleteTimeEntryMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest('DELETE', `/api/time-entries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/time-entries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/reports/summary'] });
      toast({
        title: "Success",
        description: "Time entry deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete time entry",
        variant: "destructive",
      });
    },
  });
  
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  const handleEditTimeEntry = (id: number) => {
    setSelectedTimeEntryId(id);
    setIsTimeEntryModalOpen(true);
  };
  
  const handleDeleteTimeEntry = (id: number) => {
    deleteTimeEntryMutation.mutate(id);
  };
  
  const handleCloseTimeEntryModal = () => {
    setIsTimeEntryModalOpen(false);
    setSelectedTimeEntryId(undefined);
  };
  
  const isLoading = isLoadingTimeEntries || isLoadingUsers || isLoadingClients || 
                    isLoadingProjects || isLoadingReportSummary;
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Monitor your team's time tracking at a glance</p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <Button 
            className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white"
            onClick={() => setIsTimeEntryModalOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> New Time Entry
          </Button>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <TimeFilterBar onFilterChange={handleFilterChange} />
        
        <QuickStats data={statsData} isLoading={isLoading} />
        
        <ChartSection 
          data={{
            projectData: projectChartData,
            clientData: clientChartData,
          }} 
          isLoading={isLoading}
        />
        
        <RecentTimeEntries 
          entries={enrichedTimeEntries.slice((currentPage - 1) * 10, currentPage * 10)}
          totalEntries={enrichedTimeEntries.length}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onEdit={handleEditTimeEntry}
          onDelete={handleDeleteTimeEntry}
          isLoading={isLoading}
        />
        
        <TeamWorkload 
          members={teamWorkloadData}
          isLoading={isLoading}
        />
      </div>
      
      {isTimeEntryModalOpen && (
        <TimeEntryModal
          isOpen={isTimeEntryModalOpen}
          onClose={handleCloseTimeEntryModal}
          entryId={selectedTimeEntryId}
          userId={currentUserId}
        />
      )}
    </div>
  );
};

export default Dashboard;
