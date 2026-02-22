import { Link } from "react-router-dom";
import { Tournament } from "@/features/tournaments/types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Calendar, Users, Trophy, Banknote } from "lucide-react";

interface TournamentCardProps {
  tournament: Tournament;
}

export function TournamentCard({ tournament }: TournamentCardProps) {
  return (
    <Link
      to={`/tournaments/${tournament.id}`}
      className="group block"
    >
      <div className="relative h-64 w-full overflow-hidden rounded-2xl bg-[#111] border border-white/5 mb-6 flex flex-col items-center justify-center">
        <Trophy size={48} className="mb-4 text-white/50 group-hover:text-white transition-colors duration-300" />
        <span className="text-sm font-semibold uppercase tracking-widest text-white/40 group-hover:text-white/80 transition-colors duration-300">
          {tournament.sport}
        </span>
        <div className="absolute right-4 top-4">
          <StatusBadge status={tournament.status} />
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-semibold tracking-tight text-white mb-2 group-hover:text-white/80 transition-colors">
          {tournament.name}
        </h3>
        <p className="text-white/50 leading-relaxed mb-6 line-clamp-2">
          {tournament.description}
        </p>

        <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm font-medium text-white/40">
          <span className="flex items-center gap-2">
            <Calendar size={16} />
            {new Date(tournament.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
          <span className="flex items-center gap-2">
            <Users size={16} />
            {tournament.registeredTeams}/{tournament.maxTeams} teams
          </span>
          <span className="flex items-center gap-2">
            <Banknote size={16} />
            {tournament.entryFee === 0 ? "Free entry" : `₦${tournament.entryFee.toLocaleString()} entry`}
          </span>
          <span className="flex items-center gap-2">
            <Trophy size={16} />
            ₦{tournament.prizePool.toLocaleString()} prize
          </span>
        </div>
      </div>
    </Link>
  );
}
