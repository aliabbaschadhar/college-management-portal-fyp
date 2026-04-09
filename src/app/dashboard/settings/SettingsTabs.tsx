"use client";

import { useState } from "react";
import {
  User,
  Bell,
  Shield,
  Globe,
  Palette,
  Smartphone,
  Mail,
  Lock,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

export function SettingsTabs() {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <PageHeader
        title="Settings"
        subtitle="Manage your profile, notifications, and portal preferences"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Settings" },
        ]}
      />

      <Tabs defaultValue="profile" className="space-y-6">
        <div className="flex overflow-x-auto pb-2 -mx-1 px-1">
          <TabsList className="bg-card w-full justify-start h-12 p-1 border rounded-2xl shadow-sm">
            {[
              { id: "profile", label: "Profile", icon: User },
              { id: "notifications", label: "Notifications", icon: Bell },
              { id: "security", label: "Security", icon: Shield },
              { id: "appearance", label: "Appearance", icon: Palette },
            ].map((t) => (
              <TabsTrigger
                key={t.id}
                value={t.id}
                className="rounded-xl px-6 gap-2 data-[state=active]:bg-brand-primary data-[state=active]:text-white transition-all duration-300"
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="grid gap-6">
          <TabsContent value="profile">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card border rounded-3xl p-8 shadow-sm"
            >
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <User className="h-5 w-5 text-brand-primary" /> Profile
                Information
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                    Full Name
                  </Label>
                  <Input
                    defaultValue="Admin User"
                    className="h-12 rounded-xl focus:ring-brand-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                    Email Address
                  </Label>
                  <Input
                    defaultValue="admin@gc.edu.pk"
                    disabled
                    className="h-12 rounded-xl bg-muted/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                    Phone Number
                  </Label>
                  <Input
                    defaultValue="+92 300 1234567"
                    className="h-12 rounded-xl focus:ring-brand-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                    Department
                  </Label>
                  <Input
                    defaultValue="Administration"
                    disabled
                    className="h-12 rounded-xl bg-muted/50"
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl h-12 px-8"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="notifications">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card border rounded-3xl p-8 shadow-sm"
            >
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Bell className="h-5 w-5 text-brand-secondary" /> Email & App
                Notifications
              </h3>
              <div className="space-y-6">
                {[
                  {
                    id: "new-student",
                    title: "New Student Applications",
                    desc: "Get notified when a new admission request is submitted",
                    icon: Smartphone,
                  },
                  {
                    id: "fee-payment",
                    title: "Fee Payment Alerts",
                    desc: "Alerts for upcoming or overdue fee payments",
                    icon: Mail,
                  },
                  {
                    id: "daily-report",
                    title: "Daily Analytics Summary",
                    desc: "Receive automated summary of portal activity",
                    icon: Globe,
                  },
                ].map((n) => (
                  <div
                    key={n.id}
                    className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex gap-4">
                      <div className="p-3 bg-card border rounded-xl">
                        <n.icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-bold">{n.title}</p>
                        <p className="text-sm text-muted-foreground">{n.desc}</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                ))}
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="appearance">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card border rounded-3xl p-8 shadow-sm"
            >
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Palette className="h-5 w-5 text-brand-primary" /> Visual
                Interface
              </h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                    Theme
                  </p>
                  <div className="p-4 rounded-2xl border bg-muted/10">
                    <p className="font-bold">Theme Control</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Switch between light and dark mode from the sidebar footer
                      toggle.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                    App Animations
                  </p>
                  <div className="flex items-center justify-between p-4 rounded-2xl border bg-muted/10">
                    <div>
                      <p className="font-bold">Motion Effects</p>
                      <p className="text-xs text-muted-foreground">
                        Enable smooth transitions for all dashboard pages
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="security">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card border rounded-3xl p-8 shadow-sm"
            >
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Shield className="h-5 w-5 text-destructive" /> Security &
                Privacy
              </h3>
              <div className="space-y-4">
                <div className="p-6 rounded-3xl bg-rose-500/5 border border-rose-500/20 flex items-center justify-between">
                  <div className="flex gap-4">
                    <div className="p-3 bg-card border border-rose-100 rounded-xl">
                      <Lock className="h-5 w-5 text-rose-500" />
                    </div>
                    <div>
                      <p className="font-bold text-rose-700 dark:text-rose-400">
                        Two-Factor Authentication
                      </p>
                      <p className="text-sm text-rose-600/70 dark:text-rose-400/70 truncate max-w-sm">
                        Enhance security by requiring an extra verification method
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="border-rose-200 hover:bg-rose-50 hover:text-rose-600 rounded-xl"
                  >
                    Enable 2FA
                  </Button>
                </div>

                <div className="p-6 rounded-3xl border flex items-center justify-between">
                  <p className="font-bold">Active Sessions</p>
                  <Button
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Review Sessions
                  </Button>
                </div>
              </div>
            </motion.div>
          </TabsContent>
        </div>
      </Tabs>
    </motion.div>
  );
}
