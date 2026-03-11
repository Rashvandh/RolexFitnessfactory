import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dumbbell, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    plan: "Basic",
    role: "member",
  });

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: `${form.firstName} ${form.lastName}`,
            role: form.role,
          },
        },
      });
      if (error) throw error;

      toast({
        title: "Account Created!",
        description: "Please check your email to confirm your account, then log in.",
      });
      navigate("/login/user");
    } catch (error: any) {
      toast({
        title: "Registration Failed",
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
            <Dumbbell className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-heading text-2xl font-bold mb-2">CREATE ACCOUNT</h1>
          <p className="text-muted-foreground text-sm">Join RedLine Gym and start your fitness journey</p>
        </div>

        <div className="glass-card p-8">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">First Name</label>
                <input type="text" placeholder="John" className="dark-input w-full px-4 py-3 rounded-md" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} required />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Last Name</label>
                <input type="text" placeholder="Doe" className="dark-input w-full px-4 py-3 rounded-md" value={form.lastName} onChange={(e) => update("lastName", e.target.value)} required />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
              <input type="email" placeholder="you@example.com" className="dark-input w-full px-4 py-3 rounded-md" value={form.email} onChange={(e) => update("email", e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Phone</label>
              <input type="tel" placeholder="+1 (555) 000-0000" className="dark-input w-full px-4 py-3 rounded-md" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Password</label>
              <input type="password" placeholder="••••••••" className="dark-input w-full px-4 py-3 rounded-md" value={form.password} onChange={(e) => update("password", e.target.value)} required minLength={6} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Plan</label>
              <select className="dark-input w-full px-4 py-3 rounded-md" value={form.plan} onChange={(e) => update("plan", e.target.value)}>
                <option>Basic</option>
                <option>Pro</option>
                <option>Elite</option>
              </select>
            </div>
            <button type="submit" disabled={loading} className="neon-glow-btn w-full py-3 rounded-md font-heading text-sm tracking-wider flex items-center justify-center gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "CREATE ACCOUNT"}
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login/user" className="text-primary hover:underline">Sign In</Link>
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

export default Register;
