import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials } from "@/lib/utils";

interface TeamMember {
  id: number;
  fullName: string;
  role: string;
  avatarUrl?: string;
  hours: number;
  target: number;
}

interface TeamWorkloadProps {
  members: TeamMember[];
  isLoading?: boolean;
}

const TeamWorkload = ({ members, isLoading = false }: TeamWorkloadProps) => {
  if (isLoading) {
    return (
      <Card className="bg-white rounded-lg shadow">
        <CardHeader className="px-5 py-4 border-b border-gray-200">
          <CardTitle className="text-lg font-medium text-gray-900">Team Workload</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-lg shadow">
      <CardHeader className="px-5 py-4 border-b border-gray-200">
        <CardTitle className="text-lg font-medium text-gray-900">Team Workload</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <div className="space-y-4">
          {members.map((member) => {
            const percentage = (member.hours / member.target) * 100;
            const isOvertime = percentage > 100;
            
            return (
              <div key={member.id} className="flex items-center">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={member.avatarUrl} alt={member.fullName} />
                  <AvatarFallback>{getInitials(member.fullName)}</AvatarFallback>
                </Avatar>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{member.fullName}</p>
                      <p className="text-xs text-gray-500">{member.role}</p>
                    </div>
                    <div className={`text-sm font-medium ${isOvertime ? 'text-red-600' : 'text-gray-900'}`}>
                      {member.hours} / {member.target} hrs
                    </div>
                  </div>
                  <Progress
                    value={Math.min(percentage, 100)}
                    className="h-2 bg-gray-200"
                    indicatorClassName={isOvertime ? "bg-red-500" : "bg-blue-500"}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamWorkload;
