import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, CheckSquare, Briefcase } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const AdminDashboard = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => apiService.getAdminStats(),
  });

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-md">
        Error loading dashboard statistics. Ensure you have admin privileges.
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      description: 'Registered accounts',
    },
    {
      title: 'Tests Taken',
      value: stats?.totalTestsTaken || 0,
      icon: CheckSquare,
      description: 'Completed assessments',
    },
    {
      title: 'Reports Generated',
      value: stats?.totalReportsGenerated || 0,
      icon: FileText,
      description: 'Total PDFs generated',
    },
    {
      title: 'Active Careers',
      value: stats?.totalCareers || 0,
      icon: Briefcase,
      description: 'In the database',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome to the AcadSpace Pathfinder administration panel.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-[60px] mb-1" />
                  <Skeleton className="h-3 w-[120px]" />
                </CardContent>
              </Card>
            ))
          : statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                  </CardContent>
                </Card>
              );
            })}
      </div>

      {/* Charts section can be added here later */}
    </div>
  );
};

export default AdminDashboard;
