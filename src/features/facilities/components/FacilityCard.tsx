import { Link } from "react-router-dom";
import { Facility } from "@/features/facilities/types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Users, Clock } from "lucide-react";

interface FacilityCardProps {
  facility: Facility;
}

export function FacilityCard({ facility }: FacilityCardProps) {
  return (
    <Link
      to={`/facilities/${facility.id}`}
      className="group block"
    >
      <div className="relative h-[300px] md:h-[350px] w-full overflow-hidden rounded-[2rem] bg-[#111] border border-white/5 mb-5 flex items-center justify-center">
        {/* Real image of facility instead of emoji! */}
        <div className="absolute inset-0 z-0 select-none">
          <img
            src={facility.imageUrl}
            alt={facility.name}
            className="w-full h-full object-cover opacity-50 grayscale group-hover:grayscale-0 group-hover:scale-105 group-hover:opacity-70 transition-all duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
        </div>

        <div className="absolute right-6 top-6 z-10">
          <StatusBadge status={facility.status} />
        </div>

        <div className="absolute left-6 bottom-6 z-10 flex gap-2">
          <span className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-white/90 border border-white/10">
            <Users size={14} />
            {facility.capacity}
          </span>
          <span className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-white/90 border border-white/10">
            <Clock size={14} />
            1hr
          </span>
        </div>
      </div>
      <div>
        <div className="flex justify-between items-start gap-4 mb-2">
          <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white group-hover:text-white/80 transition-colors">
            {facility.name}
          </h3>
          {/* Naira Symbol explicitly set here */}
          <div className="px-3 py-1 rounded-full bg-white/[0.03] border border-white/5 text-white/90 font-medium text-sm whitespace-nowrap">
            ₦{facility.pricePerHour.toLocaleString()}/hr
          </div>
        </div>
        <p className="text-white/50 leading-relaxed max-w-[90%] line-clamp-2 text-sm md:text-base">
          {facility.description}
        </p>
      </div>
    </Link>
  );
}
