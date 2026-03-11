import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Dumbbell, Shield, User, GraduationCap, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const roleConfig: Record<string, { title: string; icon: any; color: string; dashboard: string }> = {
  admin: { title: "Admin Login", icon: Shield, color: "Admin", dashboard: "/admin" },
  trainer: { title: "Trainer Login", icon: GraduationCap, color: "Trainer", dashboard: "/trainer" },
  user: { title: "Member Login", icon: User, color: "Member", dashboard: "/member" },
};

const Login = () => {
  const { role } = useParams<{ role: string }>();
  const config = roleConfig[role || ""] || roleConfig.user;
  const Icon = config.icon;
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // Check role and redirect
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userRole } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .limit(1)
          .single();

        const dashboardMap: Record<string, string> = {
          admin: "/admin",
          member: "/member",
          trainer: "/trainer",
        };
        navigate(dashboardMap[userRole?.role || "member"] || "/member");
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDefaultAdmin = async () => {
    setLoading(true);
    const defaultEmail = "admin@rolexfit.com";
    const defaultPassword = "admin123";

    try {
      // Try to sign in first
      let { error } = await supabase.auth.signInWithPassword({
        email: defaultEmail,
        password: defaultPassword
      });

      // If user doesn't exist, create them
      if (error && error.message.includes("Invalid login credentials")) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: defaultEmail,
          password: defaultPassword,
          options: {
            data: {
              full_name: "Default Admin",
              role: "admin",
            },
          },
        });
        if (signUpError) throw signUpError;

        // In local development or Supabase settings, sign up might require email confirmation
        // But for "quick login", we'll hope it either works or they can confirm it.
        // For true "default", we usually seed it in the DB, but this is a frontend workaround.

        toast({
          title: "Admin Account Created",
          description: "Use admin@rolexfit.com / admin123 to log in.",
        });
      } else if (error) {
        throw error;
      } else {
        navigate("/admin");
      }
    } catch (error: any) {
      toast({
        title: "Default Admin Setup Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDefaultTrainer = async () => {
    setLoading(true);
    const defaultEmail = "trainer@rolexfit.com";
    const defaultPassword = "trainer123";

    try {
      // Try to sign in first
      let { error } = await supabase.auth.signInWithPassword({
        email: defaultEmail,
        password: defaultPassword
      });

      // If user doesn't exist, create them
      if (error && error.message.includes("Invalid login credentials")) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: defaultEmail,
          password: defaultPassword,
          options: {
            data: {
              full_name: "Default Trainer",
              role: "trainer",
            },
          },
        });
        if (signUpError) throw signUpError;

        toast({
          title: "Trainer Account Created",
          description: "Use trainer@rolexfit.com / trainer123 to log in.",
        });
      } else if (error) {
        throw error;
      } else {
        navigate("/trainer");
      }
    } catch (error: any) {
      toast({
        title: "Default Trainer Setup Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
            <Icon className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-heading text-2xl font-bold mb-2">{config.title}</h1>
          <p className="text-muted-foreground text-sm">Sign in to your {config.color.toLowerCase()} dashboard</p>
        </div>

        <div className="glass-card p-8">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="dark-input w-full px-4 py-3 rounded-md"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="dark-input w-full px-4 py-3 rounded-md"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="neon-glow-btn w-full py-3 rounded-md font-heading text-sm tracking-wider flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "SIGN IN"}
            </button>

            {(role === 'admin' || !role) && (
              <button
                type="button"
                onClick={handleDefaultAdmin}
                disabled={loading}
                className="w-full py-3 mt-2 rounded-md font-heading text-[10px] tracking-widest border border-primary/20 hover:bg-primary/5 transition-colors text-primary/80 flex items-center justify-center gap-2"
              >
                LOGIN AS DEFAULT ADMIN
              </button>
            )}

            {role === 'trainer' && (
              <button
                type="button"
                onClick={handleDefaultTrainer}
                disabled={loading}
                className="w-full py-3 mt-2 rounded-md font-heading text-[10px] tracking-widest border border-primary/20 hover:bg-primary/5 transition-colors text-primary/80 flex items-center justify-center gap-2"
              >
                LOGIN AS DEFAULT TRAINER
              </button>
            )}
          </form>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary hover:underline">Register</Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-xs text-muted-foreground hover:text-primary transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
