import React, { useState, useEffect } from "react";
import { X, Trophy, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Team } from "../types";
import { Tournament } from "@/features/tournaments/types";

interface RegisterToTournamentModalProps {
    isOpen: boolean;
    onClose: () => void;
    team: Team | null;
    tournaments: Tournament[];
    onSave: (data: {
        tournamentId: string;
        teamName: string;
        captainName: string;
        captainEmail: string;
        captainPhone: string;
        playerCount: number;
    }) => Promise<void>;
}

export function RegisterToTournamentModal({ isOpen, onClose, team, tournaments, onSave }: RegisterToTournamentModalProps) {
    const [tournamentId, setTournamentId] = useState("");
    const [captainEmail, setCaptainEmail] = useState("");
    const [playerCount, setPlayerCount] = useState<number>(11);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && team) {
            setTournamentId("");
            setCaptainEmail("");
            setPlayerCount(11);
        }
    }, [isOpen, team]);

    if (!isOpen || !team) return null;

    // Filter out ended/cancelled tournaments
    const activeTournaments = tournaments.filter(t =>
        t.status === "upcoming" || t.status === "registration_open"
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tournamentId) return;

        setIsLoading(true);
        await onSave({
            tournamentId,
            teamName: team.name,
            captainName: team.captainName || "Team Captain",
            captainEmail: captainEmail || "not-provided@example.com",
            captainPhone: team.phone || "",
            playerCount
        });
        setIsLoading(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex justify-center items-end sm:items-center p-0 sm:p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
                initial={{ opacity: 0, y: 100, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 100, scale: 0.95 }}
                className="relative w-full sm:max-w-md bg-[#08080a] border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
                            <Trophy size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white tracking-tight">Register Team</h2>
                            <p className="text-xs text-white/40 mt-0.5">Register {team.name} to a tournament</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white/40 hover:text-white transition-colors">
                        <X size={16} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <form id="registerForm" onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="text-xs text-white/60 mb-2 block font-semibold">Select Tournament *</label>
                            <select
                                required
                                value={tournamentId}
                                onChange={(e) => setTournamentId(e.target.value)}
                                className="w-full bg-[#1a1a20] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white focus:border-green-400/50 focus:outline-none transition-colors appearance-none"
                            >
                                <option value="" disabled>-- Choose a Tournament --</option>
                                {activeTournaments.length === 0 && <option disabled>No upcoming tournaments available</option>}
                                {activeTournaments.map(t => (
                                    <option key={t.id} value={t.id}>{t.name} ({t.sport})</option>
                                ))}
                            </select>
                        </div>

                        <div className="h-px w-full bg-white/5 my-2" />

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-white/60 mb-2 block font-semibold">Captain Email (Optional)</label>
                                <input
                                    type="email"
                                    value={captainEmail}
                                    onChange={(e) => setCaptainEmail(e.target.value)}
                                    placeholder="e.g. email@example.com"
                                    className="w-full bg-[#1a1a20] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-green-400/50 focus:outline-none transition-colors"
                                />
                            </div>

                            <div>
                                <label className="text-xs text-white/60 mb-2 block font-semibold">Player Count</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={playerCount}
                                    onChange={(e) => setPlayerCount(parseInt(e.target.value) || 0)}
                                    className="w-full bg-[#1a1a20] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-green-400/50 focus:outline-none transition-colors"
                                />
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-white/5 bg-white/[0.02] flex items-center justify-end gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white/60 hover:text-white hover:bg-white/5 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="registerForm"
                        disabled={isLoading || !tournamentId}
                        className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : "Register"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
