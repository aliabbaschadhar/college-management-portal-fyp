"use client";

import { useState, useEffect } from "react";
import { CreditCard, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface FeeRecord {
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

const statusColors: Record<string, string> = {
  Paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Unpaid: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Overdue: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
};

const statusIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Paid: CheckCircle,
  Unpaid: AlertTriangle,
  Overdue: XCircle,
};

export default function MyDuesPage() {
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/fees")
      .then((r) => r.json())
      .then((d: FeeRecord[]) => { setFees(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const totalAmount = fees.reduce((sum, f) => sum + f.amount, 0);
  const paidAmount = fees.filter((f) => f.status === "Paid").reduce((sum, f) => sum + f.amount, 0);
  const pendingAmount = fees.filter((f) => f.status !== "Paid").reduce((sum, f) => sum + f.amount, 0);
  const overdueCount = fees.filter((f) => f.status === "Overdue").length;

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin h-8 w-8 border-2 border-brand-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
      <PageHeader
        title="My Dues &amp; Fees"
        subtitle="Track your fee payments and pending dues"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "My Dues" }]}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard title="Total Fees" value={`PKR ${totalAmount.toLocaleString()}`} trend="This semester" trendDirection="up" icon={CreditCard} iconColor="var(--color-brand-primary)" iconBg="rgb(var(--color-brand-primary-rgb) / 0.1)" />
        <StatsCard title="Paid" value={`PKR ${paidAmount.toLocaleString()}`} trend="Cleared" trendDirection="up" icon={CheckCircle} iconColor="var(--color-system-success)" iconBg="rgb(var(--color-system-success-rgb) / 0.1)" />
        <StatsCard title="Pending" value={`PKR ${pendingAmount.toLocaleString()}`} trend={pendingAmount > 0 ? "Due" : "Clear"} trendDirection={pendingAmount > 0 ? "down" : "up"} icon={AlertTriangle} iconColor="var(--color-system-warning)" iconBg="rgb(var(--color-system-warning-rgb) / 0.1)" />
        <StatsCard title="Overdue" value={overdueCount} trend={overdueCount > 0 ? "Action needed" : "None"} trendDirection={overdueCount > 0 ? "down" : "up"} icon={XCircle} iconColor="var(--color-system-danger)" iconBg="rgb(var(--color-system-danger-rgb) / 0.1)" />
      </div>

      {/* Progress bar */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Payment Progress</span>
          <span className="text-sm font-semibold text-brand-primary">
            {totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 100}%
          </span>
        </div>
        <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-linear-to-r from-brand-primary to-emerald-500 transition-all duration-500"
            style={{ width: `${totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 100}%` }}
          />
        </div>
      </div>

      {/* Fees Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left py-3 px-4 font-semibold text-foreground">Fee Type</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Semester</th>
                <th className="text-right py-3 px-4 font-semibold text-foreground">Amount</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Due Date</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Paid Date</th>
                <th className="text-center py-3 px-4 font-semibold text-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((fee) => {
                const StatusIcon = statusIcons[fee.status] || AlertTriangle;
                return (
                  <tr key={fee.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                    <td className="py-3 px-4 font-medium text-foreground">{fee.type}</td>
                    <td className="py-3 px-4 text-muted-foreground">Sem {fee.semester}</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-foreground">
                      PKR {fee.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {new Date(fee.dueDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {fee.paidDate ? new Date(fee.paidDate).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="secondary" className={`${statusColors[fee.status]} gap-1`}>
                        <StatusIcon className="h-3 w-3" />
                        {fee.status}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
              {fees.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">
                    No fee records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
