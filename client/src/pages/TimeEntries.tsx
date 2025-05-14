import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import TimeFilterBar from "@/components/TimeFilterBar";
import TimeEntryModal from "@/components/TimeEntryModal";
import RecentTimeEntries from "@/components/RecentTimeEntries";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { startOfWeek, endOfWeek } from "date-fns";

const TimeEntries = () => {
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
  const { data: timeEntries = [], isLoading: isLoadingTimeEntries } = useQuery<any[]>({
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
  const { data: users = [], isLoading: isLoadingUsers } = useQuery<any[]>({
    queryKey: ['/api/users'],
  });
  
  const { data: clients = [], isLoading: isLoadingClients } = useQuery<any[]>({
    queryKey: ['/api/clients'],
  });
  
  const { data: projects = [], isLoading: isLoadingProjects } = useQuery<any[]>({
    queryKey: ['/api/projects'],
  });
  
  // Prepare enriched time entries with user, client, and project details
  const enrichedTimeEntries = timeEntries.map((entry: any) => ({
    ...entry,
    user: users.find((user: any) => user.id === entry.userId),
    client: clients.find((client: any) => client.id === entry.clientId),
    project: projects.find((project: any) => project.id === entry.projectId),
  }));
  
  // Delete time entry mutation
  const deleteTimeEntryMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest('DELETE', `/api/time-entries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/time-entries'] });
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
  
  const isLoading = isLoadingTimeEntries || isLoadingUsers || isLoadingClients || isLoadingProjects;
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Time Entries</h1>
          <p className="mt-1 text-sm text-gray-500">View and manage your team's time entries</p>
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
        
        {enrichedTimeEntries.length === 0 && !isLoading ? (
          <Card className="bg-white rounded-lg shadow mb-6 flex items-center justify-center h-60">
            <CardContent className="text-center p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No time entries found</h3>
              <p className="text-gray-500 mb-4">Create your first time entry to get started tracking your time.</p>
              <Button 
                className="bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => setIsTimeEntryModalOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" /> New Time Entry
              </Button>
            </CardContent>
          </Card>
        ) : (
          <RecentTimeEntries 
            entries={enrichedTimeEntries.slice((currentPage - 1) * 10, currentPage * 10)}
            totalEntries={enrichedTimeEntries.length}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onEdit={handleEditTimeEntry}
            onDelete={handleDeleteTimeEntry}
            isLoading={isLoading}
          />
        )}
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

export default TimeEntries;
