import type { LabStatus } from "@/data/labProjects";

const STYLES: Record<LabStatus, string> = {
  concept: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  experimenting: "bg-primary/10 text-primary",
  graduated: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  paused: "bg-muted/10 text-muted",
};

export default function LabStatusBadge({ status, label }: { status: LabStatus; label: string }) {
  return (
    <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${STYLES[status]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {label}
    </span>
  );
}
