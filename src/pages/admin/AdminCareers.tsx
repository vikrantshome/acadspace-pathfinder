import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Plus, Edit, Trash2 } from 'lucide-react';

const AdminCareers = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCareer, setEditingCareer] = useState<any>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    careerId: '',
    careerName: '',
    bucket: '',
    riasecProfile: '',
    tags: '',
    baseParagraph: ''
  });

  const { data: careers, isLoading } = useQuery({
    queryKey: ['adminCareers'],
    queryFn: () => apiService.getAdminCareers(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiService.createCareer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCareers'] });
      toast.success('Career added successfully');
      setIsDialogOpen(false);
    },
    onError: (error: any) => toast.error(error.message)
  });

  const updateMutation = useMutation({
    mutationFn: (data: {id: string, payload: any}) => apiService.updateCareer(data.id, data.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCareers'] });
      toast.success('Career updated successfully');
      setIsDialogOpen(false);
    },
    onError: (error: any) => toast.error(error.message)
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiService.deleteCareer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCareers'] });
      toast.success('Career deleted successfully');
    },
    onError: (error: any) => toast.error(error.message)
  });

  const openEditDialog = (career: any) => {
    setEditingCareer(career);
    setFormData({
      careerId: career.careerId || '',
      careerName: career.careerName || '',
      bucket: career.bucket || '',
      riasecProfile: career.riasecProfile || '',
      tags: career.tags || '',
      baseParagraph: career.baseParagraph || ''
    });
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingCareer(null);
    setFormData({
      careerId: '',
      careerName: '',
      bucket: '',
      riasecProfile: '',
      tags: '',
      baseParagraph: ''
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCareer) {
      updateMutation.mutate({ id: editingCareer.careerId, payload: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Career Management</h1>
          <p className="text-muted-foreground">Manage the database of available careers.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} className="gap-2">
              <Plus className="h-4 w-4" /> Add Career
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCareer ? 'Edit Career' : 'Add New Career'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="careerId">Career ID</Label>
                  <Input 
                    id="careerId" 
                    value={formData.careerId} 
                    onChange={e => setFormData({...formData, careerId: e.target.value})} 
                    disabled={!!editingCareer}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="careerName">Career Name</Label>
                  <Input 
                    id="careerName" 
                    value={formData.careerName} 
                    onChange={e => setFormData({...formData, careerName: e.target.value})} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bucket">Bucket</Label>
                  <Input 
                    id="bucket" 
                    value={formData.bucket} 
                    onChange={e => setFormData({...formData, bucket: e.target.value})} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="riasecProfile">RIASEC Profile (e.g., RIA)</Label>
                  <Input 
                    id="riasecProfile" 
                    value={formData.riasecProfile} 
                    onChange={e => setFormData({...formData, riasecProfile: e.target.value})} 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (Comma separated)</Label>
                <Input 
                  id="tags" 
                  value={formData.tags} 
                  onChange={e => setFormData({...formData, tags: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="baseParagraph">Description Paragraph</Label>
                <Textarea 
                  id="baseParagraph" 
                  value={formData.baseParagraph} 
                  onChange={e => setFormData({...formData, baseParagraph: e.target.value})} 
                  className="min-h-[100px]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingCareer ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Career Name</TableHead>
              <TableHead>Bucket</TableHead>
              <TableHead>RIASEC</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : careers?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No careers found. Add one to get started.
                </TableCell>
              </TableRow>
            ) : (
              careers?.map((career: any) => (
                <TableRow key={career.careerId || career.id}>
                  <TableCell className="font-medium">{career.careerId}</TableCell>
                  <TableCell>{career.careerName}</TableCell>
                  <TableCell>{career.bucket}</TableCell>
                  <TableCell>{career.riasecProfile}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(career)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this career?')) {
                          deleteMutation.mutate(career.careerId);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminCareers;
