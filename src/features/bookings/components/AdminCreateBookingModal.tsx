import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { facilityService } from "@/features/facilities/services/facility.service";
import { bookingService } from "@/features/bookings/services/booking.service";
import { Facility } from "@/features/facilities/types";
import { useAuth } from "@/context/AuthContext";
import { X, CalendarDays, Loader2 } from "lucide-react";

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

interface AdminCreateBookingModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export function AdminCreateBookingModal({ onClose, onSuccess }: AdminCreateBookingModalProps) {
    const { user } = useAuth();
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [loadingFacs, setLoadingFacs] = useState(true);

    // Form state
    const [selectedFacilityId, setSelectedFacilityId] = useState<string>("");
    const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
    const [customerName, setCustomerName] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [notes, setNotes] = useState("");

    const [bookedSlots, setBookedSlots] = useState<{ startTime: string; endTime: string }[]>([]);
    const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        facilityService.getAll().then((res) => {
            setFacilities(res.data || []);
            if (res.data && res.data.length > 0) {
                setSelectedFacilityId(res.data[0].id);
            }
            setLoadingFacs(false);
        });
    }, []);

    useEffect(() => {
        if (!selectedFacilityId || !selectedDate) return;
        setLoadingSlots(true);
        setSelectedSlots([]);
        bookingService.getBookedSlots(selectedFacilityId, selectedDate).then((res) => {
            setBookedSlots(res.data || []);
            setLoadingSlots(false);
        });
    }, [selectedFacilityId, selectedDate]);

    const selectedFacility = facilities.find((f) => f.id === selectedFacilityId);
    const slots = selectedFacility ? generateSlots(selectedFacility.pricePerHour) : [];

    const toggleSlot = (start: string) => {
        setSelectedSlots((prev) =>
            prev.includes(start) ? prev.filter((s) => s !== start) : [...prev, start]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFacility || selectedSlots.length === 0 || !user) return;
        if (!customerName.trim() || !customerEmail.trim()) {
            setError("Name and email are required for the customer.");
            return;
        }

        setSubmitting(true);
        setError(null);

        const sortedSlots = [...selectedSlots].sort();

        const results = await Promise.all(
            sortedSlots.map(async (slot) => {
                // First create the booking to get the ID, then immediately update status to 'confirmed'
                // since admins are manually adding confirmed bookings usually.
                const res = await bookingService.create({
                    facilityId: selectedFacility.id,
                    userId: user.id, // We record who processed the manual entry, or an admin ID placeholder
                    userName: customerName,
                    userEmail: customerEmail,
                    userPhone: customerPhone,
                    date: selectedDate,
                    startTime: slot,
                    endTime: `${String(parseInt(slot) + 1).padStart(2, "0")}:00`,
                    totalPrice: selectedFacility.pricePerHour,
                    notes: notes || undefined,
                });

                if (res.success && res.data?.id) {
                    await bookingService.updateStatus(res.data.id, "confirmed");
                }
                return res;
            })
        );

        setSubmitting(false);
        const failed = results.find((r) => !r.success);
        if (failed) {
            setError(failed.message ?? "Some bookings failed to create.");
            return;
        }

        onSuccess();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2 }}
                className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-[#0d0d11] border border-white/[0.08] shadow-2xl flex flex-col my-auto max-h-fit"
            >
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.08] bg-[#1a1a20]">
                    <div>
                        <h2 className="text-lg font-bold text-white">Create Manual Booking</h2>
                        <p className="text-xs text-white/50 mt-0.5">Record a booking on behalf of a customer.</p>
                    </div>
                    <button onClick={onClose} disabled={submitting} className="p-2 text-white/50 hover:text-white rounded-full hover:bg-white/10 transition-colors disabled:opacity-50">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[70vh]">
                    {error && (
                        <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    <form id="create-booking-form" onSubmit={handleSubmit} className="space-y-6">
                        {/* Facility & Date Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold uppercase tracking-widest text-white/40">Facility</label>
                                {loadingFacs ? (
                                    <div className="h-10 bg-white/[0.03] rounded-xl flex items-center px-4 animate-pulse"></div>
                                ) : (
                                    <select
                                        value={selectedFacilityId}
                                        onChange={(e) => setSelectedFacilityId(e.target.value)}
                                        className="w-full h-10 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 text-sm text-white focus:border-white/20 focus:outline-none placeholder-white/30"
                                    >
                                        {facilities.map(f => (
                                            <option key={f.id} value={f.id} className="bg-[#111118]">{f.name}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold uppercase tracking-widest text-white/40">Date</label>
                                <div className="relative">
                                    <CalendarDays size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        min={new Date().toISOString().split("T")[0]}
                                        className="w-full h-10 bg-white/[0.03] border border-white/[0.08] rounded-xl pl-10 pr-4 text-sm text-white focus:border-white/20 focus:outline-none"
                                        style={{ colorScheme: "dark" }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Slots Selection */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-widest text-white/40">Available Time Slots</label>
                            {loadingSlots ? (
                                <div className="flex items-center gap-2 text-white/40 text-sm py-4">
                                    <Loader2 size={16} className="animate-spin" /> Loading slots...
                                </div>
                            ) : slots.length === 0 ? (
                                <p className="text-white/40 text-sm">Please select a facility and date.</p>
                            ) : (
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                    {slots.map((slot) => {
                                        const isBooked = bookedSlots.some(s => s.startTime.startsWith(slot.id));
                                        const isSelected = selectedSlots.includes(slot.id);
                                        return (
                                            <button
                                                key={slot.id}
                                                type="button"
                                                disabled={isBooked}
                                                onClick={() => toggleSlot(slot.id)}
                                                className={`py-2 rounded-lg text-xs font-semibold transition-all border ${isBooked
                                                        ? "bg-red-500/5 text-red-500/30 border-red-500/10 cursor-not-allowed"
                                                        : isSelected
                                                            ? "bg-white text-black border-transparent shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                                                            : "bg-white/[0.03] text-white/60 border-white/[0.05] hover:border-white/20 hover:text-white"
                                                    }`}
                                            >
                                                {slot.start.slice(0, 5)}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Customer Details */}
                        <div className="space-y-4 pt-4 border-t border-white/[0.05]">
                            <h3 className="text-sm font-semibold text-white">Customer Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-white/40 mb-1.5 block">Full Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={customerName}
                                        onChange={e => setCustomerName(e.target.value)}
                                        className="w-full h-10 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 text-sm text-white focus:border-white/20 focus:outline-none placeholder-white/20"
                                        placeholder="Jane Doe"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-white/40 mb-1.5 block">Email *</label>
                                    <input
                                        type="email"
                                        required
                                        value={customerEmail}
                                        onChange={e => setCustomerEmail(e.target.value)}
                                        className="w-full h-10 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 text-sm text-white focus:border-white/20 focus:outline-none placeholder-white/20"
                                        placeholder="jane@example.com"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-xs font-semibold text-white/40 mb-1.5 block">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={customerPhone}
                                        onChange={e => setCustomerPhone(e.target.value)}
                                        className="w-full h-10 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 text-sm text-white focus:border-white/20 focus:outline-none placeholder-white/20"
                                        placeholder="(Optional) e.g. +234..."
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-xs font-semibold text-white/40 mb-1.5 block">Booking Notes</label>
                                    <textarea
                                        value={notes}
                                        onChange={e => setNotes(e.target.value)}
                                        className="w-full h-20 bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 text-sm text-white focus:border-white/20 focus:outline-none resize-none placeholder-white/20"
                                        placeholder="(Optional) Any special requests or details..."
                                    />
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.08] bg-[#0c0c10]">
                    <div className="text-sm">
                        Total:{' '}
                        <span className="font-bold text-white">
                            {selectedFacility && selectedSlots.length > 0
                                ? fmt(selectedFacility.pricePerHour * selectedSlots.length)
                                : '₦0'}
                        </span>
                    </div>
                    <div className="flex gap-3">
                        <button type="button" disabled={submitting} onClick={onClose} className="px-5 py-2.5 rounded-xl border border-white/[0.08] text-sm text-white/60 hover:text-white transition-all disabled:opacity-50">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="create-booking-form"
                            disabled={submitting || selectedSlots.length === 0}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-black text-sm font-bold hover:bg-white/90 disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                        >
                            {submitting && <Loader2 size={16} className="animate-spin" />}
                            Create Booking
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
