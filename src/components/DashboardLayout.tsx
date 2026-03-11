import { ReactNode } from "react";
import { LucideIcon, Menu, X, Dumbbell, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import DashboardSidebar from "./DashboardSidebar";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardLayoutProps {
  children: ReactNode;
  links: { label: string; to: string; icon: LucideIcon }[];
  title: string;
}

const DashboardLayout = ({ children, links, title }: DashboardLayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex">
      <DashboardSidebar links={links} title={title} />

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-background/80" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-60 bg-sidebar border-r border-sidebar-border animate-fade-in-left">
            <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
              <div className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-primary" />
                <span className="font-heading text-sm font-bold">{title}</span>
              </div>
              <button onClick={() => setMobileOpen(false)}>
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <nav className="py-4">
              {links.map((link) => {
                const active = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                      active ? "text-primary bg-primary/10" : "text-sidebar-foreground hover:text-foreground"
                    }`}
                  >
                    <link.icon className="h-5 w-5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-sidebar-border">
              <Link to="/" className="text-xs text-muted-foreground hover:text-primary">← Back to Home</Link>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-16 border-b border-border flex items-center justify-between px-4 md:px-6 bg-background/80 backdrop-blur-md">
          <div className="flex items-center">
            <button className="md:hidden mr-4" onClick={() => setMobileOpen(true)}>
              <Menu className="h-5 w-5 text-foreground" />
            </button>
            <h1 className="font-heading text-sm font-semibold tracking-wider text-foreground">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            {profile && <span className="text-xs text-muted-foreground hidden sm:inline">{profile.full_name || profile.email}</span>}
            <button onClick={handleLogout} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
              <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
