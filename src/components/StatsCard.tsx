import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  change?: string;
}

const StatsCard = ({ title, value, icon: Icon, change }: StatsCardProps) => (
  <div className="stat-card flex items-start justify-between">
    <div>
      <p className="text-sm text-muted-foreground mb-1">{title}</p>
      <p className="text-3xl font-heading font-bold text-foreground">{value}</p>
      {change && <p className="text-xs text-primary mt-2">{change}</p>}
    </div>
    <div className="p-3 rounded-lg bg-primary/10">
      <Icon className="h-6 w-6 text-primary" />
    </div>
  </div>
);

export default StatsCard;
