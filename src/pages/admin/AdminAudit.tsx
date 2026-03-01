import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

const AdminAudit = () => {
  const { data: logs, isLoading, error } = useQuery({
    queryKey: ['adminAuditLogs'],
    queryFn: () => apiService.getAdminAuditLogs(0, 100), // Fetching last 100 logs
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground">Review administrative actions and system events.</p>
      </div>

      <div className="border rounded-md bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="w-[180px]">Date & Time</TableHead>
              <TableHead className="w-[200px]">Admin User</TableHead>
              <TableHead className="w-[150px]">Action</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-64" /></TableCell>
                </TableRow>
              ))
            ) : error ? (
               <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-red-500">
                  Failed to load audit logs. Ensure you have admin privileges.
                </TableCell>
              </TableRow>
            ) : logs?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No audit logs found.
                </TableCell>
              </TableRow>
            ) : (
              logs?.map((log: any) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm whitespace-nowrap text-muted-foreground">
                    {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'Unknown'}
                  </TableCell>
                  <TableCell className="font-medium">{log.adminUser}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground">
                      {log.action}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">{log.details}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminAudit;
