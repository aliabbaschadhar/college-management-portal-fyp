"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { AuditBadgeInline } from "@/components/dashboard/AuditBadge";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable, Column } from "@/components/dashboard/DataTable";
import { DEPARTMENTS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface FacultyWithUser {
  id: string;
  userId: string;
  phone: string | null;
  department: string;
  specialization: string | null;
  joinDate: string;
  avatar: string | null;
  user: { name: string | null; email: string };
}

interface FacultyForm {
  phone: string;
  department: string;
  specialization: string;
}

const deptColors: Record<string, string> = {
  "Computer Science": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Mathematics: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  Physics: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  English: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Chemistry: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  Economics: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  Urdu: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  "Islamic Studies": "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
};

const emptyForm: FacultyForm = { phone: "", department: "", specialization: "" };

export default function ManageFacultyPage() {
  const [faculty, setFaculty] = useState<FacultyWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<FacultyWithUser | null>(null);
  const [deletingFaculty, setDeletingFaculty] = useState<FacultyWithUser | null>(null);
  const [form, setForm] = useState<FacultyForm>(emptyForm);
  const [filterDept, setFilterDept] = useState<string>("all");

  useEffect(() => {
    fetch("/api/faculty")
      .then((r) => r.json())
      .then((d: FacultyWithUser[]) => { setFaculty(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = filterDept === "all" ? faculty : faculty.filter((f) => f.department === filterDept);

  const openEdit = (f: FacultyWithUser) => {
    setEditingFaculty(f);
    setForm({ phone: f.phone ?? "", department: f.department, specialization: f.specialization ?? "" });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingFaculty || !form.department) return;
    const res = await fetch(`/api/faculty/${editingFaculty.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const updated: FacultyWithUser = await res.json();
      setFaculty((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
      setDialogOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingFaculty) return;
    const res = await fetch(`/api/faculty/${deletingFaculty.id}`, { method: "DELETE" });
    if (res.ok) {
      setFaculty((prev) => prev.filter((f) => f.id !== deletingFaculty.id));
      setDeleteDialogOpen(false);
      setDeletingFaculty(null);
    }
  };

  const columns: Column<FacultyWithUser>[] = [
    {
      key: "user", header: "Name", sortable: false, render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-secondary/10 text-xs font-bold text-brand-secondary">
            {(row.user.name ?? "?").split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <div>
            <p className="font-medium text-foreground">{row.user.name ?? "—"}</p>
            <p className="text-xs text-muted-foreground">{row.user.email}</p>
            <AuditBadgeInline entity="Faculty" entityId={row.id} />
          </div>
        </div>
      )
    },
    {
      key: "department", header: "Department", sortable: true, render: (row) => (
        <Badge variant="secondary" className={deptColors[row.department] || ""}>{row.department}</Badge>
      )
    },
    { key: "specialization", header: "Specialization", sortable: false, render: (row) => (
      <span>{row.specialization ?? "—"}</span>
    )},
    {
      key: "joinDate", header: "Joined", sortable: true, render: (row) => (
        <span className="text-muted-foreground">{new Date(row.joinDate).toLocaleDateString("en-PK", { year: "numeric", month: "short" })}</span>
      )
    },
    {
      key: "id", header: "Actions", render: (row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => openEdit(row)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent transition-colors"><Pencil className="h-4 w-4 text-muted-foreground" /></button>
          <button onClick={() => { setDeletingFaculty(row); setDeleteDialogOpen(true); }} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-destructive/10 transition-colors"><Trash2 className="h-4 w-4 text-destructive" /></button>
        </div>
      )
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin h-8 w-8 border-2 border-brand-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <PageHeader
        title="Manage Faculty"
        subtitle={`${faculty.length} faculty members across all departments`}
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Manage Faculty" }]}
        action={
          <div className="flex items-center gap-3">
            <Select value={filterDept} onValueChange={setFilterDept}>
              <SelectTrigger className="w-[180px] h-9"><SelectValue placeholder="All Departments" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button
              onClick={() => alert("Faculty are created automatically when they register via the Clerk sign-up flow with the 'faculty' role.")}
              className="bg-brand-primary hover:bg-brand-primary/90 text-white"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Faculty
            </Button>
          </div>
        }
      />

      <DataTable
        data={filtered as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        searchPlaceholder="Search by name, email, or specialization..."
        searchKeys={["userId"]}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Faculty</DialogTitle>
            <DialogDescription>Update the faculty information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0321-1234567" /></div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>Specialization</Label><Input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} placeholder="Machine Learning" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-brand-primary hover:bg-brand-primary/90 text-white">Update Faculty</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Faculty</DialogTitle>
            <DialogDescription>Are you sure you want to delete <strong>{deletingFaculty?.user.name}</strong>? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}><Trash2 className="h-4 w-4 mr-2" /> Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
