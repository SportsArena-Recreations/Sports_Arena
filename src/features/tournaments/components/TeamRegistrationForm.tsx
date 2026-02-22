import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { tournamentService } from "../services/tournament.service";
import { Loader2, CheckCircle2, AlertTriangle, Users, Mail, Trash2, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TeamRegistrationFormProps {
  tournamentId: string;
  entryFee: number;
}

const inputCls =
  "w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25 focus:bg-white/[0.07] transition-all";

export function TeamRegistrationForm({ tournamentId, entryFee }: TeamRegistrationFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Persist registration in local storage
  const storageKey = `registration_${tournamentId}`;
  const [registeredData, setRegisteredData] = useState<any>(null);

  useEffect(() => {
    const loadRegistration = async () => {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setRegisteredData(parsed);

        // Fetch latest status from backend
        const res = await tournamentService.getRegistrationById(parsed.id);
        if (res.success && res.data) {
          setRegisteredData(res.data);
          localStorage.setItem(storageKey, JSON.stringify(res.data));
        } else if (res.message && (res.message.toLowerCase().includes("find") || res.message.toLowerCase().includes("result"))) {
          // If deleted by admin, clear it
          setRegisteredData(null);
          localStorage.removeItem(storageKey);
        }
      }
    };
    loadRegistration();
  }, [storageKey]);

  const [formData, setFormData] = useState({
    teamName: "",
    captainName: "",
    captainEmail: "",
    captainPhone: "",
    playerCount: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.teamName || !formData.captainName || !formData.captainEmail || !formData.playerCount) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await tournamentService.registerTeam({
      tournamentId,
      teamName: formData.teamName,
      captainName: formData.captainName,
      captainEmail: formData.captainEmail,
      captainPhone: formData.captainPhone,
      playerCount: Number(formData.playerCount),
      paymentStatus: "confirmed", // Auto-confirm if there's a spot
    });

    setLoading(false);

    if (res.success && res.data) {
      localStorage.setItem(storageKey, JSON.stringify(res.data));
      setRegisteredData(res.data);
      toast({
        title: "Registration Confirmed!",
        description: `Your team "${formData.teamName}" is ready for action.`,
      });
    } else {
      setError(res.message || "Failed to register. Please try again.");
    }
  };

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancel = async () => {
    if (!registeredData?.id) return;
    setIsCancelling(true);

    // Quick optimistic clear
    const prev = registeredData;
    setRegisteredData(null);
    localStorage.removeItem(storageKey);
    setShowCancelConfirm(false);

    const res = await tournamentService.cancelRegistration(prev.id);
    setIsCancelling(false);

    if (!res.success) {
      // Revert on failure
      setRegisteredData(prev);
      localStorage.setItem(storageKey, JSON.stringify(prev));
      toast({
        title: "Error",
        description: "Failed to cancel registration. " + res.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Registration Cancelled",
        description: "Your team has been removed from this tournament.",
      });
    }
  };

  if (registeredData) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-6 text-center"
      >
        {registeredData.paymentStatus === "confirmed" && (
          <div className="flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 border border-green-500/20 mb-5">
              <CheckCircle2 size={32} className="text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">You're in!</h3>
            <p className="text-white/50 text-sm max-w-xs leading-relaxed mb-6">
              Your team is successfully registered and your spot is confirmed.
            </p>
          </div>
        )}

        {(!registeredData.paymentStatus || registeredData.paymentStatus === "pending") && (
          <div className="flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-5">
              <Clock size={32} className="text-yellow-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Registration Pending</h3>
            <p className="text-white/50 text-sm max-w-xs leading-relaxed mb-6">
              Your team is registered, and is currently pending review by the administrators.
            </p>
          </div>
        )}

        {registeredData.paymentStatus === "cancelled" && (
          <div className="flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 mb-5">
              <AlertTriangle size={32} className="text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Registration Cancelled</h3>
            <p className="text-white/50 text-sm max-w-xs leading-relaxed mb-6">
              Your team's registration was cancelled by an administrator.
            </p>
          </div>
        )}

        <div className="w-full rounded-2xl border border-white/[0.08] bg-[#111] p-5 text-left mb-6 shadow-inner">
          <h4 className="font-display text-lg font-bold text-white mb-4 border-b border-white/10 pb-3">{registeredData.teamName}</h4>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Users size={16} className="text-white/40 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Captain</p>
                <p className="text-sm text-white/90">{registeredData.captainName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail size={16} className="text-white/40 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Contact</p>
                <p className="text-sm text-white/90">{registeredData.captainEmail}</p>
                {registeredData.captainPhone && <p className="text-sm text-white/60">{registeredData.captainPhone}</p>}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 size={16} className="text-white/40 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Roster Size</p>
                <p className="text-sm text-white/90">{registeredData.playerCount} Players</p>
              </div>
            </div>
          </div>
        </div>

        {!showCancelConfirm ? (
          <button
            onClick={() => setShowCancelConfirm(true)}
            className="flex items-center justify-center gap-2 text-red-500/80 hover:text-red-400 text-sm font-semibold transition-colors px-4 py-2 mt-2"
          >
            <Trash2 size={16} /> Cancel Registration
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: "auto", scale: 1 }}
            className="w-full rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-center mt-2"
          >
            <p className="text-sm font-medium text-red-200 mb-3">Are you sure you want to cancel? This action cannot be undone and you will lose your spot.</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                disabled={isCancelling}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                Keep Spot
              </button>
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isCancelling ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                Yes, Cancel
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-2xl border border-white/[0.08] bg-[#111] p-5 shadow-inner">
        <h4 className="text-xs font-bold tracking-widest uppercase text-white/40 mb-2">Registration Fee</h4>
        <p className="text-3xl font-bold text-white tracking-tight">
          {entryFee === 0 ? "Free" : `₦${entryFee.toLocaleString("en-NG")}`}
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-white/55">Team Name <span className="text-red-400">*</span></label>
        <input
          className={inputCls}
          placeholder="e.g. Dream Crushers"
          value={formData.teamName}
          onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-white/55">Captain Name <span className="text-red-400">*</span></label>
          <input
            className={inputCls}
            placeholder="John Doe"
            value={formData.captainName}
            onChange={(e) => setFormData({ ...formData, captainName: e.target.value })}
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-white/55">Captain Email <span className="text-red-400">*</span></label>
          <input
            type="email"
            className={inputCls}
            placeholder="john@example.com"
            value={formData.captainEmail}
            onChange={(e) => setFormData({ ...formData, captainEmail: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-white/55">Phone</label>
          <input
            className={inputCls}
            placeholder="+234..."
            value={formData.captainPhone}
            onChange={(e) => setFormData({ ...formData, captainPhone: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-white/55">Number of Players <span className="text-red-400">*</span></label>
          <input
            type="number"
            min="2"
            max="30"
            className={inputCls}
            placeholder="5"
            value={formData.playerCount}
            onChange={(e) => setFormData({ ...formData, playerCount: e.target.value })}
            required
          />
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-400 mt-2">
              <AlertTriangle size={13} className="flex-shrink-0" />
              {error}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="submit"
        disabled={loading}
        className="mt-4 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white text-black text-sm font-bold hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all disabled:opacity-50"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
        {loading ? "Registering..." : "Register Team"}
      </button>
    </form>
  );
}
