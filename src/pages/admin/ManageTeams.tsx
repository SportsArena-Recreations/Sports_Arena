import { useState, useEffect } from "react";
import {
  Search, ChevronDown, Loader2, CalendarDays,
  CheckCircle2, Clock, Users, Trophy, Mail, Phone, Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { tournamentService, TeamRegistration } from "@/features/tournaments/services/tournament.service";
import { teamService } from "@/features/teams/services/team.service";
import { Team } from "@/features/teams/types";
import { Tournament } from "@/features/tournaments/types";
import { CreateTeamModal } from "@/features/teams/components/CreateTeamModal";
import { RegisterToTournamentModal } from "@/features/teams/components/RegisterToTournamentModal";

// ─── Constants ─────────────────────────────────────────────────────────────

type StatusType = "pending" | "confirmed" | "cancelled";
const STATUS_OPTIONS: StatusType[] = ["pending", "confirmed", "cancelled"];

const STATUS_STYLES: Record<StatusType, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  confirmed: "bg-green-500/10  text-green-400  border-green-500/20",
  cancelled: "bg-red-500/10    text-red-400    border-red-500/20",
};

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-NG", {
    weekday: "short", month: "short", day: "numeric",
  });

type DisplayRegistration = TeamRegistration & {
  tournamentName?: string;
  sport?: string;
}

// ─── StatusChip & Menu ─────────────────────────────────────────────────────

function StatusChip({ status }: { status: string }) {
  const normStatus = (status || "pending").toLowerCase() as StatusType;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${STATUS_STYLES[normStatus] || STATUS_STYLES.pending}`}>
      {status}
    </span>
  );
}

function StatusMenu({
  reg, onUpdated,
}: { reg: DisplayRegistration; onUpdated: (val: DisplayRegistration) => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = async (status: StatusType) => {
    if (status === reg.paymentStatus) { setOpen(false); return; }
    setLoading(true);
    const res = await tournamentService.updateRegistrationStatus(reg.id!, status);
    setLoading(false);
    setOpen(false);
    if (res.success) onUpdated({ ...reg, paymentStatus: status });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={loading}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-xs text-white/60 hover:text-white hover:border-white/20 transition-all disabled:opacity-40"
      >
        {loading ? <Loader2 size={11} className="animate-spin" /> : "Change"}
        <ChevronDown size={11} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-1.5 w-36 rounded-xl border border-white/[0.1] bg-[#111118] shadow-2xl z-20 overflow-hidden"
            style={{ backdropFilter: "blur(12px)" }}
          >
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => update(s)}
                className={`flex w-full items-center px-3.5 py-2.5 text-xs font-semibold capitalize transition-colors hover:bg-white/[0.06] ${s === reg.paymentStatus ? "text-white" : "text-white/40"
                  }`}
              >
                <span className={`mr-2 h-1.5 w-1.5 rounded-full ${s === "pending" ? "bg-yellow-400" :
                  s === "confirmed" ? "bg-green-400" : "bg-red-400"
                  }`} />
                {s}
                {s === reg.paymentStatus && <CheckCircle2 size={11} className="ml-auto text-white/40" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {open && (
        <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
      )}
    </div>
  );
}

// ─── ManageTeams (Registrations & Standalone) ───────────────────────────

const ManageTeams = () => {
  const [activeTab, setActiveTab] = useState<"registrations" | "standalone">("registrations");

  // Tournament Registrations State
  const [registrations, setRegistrations] = useState<DisplayRegistration[]>([]);
  const [loadingRegs, setLoadingRegs] = useState(true);

  // Standalone Teams State
  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [registeringTeam, setRegisteringTeam] = useState<Team | null>(null);

  // Tournaments
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const loadData = async () => {
    setLoadingRegs(true);
    setLoadingTeams(true);

    const [regRes, teamsRes, tournRes] = await Promise.all([
      tournamentService.getAllRegistrations(),
      teamService.getAll(),
      tournamentService.getAll()
    ]);

    setRegistrations(regRes.data || []);
    setLoadingRegs(false);

    setTeams(teamsRes.data || []);
    setLoadingTeams(false);

    setTournaments(tournRes.data || []);
  };

  useEffect(() => { loadData(); }, []);

  const handleCreateTeam = async (data: { name: string; sport: string; captainName: string; captainPhone: string }) => {
    const res = await teamService.create(data);
    if (res.success && res.data) {
      setTeams([res.data, ...teams]);
    }
    setIsCreateModalOpen(false);
  };

  const handleRegisterTeam = async (data: {
    tournamentId: string;
    teamName: string;
    captainName: string;
    captainEmail: string;
    captainPhone: string;
    playerCount: number;
  }) => {
    const res = await tournamentService.registerTeam(data);
    if (res.success && res.data) {
      loadData(); // Reload to refresh both registrations and components correctly
    }
  };

  const filteredRegs = registrations.filter((r) => {
    const matchSearch =
      r.teamName.toLowerCase().includes(search.toLowerCase()) ||
      r.captainName.toLowerCase().includes(search.toLowerCase()) ||
      (r.tournamentName || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || r.paymentStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const filteredTeams = teams.filter((t) => {
    return t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.captainName.toLowerCase().includes(search.toLowerCase()) ||
      t.sport.toLowerCase().includes(search.toLowerCase());
  });

  const updateRegistration = (updated: DisplayRegistration) => {
    setRegistrations((rs) => rs.map((r) => (r.id === updated.id ? updated : r)));
  };

  // Stats
  const stats = {
    total: activeTab === "registrations" ? registrations.length : teams.length,
    pending: registrations.filter((r) => r.paymentStatus === "pending").length,
    confirmed: registrations.filter((r) => r.paymentStatus === "confirmed").length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Teams & Registrations</h1>
          <p className="text-sm text-white/40 mt-0.5">
            Manage tournament entries and standalone teams
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-white text-black px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-white/90 transition-all shrink-0 w-fit"
        >
          <Plus size={16} /> Create Team
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/[0.08]">
        <button
          onClick={() => setActiveTab("registrations")}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === "registrations" ? "border-white text-white" : "border-transparent text-white/40 hover:text-white/80"}`}
        >
          Tournament Registrations
        </button>
        <button
          onClick={() => setActiveTab("standalone")}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === "standalone" ? "border-white text-white" : "border-transparent text-white/40 hover:text-white/80"}`}
        >
          Standalone Teams
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { label: "Total Teams", value: stats.total, icon: Users, color: "text-white/60" },
          { label: "Pending Review", value: stats.pending, icon: Clock, color: "text-yellow-400" },
          { label: "Confirmed Entries", value: stats.confirmed, icon: CheckCircle2, color: "text-green-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl px-4 py-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={13} className={color} />
              <span className="text-[10px] uppercase font-bold tracking-widest text-white/25">{label}</span>
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teams, captains, or tournaments..."
            className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-all"
          />
        </div>
        {activeTab === "registrations" && (
          <div className="flex gap-1 p-1 bg-white/[0.04] border border-white/[0.07] rounded-xl w-fit self-start">
            {(["all", ...STATUS_OPTIONS]).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${statusFilter === s ? "bg-white/10 text-white" : "text-white/35 hover:text-white/60"
                  }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl">
        {activeTab === "registrations" && (
          <>
            <div className="hidden md:grid grid-cols-[1.5fr_1.5fr_1.5fr_1fr_auto] gap-4 px-5 py-3 border-b border-white/[0.05] text-[10px] font-bold text-white/20 uppercase tracking-widest">
              <span>Team Info</span>
              <span>Tournament</span>
              <span>Captain Details</span>
              <span>Registered On</span>
              <span>Status</span>
            </div>

            {loadingRegs ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={20} className="animate-spin text-white/30" />
              </div>
            ) : filteredRegs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Users size={32} className="text-white/10" />
                <p className="text-sm text-white/30">
                  {search || statusFilter !== "all" ? "No registrations match your filters." : "No teams have registered yet."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {filteredRegs.map((r) => (
                  <div
                    key={r.id}
                    className="grid grid-cols-1 md:grid-cols-[1.5fr_1.5fr_1.5fr_1fr_auto] gap-3 md:gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors items-center"
                  >
                    <div>
                      <p className="text-sm font-bold text-white tracking-tight">{r.teamName}</p>
                      <p className="text-xs text-white/40 flex items-center gap-1 mt-0.5">
                        <Users size={10} /> {r.playerCount} Roster Size
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white/80">{r.tournamentName || "Unknown Tournament"}</p>
                      <p className="text-xs text-white/40 flex items-center gap-1 mt-0.5 uppercase tracking-widest">
                        <Trophy size={10} /> {r.sport || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-white/80">{r.captainName}</p>
                      <p className="text-xs text-white/40 flex flex-col gap-0.5 mt-0.5">
                        <span className="flex items-center gap-1"><Mail size={10} /> {r.captainEmail}</span>
                        {r.captainPhone && <span className="flex items-center gap-1"><Phone size={10} /> {r.captainPhone}</span>}
                      </p>
                    </div>
                    <p className="text-sm text-white/50 flex items-center gap-1.5">
                      <CalendarDays size={12} className="text-white/20" />
                      {fmtDate(r.createdAt || new Date().toISOString())}
                    </p>
                    <div className="flex flex-row items-center gap-2">
                      <StatusChip status={r.paymentStatus || "pending"} />
                      <StatusMenu reg={r} onUpdated={updateRegistration} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Standalone Teams List */}
        {activeTab === "standalone" && (
          <>
            <div className="hidden md:grid grid-cols-[1.5fr_1.5fr_2fr_1fr_auto] gap-4 px-5 py-3 border-b border-white/[0.05] text-[10px] font-bold text-white/20 uppercase tracking-widest">
              <span>Team Name</span>
              <span>Sport</span>
              <span>Captain Details</span>
              <span>Created On</span>
            </div>

            {loadingTeams ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={20} className="animate-spin text-white/30" />
              </div>
            ) : filteredTeams.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Users size={32} className="text-white/10" />
                <p className="text-sm text-white/30">
                  {search ? "No standalone teams match your search." : "No standalone teams created yet."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {filteredTeams.map((t) => (
                  <div
                    key={t.id}
                    className="grid grid-cols-1 md:grid-cols-[1.5fr_1.5fr_2fr_1fr_auto] gap-3 md:gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors items-center"
                  >
                    <div>
                      <p className="text-sm font-bold text-white tracking-tight">{t.name}</p>
                    </div>
                    <div>
                      <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-md text-xs font-bold uppercase tracking-widest">
                        {t.sport || "N/A"}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-white/80">{t.captainName || "N/A"}</p>
                      {t.phone && (
                        <p className="text-xs text-white/40 flex items-center gap-1 mt-0.5">
                          <Phone size={10} /> {t.phone}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-white/50 flex items-center gap-1.5">
                        <CalendarDays size={12} className="text-white/20" />
                        {fmtDate(t.createdAt || new Date().toISOString())}
                      </p>
                      <button
                        onClick={() => setRegisteringTeam(t)}
                        className="px-3 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-green-500/20 transition-all"
                      >
                        Register
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      <CreateTeamModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateTeam}
      />
      <RegisterToTournamentModal
        isOpen={!!registeringTeam}
        onClose={() => setRegisteringTeam(null)}
        team={registeringTeam}
        tournaments={tournaments}
        onSave={handleRegisterTeam}
      />
    </div>
  );
};

export default ManageTeams;
