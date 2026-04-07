"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable, Column } from "@/components/dashboard/DataTable";
import { mockStudents, DEPARTMENTS } from "@/lib/mock-data";
import type { Student } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const emptyStudent: Omit<Student, "id"> = {
  name: "", rollNo: "", email: "", phone: "", department: "", semester: 1, enrollmentDate: new Date().toISOString().split("T")[0],
};

export default function ManageStudentsPage() {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [form, setForm] = useState(emptyStudent);
  const [filterDept, setFilterDept] = useState<string>("all");

  const filteredStudents = filterDept === "all" ? students : students.filter((s) => s.department === filterDept);

  const openAdd = () => {
    setEditingStudent(null);
    setForm(emptyStudent);
    setDialogOpen(true);
  };

  const openEdit = (s: Student) => {
    setEditingStudent(s);
    setForm({ name: s.name, rollNo: s.rollNo, email: s.email, phone: s.phone, department: s.department, semester: s.semester, enrollmentDate: s.enrollmentDate });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.rollNo || !form.email || !form.department) return;
    if (editingStudent) {
      setStudents((prev) => prev.map((s) => (s.id === editingStudent.id ? { ...s, ...form } : s)));
    } else {
      const newStudent: Student = { id: `s${Date.now()}`, ...form };
      setStudents((prev) => [newStudent, ...prev]);
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (deletingStudent) {
      setStudents((prev) => prev.filter((s) => s.id !== deletingStudent.id));
      setDeleteDialogOpen(false);
      setDeletingStudent(null);
    }
  };

  const columns: Column<Student>[] = [
    { key: "name", header: "Name", sortable: true, render: (row) => (
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary/10 text-xs font-bold text-brand-primary">
          {row.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
        </div>
        <div>
          <p className="font-medium text-foreground">{row.name}</p>
          <p className="text-xs text-muted-foreground">{row.email}</p>
        </div>
      </div>
    )},
    { key: "rollNo", header: "Roll No", sortable: true },
    { key: "department", header: "Department", sortable: true, render: (row) => (
      <Badge variant="secondary" className={deptColors[row.department] || ""}>
        {row.department}
      </Badge>
    )},
    { key: "semester", header: "Semester", sortable: true, render: (row) => (
      <span className="font-medium">{row.semester}</span>
    )},
    { key: "actions", header: "Actions", render: (row) => (
      <div className="flex items-center gap-1">
        <button onClick={() => openEdit(row)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent transition-colors" title="Edit">
          <Pencil className="h-4 w-4 text-muted-foreground" />
        </button>
        <button onClick={() => { setDeletingStudent(row); setDeleteDialogOpen(true); }} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-destructive/10 transition-colors" title="Delete">
          <Trash2 className="h-4 w-4 text-destructive" />
        </button>
      </div>
    )},
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <PageHeader
        title="Manage Students"
        subtitle={`${students.length} students enrolled across all departments`}
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Manage Students" }]}
        action={
          <div className="flex items-center gap-3">
            <Select value={filterDept} onValueChange={setFilterDept}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={openAdd} className="bg-brand-primary hover:bg-brand-primary/90 text-white">
              <Plus className="h-4 w-4 mr-2" /> Add Student
            </Button>
          </div>
        }
      />

      <DataTable
        data={filteredStudents as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        searchPlaceholder="Search by name, roll no, or email..."
        searchKeys={["name", "rollNo", "email"]}
      />

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingStudent ? "Edit Student" : "Add New Student"}</DialogTitle>
            <DialogDescription>{editingStudent ? "Update the student information below." : "Fill in the details for the new student."}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ali Abbas" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rollNo">Roll Number</Label>
                <Input id="rollNo" value={form.rollNo} onChange={(e) => setForm({ ...form, rollNo: e.target.value })} placeholder="CS-2022-001" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@gc.edu.pk" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0300-1234567" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}>
                  <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Semester</Label>
                <Select value={String(form.semester)} onValueChange={(v) => setForm({ ...form, semester: Number(v) })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,6,7,8].map((s) => <SelectItem key={s} value={String(s)}>Semester {s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-brand-primary hover:bg-brand-primary/90 text-white">
              {editingStudent ? "Update Student" : "Add Student"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Student</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deletingStudent?.name}</strong> ({deletingStudent?.rollNo})? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
