import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, Trophy, Users, Shield, Save, Loader2, AlertTriangle, Plus, Trash2 } from "lucide-react";
import { MatchType, MatchStatus, Match } from "../types";
import { teamService } from "@/features/teams/services/team.service";
import { tournamentService } from "@/features/tournaments/services/tournament.service";
import { facilityService } from "@/features/facilities/services/facility.service";
import { sportService, Sport } from "@/features/sports/services/sport.service";
import { Team } from "@/features/teams/types";
import { Tournament } from "@/features/tournaments/types";
import { Facility } from "@/features/facilities/types";

function SuggestInput({
    value,
    onChange,
    options,
    placeholder,
    className
}: {
    value: string;
    onChange: (val: string) => void;
    options: string[];
    placeholder?: string;
    className?: string;
}) {
    const [open, setOpen] = useState(false);

    const filtered = value ? options.filter(o => o.toLowerCase().includes(value.toLowerCase()) && o.toLowerCase() !== value.toLowerCase()) : options;
    const finalOptions = value && !options.some(o => o.toLowerCase() === value.toLowerCase())
        ? [value, ...filtered]
        : filtered;

    return (
        <div className="relative">
            <input
                type="text"
                required
                value={value}
                onChange={e => {
                    onChange(e.target.value);
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 200)}
                placeholder={placeholder}
                className={className}
            />
            <AnimatePresence>
                {open && finalOptions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="absolute z-50 w-full mt-2 bg-[#222228] border border-white/[0.1] rounded-xl shadow-2xl max-h-48 overflow-y-auto py-1"
                    >
                        {finalOptions.map((opt, i) => (
                            <div
                                key={i}
                                className="px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/[0.08] cursor-pointer transition-colors"
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    onChange(opt);
                                    setOpen(false);
                                }}
                            >
                                {opt} {i === 0 && opt === value && !options.some(o => o.toLowerCase() === value.toLowerCase()) ? <span className="text-white/30 text-xs italic ml-2">(New)</span> : ''}
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

interface CreateMatchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (match: Omit<Match, "id" | "createdAt">) => Promise<void>;
}

export function CreateMatchModal({ isOpen, onClose, onSave }: CreateMatchModalProps) {
    const [type, setType] = useState<MatchType>("tournament");
    const [tournamentName, setTournamentName] = useState("");
    const [round, setRound] = useState("");
    const [sport, setSport] = useState(""); // Category tag for the match

    // Manage multiple pairings at once:
    const [pairings, setPairings] = useState([{
        id: "p1",
        homeTeamName: "",
        awayTeamName: "",
        date: "",
        time: "",
        venue: "",
        status: "scheduled" as MatchStatus,
    }]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Data for options
    const [teams, setTeams] = useState<Team[]>([]);
    const [teamOptions, setTeamOptions] = useState<string[]>([]);
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [tournamentOptions, setTournamentOptions] = useState<string[]>([]);
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [facilityOptions, setFacilityOptions] = useState<string[]>([]);
    const [sports, setSports] = useState<Sport[]>([]);

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (isOpen) {
            tournamentService.getAll().then(res => {
                setTournaments(res.data);
                setTournamentOptions(res.data.map(t => t.name));
            });
            facilityService.getAll().then(res => {
                setFacilities(res.data);
                setFacilityOptions(res.data.map(f => f.name));
            });
            sportService.getAll().then(res => setSports(res.data));
            Promise.all([
                teamService.getAll(),
                tournamentService.getAllRegistrations()
            ]).then(([teamsRes, regsRes]) => {
                setTeams(teamsRes.data);
                const names = new Set([
                    ...teamsRes.data.map(t => t.name),
                    ...regsRes.data.map(r => r.teamName)
                ]);
                setTeamOptions(Array.from(names).sort());
            });
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation:
        if (type === "tournament" && !tournamentName) {
            setError("Please select or enter a tournament.");
            return;
        }

        if (type === "friendly" && !sport.trim()) {
            setError("Please enter a sport or category for this friendly match.");
            return;
        }

        for (const p of pairings) {
            if (p.homeTeamName === p.awayTeamName && p.homeTeamName !== "") {
                setError("Home and Away teams must be different for all pairings.");
                return;
            }
            if (!p.homeTeamName || !p.awayTeamName || !p.date || !p.time || !p.venue) {
                setError("Please fill out all fields for all pairings.");
                return;
            }
        }

        setError(null);
        setLoading(true);

        const t = tournaments.find(t => t.name.toLowerCase() === tournamentName.toLowerCase());
        const resolvedTournamentId = t ? t.id : `t-${Date.now()}`;

        try {
            await Promise.all(pairings.map(p => {
                const hTeam = teams.find(t => t.name.toLowerCase() === p.homeTeamName.toLowerCase());
                const aTeam = teams.find(t => t.name.toLowerCase() === p.awayTeamName.toLowerCase());

                return onSave({
                    type,
                    sport: type === "tournament" && t?.sport ? t.sport : sport,
                    tournamentId: type === "tournament" ? resolvedTournamentId : undefined,
                    tournamentName: type === "tournament" ? tournamentName : undefined,
                    round: type === "tournament" ? round : undefined,
                    homeTeamId: hTeam ? hTeam.id : p.homeTeamName.toLowerCase().replace(/\s+/g, '-'),
                    homeTeamName: p.homeTeamName,
                    awayTeamId: aTeam ? aTeam.id : p.awayTeamName.toLowerCase().replace(/\s+/g, '-'),
                    awayTeamName: p.awayTeamName,
                    date: p.date,
                    time: p.time,
                    venue: p.venue,
                    status: p.status,
                });
            }));
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to create match");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className={`fixed inset-0 z-[100] flex justify-center ${isMobile ? "items-end p-0" : "items-center p-4 sm:p-6"}`}>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                />

                <motion.div
                    initial={isMobile ? { opacity: 0, y: "100%" } : { opacity: 0, scale: 0.95, y: 10 }}
                    animate={isMobile ? { opacity: 1, y: 0 } : { opacity: 1, scale: 1, y: 0 }}
                    exit={isMobile ? { opacity: 0, y: "100%" } : { opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className={`relative w-full max-w-2xl overflow-hidden bg-[#111115] border border-white/[0.08] shadow-2xl flex flex-col max-h-[90vh] ${isMobile ? "rounded-t-2xl pb-2" : "rounded-2xl"}`}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.08] bg-[#1a1a20]">
                        <div>
                            <h2 className="text-lg font-bold text-white tracking-tight">Create Match</h2>
                            <p className="text-xs text-white/40 mt-1">Schedule a new tournament or friendly match</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white/50 hover:text-white transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <form id="create-match-form" onSubmit={handleSubmit} className="space-y-6">

                            {/* Type Toggle */}
                            <div>
                                <label className="text-xs uppercase tracking-widest font-semibold text-white/40 mb-3 block">Match Type</label>
                                <div className="flex gap-2 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
                                    <button
                                        type="button"
                                        onClick={() => setType("tournament")}
                                        className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${type === "tournament" ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/80"
                                            }`}
                                    >
                                        <Trophy size={14} /> Tournament
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setType("friendly")}
                                        className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${type === "friendly" ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/80"
                                            }`}
                                    >
                                        <Shield size={14} /> Friendly
                                    </button>
                                </div>
                            </div>

                            {/* Tournament Details */}
                            {type === "tournament" && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                                    <div>
                                        <label className="text-xs text-white/60 mb-2 block">Select Tournament</label>
                                        <div className="relative z-20">
                                            <SuggestInput
                                                value={tournamentName}
                                                onChange={setTournamentName}
                                                options={tournamentOptions}
                                                placeholder="Type or select tournament"
                                                className="w-full bg-[#1a1a20] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white focus:border-white/20 focus:outline-none transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-white/60 mb-2 block">Round / Stage</label>
                                        <input
                                            type="text"
                                            required={type === "tournament"}
                                            value={round}
                                            onChange={(e) => setRound(e.target.value)}
                                            placeholder="e.g. Quarter-Final, Week 2"
                                            className="w-full bg-[#1a1a20] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-white/20 focus:outline-none transition-colors"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Friendly Details (Sport/Category) */}
                            {type === "friendly" && (
                                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                                    <label className="text-xs text-white/60 mb-2 block">Sport / Category</label>
                                    <select
                                        required={type === "friendly"}
                                        value={sport}
                                        onChange={(e) => setSport(e.target.value)}
                                        className="w-full bg-[#1a1a20] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white focus:border-white/20 focus:outline-none transition-colors appearance-none"
                                    >
                                        <option value="" disabled>-- Select Sport --</option>
                                        {sports.map(s => (
                                            <option key={s.id} value={s.name}>{s.name}</option>
                                        ))}
                                    </select>
                                    <p className="text-[10px] text-white/30 mt-2">This is used as the filter category on the public Matches page.</p>
                                </div>
                            )}

                            {/* Pairings List */}
                            <div className="space-y-6">
                                {pairings.map((pairing, index) => (
                                    <div key={pairing.id} className="relative p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-5">

                                        {/* Pairing Header & Delete */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs uppercase tracking-widest font-bold text-white/40">Pairing {index + 1}</span>
                                            {pairings.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setPairings(prev => prev.filter(p => p.id !== pairing.id))}
                                                    className="text-white/20 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>

                                        {/* Teams Side-by-Side */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 relative z-10">
                                            {/* Home Team */}
                                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                                                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3 block">Home Team</span>
                                                <SuggestInput
                                                    value={pairing.homeTeamName}
                                                    onChange={(newVal) => {
                                                        setPairings(prev => prev.map(p => p.id === pairing.id ? { ...p, homeTeamName: newVal } : p));
                                                    }}
                                                    options={teamOptions.filter(t => t !== pairing.awayTeamName)}
                                                    placeholder="Type or select team..."
                                                    className="w-full bg-[#1a1a20] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white focus:border-white/20 focus:outline-none transition-colors"
                                                />
                                            </div>

                                            {/* VS Badge */}
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#222228] border border-white/[0.1] hidden sm:flex items-center justify-center z-10 pointer-events-none">
                                                <span className="text-xs font-bold text-white/50 italic">VS</span>
                                            </div>

                                            {/* Away Team */}
                                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                                                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3 block">Away Team</span>
                                                <SuggestInput
                                                    value={pairing.awayTeamName}
                                                    onChange={(newVal) => {
                                                        setPairings(prev => prev.map(p => p.id === pairing.id ? { ...p, awayTeamName: newVal } : p));
                                                    }}
                                                    options={teamOptions.filter(t => t !== pairing.homeTeamName)}
                                                    placeholder="Type or select team..."
                                                    className="w-full bg-[#1a1a20] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white focus:border-white/20 focus:outline-none transition-colors"
                                                />
                                            </div>
                                        </div>

                                        {/* Schedule & Venue & Status */}
                                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                            <div>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={14} />
                                                    <input
                                                        type="date"
                                                        required
                                                        value={pairing.date}
                                                        onChange={(e) => {
                                                            const newVal = e.target.value;
                                                            setPairings(prev => prev.map(p => p.id === pairing.id ? { ...p, date: newVal } : p));
                                                        }}
                                                        className="w-full bg-[#1a1a20] border border-white/[0.1] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:border-white/20 focus:outline-none transition-colors [color-scheme:dark]"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="relative">
                                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={14} />
                                                    <input
                                                        type="time"
                                                        required
                                                        value={pairing.time}
                                                        onChange={(e) => {
                                                            const newVal = e.target.value;
                                                            setPairings(prev => prev.map(p => p.id === pairing.id ? { ...p, time: newVal } : p));
                                                        }}
                                                        className="w-full bg-[#1a1a20] border border-white/[0.1] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:border-white/20 focus:outline-none transition-colors [color-scheme:dark]"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <SuggestInput
                                                    value={pairing.venue}
                                                    onChange={(newVal) => {
                                                        setPairings(prev => prev.map(p => p.id === pairing.id ? { ...p, venue: newVal } : p));
                                                    }}
                                                    options={facilityOptions}
                                                    placeholder="Venue"
                                                    className="w-full bg-[#1a1a20] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-white/20 focus:outline-none transition-colors"
                                                />
                                            </div>
                                            <div>
                                                <select
                                                    value={pairing.status}
                                                    onChange={(e) => {
                                                        const newVal = e.target.value as MatchStatus;
                                                        setPairings(prev => prev.map(p => p.id === pairing.id ? { ...p, status: newVal } : p));
                                                    }}
                                                    className="w-full appearance-none bg-[#1a1a20] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white focus:border-white/20 focus:outline-none transition-colors"
                                                >
                                                    <option value="scheduled">Scheduled</option>
                                                    <option value="in_progress">In Progress</option>
                                                    <option value="completed">Completed</option>
                                                    <option value="postponed">Postponed</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Add Pairing Button */}
                            <button
                                type="button"
                                onClick={() => {
                                    // Use the settings of the last pairing to prefill the new one
                                    const last = pairings[pairings.length - 1];
                                    setPairings(prev => [...prev, {
                                        id: "p" + Date.now(),
                                        homeTeamName: "",
                                        awayTeamName: "",
                                        date: last.date,
                                        time: last.time,
                                        venue: last.venue,
                                        status: last.status,
                                    }]);
                                }}
                                className="w-full py-4 border-2 border-dashed border-white/[0.1] rounded-2xl flex flex-col items-center justify-center gap-2 text-white/30 hover:text-white/80 hover:bg-white/[0.02] hover:border-white/[0.15] transition-all group"
                            >
                                <div className="w-10 h-10 rounded-full bg-white/[0.03] group-hover:bg-white/[0.05] flex items-center justify-center transition-colors">
                                    <Plus size={18} />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest leading-none">Add Pairing</span>
                            </button>

                        </form>

                        {error && (
                            <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2 text-red-400 text-sm">
                                <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-white/[0.08] bg-[#1a1a20] flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-5 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/[0.05] transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="create-match-form"
                            disabled={loading}
                            className="px-5 py-2.5 rounded-xl bg-white text-black text-sm font-bold hover:bg-white/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {loading ? "Saving..." : "Create Match"}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
