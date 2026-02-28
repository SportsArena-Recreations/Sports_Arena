import { useState, useEffect } from "react";
import {
  Search, ChevronDown, Loader2, CalendarDays,
  CheckCircle2, XCircle, Clock, Users, Banknote,
  AlertTriangle, RefreshCw, Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { bookingService } from "@/features/bookings/services/booking.service";
import { Booking, BookingStatus } from "@/features/bookings/types";
import { AdminCreateBookingModal } from "@/features/bookings/components/AdminCreateBookingModal";

// ─── constants ───────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  confirmed: "bg-green-500/10  text-green-400  border-green-500/20",
  cancelled: "bg-red-500/10    text-red-400    border-red-500/20",
  completed: "bg-blue-500/10   text-blue-400   border-blue-500/20",
};

const STATUS_OPTIONS: BookingStatus[] = ["pending", "confirmed", "cancelled", "completed"];

const fmt = (n: number) => "₦" + n.toLocaleString("en-NG", { minimumFractionDigits: 0 });

const fmtDate = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-NG", {
    weekday: "short", month: "short", day: "numeric",
  });

// ─── StatusChip ──────────────────────────────────────────────────────────────

function StatusChip({ status }: { status: BookingStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}

// ─── StatusMenu ──────────────────────────────────────────────────────────────

function StatusMenu({
  booking, onUpdated,
}: { booking: Booking; onUpdated: (b: Booking) => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = async (status: BookingStatus) => {
    if (status === booking.status) { setOpen(false); return; }
    setLoading(true);
    const res = await bookingService.updateStatus(booking.id, status);
    setLoading(false);
    setOpen(false);
    if (res.success) onUpdated({ ...booking, status });
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
                className={`flex w-full items-center px-3.5 py-2.5 text-xs font-semibold capitalize transition-colors hover:bg-white/[0.06] ${s === booking.status ? "text-white" : "text-white/40"
                  }`}
              >
                <span className={`mr-2 h-1.5 w-1.5 rounded-full ${s === "pending" ? "bg-yellow-400" :
                  s === "confirmed" ? "bg-green-400" :
                    s === "cancelled" ? "bg-red-400" : "bg-blue-400"
                  }`} />
                {s}
                {s === booking.status && <CheckCircle2 size={11} className="ml-auto text-white/40" />}
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

// ─── BookingDetailPanel ──────────────────────────────────────────────────────

function BookingDetailPanel({ booking, onClose, onUpdated }: {
  booking: Booking;
  onClose: () => void;
  onUpdated: (b: Booking) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: 40, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="w-full sm:max-w-md bg-[#0d0d11] border border-white/[0.09] sm:rounded-2xl rounded-t-2xl shadow-2xl"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-sm font-bold text-white">Booking Details</h2>
            <p className="text-[11px] text-white/30 mt-0.5">ID: {booking.id.slice(0, 8)}…</p>
          </div>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-full text-white/30 hover:text-white hover:bg-white/[0.06] transition-all">
            <XCircle size={16} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Status */}
          <div className="flex items-center justify-between">
            <StatusChip status={booking.status} />
            <StatusMenu booking={booking} onUpdated={(b) => { onUpdated(b); onClose(); }} />
          </div>

          {/* Facility + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 bg-white/[0.03] border border-white/[0.05] rounded-xl p-3">
              <p className="text-[10px] uppercase tracking-widest text-white/25 font-bold">Facility</p>
              <p className="text-sm font-semibold text-white">{booking.facilityName}</p>
            </div>
            <div className="space-y-1 bg-white/[0.03] border border-white/[0.05] rounded-xl p-3">
              <p className="text-[10px] uppercase tracking-widest text-white/25 font-bold">Date</p>
              <p className="text-sm font-semibold text-white">{fmtDate(booking.date)}</p>
            </div>
          </div>

          {/* Time + Price */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 bg-white/[0.03] border border-white/[0.05] rounded-xl p-3">
              <p className="text-[10px] uppercase tracking-widest text-white/25 font-bold">Time</p>
              <p className="text-sm font-semibold text-white">{booking.startTime.slice(0, 5)} – {booking.endTime.slice(0, 5)}</p>
            </div>
            <div className="space-y-1 bg-white/[0.03] border border-white/[0.05] rounded-xl p-3">
              <p className="text-[10px] uppercase tracking-widest text-white/25 font-bold">Total</p>
              <p className="text-sm font-bold text-white">{fmt(booking.totalPrice)}</p>
            </div>
          </div>

          {/* Customer */}
          <div className="space-y-1 bg-white/[0.03] border border-white/[0.05] rounded-xl p-3">
            <p className="text-[10px] uppercase tracking-widest text-white/25 font-bold mb-2">Customer</p>
            <p className="text-sm text-white/80 font-semibold">{booking.userName}</p>
            <p className="text-xs text-white/40">{booking.userEmail}</p>
            {booking.userPhone && <p className="text-xs text-white/40">{booking.userPhone}</p>}
          </div>

          {/* Notes */}
          {booking.notes && (
            <div className="space-y-1 bg-white/[0.03] border border-white/[0.05] rounded-xl p-3">
              <p className="text-[10px] uppercase tracking-widest text-white/25 font-bold">Notes</p>
              <p className="text-xs text-white/50 leading-relaxed">{booking.notes}</p>
            </div>
          )}

          <p className="text-[10px] text-white/20 text-center">
            Booked {new Date(booking.createdAt).toLocaleString("en-NG")}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── ManageBookings ───────────────────────────────────────────────────────────

const ManageBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
  const [selected, setSelected] = useState<Booking | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await bookingService.getAll();
    setBookings(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = bookings.filter((b) => {
    const matchSearch =
      b.userName.toLowerCase().includes(search.toLowerCase()) ||
      b.facilityName.toLowerCase().includes(search.toLowerCase()) ||
      b.userEmail.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const updateBooking = (updated: Booking) => {
    setBookings((bs) => bs.map((b) => (b.id === updated.id ? updated : b)));
  };

  // Stats
  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    revenue: bookings
      .filter((b) => b.status === "confirmed" || b.status === "completed")
      .reduce((s, b) => s + b.totalPrice, 0),
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Bookings</h1>
          <p className="text-sm text-white/40 mt-0.5">
            {bookings.length} booking{bookings.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 transition-all font-semibold shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
          >
            <Plus size={16} strokeWidth={2.5} />
            Create Booking
          </button>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white/60 hover:text-white hover:border-white/20 transition-all shrink-0"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total, icon: CalendarDays, color: "text-white/60" },
          { label: "Pending", value: stats.pending, icon: Clock, color: "text-yellow-400" },
          { label: "Confirmed", value: stats.confirmed, icon: CheckCircle2, color: "text-green-400" },
          { label: "Revenue", value: fmt(stats.revenue), icon: Banknote, color: "text-blue-400" },
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
            placeholder="Search by customer, facility, email…"
            className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-all"
          />
        </div>
        <div className="flex gap-1 p-1 bg-white/[0.04] border border-white/[0.07] rounded-xl w-fit self-start">
          {(["all", ...STATUS_OPTIONS] as const).map((s) => (
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
      </div>

      {/* Table */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="hidden md:grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-white/[0.05] text-[10px] font-bold text-white/20 uppercase tracking-widest">
          <span>Customer</span>
          <span>Facility</span>
          <span>Date</span>
          <span>Time</span>
          <span className="flex items-center gap-1"><Banknote size={9} />Total</span>
          <span>Status</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={20} className="animate-spin text-white/30" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <CalendarDays size={32} className="text-white/10" />
            <p className="text-sm text-white/30">
              {search || statusFilter !== "all" ? "No bookings match your filters." : "No bookings yet."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {filtered.map((b) => (
              <motion.div
                key={b.id}
                layout
                className="grid grid-cols-1 md:grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto] gap-3 md:gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors items-center cursor-pointer"
                onClick={() => setSelected(b)}
              >
                {/* Customer */}
                <div>
                  <p className="text-sm font-semibold text-white">{b.userName}</p>
                  <p className="text-xs text-white/35">{b.userEmail}</p>
                </div>
                {/* Facility */}
                <p className="text-sm text-white/60">{b.facilityName}</p>
                {/* Date */}
                <p className="text-sm text-white/50">{fmtDate(b.date)}</p>
                {/* Time */}
                <p className="text-sm text-white/50 flex items-center gap-1">
                  <Clock size={11} className="text-white/25" />
                  {b.startTime.slice(0, 5)}–{b.endTime.slice(0, 5)}
                </p>
                {/* Price */}
                <p className="text-sm font-semibold text-white/80">{fmt(b.totalPrice)}</p>
                {/* Status */}
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <StatusChip status={b.status} />
                  <StatusMenu booking={b} onUpdated={updateBooking} />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer summary */}
      {!loading && filtered.length > 0 && (
        <div className="flex flex-wrap gap-4 text-xs text-white/30">
          <span className="flex items-center gap-1.5">
            <Users size={11} /> {filtered.length} shown
          </span>
          <span className="ml-auto flex items-center gap-1.5">
            <Banknote size={11} />
            Confirmed revenue: {fmt(
              filtered.filter(b => b.status === "confirmed" || b.status === "completed")
                .reduce((s, b) => s + b.totalPrice, 0)
            )}
          </span>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {selected && (
          <BookingDetailPanel
            booking={selected}
            onClose={() => setSelected(null)}
            onUpdated={(b) => { updateBooking(b); setSelected(null); }}
          />
        )}
        {showCreateModal && (
          <AdminCreateBookingModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              load();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageBookings;
