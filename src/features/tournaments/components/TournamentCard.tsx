import { Link } from "react-router-dom";
import { Tournament } from "@/features/tournaments/types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Calendar, Users, Trophy, DollarSign } from "lucide-react";

interface TournamentCardProps {
  tournament: Tournament;
}

export function TournamentCard({ tournament }: TournamentCardProps) {
  return (
    <Link
      to={`/tournaments/${tournament.id}`}
      className="group block rounded-xl border border-border bg-card card-shadow transition-all duration-300 hover:card-shadow-hover hover:-translate-y-1"
    >
      <div className="relative h-40 overflow-hidden rounded-t-xl hero-gradient">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-primary-foreground">
          <Trophy size={32} className="mb-2 opacity-80" />
          <span className="text-xs font-medium uppercase tracking-widest opacity-70">
            {tournament.sport}
          </span>
        </div>
        <div className="absolute right-3 top-3">
          <StatusBadge status={tournament.status} />
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-display text-lg font-bold group-hover:text-primary transition-colors">
          {tournament.name}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
          {tournament.description}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar size={14} />
            {new Date(tournament.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
          <span className="flex items-center gap-1.5">
            <Users size={14} />
            {tournament.registeredTeams}/{tournament.maxTeams} teams
          </span>
          <span className="flex items-center gap-1.5">
            <DollarSign size={14} />
            ${tournament.entryFee} entry
          </span>
          <span className="flex items-center gap-1.5">
            <Trophy size={14} />
            ${tournament.prizePool.toLocaleString()} prize
          </span>
        </div>
      </div>
    </Link>
  );
}
