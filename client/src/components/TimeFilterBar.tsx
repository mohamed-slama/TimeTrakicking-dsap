import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { User } from "@shared/schema";

interface TimeFilterBarProps {
  onFilterChange: (filters: {
    period: string;
    startDate: string;
    endDate: string;
    userId?: number;
  }) => void;
}

const TimeFilterBar = ({ onFilterChange }: TimeFilterBarProps) => {
  const [activePeriod, setActivePeriod] = useState<string>("thisWeek");
  const [startDate, setStartDate] = useState<string>(format(startOfWeek(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState<string>(format(endOfWeek(new Date()), 'yyyy-MM-dd'));
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>(undefined);

  // Fetch team members for dropdown
  const { data: users } = useQuery({
    queryKey: ['/api/users'],
  });

  // Handle period button clicks
  const handlePeriodClick = (period: string) => {
    setActivePeriod(period);
    
    let newStartDate, newEndDate;
    const today = new Date();
    
    switch (period) {
      case "thisWeek":
        newStartDate = startOfWeek(today);
        newEndDate = endOfWeek(today);
        break;
      case "lastWeek":
        const lastWeekStart = subDays(startOfWeek(today), 7);
        const lastWeekEnd = subDays(endOfWeek(today), 7);
        newStartDate = lastWeekStart;
        newEndDate = lastWeekEnd;
        break;
      case "thisMonth":
        newStartDate = startOfMonth(today);
        newEndDate = endOfMonth(today);
        break;
      default:
        newStartDate = startOfWeek(today);
        newEndDate = endOfWeek(today);
    }
    
    setStartDate(format(newStartDate, 'yyyy-MM-dd'));
    setEndDate(format(newEndDate, 'yyyy-MM-dd'));
  };

  // Handle date range inputs
  const handleDateChange = (isStart: boolean, value: string) => {
    if (isStart) {
      setStartDate(value);
      if (new Date(value) > new Date(endDate)) {
        setEndDate(value);
      }
    } else {
      setEndDate(value);
      if (new Date(value) < new Date(startDate)) {
        setStartDate(value);
      }
    }
    setActivePeriod("custom");
  };

  // Handle team member selection
  const handleUserChange = (value: string) => {
    setSelectedUserId(value === "all" ? undefined : parseInt(value));
  };

  // Update filters when inputs change
  useEffect(() => {
    onFilterChange({
      period: activePeriod,
      startDate,
      endDate,
      userId: selectedUserId,
    });
  }, [activePeriod, startDate, endDate, selectedUserId, onFilterChange]);

  return (
    <div className="mb-6 mt-6 bg-white rounded-lg shadow p-4">
      <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
        <div>
          <div className="flex space-x-2">
            <Button
              variant={activePeriod === "thisWeek" ? "default" : "outline"}
              className={activePeriod === "thisWeek" ? "bg-blue-500 text-white hover:bg-blue-600" : ""}
              onClick={() => handlePeriodClick("thisWeek")}
            >
              This Week
            </Button>
            <Button
              variant={activePeriod === "lastWeek" ? "default" : "outline"}
              className={activePeriod === "lastWeek" ? "bg-blue-500 text-white hover:bg-blue-600" : ""}
              onClick={() => handlePeriodClick("lastWeek")}
            >
              Last Week
            </Button>
            <Button
              variant={activePeriod === "thisMonth" ? "default" : "outline"}
              className={activePeriod === "thisMonth" ? "bg-blue-500 text-white hover:bg-blue-600" : ""}
              onClick={() => handlePeriodClick("thisMonth")}
            >
              This Month
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select onValueChange={handleUserChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Team Members" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Team Members</SelectItem>
              {users?.map(user => (
                <SelectItem key={user.id} value={user.id.toString()}>
                  {user.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex items-center space-x-2">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => handleDateChange(true, e.target.value)}
              className="w-auto"
            />
            <span className="text-gray-500">to</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => handleDateChange(false, e.target.value)}
              className="w-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeFilterBar;
