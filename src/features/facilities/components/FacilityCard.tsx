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
      className="group block"
    >
      <div className="relative h-64 w-full overflow-hidden rounded-2xl bg-[#111] border border-white/5 mb-5 flex items-center justify-center">
        <div className="text-7xl opacity-80 mix-blend-luminosity grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300">
          {sportIcons[facility.type] || "🏟️"}
        </div>
        <div className="absolute right-4 top-4">
          <StatusBadge status={facility.status} />
        </div>
      </div>
      <div>
        <h3 className="text-xl md:text-2xl font-semibold tracking-tight text-white mb-2 group-hover:text-white/80 transition-colors">
          {facility.name}
        </h3>
        <p className="text-white/50 leading-relaxed mb-4 line-clamp-2 text-sm md:text-base">
          {facility.description}
        </p>
        <div className="flex items-center gap-6 text-sm font-medium text-white/40">
          <span className="flex items-center gap-1.5">
            <Users size={16} />
            {facility.capacity}
          </span>
          <span className="flex items-center gap-1.5">
            <DollarSign size={16} />
            {facility.pricePerHour}/hr
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={16} />
            1hr
          </span>
        </div>
      </div>
    </Link>
  );
}
