import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { facilityService } from "@/features/facilities/services/facility.service";
import { bookingService } from "@/features/bookings/services/booking.service";
import { Facility } from "@/features/facilities/types";
import { Booking } from "@/features/bookings/types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useAuth } from "@/context/AuthContext";
import {
  ChevronLeft, ChevronRight, Users, Banknote, Clock, CheckCircle2,
  Loader2, CalendarDays, AlertTriangle, ShieldOff, X,
} from "lucide-react";

// ─── constants ────────────────────────────────────────────────────────────────

const SPORT_GRADIENTS: Record<string, { from: string; via: string; to: string }> = {
  basketball: { from: "#7c3200", via: "#3d1a00", to: "#0a0a0c" },
  soccer: { from: "#1a4d2e", via: "#0d2718", to: "#0a0a0c" },
  tennis: { from: "#4d3a00", via: "#2a1f00", to: "#0a0a0c" },
  volleyball: { from: "#4a1d96", via: "#2d1060", to: "#0a0a0c" },
  swimming: { from: "#0d3b6e", via: "#061e3a", to: "#0a0a0c" },
  badminton: { from: "#1d4d3a", via: "#0d2820", to: "#0a0a0c" },
  multipurpose: { from: "#3d1a4d", via: "#200d2a", to: "#0a0a0c" },
};

const SPORT_EMOJI: Record<string, string> = {
  basketball: "🏀", soccer: "⚽", tennis: "🎾", volleyball: "🏐",
  swimming: "🏊", badminton: "🏸", multipurpose: "🏟️",
};

// Generate hourly time slots from 06:00 → 22:00
function generateSlots(pricePerHour: number) {
  const slots = [];
  for (let h = 6; h < 22; h++) {
    const pad = (n: number) => String(n).padStart(2, "0");
    slots.push({
      id: `${pad(h)}:00`,
      start: `${pad(h)}:00`,
      end: `${pad(h + 1)}:00`,
      price: pricePerHour,
    });
  }
  return slots;
}

const fmt = (n: number) => "₦" + n.toLocaleString("en-NG", { minimumFractionDigits: 0 });
const fmtDate = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

// ─── Component ────────────────────────────────────────────────────────────────

const FacilityDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user, fullName, session } = useAuth();

  const [facility, setFacility] = useState<Facility | null>(null);
  const [loadingFacility, setLoadingFacility] = useState(true);
  const [imgError, setImgError] = useState(false);

  // Date + slot selection
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<{ startTime: string; endTime: string }[]>([]);
  const [myBookings, setMyBookings] = useState<import("@/features/bookings/types").Booking[]>([]);

  // Booking form
  const [form, setForm] = useState({ name: fullName ?? "", email: user?.email ?? "", phone: "", notes: "" });
  const [booking, setBooking] = useState(false);
  const [bookError, setBookError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const [conflictBookings, setConflictBookings] = useState<import("@/features/bookings/types").Booking[]>([]);
  const [showConflictModal, setShowConflictModal] = useState(false);

  // Calendar View State
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date(selectedDate);
    d.setDate(1);
    return d;
  });

  const getDaysInMonth = (year: number, month: number) => {
    const date = new Date(year, month, 1);
    const startDay = date.getDay();
    const days = [];

    // Add padded days from prev month
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false
      });
    }

    // Add current month days
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }

    // Add padded days for next month
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }

    return days;
  };

  const calendarDays = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth());
  const [monthBookedDates, setMonthBookedDates] = useState<string[]>([]);

  useEffect(() => {
    if (!id) return;
    setLoadingFacility(true);
    facilityService.getById(id).then((res) => {
      if (res.data) setFacility(res.data);
      setLoadingFacility(false);
    });
    // Load this user's existing bookings for this facility
    if (session) {
      bookingService.getMineForFacility(id).then((res) => setMyBookings(res.data));
    }
  }, [id, session]);

  useEffect(() => {
    if (!id) return;
    bookingService.getBookedDaysInMonth(id, currentMonth.getFullYear(), currentMonth.getMonth())
      .then((res) => setMonthBookedDates(res.data));
  }, [id, currentMonth]);

  useEffect(() => {
    if (!id) return;
    bookingService.getBookedSlots(id, selectedDate).then((res) => {
      setBookedSlots(res.data);
      setSelectedSlot(null);
    });
  }, [id, selectedDate]);

  // Keep form in sync when auth loads
  useEffect(() => {
    setForm((f) => ({
      ...f,
      name: f.name || fullName || "",
      email: f.email || user?.email || "",
    }));
  }, [fullName, user]);

  const handleBook = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!facility || !selectedSlot || !user || !session) return;
    if (!form.name.trim() || !form.email.trim()) { setBookError("Name and email are required."); return; }

    setBooking(true);
    setBookError(null);

    // Check for conflicts first
    const conflictRes = await bookingService.getMyConflicts(selectedDate, facility.id, [selectedSlot]);
    if (conflictRes.success && conflictRes.data && conflictRes.data.length > 0) {
      setConflictBookings(conflictRes.data);
      setShowConflictModal(true);
      setBooking(false);
      return;
    }

    await executeBooking();
  };

  const executeBooking = async () => {
    setBooking(true);
    setShowConflictModal(false);

    if (!facility || !selectedSlot || !user) return;

    const res = await bookingService.create({
      facilityId: facility.id,
      userId: user.id,
      userName: form.name,
      userEmail: form.email,
      userPhone: form.phone,
      date: selectedDate,
      startTime: selectedSlot,
      endTime: `${String(parseInt(selectedSlot) + 1).padStart(2, "0")}:00`,
      totalPrice: facility.pricePerHour,
      notes: form.notes || undefined,
    });

    setBooking(false);
    if (!res.success) { setBookError(res.message ?? "Booking failed. Please try again."); return; }
    // Refresh both booked slots and user's bookings, plus month indicator
    bookingService.getBookedSlots(facility.id, selectedDate).then((r) => setBookedSlots(r.data));
    bookingService.getMineForFacility(facility.id).then((r) => setMyBookings(r.data));
    bookingService.getBookedDaysInMonth(facility.id, currentMonth.getFullYear(), currentMonth.getMonth())
      .then((res) => setMonthBookedDates(res.data));
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    setCancellingId(bookingId);
    const res = await bookingService.cancel(bookingId);
    setCancellingId(null);

    if (res.success) {
      if (!facility) return;
      // Refresh state so calendar dots, slots, and myBookings immediately update
      bookingService.getBookedSlots(facility.id, selectedDate).then((r) => setBookedSlots(r.data));
      bookingService.getMineForFacility(facility.id).then((r) => setMyBookings(r.data));
      bookingService.getBookedDaysInMonth(facility.id, currentMonth.getFullYear(), currentMonth.getMonth())
        .then((res) => setMonthBookedDates(res.data));
    } else {
      alert("Failed to cancel booking: " + res.message);
    }
  };

  if (loadingFacility) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={24} className="animate-spin text-white/30" />
      </div>
    );
  }

  if (!facility) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <AlertTriangle size={32} className="text-white/20" />
        <p className="text-white/40">Facility not found.</p>
        <Link to="/facilities" className="text-sm text-white/60 hover:text-white underline">Back to facilities</Link>
      </div>
    );
  }

  const hasImage = facility.imageUrl && facility.imageUrl.startsWith("http") && !imgError;
  const gradient = SPORT_GRADIENTS[facility.type] ?? SPORT_GRADIENTS.multipurpose;
  const slots = generateSlots(facility.pricePerHour);
  const isSlotBooked = (start: string) =>
    bookedSlots.some((b) => b.startTime.slice(0, 5) === start);
  const isSlotMyBooking = (start: string) =>
    myBookings.some((b) => b.date === selectedDate && b.startTime.slice(0, 5) === start);

  // Helper to check if a specific time slot has already passed based on the current local time
  const isSlotPast = (start: string) => {
    const now = new Date();
    // Compare selected date with today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDateObj = new Date(selectedDate);
    selectedDateObj.setHours(0, 0, 0, 0);

    // If selected date is in the past, all slots are past
    if (selectedDateObj < today) return true;

    // If selected date is today, check if the slot time has passed
    if (selectedDateObj.getTime() === today.getTime()) {
      const currentHour = now.getHours();
      const currentMinutes = now.getMinutes();
      const [slotHour, slotMinutes] = start.split(':').map(Number);

      return slotHour < currentHour || (slotHour === currentHour && slotMinutes <= currentMinutes);
    }

    // If selected date is in the future, no slots have passed
    return false;
  };

  const getLiveSessionEndTime = (booking: Booking) => {
    if (booking.status !== "confirmed") return null;
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bookingDate = new Date(booking.date + "T00:00:00");
    if (bookingDate.getTime() !== today.getTime()) return null;

    const startHour = parseInt(booking.startTime.split(':')[0], 10);
    const endHour = parseInt(booking.endTime.split(':')[0], 10);
    const currentHour = now.getHours();

    // Check if this specific booking is live
    if (currentHour >= startHour && currentHour < endHour) {
      return booking.endTime.slice(0, 5);
    }
    return null;
  };

  const sortedMyBookings = [...myBookings].sort((a, b) => {
    const timeA = new Date(`${a.date}T${a.startTime}`).getTime();
    const timeB = new Date(`${b.date}T${b.startTime}`).getTime();
    return timeA - timeB;
  });

  return (
    <div className="min-h-screen bg-[#080809]">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="relative h-72 md:h-96 w-full overflow-hidden">
        {hasImage ? (
          <img
            src={facility.imageUrl}
            alt={facility.name}
            onError={() => setImgError(true)}
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at 60% 40%, ${gradient.from} 0%, ${gradient.via} 50%, ${gradient.to} 100%)`,
            }}
          >
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[120px] opacity-10 select-none">
              {SPORT_EMOJI[facility.type] ?? "🏟️"}
            </span>
          </div>
        )}
        {/* Gradient overlay fading into page bg */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080809] via-[#080809]/40 to-transparent" />
        {/* Back link */}
        <Link
          to="/facilities"
          className="absolute top-6 left-6 flex items-center gap-1.5 text-xs text-white/60 hover:text-white bg-black/40 backdrop-blur-md px-3 py-2 rounded-full border border-white/10 transition-all"
        >
          <ChevronLeft size={14} /> Facilities
        </Link>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="container max-w-6xl px-4 -mt-12 pb-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_380px] items-start">

          {/* Left: info */}
          <div>
            {/* Title row */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{facility.name}</h1>
                  <StatusBadge status={facility.status} />
                </div>
                <div className="flex items-center gap-4 text-sm text-white/40">
                  <span className="flex items-center gap-1.5"><Users size={13} /> {facility.capacity} persons</span>
                  <span className="flex items-center gap-1.5"><Banknote size={13} /> {fmt(facility.pricePerHour)}/hr</span>
                  <span className="flex items-center gap-1.5 capitalize"><Clock size={13} /> {facility.type}</span>
                </div>
              </div>
            </div>

            {facility.description && (
              <p className="text-white/50 leading-relaxed mb-8 text-sm md:text-base">{facility.description}</p>
            )}

            {/* Amenities */}
            {facility.amenities.length > 0 && (
              <div className="mb-8">
                <p className="text-[10px] font-bold tracking-widest uppercase text-white/20 mb-3">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {facility.amenities.map((a) => (
                    <span key={a} className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/[0.05] border border-white/[0.08] text-white/60">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Rules */}
            {facility.rules && facility.rules.length > 0 && (
              <div className="mb-8">
                <p className="text-[10px] font-bold tracking-widest uppercase text-white/20 mb-3">Rules</p>
                <ul className="space-y-1.5">
                  {facility.rules.map((r) => (
                    <li key={r} className="flex items-start gap-2 text-sm text-white/45">
                      <span className="mt-1.5 h-1 w-1 rounded-full bg-white/20 flex-shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── My Bookings (persistent after refresh) ── */}
            {session && myBookings.length > 0 && (
              <div className="mb-8">
                <p className="text-[10px] font-bold tracking-widest uppercase text-white/20 mb-3 flex items-center gap-2">
                  <CheckCircle2 size={11} className="text-green-400" /> Your Bookings Here
                </p>
                <div className="space-y-2">
                  {sortedMyBookings.map((b) => {
                    const liveUntil = getLiveSessionEndTime(b);
                    return (
                      <div key={b.id} className={`flex items-center justify-between px-4 py-3 rounded-xl border ${liveUntil ? 'bg-green-500/[0.08] border-green-500/20' : 'bg-sky-500/[0.06] border-sky-500/[0.12]'}`}>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {fmtDate(b.date)} · {b.startTime.slice(0, 5)}–{b.endTime.slice(0, 5)}
                          </p>
                          <p className="text-xs text-white/40 mt-0.5">{fmt(b.totalPrice)}</p>
                        </div>
                        {liveUntil ? (
                          <span className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border bg-green-500/10 text-green-400 border-green-500/20 uppercase tracking-wider">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                            </span>
                            Live until {liveUntil}
                          </span>
                        ) : (
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${b.status === "confirmed" ? 'text-sky-400 bg-sky-500/10 border border-sky-500/20' : 'text-yellow-400 bg-yellow-500/10 border border-yellow-500/20'}`}>
                            {b.status}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── Calendar ── */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-bold tracking-widest uppercase text-white/20 flex items-center gap-2">
                  <CalendarDays size={11} /> Select Date
                </p>
                <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1">
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                    className="p-1.5 hover:bg-white/[0.06] rounded-lg text-white/40 hover:text-white transition-all disabled:opacity-30"
                    disabled={currentMonth <= new Date(new Date().getFullYear(), new Date().getMonth(), 1)} // Prevent going into past months
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="text-xs font-bold text-white min-w-[100px] text-center">
                    {currentMonth.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </span>
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                    className="p-1.5 hover:bg-white/[0.06] rounded-lg text-white/40 hover:text-white transition-all"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-3 md:p-4">
                {/* Week days */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(day => (
                    <div key={day} className="text-center text-[10px] uppercase font-bold text-white/20 py-1">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((d, i) => {
                    // Fix timezone offset to get local YYYY-MM-DD reliably
                    const isoDate = new Date(d.date.getTime() - d.date.getTimezoneOffset() * 60000).toISOString().split("T")[0];
                    const isSelected = selectedDate === isoDate;

                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const isPast = d.date < today;
                    const isBooked = monthBookedDates.includes(isoDate);
                    const isMyBookingDate = myBookings.some((b) => b.date === isoDate);

                    return (
                      <button
                        key={i}
                        disabled={isPast && !isSelected}
                        onClick={() => {
                          setSelectedDate(isoDate);
                          if (!d.isCurrentMonth) {
                            setCurrentMonth(new Date(d.date.getFullYear(), d.date.getMonth(), 1));
                          }
                        }}
                        className={`
                          relative flex flex-col items-center justify-center py-2 md:py-2.5 rounded-lg text-xs md:text-sm transition-all
                          ${isSelected
                            ? "bg-white text-black font-bold shadow-[0_4px_16px_rgba(255,255,255,0.15)]"
                            : isPast
                              ? "text-white/10 cursor-not-allowed"
                              : d.isCurrentMonth
                                ? "text-white/60 hover:bg-white/[0.06] hover:border-white/20 hover:text-white border border-transparent"
                                : "text-white/15 hover:bg-white/[0.04] hover:text-white/40 border border-transparent"
                          }
                        `}
                      >
                        <span className="relative z-10">{d.date.getDate()}</span>
                        {/* Booked indicator dot */}
                        {(isBooked || isMyBookingDate) && !isPast && (() => {
                          const isLiveDate = myBookings.some(b => b.date === isoDate && getLiveSessionEndTime(b) !== null);
                          return (
                            <span className={`absolute bottom-0.5 md:bottom-1 h-1 w-1 rounded-full ${isSelected
                              ? "bg-black"
                              : isMyBookingDate
                                ? isLiveDate ? "bg-green-400" : "bg-sky-400"
                                : "bg-white/40"
                              }`} />
                          );
                        })()}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Time slots */}
            <div className="mb-2">
              <p className="text-[10px] font-bold tracking-widest uppercase text-white/20 mb-3 flex items-center gap-2">
                <Clock size={11} /> Available Slots
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {slots.map((slot) => {
                  const isPastSlot = isSlotPast(slot.start);
                  const isBooked = isSlotBooked(slot.start);
                  const isMine = isSlotMyBooking(slot.start);
                  const isSelected = selectedSlot === slot.start;
                  const isSlotLive = isMine && myBookings.some(b => b.date === selectedDate && b.startTime.slice(0, 5) === slot.start && getLiveSessionEndTime(b) !== null);

                  return (
                    <button
                      key={slot.id}
                      disabled={isBooked || isPastSlot || facility.status !== "available"}
                      onClick={() => setSelectedSlot(isSelected ? null : slot.start)}
                      className={`flex flex-col items-center py-2.5 px-1 rounded-xl border text-center transition-all ${isSelected
                        ? "bg-white border-white text-black"
                        : isBooked
                          ? isMine
                            ? isSlotLive
                              ? "bg-green-500/[0.08] border-green-500/20 text-green-400 cursor-not-allowed"
                              : "bg-sky-500/[0.08] border-sky-500/20 text-sky-400 cursor-not-allowed"
                            : "bg-white/[0.02] border-white/[0.04] text-white/15 cursor-not-allowed line-through"
                          : isPastSlot
                            ? "bg-white/[0.01] border-white/[0.02] text-white/10 cursor-not-allowed line-through"
                            : "bg-white/[0.04] border-white/[0.08] text-white/60 hover:border-white/25 hover:text-white cursor-pointer"
                        }`}
                    >
                      <span className="text-xs font-bold">{slot.start}</span>
                      <span className="text-[10px] opacity-60 mt-0.5">
                        {isBooked ? (
                          isMine ? (
                            isSlotLive ? (
                              <span className="flex items-center gap-1 justify-center">
                                <span className="relative flex h-1.5 w-1.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                                </span>
                                Live
                              </span>
                            ) : "Yours"
                          ) : "Taken"
                        ) : isPastSlot ? "Passed" : fmt(slot.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: booking card */}
          <div className="lg:sticky lg:top-6">
            <AnimatePresence mode="wait">

              {/* ── Has bookings → show details card ── */}
              {session && myBookings.length > 0 ? (
                <motion.div
                  key="my-bookings"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="rounded-2xl border border-green-500/20 bg-[#0d0d11] overflow-hidden"
                  style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(74,222,128,0.06)" }}
                >
                  {/* Header */}
                  <div className="flex items-center gap-3 px-6 py-5 border-b border-white/[0.06]">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500/10 border border-green-500/20 flex-shrink-0">
                      <CheckCircle2 size={16} className="text-green-400" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-white">You're booked! 🎉</h2>
                      <p className="text-[11px] text-white/35 mt-0.5">
                        {myBookings.length} active booking{myBookings.length > 1 ? "s" : ""} at this facility
                      </p>
                    </div>
                  </div>

                  {/* Booking list */}
                  <div className="divide-y divide-white/[0.04]">
                    {sortedMyBookings.map((b) => {
                      const liveUntil = getLiveSessionEndTime(b);

                      return (
                        <div key={b.id} className="px-6 py-4 space-y-3">
                          {/* Date + Status row */}
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-white">{fmtDate(b.date)}</p>
                            <div className="flex items-center gap-2">
                              {liveUntil ? (
                                <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border bg-green-500/10 text-green-400 border-green-500/20 uppercase tracking-wider">
                                  <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                                  </span>
                                  Live until {liveUntil}
                                </span>
                              ) : (
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border capitalize ${b.status === "confirmed"
                                  ? "bg-sky-500/10 text-sky-400 border-sky-500/20"
                                  : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                                  }`}>
                                  {b.status}
                                </span>
                              )}
                              <button
                                onClick={() => handleCancelBooking(b.id)}
                                disabled={cancellingId === b.id}
                                className={`p-1.5 rounded-full border transition-all ${cancellingId === b.id
                                  ? "bg-white/5 border-white/10 text-white/20 cursor-wait"
                                  : "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white"
                                  }`}
                                title="Cancel Booking"
                              >
                                {cancellingId === b.id ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
                              </button>
                            </div>
                          </div>

                          {/* Details grid */}
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-3">
                              <p className="text-[10px] uppercase font-bold tracking-widest text-white/20 mb-1">Time</p>
                              <p className="text-sm font-semibold text-white">
                                {b.startTime.slice(0, 5)} – {b.endTime.slice(0, 5)}
                              </p>
                            </div>
                            <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-3">
                              <p className="text-[10px] uppercase font-bold tracking-widest text-white/20 mb-1">Total</p>
                              <p className="text-sm font-bold text-white">{fmt(b.totalPrice)}</p>
                            </div>
                          </div>

                          {/* Contact info */}
                          <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-3 space-y-0.5">
                            <p className="text-[10px] uppercase font-bold tracking-widest text-white/20 mb-1.5">Booked as</p>
                            <p className="text-xs text-white/70 font-medium">{b.userName}</p>
                            <p className="text-xs text-white/40">{b.userEmail}</p>
                            {b.userPhone && <p className="text-xs text-white/40">{b.userPhone}</p>}
                          </div>

                          {b.notes && (
                            <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl px-3 py-2.5">
                              <p className="text-[10px] uppercase font-bold tracking-widest text-white/20 mb-1">Notes</p>
                              <p className="text-xs text-white/45 leading-relaxed">{b.notes}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer: book another */}
                  <div className="px-6 py-4 border-t border-white/[0.05]">
                    <button
                      onClick={() => setMyBookings([])}
                      className="w-full py-2.5 rounded-xl border border-white/[0.08] text-xs text-white/40 hover:text-white hover:border-white/20 transition-all"
                    >
                      + Book another slot
                    </button>
                  </div>
                </motion.div>

              ) : !session ? (
                /* ── Not signed in ── */
                <motion.div
                  key="auth"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-2xl border border-white/[0.08] bg-[#0d0d11] overflow-hidden"
                  style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}
                >
                  <div className="px-6 py-5 border-b border-white/[0.06]">
                    <h2 className="text-base font-bold text-white">Book This Facility</h2>
                    <p className="text-xs text-white/35 mt-0.5">Sign in to reserve your slot</p>
                  </div>
                  <div className="flex flex-col items-center gap-3 px-6 py-8 text-center">
                    <ShieldOff size={28} className="text-white/15" />
                    <p className="text-sm text-white/50">Sign in to book this facility</p>
                    <Link
                      to="/login"
                      className="mt-1 px-5 py-2.5 rounded-xl bg-white text-black text-sm font-bold hover:bg-white/90 transition-all"
                    >
                      Sign in
                    </Link>
                  </div>
                </motion.div>

              ) : showConflictModal ? (
                /* ── Conflict Warning Modal ── */
                <motion.div
                  key="conflict-modal"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="rounded-2xl border border-yellow-500/30 bg-[#0d0d11] overflow-hidden"
                  style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(234,179,8,0.1)" }}
                >
                  <div className="px-6 py-5 border-b border-yellow-500/20 bg-yellow-500/5">
                    <h2 className="text-base font-bold text-yellow-400 flex items-center gap-2">
                      <AlertTriangle size={18} /> Booking Conflict
                    </h2>
                  </div>
                  <div className="p-6 space-y-5">
                    <p className="text-sm text-white/70 leading-relaxed">
                      You already have a booking for this date and time at another facility.
                      Are you sure you want to proceed with booking <strong>{facility.name}</strong> as well?
                    </p>
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold tracking-widest uppercase text-white/30">Existing Booking</p>
                      {conflictBookings.map((b) => (
                        <div key={b.id} className="p-3 bg-white/[0.03] rounded-xl border border-white/10 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold text-white">{b.facilityName || "Another facility"}</p>
                            <p className="text-xs text-white/50 mt-0.5">
                              {b.startTime.slice(0, 5)} - {b.endTime.slice(0, 5)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => setShowConflictModal(false)}
                        className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-all text-sm font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={executeBooking}
                        disabled={booking}
                        className="flex-1 py-2.5 rounded-xl bg-yellow-400 text-black text-sm font-bold hover:bg-yellow-300 transition-all flex justify-center items-center gap-2"
                      >
                        {booking && <Loader2 size={14} className="animate-spin" />}
                        Proceed Anyway
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* ── Booking form ── */
                <motion.div
                  key="form-card"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-2xl border border-white/[0.08] bg-[#0d0d11] overflow-hidden"
                  style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}
                >
                  {/* Card header */}
                  <div className="px-6 py-5 border-b border-white/[0.06]">
                    <h2 className="text-base font-bold text-white">Book This Facility</h2>
                    <p className="text-xs text-white/35 mt-0.5">
                      {selectedSlot
                        ? `${fmtDate(selectedDate)} · ${selectedSlot}–${String(parseInt(selectedSlot) + 1).padStart(2, "0")}:00`
                        : "Select a time slot to continue"}
                    </p>
                  </div>

                  {/* Price summary */}
                  {selectedSlot && (
                    <div className="flex items-center justify-between px-6 py-3 bg-white/[0.02] border-b border-white/[0.05]">
                      <span className="text-xs text-white/40">Total</span>
                      <span className="text-lg font-bold text-white">{fmt(facility.pricePerHour)}</span>
                    </div>
                  )}

                  <form onSubmit={handleBook} className="px-6 py-5 space-y-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">Full Name</label>
                        <input
                          className="mt-1 w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-all"
                          placeholder="Your name"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">Email</label>
                        <input
                          type="email"
                          className="mt-1 w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-all"
                          placeholder="you@email.com"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">Phone</label>
                        <input
                          className="mt-1 w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-all"
                          placeholder="+234 800 000 0000"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">Notes (optional)</label>
                        <textarea
                          rows={2}
                          className="mt-1 w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-all resize-none"
                          placeholder="Any special requirements…"
                          value={form.notes}
                          onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        />
                      </div>
                    </div>

                    {bookError && (
                      <p className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
                        <AlertTriangle size={12} className="flex-shrink-0" /> {bookError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={!selectedSlot || booking || facility.status !== "available"}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-black text-sm font-bold hover:bg-white/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {booking && <Loader2 size={14} className="animate-spin" />}
                      {facility.status !== "available"
                        ? "Facility unavailable"
                        : !selectedSlot
                          ? "Select a time slot"
                          : booking
                            ? "Confirming…"
                            : `Book for ${fmt(facility.pricePerHour)}`
                      }
                    </button>

                    {!selectedSlot && (
                      <p className="text-center text-[11px] text-white/25">
                        ↑ Pick a date and time slot above
                      </p>
                    )}
                  </form>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FacilityDetail;
