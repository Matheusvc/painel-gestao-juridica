import { Circle } from "lucide-react";
import { getStatusColor } from "@/lib/serviceStatus";

interface StatusTagProps {
  status: string;
}

export function StatusTag({ status }: StatusTagProps) {
  const { text, bg } = getStatusColor(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 ring-1 ring-inset ring-current/20 ${bg} ${text}`}
    >
      <Circle size={8} fill="currentColor" className="shrink-0" />
      <span className="text-xs font-bold leading-[1.4] whitespace-nowrap">
        {status}
      </span>
    </span>
  );
}
