import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { timeEntryFormSchema, TimeEntry, Client, Project } from "@shared/schema";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ClockIcon } from "lucide-react";
import { format } from 'date-fns';

interface TimeEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entryId?: number;
  userId: number;
}

const currentYear = new Date().getFullYear();
const years = [currentYear - 1, currentYear, currentYear + 1];
const months = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: new Date(0, i).toLocaleString('default', { month: 'long' })
}));
const weeks = Array.from({ length: 53 }, (_, i) => ({
  value: i + 1,
  label: `Week ${i + 1}`
}));

const TimeEntryModal = ({ isOpen, onClose, entryId, userId }: TimeEntryModalProps) => {
  const { toast } = useToast();
  const isEditMode = !!entryId;
  
  // Fetch clients for dropdown
  const { data: clients } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
    enabled: isOpen,
  });
  
  // Fetch projects for dropdown
  const { data: projects } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
    enabled: isOpen,
  });
  
  // Fetch time entry data if in edit mode
  const { data: timeEntry, isLoading: isLoadingTimeEntry } = useQuery<TimeEntry>({
    queryKey: ['/api/time-entries', entryId],
    enabled: isOpen && isEditMode,
  });
  
  const form = useForm<z.infer<typeof timeEntryFormSchema>>({
    resolver: zodResolver(timeEntryFormSchema),
    defaultValues: {
      userId: userId,
      clientId: undefined,
      projectId: undefined,
      year: currentYear,
      month: new Date().getMonth() + 1,
      week: Math.ceil((new Date().getDate() + new Date(currentYear, new Date().getMonth(), 0).getDay()) / 7),
      date: new Date(),
      hours: undefined,
      description: "",
    },
  });
  
  // Update form values when editing an existing entry
  useEffect(() => {
    if (timeEntry && isEditMode) {
      form.reset({
        userId: timeEntry.userId,
        clientId: timeEntry.clientId,
        projectId: timeEntry.projectId,
        year: timeEntry.year,
        month: timeEntry.month,
        week: timeEntry.week,
        date: timeEntry.date ? new Date(timeEntry.date) : new Date(),
        hours: timeEntry.hours ? parseFloat(timeEntry.hours.toString()) : 0,
        description: timeEntry.description || "",
      });
    }
  }, [timeEntry, isEditMode, form]);

  // Update projects based on selected client
  const [filteredProjects, setFilteredProjects] = useState(projects);
  
  const clientId = form.watch('clientId');
  useEffect(() => {
    if (clientId && projects) {
      setFilteredProjects(projects.filter(project => project.clientId === clientId));
    } else {
      setFilteredProjects(projects);
    }
  }, [clientId, projects]);
  
  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: z.infer<typeof timeEntryFormSchema>) => {
      return apiRequest('POST', '/api/time-entries', data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/api/time-entries'] });
      toast({
        title: "Success",
        description: "Time entry created successfully",
      });
      onClose();
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create time entry",
        variant: "destructive",
      });
    },
  });
  
  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: z.infer<typeof timeEntryFormSchema>) => {
      return apiRequest('PUT', `/api/time-entries/${entryId}`, data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/api/time-entries'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/time-entries', entryId] });
      toast({
        title: "Success",
        description: "Time entry updated successfully",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update time entry",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: z.infer<typeof timeEntryFormSchema>) => {
    if (isEditMode) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="bg-blue-100 p-2 rounded-full">
              <ClockIcon className="h-5 w-5 text-blue-600" />
            </div>
            <DialogTitle>{isEditMode ? 'Edit Time Entry' : 'New Time Entry'}</DialogTitle>
          </div>
          <DialogDescription>
            Record your work hours by filling out the form below.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <Select 
                    value={field.value?.toString()} 
                    onValueChange={(value) => field.onChange(parseInt(value))}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients?.map(client => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="projectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project</FormLabel>
                  <Select 
                    value={field.value?.toString()} 
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    disabled={!clientId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a project" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredProjects?.map(project => (
                        <SelectItem key={project.id} value={project.id.toString()}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <Select 
                      value={field.value?.toString()} 
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {years.map(year => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="month"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Month</FormLabel>
                    <Select 
                      value={field.value?.toString()} 
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {months.map(month => (
                          <SelectItem key={month.value} value={month.value.toString()}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="week"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Week</FormLabel>
                    <Select 
                      value={field.value?.toString()} 
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Week" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {weeks.map(week => (
                          <SelectItem key={week.value} value={week.value.toString()}>
                            {week.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      value={field.value ? format(new Date(field.value), 'yyyy-MM-dd') : ''} 
                      onChange={(e) => {
                        const date = e.target.value ? new Date(e.target.value) : null;
                        if (date) {
                          field.onChange(date);
                          // Optionally update year, month, week based on selected date
                          form.setValue('year', date.getFullYear());
                          form.setValue('month', date.getMonth() + 1);
                          // Calculate week
                          const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
                          const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
                          const week = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
                          form.setValue('week', week);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="hours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hours</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.5" 
                      min="0.5" 
                      max="24" 
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="What did you work on?" 
                      rows={3} 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="mt-2 sm:mt-0"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="ml-2 bg-blue-600 hover:bg-blue-700"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending 
                  ? 'Saving...' 
                  : isEditMode ? 'Update Entry' : 'Save Entry'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TimeEntryModal;
