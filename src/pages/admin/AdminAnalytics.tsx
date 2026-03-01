import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Download, Search, Settings2, Check } from 'lucide-react';
import { exportToExcel } from '@/lib/excel-export';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

// VTable Imports
import { ListTable } from '@visactor/react-vtable';

const AdminAnalytics = () => {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState<number | 'all'>(50); 
  const [globalFilter, setGlobalFilter] = useState('');
  
  // Track which columns are currently frozen (by field name)
  const [frozenColumns, setFrozenColumns] = useState<string[]>(['studentID', 'studentName']);

  // Fetch paginated data from the backend
  const { data, isLoading, error } = useQuery({
    queryKey: ['adminAnalytics', pageIndex, pageSize],
    queryFn: () => {
      // If 'all', we pass a very large number
      const fetchSize = pageSize === 'all' ? 100000 : pageSize;
      return apiService.getAllReportsForAnalytics(pageIndex, fetchSize);
    },
  });

  // Extract reports and flatten vibeScores
  const reports = useMemo(() => {
    if (!data?.content) return [];
    return data.content.map((row: any) => ({
      ...row,
      vibeR: row.vibeScores?.R || '-',
      vibeI: row.vibeScores?.I || '-',
      vibeA: row.vibeScores?.A || '-',
      vibeS: row.vibeScores?.S || '-',
      vibeE: row.vibeScores?.E || '-',
      vibeC: row.vibeScores?.C || '-',
    }));
  }, [data]);

  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  // Base Column Definitions
  const baseColumns = useMemo(() => [
    { field: 'studentID', title: 'Student ID', width: 100, sort: true },
    { field: 'studentName', title: 'Name', width: 150, sort: true },
    { field: 'email', title: 'Email', width: 200, sort: true },
    { field: 'mobileNo', title: 'Mobile', width: 120 },
    { field: 'active', title: 'Active', width: 80, sort: true, format: (value: any) => value ? 'Yes' : 'No' },
    { field: 'fullName', title: 'Full Name', width: 150, sort: true },
    { field: 'parentName', title: 'Parent Name', width: 150, sort: true },
    { field: 'schoolName', title: 'School', width: 200, sort: true },
    { field: 'grade', title: 'Grade', width: 80, sort: true },
    { field: 'board', title: 'Board', width: 100, sort: true },
    { field: 'city', title: 'City', width: 120, sort: true },
    { field: 'state', title: 'State', width: 120, sort: true },
    { field: 'partner', title: 'Partner', width: 100, sort: true },
    { field: 'extracurriculars', title: 'Extracurriculars', width: 200 },
    { field: 'parentCareers', title: 'Parent Careers', width: 200 },
    { field: 'topBucket1', title: 'Career Bucket 1', width: 250, sort: true },
    { field: 'topBucket2', title: 'Career Bucket 2', width: 250, sort: true },
    { field: 'topBucket3', title: 'Career Bucket 3', width: 250, sort: true },
    { field: 'vibeR', title: 'Vibe R', width: 80, sort: true },
    { field: 'vibeI', title: 'Vibe I', width: 80, sort: true },
    { field: 'vibeA', title: 'Vibe A', width: 80, sort: true },
    { field: 'vibeS', title: 'Vibe S', width: 80, sort: true },
    { field: 'vibeE', title: 'Vibe E', width: 80, sort: true },
    { field: 'vibeC', title: 'Vibe C', width: 80, sort: true },
    { field: 'aiEnhanced', title: 'AI Enhanced', width: 100, sort: true, cellType: 'text', format: (value: any) => value ? 'Yes' : 'No' },
    { field: 'createdAt', title: 'Created At', width: 150, sort: true, format: (value: any) => value ? new Date(value).toLocaleString() : '' },
    { field: 'updatedAt', title: 'Updated At', width: 150, sort: true, format: (value: any) => value ? new Date(value).toLocaleString() : '' }
  ], []);

  // Reorder columns so frozen ones appear first, enabling VTable's frozenColCount to work dynamically
  const displayColumns = useMemo(() => {
    const frozen = baseColumns.filter(c => frozenColumns.includes(c.field));
    const unfrozen = baseColumns.filter(c => !frozenColumns.includes(c.field));
    return [...frozen, ...unfrozen];
  }, [baseColumns, frozenColumns]);

  const toggleFreeze = (field: string) => {
    setFrozenColumns(prev => 
      prev.includes(field) 
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  // Simple client-side filter
  const filteredRecords = useMemo(() => {
    if (!globalFilter || !reports) return reports;
    const lowerFilter = globalFilter.toLowerCase();
    return reports.filter((row: any) => 
      Object.values(row).some((val) => 
        String(val).toLowerCase().includes(lowerFilter)
      )
    );
  }, [reports, globalFilter]);

  const handleExport = () => {
    if (!filteredRecords || filteredRecords.length === 0) return;
    
    // Prepare data for export with only requested fields and formatted headers
    const exportData = filteredRecords.map((row: any) => ({
      'Email': row.email || '-',
      'Student ID': row.studentID || '-',
      'Mobile No': row.mobileNo || '-',
      'Name': row.studentName || '-',
      'Active': row.active ? 'Yes' : 'No',
      'Full Name': row.fullName || '-',
      'Parent Name': row.parentName || '-',
      'School Name': row.schoolName || '-',
      'Grade': row.grade || '-',
      'Board': row.board || '-',
      'City': row.city || '-',
      'State': row.state || '-',
      'Career Bucket 1': row.topBucket1 || '-',
      'Career Bucket 2': row.topBucket2 || '-',
      'Career Bucket 3': row.topBucket3 || '-',
      'Created At': row.createdAt ? new Date(row.createdAt).toLocaleString() : '-',
      'Updated At': row.updatedAt ? new Date(row.updatedAt).toLocaleString() : '-',
      'Partner': row.partner || '-',
      'AI Enhanced': row.aiEnhanced ? 'Yes' : 'No',
      'Vibe R': row.vibeR,
      'Vibe I': row.vibeI,
      'Vibe A': row.vibeA,
      'Vibe S': row.vibeS,
      'Vibe E': row.vibeE,
      'Vibe C': row.vibeC
    }));

    exportToExcel(exportData, `Naviksha_Analytics_Export_${new Date().toISOString().split('T')[0]}`);
  };

  // Ensure 'custom' size is handled properly
  const isCustomSize = typeof pageSize === 'number' && ![30, 50].includes(pageSize);

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-2rem)]">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Database</h1>
          <p className="text-muted-foreground">High-performance data grid viewing via VTable.</p>
        </div>
        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Download className="w-4 h-4" /> Export Current Page
        </Button>
      </div>

      <div className="flex flex-col flex-grow overflow-hidden bg-white border rounded-md shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b shrink-0 bg-gray-50">
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center w-full max-w-[250px] space-x-2 border rounded-md px-3 bg-white">
              <Search className="w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search loaded records..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="px-0 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-9"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-10 bg-white">
                  <Settings2 className="w-4 h-4 mr-2 text-gray-500" />
                  Freeze Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 max-h-[300px] overflow-y-auto">
                <DropdownMenuLabel>Select Columns to Freeze</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {baseColumns.map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.field}
                    checked={frozenColumns.includes(col.field)}
                    onCheckedChange={() => toggleFreeze(col.field)}
                  >
                    {col.title}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Server Pagination Controls */}
          <div className="flex items-center space-x-4 text-sm">
            <span className="hidden text-muted-foreground md:inline">
              Total: {totalElements.toLocaleString()}
            </span>
            
            <div className="flex items-center h-10 px-2 space-x-2 bg-white border rounded-md">
              <span className="text-muted-foreground whitespace-nowrap">Rows/Page:</span>
              <select 
                className="w-24 bg-transparent border-none cursor-pointer focus:ring-0"
                value={pageSize === 'all' ? 'all' : (isCustomSize ? 'custom' : pageSize)}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'custom') {
                    const customVal = window.prompt("Enter custom rows per page:", "100");
                    const parsed = parseInt(customVal || "50", 10);
                    if (!isNaN(parsed) && parsed > 0) {
                      setPageSize(parsed);
                      setPageIndex(0);
                    }
                  } else if (val === 'all') {
                    setPageSize('all');
                    setPageIndex(0);
                  } else {
                    setPageSize(Number(val));
                    setPageIndex(0);
                  }
                }}
              >
                <option value={30}>30</option>
                <option value={50}>50</option>
                <option value="all">All</option>
                <option value="custom">Custom {isCustomSize ? `(${pageSize})` : ''}</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPageIndex(p => Math.max(0, p - 1))}
                disabled={pageIndex === 0 || isLoading || pageSize === 'all'}
                className="h-9"
              >
                Previous
              </Button>
              <span className="px-2 font-medium whitespace-nowrap">
                Page {pageSize === 'all' ? '1' : pageIndex + 1} of {pageSize === 'all' ? '1' : (totalPages || 1)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPageIndex(p => p + 1)}
                disabled={pageIndex >= totalPages - 1 || isLoading || pageSize === 'all'}
                className="h-9"
              >
                Next
              </Button>
            </div>
          </div>
        </div>

        <div className="relative flex-grow w-full bg-white">
          {isLoading ? (
            <div className="absolute inset-0 z-10 p-4 space-y-4 bg-white/80">
              <Skeleton className="w-full h-10" />
              <Skeleton className="w-full h-10" />
              <Skeleton className="w-full h-64" />
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex items-center justify-center p-8 text-center text-red-600">
              Error loading analytics data.
            </div>
          ) : null}
          
          {/* Ensure container has dimensions for VTable canvas */}
          <div className="absolute inset-0" style={{ width: '100%', height: '100%' }}>
            {filteredRecords && filteredRecords.length > 0 && (
              <ListTable
                records={filteredRecords}
                columns={displayColumns}
                frozenColCount={frozenColumns.length}
                widthMode="standard"
                // Using standard height mode prevents the table rows from changing sizes dynamically and jumping
                heightMode="standard"
                defaultRowHeight={40}
                theme={{
                  headerStyle: {
                    bgColor: '#f8fafc',
                    fontSize: 13,
                    fontWeight: 'bold',
                    color: '#475569',
                    borderColor: '#e2e8f0',
                    padding: [4, 4, 4, 4]
                  },
                  bodyStyle: {
                    fontSize: 13,
                    color: '#334155',
                    borderColor: '#e2e8f0',
                    padding: [4, 4, 4, 8]
                  },
                  frameStyle: {
                    borderColor: 'transparent'
                  }
                }}
              />
            )}
            {filteredRecords && filteredRecords.length === 0 && !isLoading && (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No records found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
