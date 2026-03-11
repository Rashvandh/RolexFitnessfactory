import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard, Users, UserCheck, CalendarDays, DollarSign, BarChart3,
  ClipboardList, Dumbbell, TrendingUp, Download, Filter,
  ArrowUpRight, ArrowDownRight, Loader2, Plus, Trash2, UserPlus,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart as ReBarChart, Bar, XAxis, YAxis, Tooltip as ReTooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";
import type { Tables } from "@/integrations/supabase/types";

const sidebarLinks = [
  { label: "Overview", to: "/admin", icon: LayoutDashboard },
  { label: "Members", to: "/admin/members", icon: Users },
  { label: "Trainers", to: "/admin/trainers", icon: Dumbbell },
  { label: "Attendance", to: "/admin/attendance", icon: CalendarDays },
  { label: "Fee Tracking", to: "/admin/fees", icon: DollarSign },
  { label: "Reports", to: "/admin/reports", icon: BarChart3 },
];

const chartTooltipStyle = {
  contentStyle: { backgroundColor: "hsl(0 0% 8%)", border: "1px solid hsl(0 0% 16%)", borderRadius: "8px", color: "hsl(0 0% 95%)" },
  labelStyle: { color: "hsl(0 0% 55%)" },
};

type TimeFilter = "today" | "week" | "month" | "quarter";

/* ─── Overview ─── */
const AdminOverview = () => {
  const [filter, setFilter] = useState<TimeFilter>("month");
  const [profiles, setProfiles] = useState<Tables<"profiles">[]>([]);
  const [attendance, setAttendance] = useState<Tables<"attendance">[]>([]);
  const [fees, setFees] = useState<Tables<"fees">[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const [{ data: p }, { data: a }, { data: f }] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("attendance").select("*").order("check_in", { ascending: false }).limit(500),
        supabase.from("fees").select("*").order("due_date", { ascending: false }).limit(500),
      ]);
      setProfiles(p || []);
      setAttendance(a || []);
      setFees(f || []);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const totalMembers = profiles.length;
  const totalRevenue = fees.filter((f) => f.status === "paid").reduce((s, f) => s + Number(f.amount), 0);
  const todayAttendance = attendance.filter((a) => new Date(a.check_in).toDateString() === new Date().toDateString()).length;

  const exportReport = () => {
    const header = "Metric,Value\n";
    const rows = [
      `Total Members,${totalMembers}`,
      `Total Revenue,$${totalRevenue.toFixed(0)}`,
      `Today's Attendance,${todayAttendance}`,
    ].join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `admin_kpi_${filter}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  // Build chart data from real data
  const attendanceByDay = (() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const counts = days.map((day) => ({ day, count: 0 }));
    attendance.forEach((a) => {
      const idx = new Date(a.check_in).getDay();
      counts[idx].count++;
    });
    return counts;
  })();

  const revenueByMonth = (() => {
    const months: Record<string, number> = {};
    fees.filter((f) => f.status === "paid").forEach((f) => {
      const key = new Date(f.due_date).toLocaleDateString("en-US", { month: "short" });
      months[key] = (months[key] || 0) + Number(f.amount);
    });
    return Object.entries(months).slice(-6).map(([month, revenue]) => ({ month, revenue }));
  })();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Quick Filters:</span>
          <div className="flex gap-1">
            {(["today", "week", "month", "quarter"] as TimeFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-xs font-heading tracking-wider transition-all duration-200 ${filter === f
                  ? "bg-primary text-primary-foreground shadow-[0_0_10px_hsl(1_95%_46%/0.3)]"
                  : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                  }`}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <button onClick={exportReport} className="neon-glow-btn px-4 py-2 rounded-md text-xs font-heading flex items-center gap-2">
          <Download className="h-3 w-3" /> Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Members" value={totalMembers.toString()} icon={Users} />
        <StatsCard title="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} icon={DollarSign} />
        <StatsCard title="Today's Attendance" value={todayAttendance.toString()} icon={CalendarDays} />
        <StatsCard title="Total Records" value={attendance.length.toString()} icon={BarChart3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="stat-card">
          <h2 className="font-heading text-sm font-semibold mb-4 flex items-center gap-2">
            Revenue Trend <ArrowUpRight className="h-4 w-4 text-green-400" />
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 16%)" />
              <XAxis dataKey="month" stroke="hsl(0 0% 55%)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(0 0% 55%)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <ReTooltip {...chartTooltipStyle} formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(1 95% 46%)" fill="hsl(1 95% 46% / 0.15)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="stat-card">
          <h2 className="font-heading text-sm font-semibold mb-4">Attendance by Day</h2>
          <ResponsiveContainer width="100%" height={220}>
            <ReBarChart data={attendanceByDay}>
              <XAxis dataKey="day" stroke="hsl(0 0% 55%)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(0 0% 55%)" fontSize={12} tickLine={false} axisLine={false} />
              <ReTooltip {...chartTooltipStyle} />
              <Bar dataKey="count" fill="hsl(1 95% 46%)" radius={[4, 4, 0, 0]} />
            </ReBarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Members Table */}
      <div className="stat-card">
        <h2 className="font-heading text-sm font-semibold mb-4">Recent Members</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Name</th>
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Email</th>
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {profiles.length === 0 ? (
                <tr><td colSpan={3} className="py-8 text-center text-muted-foreground">No members yet.</td></tr>
              ) : profiles.slice(0, 10).map((p) => (
                <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-2 text-foreground">{p.full_name || "—"}</td>
                  <td className="py-3 px-2 text-muted-foreground">{p.email}</td>
                  <td className="py-3 px-2 text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ─── Members Page ─── */
const MembersPage = () => {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    const [
      { data: profilesData },
      { data: rolesData },
      { data: assignmentsData }
    ] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role").eq("role", "trainer"),
      supabase.from("trainer_assignments").select("*")
    ]);

    // For trainers, we need their names from profiles
    const trainerIds = rolesData?.map(r => r.user_id) || [];
    const { data: trainerProfiles } = await supabase
      .from("profiles")
      .select("user_id, full_name")
      .in("user_id", trainerIds);

    setTrainers(trainerProfiles || []);

    // Merge assignment data into profiles
    const enrichedProfiles = (profilesData || []).map(p => ({
      ...p,
      assigned_trainer_id: assignmentsData?.find(a => a.member_id === p.user_id)?.trainer_id
    }));

    setProfiles(enrichedProfiles);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteMember = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this member? All their associated records (attendance, fees, etc.) will be removed.")) return;
    setLoading(true);
    try {
      console.log("Admin attempt delete user:", userId);
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: "Member Deleted",
        description: "The member has been removed from the system.",
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error Deleting Member",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTrainer = async (memberId: string, trainerId: string) => {
    try {
      // First, remove any existing assignment for this member
      // This allows us to "reassign" even with the composite unique constraint
      await supabase
        .from("trainer_assignments")
        .delete()
        .eq("member_id", memberId);

      if (trainerId) {
        // Create new assignment
        const { error: insertError } = await supabase
          .from("trainer_assignments")
          .insert({
            member_id: memberId,
            trainer_id: trainerId,
            updated_at: new Date().toISOString()
          });
        if (insertError) throw insertError;
      }

      toast({
        title: "Trainer Assigned",
        description: "Trainer assignment has been updated successfully.",
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Assignment Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-lg font-bold">All Members</h2>
      <div className="stat-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Name</th>
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Email</th>
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Phone</th>
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Goal</th>
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Trainer</th>
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Joined</th>
                <th className="text-right py-3 px-2 text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => (
                <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-2 text-foreground font-medium">{p.full_name || "—"}</td>
                  <td className="py-3 px-2 text-muted-foreground">{p.email}</td>
                  <td className="py-3 px-2 text-muted-foreground">{p.phone || "—"}</td>
                  <td className="py-3 px-2 text-primary">{p.fitness_goal || "—"}</td>
                  <td className="py-3 px-2">
                    <select
                      className="bg-background border border-border text-xs rounded px-2 py-1 focus:ring-1 focus:ring-primary outline-none"
                      value={p.assigned_trainer_id || ""}
                      onChange={(e) => handleAssignTrainer(p.user_id, e.target.value)}
                    >
                      <option value="">Unassigned</option>
                      {trainers.map(t => (
                        <option key={t.user_id} value={t.user_id}>{t.full_name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-2 text-muted-foreground text-xs">{new Date(p.created_at).toLocaleDateString()}</td>
                  <td className="py-3 px-2 text-right">
                    <button
                      onClick={() => handleDeleteMember(p.user_id)}
                      className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all"
                      title="Delete Member"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ─── Trainers Page ─── */
const TrainersPage = () => {
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTrainer, setNewTrainer] = useState({ name: "", email: "", password: "" });
  const { toast } = useToast();

  const fetchTrainers = async () => {
    setLoading(true);
    const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "trainer");
    const ids = roles?.map(r => r.user_id) || [];

    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .in("user_id", ids)
      .order("created_at", { ascending: false });

    setTrainers(profiles || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTrainers();
  }, []);

  const handleCreateTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: newTrainer.email,
        password: newTrainer.password,
        options: {
          data: {
            full_name: newTrainer.name,
            role: "trainer",
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Trainer Created",
        description: `Account for ${newTrainer.name} created successfully.`,
      });
      setShowAddModal(false);
      setNewTrainer({ name: "", email: "", password: "" });
      fetchTrainers();
    } catch (error: any) {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !showAddModal) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-heading text-lg font-bold">Gym Trainers</h2>
        <button onClick={() => setShowAddModal(true)} className="neon-glow-btn px-4 py-2 rounded-md font-heading text-xs flex items-center gap-2">
          <Plus className="h-4 w-4" /> ADD TRAINER
        </button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-8 w-full max-w-md animate-scale-in">
            <h3 className="font-heading text-xl font-bold mb-6">Create New Trainer</h3>
            <form onSubmit={handleCreateTrainer} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Full Name</label>
                <input
                  className="dark-input w-full px-4 py-2 rounded-md"
                  value={newTrainer.name}
                  onChange={e => setNewTrainer(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Email</label>
                <input
                  type="email"
                  className="dark-input w-full px-4 py-2 rounded-md"
                  value={newTrainer.email}
                  onChange={e => setNewTrainer(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Initial Password</label>
                <input
                  type="password"
                  className="dark-input w-full px-4 py-2 rounded-md"
                  value={newTrainer.password}
                  onChange={e => setNewTrainer(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={loading} className="neon-glow-btn flex-1 py-3 rounded-md font-heading text-sm text-[10px] tracking-widest">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto text-white" /> : "CREATE ACCOUNT"}
                </button>
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 bg-secondary py-3 rounded-md font-heading text-sm text-foreground text-[10px] tracking-widest">
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="stat-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Name</th>
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Email</th>
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {trainers.length === 0 ? (
                <tr><td colSpan={3} className="py-8 text-center text-muted-foreground">No trainers found.</td></tr>
              ) : trainers.map((t) => (
                <tr key={t.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-2 text-foreground font-medium">{t.full_name || "—"}</td>
                  <td className="py-3 px-2 text-muted-foreground">{t.email}</td>
                  <td className="py-3 px-2 text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ─── Attendance Page ─── */
const AttendancePage = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("attendance")
        .select("*, profiles!attendance_user_id_fkey(full_name)")
        .order("check_in", { ascending: false })
        .limit(100);
      setRecords(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-lg font-bold">Attendance Logs</h2>
      <div className="stat-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Member</th>
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Check In</th>
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Check Out</th>
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Duration</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">No records.</td></tr>
              ) : records.map((r) => (
                <tr key={r.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-2 text-foreground">{r.profiles?.full_name || "Unknown"}</td>
                  <td className="py-3 px-2 text-muted-foreground">{new Date(r.check_in).toLocaleString()}</td>
                  <td className="py-3 px-2 text-muted-foreground">{r.check_out ? new Date(r.check_out).toLocaleString() : "—"}</td>
                  <td className="py-3 px-2 text-primary">{r.duration_minutes ? `${r.duration_minutes} min` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ─── Fees Page ─── */
const FeesPage = () => {
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("fees")
        .select("*, profiles!fees_user_id_fkey(full_name)")
        .order("due_date", { ascending: false })
        .limit(100);
      setFees(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-lg font-bold">Fee Tracking</h2>
      <div className="stat-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Member</th>
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Plan</th>
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Amount</th>
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Due Date</th>
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {fees.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No fee records.</td></tr>
              ) : fees.map((f) => (
                <tr key={f.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-2 text-foreground">{f.profiles?.full_name || "Unknown"}</td>
                  <td className="py-3 px-2 text-muted-foreground">{f.plan_name}</td>
                  <td className="py-3 px-2 text-foreground">${Number(f.amount).toFixed(2)}</td>
                  <td className="py-3 px-2 text-muted-foreground">{new Date(f.due_date).toLocaleDateString()}</td>
                  <td className="py-3 px-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${f.status === "paid" ? "bg-green-500/10 text-green-400" :
                      f.status === "overdue" ? "bg-red-500/10 text-red-400" :
                        "bg-yellow-500/10 text-yellow-400"
                      }`}>{f.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ─── Router ─── */
const AdminDashboard = () => {
  const location = useLocation();
  const path = location.pathname;

  const renderPage = () => {
    if (path === "/admin/members") return <MembersPage />;
    if (path === "/admin/trainers") return <TrainersPage />;
    if (path === "/admin/attendance") return <AttendancePage />;
    if (path === "/admin/fees") return <FeesPage />;
    return <AdminOverview />;
  };

  return (
    <DashboardLayout links={sidebarLinks} title="Admin Dashboard">
      {renderPage()}
    </DashboardLayout>
  );
};

export default AdminDashboard;
