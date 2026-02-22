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
          {/* Cover Image banner */}
          <div className="relative h-64 md:h-80 w-full overflow-hidden rounded-2xl mb-8 bg-[#111] border border-white/5 flex flex-col items-center justify-center">
            {tournament.imageUrl && tournament.imageUrl.startsWith("http") ? (
              <>
                <img
                  src={tournament.imageUrl}
                  alt={tournament.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-[#020202]/40 to-transparent" />
              </>
            ) : (
              <>
                <Trophy size={64} className="mb-4 text-white/10" />
                <span className="text-sm font-semibold uppercase tracking-widest text-white/20">
                  {tournament.sport}
                </span>
              </>
            )}
            <div className="absolute left-6 bottom-6 z-10 flex items-center gap-3">
              <StatusBadge status={tournament.status} />
              <span className="text-sm text-muted-foreground bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 font-medium">
                {tournament.sport}
              </span>
            </div>
          </div>

          <div className="mb-6">
            <h1 className="font-display text-3xl font-bold md:text-4xl tracking-tight">{tournament.name}</h1>
            <p className="mt-4 text-muted-foreground text-lg leading-relaxed">{tournament.description}</p>
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
          <div className="sticky top-24 rounded-2xl border border-white/5 bg-[#0a0a0d] p-6 shadow-2xl">
            <h3 className="font-display text-xl font-bold mb-6 text-white tracking-tight">Team Registration</h3>
            {canRegister ? (
              <TeamRegistrationForm
                tournamentId={tournament.id}
                entryFee={tournament.entryFee}
              />
            ) : (
              <div className="rounded-xl bg-white/[0.03] border border-white/5 p-6 text-center">
                <p className="text-sm text-white/40 leading-relaxed">
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
