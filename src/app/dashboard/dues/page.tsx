"use client";

import { useState } from "react";
import { DollarSign, CheckCircle2, AlertCircle, Clock, Search, Filter } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable, Column } from "@/components/dashboard/DataTable";
import { mockFees, mockStudents } from "@/lib/mock-data";
import type { Fee } from "@/types";
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
import { motion } from "framer-motion";

const statusColors: Record<Fee["status"], string> = {
  Paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Unpaid: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Overdue: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
};

const statusIcons: Record<Fee["status"], any> = {
  Paid: CheckCircle2,
  Unpaid: Clock,
  Overdue: AlertCircle,
};

export default function ManageDuesPage() {
  const [fees, setFees] = useState<Fee[]>(mockFees);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [payDialogOpen, setPayDialogOpen] = useState(false);

  const filteredFees = filterStatus === "all" 
    ? fees 
    : fees.filter((f) => f.status === filterStatus);

  const handleMarkPaid = () => {
    if (selectedFee) {
      setFees((prev) => 
        prev.map((f) => (f.id === selectedFee.id ? { ...f, status: "Paid" } : f))
      );
      setPayDialogOpen(false);
      setSelectedFee(null);
    }
  };

  const columns: Column<Fee>[] = [
    { key: "studentId", header: "Student", sortable: true, render: (row) => {
      const student = mockStudents.find(s => s.id === row.studentId);
      return (
        <div>
          <p className="font-medium text-foreground">{student?.name || row.studentId}</p>
          <p className="text-xs text-muted-foreground">{student?.rollNo}</p>
        </div>
      );
    }},
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
    { key: "actions", header: "Actions", render: (row) => (
      row.status !== "Paid" && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => { setSelectedFee(row); setPayDialogOpen(true); }}
          className="h-8 text-xs gap-1 border-brand-primary/20 hover:bg-brand-primary hover:text-white transition-all transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <DollarSign className="h-3 w-3" />
          Mark Paid
        </Button>
      )
    )},
  ];

  const totalDues = fees.filter(f => f.status !== "Paid").reduce((acc, f) => acc + f.amount, 0);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <PageHeader
        title="Account Dues"
        subtitle={`Total Outstanding: Rs. ${totalDues.toLocaleString()}`}
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Dues" }]}
        action={
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
        }
      />

      <DataTable
        data={filteredFees as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        searchPlaceholder="Search by student or type..."
        searchKeys={["studentId", "type"]}
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
    </motion.div>
  );
}
