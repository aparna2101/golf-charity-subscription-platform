import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil, X, Check, Plus } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function AdminCharitiesPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [newCharity, setNewCharity] = useState({ name: '', description: '', category: '', location: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: charities = [], isLoading } = useQuery({
    queryKey: ['admin-charities'],
    queryFn: () => api.getCharities(),
  });

  const addMutation = useMutation({
    mutationFn: (data: any) => api.adminAddCharity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-charities'] });
      toast({ title: "Charity added" });
      setShowAdd(false);
      setNewCharity({ name: '', description: '', category: '', location: '' });
    },
    onError: (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.adminUpdateCharity(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-charities'] });
      toast({ title: "Charity updated" });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.adminDeleteCharity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-charities'] });
      toast({ title: "Charity deleted" });
    },
  });

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Charity Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">{charities.length} charities registered</p>
        </div>
        <Button variant="hero" onClick={() => setShowAdd(!showAdd)}>
          <Plus className="mr-1 h-4 w-4" /> Add Charity
        </Button>
      </div>

      {showAdd && (
        <div className="mb-6 rounded-2xl border border-border bg-card p-6 shadow-soft animate-fade-in">
          <h3 className="mb-4 font-display text-lg font-semibold text-foreground">Add New Charity</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Name *</label>
              <input value={newCharity.name} onChange={e => setNewCharity({ ...newCharity, name: e.target.value })}
                className="h-10 w-full rounded-lg border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Charity name" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Category</label>
              <input value={newCharity.category} onChange={e => setNewCharity({ ...newCharity, category: e.target.value })}
                className="h-10 w-full rounded-lg border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="e.g. Sport, Youth, Environment" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Location</label>
              <input value={newCharity.location} onChange={e => setNewCharity({ ...newCharity, location: e.target.value })}
                className="h-10 w-full rounded-lg border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="e.g. London, UK" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-foreground">Description</label>
              <textarea value={newCharity.description} onChange={e => setNewCharity({ ...newCharity, description: e.target.value })}
                className="w-full rounded-lg border border-border bg-background p-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring" rows={3} placeholder="Short description" />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <Button variant="hero" onClick={() => addMutation.mutate(newCharity)} disabled={!newCharity.name || addMutation.isPending}>
              {addMutation.isPending ? 'Adding...' : 'Add Charity'}
            </Button>
            <Button variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="px-4 py-3 text-left font-semibold text-foreground">Charity Name</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Category</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Location</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Members</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Contributions</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {isLoading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Loading charities...</td></tr>
            ) : charities.length > 0 ? (
              charities.map((c: any) => (
                <tr key={c.id} className="hover:bg-secondary/20 transition-colors">
                  {editingId === c.id ? (
                    <>
                      <td className="px-4 py-3">
                        <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                          className="h-8 w-full rounded border border-border bg-background px-2 text-sm" />
                      </td>
                      <td className="px-4 py-3">
                        <input value={editForm.category || ''} onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                          className="h-8 w-full rounded border border-border bg-background px-2 text-sm" />
                      </td>
                      <td className="px-4 py-3">
                        <input value={editForm.location || ''} onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                          className="h-8 w-full rounded border border-border bg-background px-2 text-sm" />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{c.members?.toLocaleString() || 0}</td>
                      <td className="px-4 py-3 text-foreground">₹{parseFloat(c.contributions || 0).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                          className="h-8 rounded border border-border bg-background px-2 text-sm">
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-olive" onClick={() => updateMutation.mutate({ id: c.id, data: editForm })}>
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setEditingId(null)}>
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 font-medium text-foreground">{c.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{c.category || '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{c.location || '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{c.members?.toLocaleString() || 0}</td>
                      <td className="px-4 py-3 text-foreground">₹{parseFloat(c.contributions || 0).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${c.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setEditingId(c.id); setEditForm({ name: c.name, category: c.category, location: c.location, status: c.status }); }}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => {
                            if (confirm(`Delete ${c.name}?`)) deleteMutation.mutate(c.id);
                          }}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))
            ) : (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No charities found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
