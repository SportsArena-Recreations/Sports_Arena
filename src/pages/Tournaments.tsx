import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { TournamentCard } from "@/features/tournaments/components/TournamentCard";
import { tournamentService } from "@/features/tournaments/services/tournament.service";
import { Tournament } from "@/features/tournaments/types";

const Tournaments = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  useEffect(() => {
    tournamentService.getAll().then((res) => setTournaments(res.data));
  }, []);

  return (
    <div className="container py-10">
      <PageHeader
        title="Tournaments"
        description="Compete in our upcoming tournaments and leagues."
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tournaments.map((t) => (
          <TournamentCard key={t.id} tournament={t} />
        ))}
      </div>
    </div>
  );
};

export default Tournaments;
