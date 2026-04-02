import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Search, Pencil, Trash2, X, Check } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.getUsers(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.adminUpdateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: "User updated" });
      setEditingId(null);
    },
    onError: (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.adminDeleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: "User deleted" });
    },
  });

  const filteredUsers = users.filter((user: any) =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startEdit = (u: any) => {
    setEditingId(u.id);
    setEditForm({ name: u.name, email: u.email, plan: u.plan || 'Monthly', status: u.status, role: u.role || 'user' });
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">User Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">{filteredUsers.length} users found</p>
        </div>
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-card pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="px-4 py-3 text-left font-semibold text-foreground">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Email</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Plan</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Charity</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Role</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Joined</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {isLoading ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">Loading users...</td></tr>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((u: any) => (
                <tr key={u.id} className="hover:bg-secondary/20 transition-colors">
                  {editingId === u.id ? (
                    <>
                      <td className="px-4 py-3">
                        <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                          className="h-8 w-full rounded border border-border bg-background px-2 text-sm" />
                      </td>
                      <td className="px-4 py-3">
                        <input value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                          className="h-8 w-full rounded border border-border bg-background px-2 text-sm" />
                      </td>
                      <td className="px-4 py-3">
                        <select value={editForm.plan} onChange={e => setEditForm({ ...editForm, plan: e.target.value })}
                          className="h-8 rounded border border-border bg-background px-2 text-sm">
                          <option value="Monthly">Monthly</option>
                          <option value="Yearly">Yearly</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{u.charity_name || '—'}</td>
                      <td className="px-4 py-3">
                        <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                          className="h-8 rounded border border-border bg-background px-2 text-sm">
                          <option value="Active">Active</option>
                          <option value="Pending">Pending</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <select value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                          className="h-8 rounded border border-border bg-background px-2 text-sm">
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{u.joined_date ? new Date(u.joined_date).toLocaleDateString() : '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-olive" onClick={() => updateMutation.mutate({ id: u.id, data: editForm })}>
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
                      <td className="px-4 py-3 font-medium text-foreground">{u.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                      <td className="px-4 py-3 text-foreground">{u.plan || 'Monthly'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{u.charity_name || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          u.status === 'Active' ? 'bg-green-100 text-green-700' :
                          u.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-muted text-muted-foreground'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground capitalize">{u.role || 'user'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{u.joined_date ? new Date(u.joined_date).toLocaleDateString() : '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => startEdit(u)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => {
                            if (confirm(`Delete user ${u.name}?`)) deleteMutation.mutate(u.id);
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
              <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
