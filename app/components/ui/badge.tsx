import * as React from "react";
import { cn } from "~/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "submitted"
    | "verified"
    | "assigned"
    | "in_progress"
    | "review"
    | "completed"
    | "rejected"
    | "duplicate"
    | "urgency-normal"
    | "urgency-high"
    | "urgency-emergency"
    | "neutral"
    | "lime";
}

export function Badge({
  className,
  variant = "neutral",
  children,
  ...props
}: BadgeProps) {
  const variants = {
    submitted: "bg-[#FEF08A] text-[#09090B]",
    verified: "bg-[#A5F3FC] text-[#09090B]",
    assigned: "bg-[#BAE6FD] text-[#09090B]",
    in_progress: "bg-[#FED7AA] text-[#09090B]",
    review: "bg-[#E9D5FF] text-[#09090B]",
    completed: "bg-[#D9F99D] text-[#09090B]",
    rejected: "bg-[#FECDD3] text-[#09090B]",
    duplicate: "bg-[#E2E8F0] text-[#09090B]",
    "urgency-normal": "bg-[#E0E7FF] text-[#09090B]",
    "urgency-high": "bg-[#FDE68A] text-[#09090B]",
    "urgency-emergency": "bg-[#FCA5A5] text-[#09090B]",
    neutral: "bg-white text-[#09090B]",
    lime: "bg-[#D9F99D] text-[#09090B]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 border-2 border-ink-primary text-xs font-bold font-mono shadow-neo-sm",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function getStatusBadgeConfig(status: string) {
  switch (status) {
    case "submitted":
      return { variant: "submitted" as const, label: "Diajukan" };
    case "verified":
      return { variant: "verified" as const, label: "Diverifikasi" };
    case "assigned":
      return { variant: "assigned" as const, label: "Ditugaskan" };
    case "in_progress":
      return { variant: "in_progress" as const, label: "Dalam Perbaikan" };
    case "review":
      return { variant: "review" as const, label: "Menunggu Konfirmasi" };
    case "completed":
      return { variant: "completed" as const, label: "Selesai" };
    case "rejected":
      return { variant: "rejected" as const, label: "Ditolak" };
    case "duplicate":
      return { variant: "duplicate" as const, label: "Duplikat" };
    default:
      return { variant: "neutral" as const, label: status };
  }
}

export function getUrgencyBadgeConfig(urgency: string) {
  switch (urgency) {
    case "emergency":
      return { variant: "urgency-emergency" as const, label: "Darurat" };
    case "high":
      return { variant: "urgency-high" as const, label: "Tinggi" };
    case "normal":
    default:
      return { variant: "urgency-normal" as const, label: "Normal" };
  }
}
