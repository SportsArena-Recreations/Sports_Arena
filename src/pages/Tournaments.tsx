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
      <div className="flex overflow-x-auto gap-2 pb-6 mb-2 scrollbar-hide snap-x">
        <button
          onClick={() => setSelectedSport("all")}
          className={`snap-start whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-all ${selectedSport === "all"
              ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              : "bg-white/[0.03] text-white/60 hover:bg-white/[0.08] hover:text-white border border-white/[0.05]"
            }`}
        >
          All Sports
        </button>
        {sports.map((sport) => (
          <button
            key={sport.id}
            onClick={() => setSelectedSport(sport.name)}
            className={`snap-start whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-all ${selectedSport === sport.name
                ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                : "bg-white/[0.03] text-white/60 hover:bg-white/[0.08] hover:text-white border border-white/[0.05]"
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
