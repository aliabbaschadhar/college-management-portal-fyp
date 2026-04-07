"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable, Column } from "@/components/dashboard/DataTable";
import { mockFaculty, DEPARTMENTS } from "@/lib/mock-data";
import type { Faculty } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

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

const emptyFaculty: Omit<Faculty, "id"> = {
  name: "", email: "", phone: "", department: "", specialization: "", joinDate: new Date().toISOString().split("T")[0],
};

export default function ManageFacultyPage() {
  const [faculty, setFaculty] = useState<Faculty[]>(mockFaculty);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [deletingFaculty, setDeletingFaculty] = useState<Faculty | null>(null);
  const [form, setForm] = useState(emptyFaculty);
  const [filterDept, setFilterDept] = useState<string>("all");

  const filtered = filterDept === "all" ? faculty : faculty.filter((f) => f.department === filterDept);

  const openAdd = () => { setEditingFaculty(null); setForm(emptyFaculty); setDialogOpen(true); };
  const openEdit = (f: Faculty) => {
    setEditingFaculty(f);
    setForm({ name: f.name, email: f.email, phone: f.phone, department: f.department, specialization: f.specialization, joinDate: f.joinDate });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.email || !form.department) return;
    if (editingFaculty) {
      setFaculty((prev) => prev.map((f) => (f.id === editingFaculty.id ? { ...f, ...form } : f)));
    } else {
      setFaculty((prev) => [{ id: `f${Date.now()}`, ...form }, ...prev]);
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (deletingFaculty) {
      setFaculty((prev) => prev.filter((f) => f.id !== deletingFaculty.id));
      setDeleteDialogOpen(false);
    }
  };

  const columns: Column<Faculty>[] = [
    {
      key: "name", header: "Name", sortable: true, render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-secondary/10 text-xs font-bold text-brand-secondary">
            {row.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <div>
            <p className="font-medium text-foreground">{row.name}</p>
            <p className="text-xs text-muted-foreground">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      key: "department", header: "Department", sortable: true, render: (row) => (
        <Badge variant="secondary" className={deptColors[row.department] || ""}>{row.department}</Badge>
      )
    },
    { key: "specialization", header: "Specialization", sortable: true },
    {
      key: "joinDate", header: "Joined", sortable: true, render: (row) => (
        <span className="text-muted-foreground">{new Date(row.joinDate).toLocaleDateString("en-PK", { year: "numeric", month: "short" })}</span>
      )
    },
    {
      key: "actions", header: "Actions", render: (row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => openEdit(row)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent transition-colors"><Pencil className="h-4 w-4 text-muted-foreground" /></button>
          <button onClick={() => { setDeletingFaculty(row); setDeleteDialogOpen(true); }} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-destructive/10 transition-colors"><Trash2 className="h-4 w-4 text-destructive" /></button>
        </div>
      )
    },
  ];

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
            <Button onClick={openAdd} className="bg-brand-primary hover:bg-brand-primary/90 text-white">
              <Plus className="h-4 w-4 mr-2" /> Add Faculty
            </Button>
          </div>
        }
      />

      <DataTable
        data={filtered as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        searchPlaceholder="Search by name, email, or specialization..."
        searchKeys={["name", "email", "specialization"]}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingFaculty ? "Edit Faculty" : "Add New Faculty"}</DialogTitle>
            <DialogDescription>{editingFaculty ? "Update the faculty information." : "Fill in the details for the new faculty member."}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Full Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Dr. Ahmed Khan" /></div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@gc.edu.pk" /></div>
            </div>
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
            <Button onClick={handleSave} className="bg-brand-primary hover:bg-brand-primary/90 text-white">{editingFaculty ? "Update" : "Add Faculty"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Faculty</DialogTitle>
            <DialogDescription>Are you sure you want to delete <strong>{deletingFaculty?.name}</strong>? This action cannot be undone.</DialogDescription>
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
