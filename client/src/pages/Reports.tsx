import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Download, FileText } from "lucide-react";
import { getInitials } from "@/lib/utils";
import TimeFilterBar from "@/components/TimeFilterBar";
import { format, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const Reports = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [reportType, setReportType] = useState("monthly");
  const [filters, setFilters] = useState({
    period: "thisMonth",
    startDate: startOfMonth(new Date()).toISOString().split('T')[0],
    endDate: endOfMonth(new Date()).toISOString().split('T')[0],
    userId: undefined as number | undefined,
  });

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

  // Fetch report summary data
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

  // Fetch users
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['/api/users'],
  });

  // Fetch clients
  const { data: clients, isLoading: isLoadingClients } = useQuery({
    queryKey: ['/api/clients'],
  });

  // Fetch projects
  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ['/api/projects'],
  });

  const isLoading = isLoadingTimeEntries || isLoadingReportSummary || isLoadingUsers || isLoadingClients || isLoadingProjects;

  // Handle filter changes
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  // Handle report type change
  const handleReportTypeChange = (value: string) => {
    setReportType(value);
    
    // Adjust date range based on report type
    const today = new Date();
    let startDate, endDate;
    
    switch (value) {
      case "weekly":
        startDate = startOfWeek(today);
        endDate = endOfWeek(today);
        break;
      case "monthly":
        startDate = startOfMonth(today);
        endDate = endOfMonth(today);
        break;
      case "quarterly":
        const quarter = Math.floor(today.getMonth() / 3);
        startDate = new Date(today.getFullYear(), quarter * 3, 1);
        endDate = new Date(today.getFullYear(), quarter * 3 + 3, 0);
        break;
      case "yearly":
        startDate = startOfYear(today);
        endDate = endOfYear(today);
        break;
      default:
        startDate = startOfMonth(today);
        endDate = endOfMonth(today);
    }
    
    setFilters({
      ...filters,
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
    });
  };

  // Prepare data for charts
  const prepareChartData = () => {
    // By user
    const userChartData = users?.map(user => ({
      name: user.fullName,
      hours: reportSummary?.byUser?.[user.id] || 0,
      color: getRandomColor(user.id),
    })).filter(item => item.hours > 0).sort((a, b) => b.hours - a.hours) || [];

    // By client
    const clientChartData = clients?.map(client => ({
      name: client.name,
      hours: reportSummary?.byClient?.[client.id] || 0,
      color: getRandomColor(client.id),
    })).filter(item => item.hours > 0).sort((a, b) => b.hours - a.hours) || [];
    
    // By project
    const projectChartData = projects?.map(project => ({
      name: project.name,
      hours: reportSummary?.byProject?.[project.id] || 0,
      color: getRandomColor(project.id),
    })).filter(item => item.hours > 0).sort((a, b) => b.hours - a.hours) || [];

    return {
      userChartData,
      clientChartData,
      projectChartData,
    };
  };

  // Helper to get consistent colors
  const getRandomColor = (id: number) => {
    const colors = [
      "rgba(59, 130, 246, 0.7)",  // blue
      "rgba(16, 185, 129, 0.7)",  // green
      "rgba(139, 92, 246, 0.7)",  // purple
      "rgba(249, 115, 22, 0.7)",  // orange
      "rgba(236, 72, 153, 0.7)",  // pink
      "rgba(14, 165, 233, 0.7)",  // sky
      "rgba(168, 85, 247, 0.7)",  // violet
      "rgba(234, 88, 12, 0.7)",   // amber
      "rgba(22, 163, 74, 0.7)",   // emerald
      "rgba(6, 182, 212, 0.7)",   // cyan
    ];
    return colors[id % colors.length];
  };

  const chartData = prepareChartData();

  // Helper to export data as CSV
  const exportCSV = () => {
    if (!timeEntries || timeEntries.length === 0) return;
    
    // Add headers
    let csv = "User,Client,Project,Date,Hours,Description\n";
    
    // Add data
    timeEntries.forEach(entry => {
      const user = users?.find(u => u.id === entry.userId)?.fullName || '';
      const client = clients?.find(c => c.id === entry.clientId)?.name || '';
      const project = projects?.find(p => p.id === entry.projectId)?.name || '';
      const date = format(new Date(entry.date), 'yyyy-MM-dd');
      const hours = entry.hours.toString();
      const description = entry.description ? `"${entry.description.replace(/"/g, '""')}"` : '';
      
      csv += `${user},${client},${project},${date},${hours},${description}\n`;
    });
    
    // Create download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `time-report-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
          <p className="mt-1 text-sm text-gray-500">Analyze time data across team members, clients, and projects</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex space-x-2">
          <Select
            value={reportType}
            onValueChange={handleReportTypeChange}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Report type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            className="flex items-center space-x-2"
            onClick={exportCSV}
            disabled={isLoading || !timeEntries || timeEntries.length === 0}
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <TimeFilterBar onFilterChange={handleFilterChange} />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="by-user">By User</TabsTrigger>
            <TabsTrigger value="by-client">By Client</TabsTrigger>
            <TabsTrigger value="by-project">By Project</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Time Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-lg bg-blue-50 p-4">
                      <h3 className="text-sm font-medium text-blue-800">Total Hours</h3>
                      <p className="mt-2 text-3xl font-semibold text-blue-900">
                        {reportSummary?.totalHours || 0}
                      </p>
                    </div>
                    <div className="rounded-lg bg-green-50 p-4">
                      <h3 className="text-sm font-medium text-green-800">Active Clients</h3>
                      <p className="mt-2 text-3xl font-semibold text-green-900">
                        {Object.keys(reportSummary?.byClient || {}).length}
                      </p>
                    </div>
                    <div className="rounded-lg bg-purple-50 p-4">
                      <h3 className="text-sm font-medium text-purple-800">Active Projects</h3>
                      <p className="mt-2 text-3xl font-semibold text-purple-900">
                        {Object.keys(reportSummary?.byProject || {}).length}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Hours by User</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-72 animate-pulse bg-gray-100 rounded-md"></div>
                  ) : (
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={chartData.userChartData}
                          layout="vertical"
                          margin={{ top: 10, right: 30, left: 90, bottom: 10 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            width={80}
                            tick={{ fontSize: 12 }}
                          />
                          <Tooltip />
                          <Bar dataKey="hours" nameKey="name">
                            {chartData.userChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Hours by Client</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-72 animate-pulse bg-gray-100 rounded-md"></div>
                  ) : (
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData.clientChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="hours"
                            nameKey="name"
                          >
                            {chartData.clientChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Time Entries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Hours</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        Array(5).fill(0).map((_, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <div className="flex items-center">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <Skeleton className="h-4 w-24 ml-2" />
                              </div>
                            </TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                          </TableRow>
                        ))
                      ) : !timeEntries || timeEntries.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            <div className="flex flex-col items-center justify-center text-gray-500">
                              <FileText className="h-10 w-10 mb-2" />
                              <p>No time entries found for the selected period</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        timeEntries.slice(0, 10).map((entry) => {
                          const user = users?.find((u) => u.id === entry.userId);
                          const client = clients?.find((c) => c.id === entry.clientId);
                          const project = projects?.find((p) => p.id === entry.projectId);
                          
                          return (
                            <TableRow key={entry.id}>
                              <TableCell>
                                <div className="flex items-center">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={user?.avatarUrl} alt={user?.fullName} />
                                    <AvatarFallback>{user ? getInitials(user.fullName) : "??"}</AvatarFallback>
                                  </Avatar>
                                  <span className="ml-2 text-sm font-medium text-gray-900">{user?.fullName}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm text-gray-900">{client?.name}</TableCell>
                              <TableCell className="text-sm text-gray-900">{project?.name}</TableCell>
                              <TableCell className="text-sm text-gray-900">{format(new Date(entry.date), 'MMM d, yyyy')}</TableCell>
                              <TableCell className="text-sm text-gray-900">{entry.hours.toString()}</TableCell>
                              <TableCell className="text-sm text-gray-900 max-w-xs truncate">{entry.description}</TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="by-user">
            <Card>
              <CardHeader>
                <CardTitle>Hours by User</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-96 animate-pulse bg-gray-100 rounded-md"></div>
                ) : (
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData.userChartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45} 
                          textAnchor="end"
                          height={70}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="hours" name="Hours" fill="#3B82F6">
                          {chartData.userChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>User Time Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="text-right">Total Hours</TableHead>
                        <TableHead className="text-right">Projects</TableHead>
                        <TableHead className="text-right">Avg Hours/Day</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        Array(5).fill(0).map((_, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <div className="flex items-center">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <Skeleton className="h-4 w-24 ml-2" />
                              </div>
                            </TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                          </TableRow>
                        ))
                      ) : users?.filter(user => 
                        reportSummary?.byUser?.[user.id] !== undefined
                      ).map((user) => {
                        const userHours = reportSummary?.byUser?.[user.id] || 0;
                        const userProjects = timeEntries?.filter(entry => entry.userId === user.id)
                          .map(entry => entry.projectId)
                          .filter((value, index, self) => self.indexOf(value) === index).length || 0;
                            
                        // Calculate avg hours per day - assuming entries span over days in the filter period
                        const start = new Date(filters.startDate);
                        const end = new Date(filters.endDate);
                        const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
                        const avgHoursPerDay = userHours / days;
                            
                        return (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                                  <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
                                </Avatar>
                                <span className="ml-2 text-sm font-medium text-gray-900">{user.fullName}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-gray-900">{user.role}</TableCell>
                            <TableCell className="text-sm text-gray-900 text-right">{userHours.toFixed(1)}</TableCell>
                            <TableCell className="text-sm text-gray-900 text-right">{userProjects}</TableCell>
                            <TableCell className="text-sm text-gray-900 text-right">{avgHoursPerDay.toFixed(1)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="by-client">
            <Card>
              <CardHeader>
                <CardTitle>Hours by Client</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-96 animate-pulse bg-gray-100 rounded-md"></div>
                ) : (
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData.clientChartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45} 
                          textAnchor="end"
                          height={70}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="hours" name="Hours" fill="#10B981">
                          {chartData.clientChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Client Time Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead className="text-right">Total Hours</TableHead>
                        <TableHead className="text-right">Projects</TableHead>
                        <TableHead className="text-right">Team Members</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        Array(5).fill(0).map((_, index) => (
                          <TableRow key={index}>
                            <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                          </TableRow>
                        ))
                      ) : clients?.filter(client => 
                        reportSummary?.byClient?.[client.id] !== undefined
                      ).map((client) => {
                        const clientHours = reportSummary?.byClient?.[client.id] || 0;
                        const clientProjects = timeEntries?.filter(entry => entry.clientId === client.id)
                          .map(entry => entry.projectId)
                          .filter((value, index, self) => self.indexOf(value) === index).length || 0;
                        const clientUsers = timeEntries?.filter(entry => entry.clientId === client.id)
                          .map(entry => entry.userId)
                          .filter((value, index, self) => self.indexOf(value) === index).length || 0;
                            
                        return (
                          <TableRow key={client.id}>
                            <TableCell className="text-sm font-medium text-gray-900">{client.name}</TableCell>
                            <TableCell className="text-sm text-gray-900">{client.contactName || '-'}</TableCell>
                            <TableCell className="text-sm text-gray-900 text-right">{clientHours.toFixed(1)}</TableCell>
                            <TableCell className="text-sm text-gray-900 text-right">{clientProjects}</TableCell>
                            <TableCell className="text-sm text-gray-900 text-right">{clientUsers}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="by-project">
            <Card>
              <CardHeader>
                <CardTitle>Hours by Project</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-96 animate-pulse bg-gray-100 rounded-md"></div>
                ) : (
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData.projectChartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45} 
                          textAnchor="end"
                          height={70}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="hours" name="Hours" fill="#8B5CF6">
                          {chartData.projectChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Project Time Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Project</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead className="text-right">Total Hours</TableHead>
                        <TableHead className="text-right">Team Members</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        Array(5).fill(0).map((_, index) => (
                          <TableRow key={index}>
                            <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                            <TableCell className="text-center"><Skeleton className="h-4 w-16 mx-auto" /></TableCell>
                          </TableRow>
                        ))
                      ) : projects?.filter(project => 
                        reportSummary?.byProject?.[project.id] !== undefined
                      ).map((project) => {
                        const projectHours = reportSummary?.byProject?.[project.id] || 0;
                        const projectClient = clients?.find(c => c.id === project.clientId);
                        const projectUsers = timeEntries?.filter(entry => entry.projectId === project.id)
                          .map(entry => entry.userId)
                          .filter((value, index, self) => self.indexOf(value) === index).length || 0;
                            
                        return (
                          <TableRow key={project.id}>
                            <TableCell className="text-sm font-medium text-gray-900">{project.name}</TableCell>
                            <TableCell className="text-sm text-gray-900">{projectClient?.name || '-'}</TableCell>
                            <TableCell className="text-sm text-gray-900 text-right">{projectHours.toFixed(1)}</TableCell>
                            <TableCell className="text-sm text-gray-900 text-right">{projectUsers}</TableCell>
                            <TableCell className="text-center">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                project.isActive === 1 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {project.isActive === 1 ? 'Active' : 'Inactive'}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Reports;
