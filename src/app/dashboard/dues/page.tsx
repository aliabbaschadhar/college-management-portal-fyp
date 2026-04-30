"use client";

import { useState, useEffect, useCallback } from "react";
import { DollarSign, CheckCircle2, AlertCircle, Clock, Plus, Trash2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable, Column } from "@/components/dashboard/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuditBadgeInline } from "@/components/dashboard/AuditBadge";
import { motion } from "framer-motion";

interface FeeWithStudent {
  id: string;
  studentId: string;
  type: string;
  amount: number;
  status: "Paid" | "Unpaid" | "Overdue";
  dueDate: string;
  semester: number;
  paidDate: string | null;
  student: { rollNo: string; user: { name: string | null } };
}

const statusColors: Record<"Paid" | "Unpaid" | "Overdue", string> = {
  Paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Unpaid: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Overdue: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
};

const statusIcons: Record<"Paid" | "Unpaid" | "Overdue", LucideIcon> = {
  Paid: CheckCircle2,
  Unpaid: Clock,
  Overdue: AlertCircle,
};

export default function ManageDuesPage() {
  const [fees, setFees] = useState<FeeWithStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedFee, setSelectedFee] = useState<FeeWithStudent | null>(null);
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [students, setStudents] = useState<Array<{id: string; rollNo: string; user: {name: string | null}}>>([]);
  const [newFee, setNewFee] = useState({ studentId: "", type: "Tuition Fee", amount: "", dueDate: "", semester: "1" });

  const loadFees = useCallback(() => {
    setLoading(true);
    const url = filterStatus === "all" ? "/api/fees" : `/api/fees?status=${filterStatus}`;
    fetch(url)
      .then((r) => r.json())
      .then((d: FeeWithStudent[]) => { setFees(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [filterStatus]);

  useEffect(() => {
    loadFees();
  }, [loadFees]);

  useEffect(() => {
    fetch("/api/students")
      .then((r) => r.json())
      .then((d: Array<{id: string; rollNo: string; user: {name: string | null}}>) => {
        if (Array.isArray(d)) setStudents(d);
      })
      .catch(() => {});
  }, []);

  const handleMarkPaid = async () => {
    if (!selectedFee) return;
    const res = await fetch(`/api/fees/${selectedFee.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Paid", paidDate: new Date().toISOString() }),
    });
    if (res.ok) {
      setFees((prev) =>
        prev.map((f) => (f.id === selectedFee.id ? { ...f, status: "Paid" as const, paidDate: new Date().toISOString() } : f))
      );
      setPayDialogOpen(false);
      setSelectedFee(null);
    }
  };

  const handleDeleteFee = async (id: string, name: string) => {
    if (!confirm(`Delete fee record for ${name}?`)) return;
    setMutationError(null);
    const res = await fetch(`/api/fees/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const payload = (await res.json().catch(() => null)) as { error?: string } | null;
      setMutationError(payload?.error ?? "Failed to delete fee");
      return;
    }
    setFees((prev) => prev.filter((f) => f.id !== id));
  };

  const handleCreateFee = async () => {
    setMutationError(null);
    if (!newFee.studentId || !newFee.amount || !newFee.dueDate) {
      setMutationError("Please fill all required fields");
      return;
    }
    const res = await fetch("/api/fees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: newFee.studentId,
        type: newFee.type,
        amount: parseFloat(newFee.amount),
        dueDate: new Date(newFee.dueDate).toISOString(),
        semester: parseInt(newFee.semester),
      }),
    });
    if (!res.ok) {
      const payload = (await res.json().catch(() => null)) as { error?: string } | null;
      setMutationError(payload?.error ?? "Failed to create fee");
      return;
    }
    setCreateDialogOpen(false);
    setNewFee({ studentId: "", type: "Tuition Fee", amount: "", dueDate: "", semester: "1" });
    loadFees();
  };

  const columns: Column<FeeWithStudent>[] = [
    { key: "student", header: "Student", sortable: false, render: (row) => (
      <div>
        <p className="font-medium text-foreground">{row.student.user.name ?? "—"}</p>
        <p className="text-xs text-muted-foreground">{row.student.rollNo}</p>
        <AuditBadgeInline entity="Fee" entityId={row.id} />
      </div>
    )},
    { key: "type", header: "Fee Type", sortable: true },
    { key: "amount", header: "Amount", sortable: true, render: (row) => (
      <span className="font-semibold text-foreground">Rs. {row.amount.toLocaleString()}</span>
    )},
    { key: "dueDate", header: "Due Date", sortable: true, render: (row) => {
      const isOverdue = new Date(row.dueDate) < new Date() && row.status !== "Paid";
      return (
        <span className={isOverdue ? "text-destructive font-medium" : "text-muted-foreground"}>
          {new Date(row.dueDate).toLocaleDateString()}
        </span>
      );
    }},
    { key: "status", header: "Status", sortable: true, render: (row) => {
      const Icon = statusIcons[row.status];
      return (
        <Badge variant="secondary" className={`flex w-fit items-center gap-1 ${statusColors[row.status]}`}>
          <Icon className="h-3 w-3" />
          {row.status}
        </Badge>
      );
    }},
    { key: "id", header: "Actions", render: (row) => (
      <div className="flex items-center gap-1">
        {row.status !== "Paid" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setSelectedFee(row); setPayDialogOpen(true); }}
            className="h-8 text-xs gap-1 border-brand-primary/20 hover:bg-brand-primary hover:text-white transition-all"
          >
            <DollarSign className="h-3 w-3" />
            Mark Paid
          </Button>
        )}
        <button
          onClick={() => handleDeleteFee(row.id, row.student.user.name ?? row.student.rollNo)}
          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
          title="Delete Fee"
        >
          <Trash2 className="h-4 w-4 text-rose-500" />
        </button>
      </div>
    )},
  ];

  const totalDues = fees.filter((f) => f.status !== "Paid").reduce((acc, f) => acc + f.amount, 0);

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
        title="Account Dues"
        subtitle={`Total Outstanding: Rs. ${totalDues.toLocaleString()}`}
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Dues" }]}
        action={
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setCreateDialogOpen(true)} className="bg-brand-primary hover:bg-brand-primary/90 text-white">
              <Plus className="h-4 w-4 mr-2" /> Create Fee
            </Button>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fees</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Unpaid">Unpaid</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      <DataTable
        data={fees as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        searchPlaceholder="Search by student or type..."
        searchKeys={["type"]}
      />

      {/* Confirmation Dialog */}
      <Dialog open={payDialogOpen} onOpenChange={setPayDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this fee record as <strong>Paid</strong>?
            </DialogDescription>
          </DialogHeader>

          {selectedFee && (
            <div className="p-4 rounded-xl bg-accent/30 border border-brand-primary/10 shadow-inner">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-muted-foreground uppercase">Amount Due</span>
                <span className="text-lg font-bold text-brand-primary">Rs. {selectedFee.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground uppercase">Fee Type</span>
                <span className="text-sm font-medium">{selectedFee.type}</span>
              </div>
            </div>
          )}

          <DialogFooter className="mt-4 gap-2 sm:justify-end">
            <Button variant="ghost" onClick={() => setPayDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleMarkPaid} className="bg-brand-primary hover:bg-brand-primary/90 text-white shadow-lg shadow-brand-primary/20">
              Confirm Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Fee Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Create Fee Record</DialogTitle>
            <DialogDescription>Add a new fee for a student.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {mutationError && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-300">
                {mutationError}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="studentId">Student</Label>
              <Select value={newFee.studentId} onValueChange={(v) => setNewFee({...newFee, studentId: v})}>
                <SelectTrigger><SelectValue placeholder="Select Student" /></SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.user.name ?? s.rollNo} ({s.rollNo})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="feeType">Fee Type</Label>
              <Select value={newFee.type} onValueChange={(v) => setNewFee({...newFee, type: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tuition Fee">Tuition Fee</SelectItem>
                  <SelectItem value="Admission Fee">Admission Fee</SelectItem>
                  <SelectItem value="Lab Fee">Lab Fee</SelectItem>
                  <SelectItem value="Library Fee">Library Fee</SelectItem>
                  <SelectItem value="Transport Fee">Transport Fee</SelectItem>
                  <SelectItem value="Examination Fee">Examination Fee</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount (Rs.)</Label>
                <Input id="amount" type="number" placeholder="45000" value={newFee.amount} onChange={(e) => setNewFee({...newFee, amount: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="semester">Semester</Label>
                <Input id="semester" type="number" min={1} max={8} value={newFee.semester} onChange={(e) => setNewFee({...newFee, semester: e.target.value})} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input id="dueDate" type="date" value={newFee.dueDate} onChange={(e) => setNewFee({...newFee, dueDate: e.target.value})} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateFee} className="bg-brand-primary hover:bg-brand-primary/90 text-white">
              Create Fee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
