import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { TimeEntry, User, Client, Project } from "@shared/schema";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials } from "@/lib/utils";
import { Link } from "wouter";

interface RecentTimeEntriesProps {
  entries: (TimeEntry & {
    user?: User;
    client?: Client;
    project?: Project;
  })[];
  totalEntries: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
}

const RecentTimeEntries = ({
  entries,
  totalEntries,
  currentPage,
  onPageChange,
  onEdit,
  onDelete,
  isLoading = false,
}: RecentTimeEntriesProps) => {
  const pageSize = 10;
  const totalPages = Math.ceil(totalEntries / pageSize);
  
  const handleEdit = (id: number) => {
    onEdit(id);
  };
  
  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this time entry?")) {
      onDelete(id);
    }
  };
  
  if (isLoading) {
    return (
      <Card className="bg-white rounded-lg shadow mb-6">
        <CardHeader className="px-5 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-medium text-gray-900">Recent Time Entries</CardTitle>
            <Link href="/time-entries" className="text-blue-500 hover:text-blue-600 text-sm font-medium">
              View All Entries
            </Link>
          </div>
        </CardHeader>
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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(3)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="ml-4">
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-6 w-14 ml-auto" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="bg-white rounded-lg shadow mb-6">
      <CardHeader className="px-5 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium text-gray-900">Recent Time Entries</CardTitle>
          <Link href="/time-entries" className="text-blue-500 hover:text-blue-600 text-sm font-medium">
            View All Entries
          </Link>
        </div>
      </CardHeader>
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
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No time entries found
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => (
                <TableRow key={entry.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={entry.user?.avatarUrl} alt={entry.user?.fullName} />
                        <AvatarFallback>{entry.user ? getInitials(entry.user.fullName) : "??"}</AvatarFallback>
                      </Avatar>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{entry.user?.fullName}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-900">{entry.client?.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-900">{entry.project?.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-900">{format(new Date(entry.date), 'MMM d, yyyy')}</div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-900">{entry.hours.toString()}</TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-900 max-w-xs truncate">{entry.description}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-500 hover:text-blue-700"
                        onClick={() => handleEdit(entry.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(entry.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {totalPages > 1 && (
        <div className="px-5 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(currentPage + 1)}
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(currentPage * pageSize, totalEntries)}
                </span>{" "}
                of <span className="font-medium">{totalEntries}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <Button
                  variant="outline"
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md"
                  disabled={currentPage === 1}
                  onClick={() => onPageChange(currentPage - 1)}
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <Button
                    key={i}
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                      currentPage === i + 1
                        ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                    onClick={() => onPageChange(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md"
                  disabled={currentPage === totalPages}
                  onClick={() => onPageChange(currentPage + 1)}
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default RecentTimeEntries;
