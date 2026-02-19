import { Link } from "react-router-dom";
import { Facility } from "@/features/facilities/types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Users, Clock, DollarSign } from "lucide-react";

interface FacilityCardProps {
  facility: Facility;
}

const sportIcons: Record<string, string> = {
  basketball: "🏀",
  soccer: "⚽",
  tennis: "🎾",
  volleyball: "🏐",
  swimming: "🏊",
  badminton: "🏸",
  multipurpose: "🏟️",
};

export function FacilityCard({ facility }: FacilityCardProps) {
  return (
    <Link
      to={`/facilities/${facility.id}`}
      className="group block rounded-xl border border-border bg-card card-shadow transition-all duration-300 hover:card-shadow-hover hover:-translate-y-1"
    >
      <div className="relative h-48 overflow-hidden rounded-t-xl bg-muted">
        <div className="absolute inset-0 flex items-center justify-center text-6xl bg-gradient-to-br from-primary/10 to-accent/10">
          {sportIcons[facility.type] || "🏟️"}
        </div>
        <div className="absolute right-3 top-3">
          <StatusBadge status={facility.status} />
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-display text-lg font-bold group-hover:text-primary transition-colors">
          {facility.name}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
          {facility.description}
        </p>
        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users size={14} />
            {facility.capacity}
          </span>
          <span className="flex items-center gap-1">
            <DollarSign size={14} />
            {facility.pricePerHour}/hr
          </span>
          <span className="flex items-center gap-1">
            <Clock size={14} />
            1hr slots
          </span>
        </div>
      </div>
    </Link>
  );
}
