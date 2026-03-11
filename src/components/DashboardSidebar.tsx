import { Link, useLocation } from "react-router-dom";
import { LucideIcon, Dumbbell, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface SidebarLink {
  label: string;
  to: string;
  icon: LucideIcon;
}

interface DashboardSidebarProps {
  links: SidebarLink[];
  title: string;
}

const DashboardSidebar = ({ links, title }: DashboardSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={`hidden md:flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-primary" />
            <span className="font-heading text-sm font-bold tracking-wider">
              {title}
            </span>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="text-muted-foreground hover:text-foreground">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
      <nav className="flex-1 py-4">
        {links.map((link) => {
          const active = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors duration-200 ${
                active
                  ? "text-primary bg-primary/10 border-r-2 border-primary"
                  : "text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent"
              }`}
            >
              <link.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-sidebar-border">
        <Link to="/" className="text-xs text-muted-foreground hover:text-primary transition-colors">
          {collapsed ? "←" : "← Back to Home"}
        </Link>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
