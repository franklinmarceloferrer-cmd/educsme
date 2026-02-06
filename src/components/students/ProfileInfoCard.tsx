import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileInfoCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  isEmpty?: boolean;
}

export function ProfileInfoCard({ icon: Icon, label, value, isEmpty }: ProfileInfoCardProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className={cn(
          "text-sm mt-0.5 break-words",
          isEmpty && "text-muted-foreground italic"
        )}>
          {value}
        </p>
      </div>
    </div>
  );
}
