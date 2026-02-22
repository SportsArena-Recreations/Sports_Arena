import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { tournamentService } from "@/features/tournaments/services/tournament.service";
import { Tournament } from "@/features/tournaments/types";
import { TeamRegistrationForm } from "@/features/tournaments/components/TeamRegistrationForm";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ChevronLeft, Calendar, Users, Banknote, Trophy, MapPin } from "lucide-react";

const TournamentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [tournament, setTournament] = useState<Tournament | null>(null);

  useEffect(() => {
    if (id) {
      tournamentService.getById(id).then((res) => res.data && setTournament(res.data));
    }
  }, [id]);

  if (!tournament) {
    return <div className="container py-20 text-center text-muted-foreground">Loading...</div>;
  }

  const canRegister = tournament.status === "registration_open" && tournament.registeredTeams < tournament.maxTeams;

  return (
    <div className="container py-10">
      <Link to="/tournaments" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft size={16} />
        Back to Tournaments
      </Link>

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <StatusBadge status={tournament.status} />
              <span className="text-sm text-muted-foreground">{tournament.sport}</span>
            </div>
            <h1 className="font-display text-3xl font-bold">{tournament.name}</h1>
            <p className="mt-3 text-muted-foreground">{tournament.description}</p>
          </div>

          {/* Details grid */}
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[
              { icon: Calendar, label: "Start Date", value: new Date(tournament.startDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) },
              { icon: Calendar, label: "End Date", value: new Date(tournament.endDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) },
              { icon: Users, label: "Teams", value: `${tournament.registeredTeams} / ${tournament.maxTeams}` },
              { icon: Banknote, label: "Entry Fee", value: tournament.entryFee === 0 ? "Free" : `₦${tournament.entryFee.toLocaleString()}` },
              { icon: Trophy, label: "Prize Pool", value: `₦${tournament.prizePool.toLocaleString()}` },
              { icon: MapPin, label: "Venue", value: tournament.facilityName },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-border bg-card p-4 card-shadow">
                <item.icon size={16} className="mb-1 text-primary" />
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="font-display font-semibold text-sm">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Rules */}
          <div className="mb-8">
            <h3 className="font-display font-semibold mb-3">Rules & Format</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {tournament.rules.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>

          {/* Registration deadline */}
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">
              Registration Deadline:{" "}
              <span className="font-semibold text-foreground">
                {new Date(tournament.registrationDeadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </span>
            </p>
          </div>
        </div>

        {/* Registration Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-xl border border-border bg-card p-6 card-shadow">
            <h3 className="font-display text-xl font-bold mb-4">Team Registration</h3>
            {canRegister ? (
              <TeamRegistrationForm
                tournamentName={tournament.name}
                entryFee={tournament.entryFee}
              />
            ) : (
              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  {tournament.status === "registration_closed"
                    ? "Registration is closed for this tournament."
                    : tournament.registeredTeams >= tournament.maxTeams
                      ? "This tournament is full."
                      : "Registration is not yet open."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentDetail;
