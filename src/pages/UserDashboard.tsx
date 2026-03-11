import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard, QrCode, CalendarDays, Flame, Heart, DollarSign, Download,
  Clock, TrendingUp, Activity, Radio, CheckCircle, AlertCircle, Droplets, Moon, Dumbbell, Loader2,
} from "lucide-react";
import { BarChart as ReBarChart, Bar, XAxis, YAxis, Tooltip as ReTooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from "recharts";
import type { Tables } from "@/integrations/supabase/types";

const sidebarLinks = [
  { label: "Dashboard", to: "/member", icon: LayoutDashboard },
  { label: "QR Code", to: "/member/qr", icon: QrCode },
  { label: "Attendance", to: "/member/attendance", icon: CalendarDays },
  { label: "Fee Status", to: "/member/fees", icon: DollarSign },
  { label: "Health", to: "/member/health", icon: Heart },
];

const chartTooltipStyle = {
  contentStyle: { backgroundColor: "hsl(0 0% 8%)", border: "1px solid hsl(0 0% 16%)", borderRadius: "8px", color: "hsl(0 0% 95%)" },
  labelStyle: { color: "hsl(0 0% 55%)" },
};

/* ─── Sub-page: QR Code ─── */
const QRCodePage = () => {
  const { user, profile } = useAuth();
  return (
    <div className="space-y-6">
      <h2 className="font-heading text-lg font-bold">Your QR Code</h2>
      <div className="stat-card flex flex-col items-center text-center py-10">
        <div className="w-56 h-56 bg-foreground rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-primary/10">
          <QrCode className="h-40 w-40 text-background" />
        </div>
        <p className="text-primary font-heading text-lg font-bold mb-1">
          {user?.id ? `GYM-${user.id.slice(0, 8).toUpperCase()}` : "GYM-XXXXXXXX"}
        </p>
        <p className="text-sm text-muted-foreground mb-6">Scan this code at the entrance for instant check-in</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-md">
          <div className="stat-card text-center py-3">
            <p className="text-xs text-muted-foreground">Member Since</p>
            <p className="text-sm font-heading font-bold text-foreground">
              {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "—"}
            </p>
          </div>
          <div className="stat-card text-center py-3">
            <p className="text-xs text-muted-foreground">Name</p>
            <p className="text-sm font-heading font-bold text-primary">{profile?.full_name || "—"}</p>
          </div>
          <div className="stat-card text-center py-3">
            <p className="text-xs text-muted-foreground">Status</p>
            <p className="text-sm font-heading font-bold text-green-500">Active</p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Sub-page: Attendance ─── */
const AttendancePage = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<Tables<"attendance">[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("attendance")
        .select("*")
        .eq("user_id", user.id)
        .order("check_in", { ascending: false })
        .limit(30);
      setAttendance(data || []);
      setLoading(false);
    };
    fetch();

    // Real-time subscription
    const channel = supabase
      .channel("attendance-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "attendance", filter: `user_id=eq.${user.id}` }, () => {
        fetch();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const thisMonth = attendance.filter((a) => {
    const d = new Date(a.check_in);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  // Calculate streak
  const calcStreak = () => {
    if (attendance.length === 0) return 0;
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dates = [...new Set(attendance.map((a) => new Date(a.check_in).toDateString()))];
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      if (dates.includes(checkDate.toDateString())) {
        streak++;
      } else if (i > 0) break;
    }
    return streak;
  };

  const avgDuration = thisMonth.length > 0
    ? Math.round(thisMonth.reduce((sum, a) => sum + (a.duration_minutes || 0), 0) / thisMonth.length)
    : 0;

  const weeklyData = (() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const result = days.map((day) => ({ day, hours: 0 }));
    thisMonth.forEach((a) => {
      const dayIdx = new Date(a.check_in).getDay();
      result[dayIdx].hours += (a.duration_minutes || 0) / 60;
    });
    return result;
  })();

  const exportCSV = () => {
    const header = "Date,Check In,Check Out,Duration (min)\n";
    const rows = attendance.map((a) =>
      `${new Date(a.check_in).toLocaleDateString()},${new Date(a.check_in).toLocaleTimeString()},${a.check_out ? new Date(a.check_out).toLocaleTimeString() : "—"},${a.duration_minutes || "—"}`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "attendance_report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Check in/out
  const handleCheckIn = async () => {
    if (!user) return;
    await supabase.from("attendance").insert({ user_id: user.id, check_in: new Date().toISOString() });
  };

  const activeSession = attendance.find((a) => !a.check_out);

  const handleCheckOut = async () => {
    if (!activeSession) return;
    const checkIn = new Date(activeSession.check_in);
    const now = new Date();
    const duration = Math.round((now.getTime() - checkIn.getTime()) / 60000);
    await supabase
      .from("attendance")
      .update({ check_out: now.toISOString(), duration_minutes: duration })
      .eq("id", activeSession.id);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="font-heading text-lg font-bold">Attendance History</h2>
        <div className="flex gap-2">
          {activeSession ? (
            <button onClick={handleCheckOut} className="neon-glow-btn px-4 py-2 rounded-md text-xs font-heading">CHECK OUT</button>
          ) : (
            <button onClick={handleCheckIn} className="neon-glow-btn px-4 py-2 rounded-md text-xs font-heading">CHECK IN</button>
          )}
          <button onClick={exportCSV} className="px-4 py-2 rounded-md text-xs font-heading bg-secondary text-foreground flex items-center gap-2 hover:bg-secondary/80 transition-colors">
            <Download className="h-3 w-3" /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard title="This Month" value={`${thisMonth.length} Visits`} icon={CalendarDays} change={`Goal: 20 visits`} />
        <StatsCard title="Current Streak" value={`${calcStreak()} Days`} icon={Flame} />
        <StatsCard title="Avg Duration" value={avgDuration > 0 ? `${Math.floor(avgDuration / 60)}h ${avgDuration % 60}m` : "—"} icon={Clock} />
      </div>

      <div className="stat-card">
        <h3 className="font-heading text-sm font-semibold mb-4">Weekly Training Hours</h3>
        <ResponsiveContainer width="100%" height={200}>
          <ReBarChart data={weeklyData}>
            <XAxis dataKey="day" stroke="hsl(0 0% 55%)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(0 0% 55%)" fontSize={12} tickLine={false} axisLine={false} />
            <ReTooltip {...chartTooltipStyle} />
            <Bar dataKey="hours" fill="hsl(1 95% 46%)" radius={[4, 4, 0, 0]} />
          </ReBarChart>
        </ResponsiveContainer>
      </div>

      <div className="stat-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Date</th>
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Check In</th>
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Check Out</th>
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Duration</th>
              </tr>
            </thead>
            <tbody>
              {attendance.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">No attendance records yet. Click "CHECK IN" to start!</td></tr>
              ) : attendance.map((a) => (
                <tr key={a.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-2 text-foreground">{new Date(a.check_in).toLocaleDateString()}</td>
                  <td className="py-3 px-2 text-muted-foreground">{new Date(a.check_in).toLocaleTimeString()}</td>
                  <td className="py-3 px-2 text-muted-foreground">{a.check_out ? new Date(a.check_out).toLocaleTimeString() : "—"}</td>
                  <td className="py-3 px-2 text-primary">{a.duration_minutes ? `${Math.floor(a.duration_minutes / 60)}h ${a.duration_minutes % 60}m` : "In progress"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ─── Sub-page: Fee Status ─── */
const FeeStatusPage = () => {
  const { user } = useAuth();
  const [fees, setFees] = useState<Tables<"fees">[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("fees")
        .select("*")
        .eq("user_id", user.id)
        .order("due_date", { ascending: false });
      setFees(data || []);
      setLoading(false);
    };
    fetch();

    const channel = supabase
      .channel("fees-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "fees", filter: `user_id=eq.${user.id}` }, () => {
        fetch();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const totalPaid = fees.filter((f) => f.status === "paid").reduce((sum, f) => sum + Number(f.amount), 0);
  const latestFee = fees[0];

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-lg font-bold">Fee Status</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard title="Current Plan" value={latestFee?.plan_name || "—"} icon={Dumbbell} change={latestFee ? `$${Number(latestFee.amount).toFixed(0)}/month` : ""} />
        <StatsCard title="Next Due Date" value={latestFee ? new Date(latestFee.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"} icon={CalendarDays} />
        <StatsCard title="Total Paid" value={`$${totalPaid.toFixed(0)}`} icon={DollarSign} change={`${fees.filter((f) => f.status === "paid").length} payments`} />
      </div>

      <div className="stat-card">
        <h3 className="font-heading text-sm font-semibold mb-4">Payment History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Plan</th>
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Amount</th>
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Due Date</th>
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {fees.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">No fee records found.</td></tr>
              ) : fees.map((f) => (
                <tr key={f.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-2 text-foreground">{f.plan_name}</td>
                  <td className="py-3 px-2 text-foreground">${Number(f.amount).toFixed(2)}</td>
                  <td className="py-3 px-2 text-muted-foreground">{new Date(f.due_date).toLocaleDateString()}</td>
                  <td className="py-3 px-2">
                    <span className={`inline-flex items-center gap-1 text-xs font-heading px-2 py-1 rounded-full ${
                      f.status === "paid" ? "bg-green-500/10 text-green-500" :
                      f.status === "overdue" ? "bg-red-500/10 text-red-500" :
                      "bg-yellow-500/10 text-yellow-500"
                    }`}>
                      {f.status === "paid" ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                      {f.status.charAt(0).toUpperCase() + f.status.slice(1)}
                    </span>
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

/* ─── Sub-page: Health ─── */
const HealthPage = () => {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Tables<"health_reminders">[]>([]);
  const [loading, setLoading] = useState(true);
  const [newReminder, setNewReminder] = useState("");
  const [newCategory, setNewCategory] = useState("Daily");

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("health_reminders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setReminders(data || []);
      setLoading(false);
    };
    fetch();

    const channel = supabase
      .channel("health-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "health_reminders", filter: `user_id=eq.${user.id}` }, () => {
        fetch();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const addReminder = async () => {
    if (!user || !newReminder.trim()) return;
    await supabase.from("health_reminders").insert({
      user_id: user.id,
      reminder_text: newReminder,
      category: newCategory,
    });
    setNewReminder("");
  };

  const toggleComplete = async (id: string, current: boolean) => {
    await supabase.from("health_reminders").update({ is_completed: !current }).eq("id", id);
  };

  const deleteReminder = async (id: string) => {
    await supabase.from("health_reminders").delete().eq("id", id);
  };

  const iconMap: Record<string, any> = { Daily: Droplets, "Pre-workout": Activity, "Post-workout": Dumbbell, Recovery: Moon, Nutrition: TrendingUp };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-lg font-bold">Health & Wellness</h2>

      {/* Add reminder */}
      <div className="stat-card">
        <h3 className="font-heading text-sm font-semibold mb-4">Add Reminder</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            className="dark-input flex-1 px-4 py-3 rounded-md"
            placeholder="e.g. Drink 3L of water today"
            value={newReminder}
            onChange={(e) => setNewReminder(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addReminder()}
          />
          <select className="dark-input px-4 py-3 rounded-md" value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
            {["Daily", "Pre-workout", "Post-workout", "Recovery", "Nutrition"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <button onClick={addReminder} className="neon-glow-btn px-6 py-3 rounded-md text-xs font-heading">ADD</button>
        </div>
      </div>

      {/* Reminders list */}
      <div className="stat-card">
        <h3 className="font-heading text-sm font-semibold mb-4">Your Reminders</h3>
        {reminders.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No reminders yet. Add one above!</p>
        ) : (
          <div className="space-y-3">
            {reminders.map((r) => {
              const Icon = iconMap[r.category] || Heart;
              return (
                <div key={r.id} className={`flex items-center justify-between p-3 rounded-md transition-all ${r.is_completed ? "bg-secondary/20 opacity-60" : "bg-secondary/50"}`}>
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleComplete(r.id, r.is_completed)} className="shrink-0">
                      {r.is_completed ? <CheckCircle className="h-5 w-5 text-green-500" /> : <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />}
                    </button>
                    <Icon className="h-4 w-4 text-primary shrink-0" />
                    <p className={`text-sm ${r.is_completed ? "line-through text-muted-foreground" : "text-foreground"}`}>{r.reminder_text}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-primary shrink-0">{r.category}</span>
                    <button onClick={() => deleteReminder(r.id)} className="text-xs text-muted-foreground hover:text-red-400 transition-colors">✕</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Main Dashboard (overview) ─── */
const DashboardOverview = () => {
  const { user, profile } = useAuth();
  const [liveCount, setLiveCount] = useState(0);
  const [attendance, setAttendance] = useState<Tables<"attendance">[]>([]);
  const [fees, setFees] = useState<Tables<"fees">[]>([]);

  useEffect(() => {
    // Fetch live occupancy
    const fetchOccupancy = async () => {
      const { data } = await supabase.from("gym_settings").select("value").eq("key", "live_occupancy").single();
      setLiveCount(parseInt(data?.value || "0"));
    };
    fetchOccupancy();

    const channel = supabase
      .channel("gym-settings-live")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "gym_settings" }, () => {
        fetchOccupancy();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [{ data: att }, { data: fe }] = await Promise.all([
        supabase.from("attendance").select("*").eq("user_id", user.id).order("check_in", { ascending: false }).limit(30),
        supabase.from("fees").select("*").eq("user_id", user.id).order("due_date", { ascending: false }).limit(1),
      ]);
      setAttendance(att || []);
      setFees(fe || []);
    };
    fetchData();
  }, [user]);

  const thisMonth = attendance.filter((a) => {
    const d = new Date(a.check_in);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const calcStreak = () => {
    if (attendance.length === 0) return 0;
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dates = [...new Set(attendance.map((a) => new Date(a.check_in).toDateString()))];
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      if (dates.includes(checkDate.toDateString())) streak++;
      else if (i > 0) break;
    }
    return streak;
  };

  const avgDuration = thisMonth.length > 0
    ? Math.round(thisMonth.reduce((sum, a) => sum + (a.duration_minutes || 0), 0) / thisMonth.length)
    : 0;

  const latestFee = fees[0];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="stat-card">
        <p className="text-sm text-muted-foreground">Welcome back,</p>
        <p className="text-xl font-heading font-bold text-foreground">{profile?.full_name || "Member"}</p>
      </div>

      {/* Live Banner */}
      <div className="stat-card flex items-center justify-between animate-pulse-glow">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Radio className="h-5 w-5 text-primary" />
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-primary rounded-full animate-ping" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Live Gym Occupancy</p>
            <p className="text-xs text-muted-foreground">Real-time from database</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-heading font-bold text-primary">{liveCount}</p>
          <p className="text-xs text-muted-foreground">members currently in gym</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Current Streak" value={`${calcStreak()} Days`} icon={Flame} />
        <StatsCard title="This Month" value={`${thisMonth.length} Visits`} icon={CalendarDays} change="Goal: 20 visits" />
        <StatsCard title="Fee Status" value={latestFee?.status ? latestFee.status.charAt(0).toUpperCase() + latestFee.status.slice(1) : "—"} icon={DollarSign} change={latestFee ? `Next: ${new Date(latestFee.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : ""} />
        <StatsCard title="Avg Duration" value={avgDuration > 0 ? `${Math.floor(avgDuration / 60)}h ${avgDuration % 60}m` : "—"} icon={Clock} />
      </div>

      {/* QR + Quick Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="stat-card flex flex-col items-center text-center">
          <h2 className="font-heading text-sm font-semibold mb-4">Your QR Code</h2>
          <div className="w-48 h-48 bg-foreground rounded-lg flex items-center justify-center mb-4">
            <QrCode className="h-32 w-32 text-background" />
          </div>
          <p className="text-xs text-muted-foreground">Scan at the entrance for quick check-in</p>
          <p className="text-xs text-primary mt-2 font-heading">
            ID: {user?.id ? `GYM-${user.id.slice(0, 8).toUpperCase()}` : "—"}
          </p>
        </div>
        <div className="stat-card">
          <h2 className="font-heading text-sm font-semibold mb-4">Recent Activity</h2>
          {attendance.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No attendance records yet.</p>
          ) : (
            <div className="space-y-3">
              {attendance.slice(0, 5).map((a) => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-md bg-secondary/50">
                  <p className="text-sm text-foreground">{new Date(a.check_in).toLocaleDateString()}</p>
                  <span className="text-xs text-primary">{a.duration_minutes ? `${a.duration_minutes} min` : "In progress"}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Router ─── */
const UserDashboard = () => {
  const location = useLocation();
  const path = location.pathname;

  const renderPage = () => {
    if (path === "/member/qr") return <QRCodePage />;
    if (path === "/member/attendance") return <AttendancePage />;
    if (path === "/member/fees") return <FeeStatusPage />;
    if (path === "/member/health") return <HealthPage />;
    return <DashboardOverview />;
  };

  return (
    <DashboardLayout links={sidebarLinks} title="Member Dashboard">
      {renderPage()}
    </DashboardLayout>
  );
};

export default UserDashboard;
