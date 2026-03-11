import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, Users, ClipboardList, TrendingUp, Dumbbell, Loader2 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

const sidebarLinks = [
  { label: "Dashboard", to: "/trainer", icon: LayoutDashboard },
  { label: "My Members", to: "/trainer/members", icon: Users },
  { label: "Workout Plans", to: "/trainer/plans", icon: ClipboardList },
  { label: "Progress", to: "/trainer/progress", icon: TrendingUp },
];

const TrainerOverview = () => {
  const { user, profile } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("trainer_assignments")
        .select("*, profiles!trainer_assignments_member_id_fkey(full_name, fitness_goal, experience_level)")
        .eq("trainer_id", user.id);
      setAssignments(data || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="stat-card">
        <p className="text-sm text-muted-foreground">Welcome back,</p>
        <p className="text-xl font-heading font-bold text-foreground">{profile?.full_name || "Trainer"}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard title="Assigned Members" value={assignments.length.toString()} icon={Users} />
        <StatsCard title="Active Plans" value={assignments.filter((a) => a.workout_plan).length.toString()} icon={ClipboardList} />
        <StatsCard title="Avg Progress" value="—" icon={TrendingUp} />
      </div>

      <div className="stat-card">
        <h2 className="font-heading text-sm font-semibold mb-4">Assigned Members</h2>
        {assignments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No members assigned yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignments.map((a) => (
              <div key={a.id} className="p-4 rounded-lg bg-secondary/30 border border-border/50 hover:border-primary/30 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium text-foreground">{a.profiles?.full_name || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">{a.profiles?.fitness_goal || "No goal set"}</p>
                  </div>
                  <Dumbbell className="h-4 w-4 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground">Plan: {a.workout_plan || "Not assigned"}</p>
                {a.notes && <p className="text-xs text-primary mt-1">Notes: {a.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── My Members Page ─── */
const MyMembersPage = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("trainer_assignments")
        .select("*, profiles!trainer_assignments_member_id_fkey(full_name, email, fitness_goal, experience_level)")
        .eq("trainer_id", user.id);
      setAssignments(data || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPlan, setEditPlan] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const startEdit = (a: any) => {
    setEditingId(a.id);
    setEditPlan(a.workout_plan || "");
    setEditNotes(a.notes || "");
  };

  const saveEdit = async () => {
    if (!editingId) return;
    await supabase.from("trainer_assignments").update({ workout_plan: editPlan, notes: editNotes }).eq("id", editingId);
    setEditingId(null);
    // Refetch
    if (!user) return;
    const { data } = await supabase
      .from("trainer_assignments")
      .select("*, profiles!trainer_assignments_member_id_fkey(full_name, email, fitness_goal, experience_level)")
      .eq("trainer_id", user.id);
    setAssignments(data || []);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-lg font-bold">My Members</h2>
      {assignments.length === 0 ? (
        <div className="stat-card text-center py-12">
          <p className="text-muted-foreground">No members assigned to you yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((a) => (
            <div key={a.id} className="stat-card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium text-foreground">{a.profiles?.full_name || "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">{a.profiles?.email}</p>
                  <p className="text-xs text-primary mt-1">Goal: {a.profiles?.fitness_goal || "—"} · Level: {a.profiles?.experience_level || "—"}</p>
                </div>
                <button onClick={() => startEdit(a)} className="text-xs text-primary hover:underline">Edit Plan</button>
              </div>
              {editingId === a.id ? (
                <div className="space-y-3 mt-4 pt-4 border-t border-border">
                  <input className="dark-input w-full px-4 py-3 rounded-md" placeholder="Workout plan name" value={editPlan} onChange={(e) => setEditPlan(e.target.value)} />
                  <textarea className="dark-input w-full px-4 py-3 rounded-md resize-none" rows={3} placeholder="Notes..." value={editNotes} onChange={(e) => setEditNotes(e.target.value)} />
                  <div className="flex gap-2">
                    <button onClick={saveEdit} className="neon-glow-btn px-4 py-2 rounded-md text-xs font-heading">SAVE</button>
                    <button onClick={() => setEditingId(null)} className="px-4 py-2 rounded-md text-xs bg-secondary text-foreground">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="mt-2 text-sm text-muted-foreground">
                  <p>Plan: {a.workout_plan || "Not assigned"}</p>
                  {a.notes && <p className="text-xs mt-1">Notes: {a.notes}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Router ─── */
const TrainerDashboard = () => {
  const location = useLocation();
  const path = location.pathname;

  const renderPage = () => {
    if (path === "/trainer/members") return <MyMembersPage />;
    return <TrainerOverview />;
  };

  return (
    <DashboardLayout links={sidebarLinks} title="Trainer Dashboard">
      {renderPage()}
    </DashboardLayout>
  );
};

export default TrainerDashboard;
