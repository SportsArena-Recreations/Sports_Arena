import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy, Users, Calendar, Clock, ChevronRight, Swords, CheckCircle2, Timer, Shield, Info } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { tournamentService } from "@/features/tournaments/services/tournament.service";
import { facilityService } from "@/features/facilities/services/facility.service";
import { sportService, Sport } from "@/features/sports/services/sport.service";
import { matchService } from "@/features/matches/services/match.service";
import { Match as DBMatch } from "@/features/matches/types";
import { Tournament } from "@/features/tournaments/types";

// ─── Types ────────────────────────────────────────────────────────────────────
type MatchStatus = "result" | "fixture" | "live";
type TournamentStatus = "upcoming" | "on-going" | "ended";

interface TeamScore {
    name: string;
    shortName: string;
    score?: number;
}

interface Match {
    id: string;
    home: TeamScore;
    away: TeamScore;
    date: string;      // ISO string e.g. "2026-02-20"
    time: string;      // "18:30"
    venue: string;
    status: MatchStatus;
    round?: string;    // e.g. "Quarter-Final"
}

interface TournamentMatches {
    id: string;
    type?: "tournament" | "friendly";
    title: string;
    subtitle: string;
    sport: string;
    icon: React.ElementType;
    accentColor: string;       // tailwind bg class
    accentText: string;        // tailwind text class
    accentBorder: string;
    status: TournamentStatus;
    currentStage: string;
    numberOfTeams: number;
    matches: Match[];
}

// ─── Transformer ─────────────────────────────────────────────────────────────
// Maps the backend DB matches to the UI format expected by the Matches page
function mapMatchToUI(m: DBMatch): Match {
    let uiStatus: MatchStatus = "fixture";
    if (m.status === "completed") uiStatus = "result";
    else if (m.status === "in_progress") uiStatus = "live";
    else if (m.status === "scheduled") uiStatus = "fixture";

    return {
        id: m.id,
        home: { name: m.homeTeamName, shortName: m.homeTeamName.substring(0, 3).toUpperCase(), score: m.homeScore },
        away: { name: m.awayTeamName, shortName: m.awayTeamName.substring(0, 3).toUpperCase(), score: m.awayScore },
        date: m.date,
        time: m.time,
        venue: m.venue || "TBD",
        status: uiStatus,
        round: m.round
    };
}


// ─── Fake scores (deterministic from match id) ─────────────────────────────
function fakeScore(matchId: string, team: "home" | "away"): number {
    const seed = matchId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    if (team === "home") return (seed * 3 + 47) % 5 + (seed % 3);
    return (seed * 7 + 13) % 5 + ((seed + 2) % 3);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

function getThreeRecentMatches(matches: Match[]): Match[] {
    // Sort matches by date to find the most "relevant" ones.
    // In a real app we'd sort by difference to current date.
    // Here we just grab a slice that includes live, then fixtures, then results (just grabbing the middle/end)
    const sorted = [...matches].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const now = new Date("2026-02-22").getTime();

    // Find the closest match to 'now'
    let closestIdx = 0;
    let minDiff = Infinity;
    sorted.forEach((m, i) => {
        const diff = Math.abs(new Date(m.date).getTime() - now);
        if (diff < minDiff) {
            minDiff = diff;
            closestIdx = i;
        }
    });

    // Try to get one before, the closest, and one after (if available) -> up to 3 matches
    let start = Math.max(0, closestIdx - 1);
    let end = Math.min(sorted.length, start + 3);
    if (end - start < 3) {
        start = Math.max(0, end - 3);
    }

    return sorted.slice(start, end);
}

// ─── Components ───────────────────────────────────────────────────────────────

/** Avatar-style team initial circle */
function TeamBadge({ short, accent }: { short: string; accent: string }) {
    return (
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border ${accent} bg-white/[0.04] text-white/80 flex-shrink-0 shadow-sm`}>
            {short}
        </div>
    );
}

/** Single match row shown inside a modal or inline */
function MatchRow({ match, accent, border, compact = false }: { match: Match; accent: string; border: string; compact?: boolean }) {
    const isResult = match.status === "result";
    const isLive = match.status === "live";
    const homeScore = isResult || isLive ? fakeScore(match.id, "home") : null;
    const awayScore = isResult || isLive ? fakeScore(match.id, "away") : null;
    const homeWon = homeScore !== null && awayScore !== null && homeScore > awayScore;
    const awayWon = homeScore !== null && awayScore !== null && awayScore > homeScore;

    return (
        <div className={`rounded-xl border bg-white/[0.02] hover:bg-white/[0.05] transition-colors ${compact ? 'p-3' : 'p-3 sm:p-4'} ${border}`}>
            {/* Round + date row */}
            <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                {match.round && (
                    <span className={`text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-sm ${accent} bg-white/[0.04] border ${border}`}>
                        {match.round}
                    </span>
                )}
                <div className="flex items-center gap-1.5 text-white/40 text-[11px] ml-auto">
                    {isLive ? (
                        <span className="flex items-center gap-1.5 text-red-500 font-bold tracking-widest uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
                            LIVE
                        </span>
                    ) : (
                        <>
                            {formatDate(match.date)}
                            <span className="text-white/20">·</span>
                            {match.time}
                        </>
                    )}
                </div>
            </div>

            {/* Teams & score */}
            <div className="flex items-center gap-3">
                <TeamBadge short={match.home.shortName} accent={border} />
                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${homeWon || isLive ? "text-white" : "text-white/70"}`}>
                        {match.home.name}
                    </p>
                </div>

                {/* Score or "vs" */}
                <div className="flex items-center justify-center gap-2 flex-shrink-0 min-w-[60px] bg-black/30 rounded-lg px-2 py-1">
                    {homeScore !== null && homeScore !== undefined ? (
                        <>
                            <span className={`text-xl font-black tabular-nums ${homeWon ? "text-white" : "text-white/50"}`}>{homeScore}</span>
                            <span className="text-white/20 font-black">-</span>
                            <span className={`text-xl font-black tabular-nums ${awayWon ? "text-white" : "text-white/50"}`}>{awayScore}</span>
                        </>
                    ) : (
                        <span className="text-xs font-bold text-white/30 uppercase tracking-widest px-1">vs</span>
                    )}
                </div>

                <div className="flex-1 min-w-0 text-right">
                    <p className={`text-sm font-semibold truncate ${awayWon || isLive ? "text-white" : "text-white/70"}`}>
                        {match.away.name}
                    </p>
                </div>
                <TeamBadge short={match.away.shortName} accent={border} />
            </div>

            {/* Venue (only if not compact) */}
            {
                !compact && (
                    <p className="text-[11px] text-white/25 mt-3 text-center uppercase tracking-widest font-semibold">{match.venue}</p>
                )
            }
        </div >
    );
}

/** Full-screen modal for a tournament */
function TournamentModal({ tournament, onClose }: { tournament: TournamentMatches; onClose: () => void }) {
    const results = tournament.matches.filter((m) => m.status === "result" || m.status === "live");
    const fixtures = tournament.matches.filter((m) => m.status === "fixture");

    return (
        <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

            {/* Sheet */}
            <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 40, scale: 0.97 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full sm:max-w-2xl max-h-[80dvh] sm:max-h-[85vh] flex flex-col bg-[#08080a] border border-white/10 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
            >
                {/* Modal header */}
                <div className={`px-4 pt-5 pb-4 sm:px-6 sm:pt-6 sm:pb-5 border-b border-white/[0.06] flex-shrink-0 ${tournament.accentColor}`}>
                    <div className="flex items-start justify-between gap-3 sm:gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border ${tournament.accentText} ${tournament.accentBorder} bg-black/20`}>
                                    {tournament.sport}
                                </span>
                                <span className="text-white/40 text-[11px] font-semibold">{tournament.currentStage}</span>
                            </div>
                            <h2 className="text-xl font-bold text-white tracking-tight">{tournament.title}</h2>
                            <p className="text-sm text-white/45 mt-0.5">{tournament.subtitle}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="flex-shrink-0 w-9 h-9 rounded-full bg-white/[0.07] border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.12] transition-all"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5 space-y-6 sm:space-y-8">
                    {results.length > 0 && (
                        <div>
                            <h3 className="text-[10px] font-bold tracking-widest uppercase text-white/40 mb-3 flex items-center gap-2">
                                Results
                            </h3>
                            <div className="space-y-2">
                                {results.map((m) => (
                                    <MatchRow key={m.id} match={m} accent={tournament.accentText} border={tournament.accentBorder} />
                                ))}
                            </div>
                        </div>
                    )}

                    {fixtures.length > 0 && (
                        <div>
                            <h3 className="text-[10px] font-bold tracking-widest uppercase text-white/40 mb-3 flex items-center gap-2">
                                Fixtures
                            </h3>
                            <div className="space-y-2">
                                {fixtures.map((m) => (
                                    <MatchRow key={m.id} match={m} accent={tournament.accentText} border={tournament.accentBorder} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}

// ─── Tournament Card ─────────────────────────────────────────────────────────
function TournamentCard({ tournament, onClickViewAll }: { tournament: TournamentMatches; onClickViewAll: () => void }) {
    const Icon = tournament.icon;
    const recentMatches = getThreeRecentMatches(tournament.matches);

    const statusColor = {
        "upcoming": "text-blue-400 bg-blue-500/10 border-blue-500/20",
        "on-going": "text-green-400 bg-green-500/10 border-green-500/20",
        "ended": "text-zinc-400 bg-zinc-500/10 border-zinc-500/20",
    }[tournament.status];

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className={`group w-full text-left rounded-[2rem] border bg-[#050505] transition-all duration-300 relative overflow-hidden ${tournament.accentBorder} shadow-xl`}
        >
            {/* Background glow top right */}
            <div className={`absolute -top-32 -right-32 w-64 h-64 blur-[100px] opacity-20 ${tournament.accentColor} pointer-events-none`} />

            {/* Header section */}
            <div className="p-6 md:p-8 border-b border-white/[0.04]">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${tournament.accentBorder} ${tournament.accentColor} flex-shrink-0 shadow-inner`}>
                            <Icon size={24} className={tournament.accentText} strokeWidth={1.75} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <span className={`text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-sm border ${tournament.accentText} ${tournament.accentBorder} bg-black/30`}>
                                    {tournament.sport}
                                </span>
                                <span className={`text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-sm border ${statusColor}`}>
                                    {tournament.status}
                                </span>
                            </div>
                            <h3 className="text-2xl font-bold text-white tracking-tight leading-snug">{tournament.title}</h3>
                            <p className="text-sm text-white/50 mt-1">{tournament.subtitle}</p>
                        </div>
                    </div>

                    <div className="flex flex-row sm:flex-col gap-4 sm:gap-2 sm:text-right mt-2 sm:mt-0 opacity-80">
                        <div>
                            <p className="text-[10px] uppercase font-bold tracking-widest text-white/30">Teams</p>
                            <p className="text-base font-semibold text-white/90 tabular-nums">{tournament.numberOfTeams}</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold tracking-widest text-white/30">Stage</p>
                            <p className="text-sm font-semibold text-white/90">{tournament.currentStage}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Matches middle section */}
            <div className="p-6 md:p-8 bg-white/[0.01]">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[10px] uppercase font-bold tracking-widest text-white/40">Latest Matches</h4>
                </div>

                <div className="space-y-2">
                    {recentMatches.map(match => (
                        <MatchRow key={match.id} match={match} accent={tournament.accentText} border={tournament.accentBorder} compact />
                    ))}
                </div>
            </div>

            {/* Footer CTA */}
            <div className="p-4 md:px-8 md:py-5 border-t border-white/[0.04] bg-[#020202]">
                <button
                    onClick={onClickViewAll}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] hover:border-white/[0.1] transition-all text-sm font-semibold text-white"
                >
                    View all matches
                    <ChevronRight size={16} className="text-white/50" />
                </button>
            </div>

        </motion.div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Matches() {
    const [tournaments, setTournaments] = useState<TournamentMatches[]>([]);
    const [selected, setSelected] = useState<TournamentMatches | null>(null);
    const [sports, setSports] = useState<Sport[]>([]);
    const [selectedSport, setSelectedSport] = useState<string>("all");
    const [filter, setFilter] = useState<string>("all");

    useEffect(() => {
        Promise.all([
            tournamentService.getAll(),
            matchService.getAll(),
            sportService.getAll()
        ]).then(([tRes, mRes, sRes]) => {
            const dbTournaments = tRes.data || [];
            const dbMatches = mRes.data || [];
            setSports(sRes.data || []);

            // 1. Group matches into Tournaments
            const mappedTournaments: TournamentMatches[] = dbTournaments.map(t => {
                const tMatches = dbMatches.filter(m => m.tournamentId === t.id);
                return {
                    id: t.id,
                    type: "tournament",
                    title: t.name,
                    subtitle: `${t.maxTeams} Teams · ${t.description || t.sport}`,
                    sport: t.sport,
                    icon: Trophy,
                    accentColor: "bg-blue-500/10",
                    accentText: "text-blue-400",
                    accentBorder: "border-blue-500/20",
                    status: ["registration_closed", "registration_open"].includes(t.status) ? "upcoming" : (t.status === "completed" ? "ended" : "on-going"),
                    currentStage: "Various",
                    numberOfTeams: t.registeredTeams,
                    matches: tMatches.map(mapMatchToUI)
                };
            });

            // 2. Group friendly matches into a single pseudo-tournament block
            const friendlyMatches = dbMatches.filter(m => m.type === "friendly");
            if (friendlyMatches.length > 0) {
                mappedTournaments.unshift({
                    id: "friendly-series",
                    type: "friendly",
                    title: "Community Friendlies",
                    subtitle: "One-off exhibition matches & pickup games",
                    sport: "Mixed",
                    icon: Users,
                    accentColor: "bg-purple-500/10",
                    accentText: "text-purple-400",
                    accentBorder: "border-purple-500/20",
                    status: "on-going",
                    currentStage: "Various",
                    numberOfTeams: 0,
                    matches: friendlyMatches.map(mapMatchToUI)
                });
            }

            setTournaments(mappedTournaments);
        });
    }, []);

    const totalPlayed = tournaments.reduce((a, c) => a + c.matches.filter((m) => m.status === "result").length, 0);
    const totalUpcoming = tournaments.reduce((a, c) => a + c.matches.filter((m) => m.status === "fixture").length, 0);
    const liveCount = tournaments.reduce((a, c) => a + c.matches.filter((m) => m.status === "live").length, 0);

    const filterOptions = [
        { label: "All Formats", value: "all" },
        { label: "Friendlies", value: "friendly" },
        ...tournaments.filter(t => t.type !== "friendly").map(t => ({ label: t.title, value: t.id }))
    ];

    let filteredTournaments = filter === "all"
        ? tournaments
        : filter === "friendly"
            ? tournaments.filter(t => t.type === "friendly")
            : tournaments.filter(t => t.id === filter);

    // Secondary filter by Sport
    if (selectedSport !== "all") {
        filteredTournaments = filteredTournaments.filter(t => t.sport === selectedSport);
    }

    return (
        <div className="bg-[#020202] text-white min-h-screen font-sans">
            {/* Hero Header */}
            <section className="pt-16 pb-12 px-6 border-b border-white/[0.05] relative overflow-hidden bg-black">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                <div className="container mx-auto max-w-4xl relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <span className="text-[10px] font-bold tracking-widest uppercase text-white/30 border border-white/10 px-3 py-1 rounded-full">
                                Sports Arena
                            </span>
                            {liveCount > 0 && (
                                <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-red-400 border border-red-500/30 px-3 py-1 rounded-full bg-red-500/10">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                    {liveCount} live matches
                                </span>
                            )}
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter text-white mb-4">
                            Matches &amp; Tournaments
                        </h1>
                        <p className="text-lg text-white/40 max-w-xl mx-auto">
                            Track results, scores, and upcoming fixtures across all active competitions and leagues.
                        </p>

                        {/* Quick stats */}
                        <div className="flex justify-center flex-wrap gap-8 sm:gap-16 mt-10">
                            {[
                                { label: "Matches Played", value: totalPlayed },
                                { label: "Upcoming", value: totalUpcoming },
                                { label: "Active Tournaments", value: tournaments.length },
                            ].map((s) => (
                                <div key={s.label}>
                                    <p className="text-3xl font-black text-white">{s.value}</p>
                                    <p className="text-[10px] font-bold tracking-widest uppercase text-white/30 mt-1">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Category Filter */}
            <section className="pt-8 pb-4 px-4 sm:px-6 sticky top-[72px] z-30 bg-[#020202]/90 backdrop-blur-md border-b border-white/[0.05]">
                <div className="container mx-auto max-w-4xl">
                    <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide snap-x items-center">

                        <span className="text-[10px] uppercase font-bold tracking-widest text-white/30 whitespace-nowrap hidden sm:inline-block">Format</span>

                        {filterOptions.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => setFilter(opt.value)}
                                className={`snap-start whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter === opt.value
                                    ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                                    : "bg-white/[0.03] text-white/60 hover:bg-white/[0.08] hover:text-white border border-white/[0.05]"
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}

                        <div className="w-px h-6 bg-white/[0.1] mx-1 flex-shrink-0" />

                        <span className="text-[10px] uppercase font-bold tracking-widest text-white/30 whitespace-nowrap hidden sm:inline-block">Sport</span>

                        <button
                            onClick={() => setSelectedSport("all")}
                            className={`snap-start whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-all ${selectedSport === "all"
                                ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                                : "bg-white/[0.03] text-white/60 hover:bg-white/[0.08] hover:text-white border border-white/[0.05]"
                                }`}
                        >
                            All Sports
                        </button>
                        {sports.map(sport => (
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
                </div>
            </section>

            {/* Tournaments Vertical Stack */}
            <section className="py-12 px-4 sm:px-6">
                <div className="container mx-auto max-w-4xl flex flex-col gap-10">
                    <AnimatePresence mode="popLayout">
                        {filteredTournaments.map((t, i) => (
                            <motion.div
                                key={t.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            >
                                <TournamentCard
                                    tournament={t}
                                    onClickViewAll={() => setSelected(t)}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {filteredTournaments.length === 0 && (
                        <div className="text-center py-20 text-white/40">
                            No matches or tournaments found for this category.
                        </div>
                    )}
                </div>
            </section>

            <Footer />

            {/* Modal */}
            <AnimatePresence>
                {selected && (
                    <TournamentModal tournament={selected} onClose={() => setSelected(null)} />
                )}
            </AnimatePresence>
        </div>
    );
}
