import { CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export function AvailabilityBadge({
  available,
  size = "sm",
  className,
}: {
  available: boolean;
  size?: "sm" | "lg";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-display font-semibold uppercase tracking-wide",
        size === "sm" ? "px-2.5 py-1 text-xs" : "px-4 py-2 text-sm",
        available
          ? "bg-success/12 text-success"
          : "bg-muted text-muted-foreground",
        className,
      )}
    >
      {available ? <CheckCircle2 className="size-3.5" /> : <Clock className="size-3.5" />}
      {available ? "Available at Showroom" : "Currently Unavailable"}
    </span>
  );
}
