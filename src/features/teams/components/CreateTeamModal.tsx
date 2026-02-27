import React, { useState, useEffect } from "react";
import { X, Users, Trophy, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { sportService, Sport } from "@/features/sports/services/sport.service";

interface CreateTeamModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (team: { name: string; sport: string; captainName: string; captainPhone: string }) => Promise<void>;
}

export function CreateTeamModal({ isOpen, onClose, onSave }: CreateTeamModalProps) {
    const [name, setName] = useState("");
    const [sport, setSport] = useState("");
    const [captainName, setCaptainName] = useState("");
    const [captainPhone, setCaptainPhone] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [sports, setSports] = useState<Sport[]>([]);

    useEffect(() => {
        if (isOpen) {
            sportService.getAll().then(res => setSports(res.data));
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !sport) return;

        setIsLoading(true);
        await onSave({ name, sport, captainName, captainPhone });
        setIsLoading(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex justify-center items-end sm:items-center p-0 sm:p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, y: 100, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 100, scale: 0.95 }}
                className="relative w-full sm:max-w-lg bg-[#08080a] border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                            <Users size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Create Standalone Team</h2>
                            <p className="text-[11px] text-white/40 mt-0.5">Add a new team for future friendlies and events</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    <form id="createTeamForm" onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="text-xs text-white/60 mb-2 block font-semibold">Team Name *</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Red Lions FC"
                                className="w-full bg-[#1a1a20] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-purple-400/50 focus:outline-none transition-colors"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-white/60 mb-2 block flex items-center gap-1.5 font-semibold">
                                <Trophy size={12} className="text-purple-400" />
                                Primary Sport *
                            </label>
                            <select
                                required
                                value={sport}
                                onChange={(e) => setSport(e.target.value)}
                                className="w-full bg-[#1a1a20] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white focus:border-purple-400/50 focus:outline-none transition-colors appearance-none"
                            >
                                <option value="" disabled>-- Select Sport --</option>
                                {sports.map(s => (
                                    <option key={s.id} value={s.name}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="h-px w-full bg-white/5 my-2" />

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-white/60 mb-2 block font-semibold">Captain Name (Optional)</label>
                                <input
                                    type="text"
                                    value={captainName}
                                    onChange={(e) => setCaptainName(e.target.value)}
                                    placeholder="e.g. John Doe"
                                    className="w-full bg-[#1a1a20] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-purple-400/50 focus:outline-none transition-colors"
                                />
                            </div>

                            <div>
                                <label className="text-xs text-white/60 mb-2 block font-semibold">Captain Phone (Optional)</label>
                                <input
                                    type="tel"
                                    value={captainPhone}
                                    onChange={(e) => setCaptainPhone(e.target.value)}
                                    placeholder="e.g. +234..."
                                    className="w-full bg-[#1a1a20] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-purple-400/50 focus:outline-none transition-colors"
                                />
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
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
                        form="createTeamForm"
                        disabled={isLoading || !name || !sport}
                        className="px-6 py-2.5 bg-purple-500 hover:bg-purple-600 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : "Create Team"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
