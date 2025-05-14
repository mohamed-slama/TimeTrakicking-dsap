import { ArrowUp, ArrowDown, Clock, Folder, AlertCircle, PieChart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsData {
  totalHours: number;
  totalHoursChange: number;
  activeProjects: number;
  activeProjectsChange: number;
  overtimeHours: number;
  overtimeHoursChange: number;
  utilizationRate: number;
  utilizationRateChange: number;
}

interface QuickStatsProps {
  data: StatsData;
  isLoading?: boolean;
}

const QuickStats = ({ data, isLoading = false }: QuickStatsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-white">
            <CardContent className="p-5">
              <div className="h-24 flex items-center justify-center">
                <div className="animate-pulse w-full">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      name: "Total Hours This Week",
      value: data.totalHours,
      change: data.totalHoursChange,
      icon: Clock,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-500",
    },
    {
      name: "Active Projects",
      value: data.activeProjects,
      change: data.activeProjectsChange,
      icon: Folder,
      iconBg: "bg-green-100",
      iconColor: "text-green-500",
    },
    {
      name: "Overtime Hours",
      value: data.overtimeHours,
      change: data.overtimeHoursChange,
      icon: AlertCircle,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-500",
    },
    {
      name: "Utilization Rate",
      value: `${data.utilizationRate}%`,
      change: data.utilizationRateChange,
      icon: PieChart,
      iconBg: "bg-violet-100",
      iconColor: "text-violet-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
              <div className={cn("p-3 rounded-full", stat.iconBg)}>
                <stat.icon className={cn("text-xl", stat.iconColor)} />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <span
                  className={cn(
                    "flex items-center",
                    stat.change >= 0 ? "text-green-500" : "text-red-500"
                  )}
                >
                  {stat.change >= 0 ? (
                    <ArrowUp className="mr-1 h-3 w-3" />
                  ) : (
                    <ArrowDown className="mr-1 h-3 w-3" />
                  )}
                  {Math.abs(stat.change)}%
                </span>
                <span className="text-gray-500 ml-2">from last week</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default QuickStats;
