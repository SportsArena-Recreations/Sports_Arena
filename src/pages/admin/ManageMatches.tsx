import { useState, useEffect } from "react";
import { Plus, Search, Calendar, Trophy, Shield, MoreVertical, Clock } from "lucide-react";
import { Match, MatchType } from "@/features/matches/types";
import { matchService } from "@/features/matches/services/match.service";
import { CreateMatchModal } from "@/features/matches/components/CreateMatchModal";

export default function ManageMatches() {
    const [activeTab, setActiveTab] = useState<MatchType>("tournament");
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Load matches
    const loadMatches = async () => {
        setLoading(true);
        const { data } = await matchService.getByType(activeTab);
        setMatches(data || []);
        setLoading(false);
    };

    useEffect(() => {
        loadMatches();
    }, [activeTab]);

    const handleCreate = async (matchData: Omit<Match, "id" | "createdAt">) => {
        await matchService.create(matchData);
        loadMatches();
    };

    // Helper date formatter
    const formatDate = (d: string) => {
        return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Matches</h1>
                    <p className="text-sm text-white/40 mt-1">Manage all tournament and friendly matches</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-2 bg-white hover:bg-white/90 text-black px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                >
                    <Plus size={16} strokeWidth={2.5} />
                    Create Match
                </button>
            </div>

            {/* Toggles & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex bg-[#111115] p-1 rounded-xl border border-white/[0.05] w-full sm:w-fit">
                    <button
                        onClick={() => setActiveTab("tournament")}
                        className={`flex-1 sm:px-6 py-2 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === "tournament"
                            ? "bg-white/[0.08] text-white shadow-sm border border-white/[0.05]"
                            : "text-white/40 hover:text-white/70"
                            }`}
                    >
                        <Trophy size={14} /> Tournaments
                    </button>
                    <button
                        onClick={() => setActiveTab("friendly")}
                        className={`flex-1 sm:px-6 py-2 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === "friendly"
                            ? "bg-white/[0.08] text-white shadow-sm border border-white/[0.05]"
                            : "text-white/40 hover:text-white/70"
                            }`}
                    >
                        <Shield size={14} /> Friendlies
                    </button>
                </div>

                <div className="relative w-full sm:w-64">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                        type="text"
                        placeholder="Search teams or venues..."
                        className="w-full bg-[#111115] border border-white/[0.05] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-colors"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-[#111115] border border-white/[0.05] rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="p-12 flex justify-center">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
                    </div>
                ) : matches.length === 0 ? (
                    <div className="p-16 flex flex-col items-center justify-center text-center border-dashed border-white/5 mx-6 my-6 rounded-2xl">
                        <div className="w-12 h-12 rounded-full bg-white/[0.03] flex items-center justify-center mb-3">
                            {activeTab === "tournament" ? <Trophy size={20} className="text-white/20" /> : <Shield size={20} className="text-white/20" />}
                        </div>
                        <h3 className="text-white font-medium mb-1">No {activeTab} matches</h3>
                        <p className="text-sm text-white/40 max-w-[250px]">Get started by creating a new match for your teams.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-[#15151a] border-b border-white/[0.05] text-white/40 text-[11px] uppercase tracking-wider font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Details</th>
                                    <th className="px-6 py-4">Matchup</th>
                                    <th className="px-6 py-4">Schedule & Venue</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.02]">
                                {matches.map((match) => (
                                    <tr key={match.id} className="hover:bg-white/[0.01] transition-colors group">

                                        {/* Details Column */}
                                        <td className="px-6 py-4">
                                            {match.type === "tournament" ? (
                                                <div>
                                                    <p className="text-white font-medium">{match.tournamentName}</p>
                                                    <p className="text-xs text-white/40 mt-0.5">{match.round}</p>
                                                </div>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-white/[0.04] text-white/50 text-[10px] uppercase font-bold tracking-widest">
                                                    Friendly Match
                                                </span>
                                            )}
                                        </td>

                                        {/* Matchup Column */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <span className="font-semibold text-white/90 w-28 text-right truncate" title={match.homeTeamName}>
                                                    {match.homeTeamName}
                                                </span>

                                                <div className="flex flex-col items-center justify-center px-3 py-1 bg-white/[0.03] border border-white/[0.05] rounded-lg">
                                                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-none mb-1">VS</span>
                                                    <span className="text-sm font-bold text-white leading-none">
                                                        {match.homeScore ?? "-"} : {match.awayScore ?? "-"}
                                                    </span>
                                                </div>

                                                <span className="font-semibold text-white/90 w-28 truncate" title={match.awayTeamName}>
                                                    {match.awayTeamName}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Schedule & Venue Column */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Calendar size={13} className="text-white/30" />
                                                <span className="text-white/70">{formatDate(match.date)}</span>
                                                <span className="text-white/30 px-1">•</span>
                                                <Clock size={13} className="text-white/30" />
                                                <span className="text-white/70">{match.time}</span>
                                            </div>
                                            <p className="text-xs text-white/40">{match.venue}</p>
                                        </td>

                                        {/* Status Column */}
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${match.status === "completed" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                                match.status === "in_progress" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                                                    match.status === "postponed" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                                        "bg-white/5 text-white/50 border-white/10"
                                                }`}>
                                                {match.status.replace("_", " ")}
                                            </span>
                                        </td>

                                        {/* Actions Column */}
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 rounded-lg hover:bg-white/[0.05] text-white/40 hover:text-white transition-colors">
                                                <MoreVertical size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <CreateMatchModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleCreate}
            />
        </div>
    );
}
