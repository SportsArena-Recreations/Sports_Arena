import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { TournamentCard } from "@/features/tournaments/components/TournamentCard";
import { tournamentService } from "@/features/tournaments/services/tournament.service";
import { sportService, Sport } from "@/features/sports/services/sport.service";
import { Tournament } from "@/features/tournaments/types";

const Tournaments = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [selectedSport, setSelectedSport] = useState<string>("all");

  useEffect(() => {
    Promise.all([
      tournamentService.getAll(),
      sportService.getAll()
    ]).then(([tRes, sRes]) => {
      setTournaments(tRes.data);
      setSports(sRes.data);
    });
  }, []);

  const filteredTournaments = selectedSport === "all"
    ? tournaments
    : tournaments.filter(t => t.sport === selectedSport);

  return (
    <div className="container py-10 min-h-screen">
      <PageHeader
        title="Tournaments"
        description="Compete in our upcoming tournaments and leagues."
      />

      {/* Sports Filter */}
      <div className="flex flex-wrap items-center justify-start gap-3 pb-6 mb-2">
        <span className="text-[10px] uppercase font-bold tracking-widest text-white/30 whitespace-nowrap hidden sm:inline-block mr-2">Sport</span>
        <button
          onClick={() => setSelectedSport("all")}
          className={`whitespace-nowrap flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all border ${selectedSport === "all"
            ? "bg-white/10 text-white border-white/15"
            : "text-white/35 border-transparent hover:text-white/70 hover:border-white/10"
            }`}
        >
          All Sports
        </button>
        {sports.map((sport) => (
          <button
            key={sport.id}
            onClick={() => setSelectedSport(sport.name)}
            className={`whitespace-nowrap flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all border ${selectedSport === sport.name
              ? "bg-white/10 text-white border-white/15"
              : "text-white/35 border-transparent hover:text-white/70 hover:border-white/10"
              }`}
          >
            {sport.name}
          </button>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTournaments.map((t) => (
          <TournamentCard key={t.id} tournament={t} />
        ))}
      </div>
    </div>
  );
};

export default Tournaments;
