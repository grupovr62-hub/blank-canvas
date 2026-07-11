import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    type: "increase" | "decrease" | "neutral";
  };
  variant?: "default" | "accent" | "success" | "warning";
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
}: MetricCardProps) {
  const variantStyles = {
    default: "border-border",
    accent: "border-accent/20 bg-gradient-to-br from-accent/5 to-accent/10",
    success: "border-success/20 bg-gradient-to-br from-success/5 to-success/10",
    warning: "border-warning/20 bg-gradient-to-br from-warning/5 to-warning/10",
  };

  const iconStyles = {
    default: "text-primary",
    accent: "text-accent",
    success: "text-success", 
    warning: "text-warning",
  };

  return (
    <Card className={cn("shadow-card hover:shadow-elevated transition-shadow", variantStyles[variant])}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-foreground">{value}</span>
              {trend && (
                <span
                  className={cn(
                    "text-xs font-medium",
                    trend.type === "increase" && "text-success",
                    trend.type === "decrease" && "text-destructive",
                    trend.type === "neutral" && "text-muted-foreground"
                  )}
                >
                  {trend.value}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className={cn("p-3 rounded-lg bg-background/50", iconStyles[variant])}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}