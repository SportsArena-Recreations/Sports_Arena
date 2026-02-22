import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { bookingService } from "@/features/bookings/services/booking.service";
import { Booking } from "@/features/bookings/types";
import { PageHeader } from "@/components/shared/PageHeader";
import { Calendar, Clock, MapPin, Plus, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function Bookings() {
    const { user } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        loadBookings();
    }, [user]);

    const loadBookings = async () => {
        setLoading(true);
        const res = await bookingService.getMine();
        if (res.success && res.data) {
            setBookings(res.data);
        }
        setLoading(false);
    };

    const formatTime = (timeString: string) => {
        const [h, m] = timeString.split(':');
        let hour = parseInt(h);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12 || 12;
        return `${hour}:${m} ${ampm}`;
    };

    return (
        <div className="bg-[#020202] text-white min-h-screen pb-20">
            <div className="pt-24 pb-8 bg-gradient-to-br from-[#0a0a0c] to-[#020202] border-b border-white/[0.06]">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                        <PageHeader
                            title="My Bookings"
                            description="View and manage your facility reservations."
                        />
                        <Link
                            to="/facilities"
                            className="bg-white text-black px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] flex-shrink-0"
                        >
                            <Plus size={18} />
                            Create Booking
                        </Link>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 py-12">
                {loading ? (
                    <div className="flex justify-center items-center py-20 text-white/50">
                        <Loader2 className="animate-spin mr-2" size={24} />
                        Loading bookings...
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="text-center py-20 border border-white/[0.04] border-dashed rounded-3xl bg-white/[0.01]">
                        <Calendar size={48} className="mx-auto text-white/20 mb-4" strokeWidth={1} />
                        <h3 className="text-xl font-bold text-white mb-2">No Bookings Yet</h3>
                        <p className="text-white/50 mb-6 max-w-sm mx-auto">
                            You haven't made any facility reservations. Find a facility and book your next session!
                        </p>
                        <Link
                            to="/facilities"
                            className="inline-block px-6 py-3 bg-white/[0.05] hover:bg-white/[0.1] text-white font-semibold rounded-xl border border-white/10 transition-all"
                        >
                            Browse Facilities
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {bookings.map((booking) => (
                            <div key={booking.id} className="bg-[#08080a] border border-white/[0.06] rounded-2xl p-6 hover:border-white/20 transition-all shadow-lg">
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="text-xl font-bold text-white line-clamp-1">{booking.facilityName}</h4>
                                    <StatusBadge status={booking.status} />
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center text-white/60 text-sm gap-3">
                                        <Calendar size={16} className="text-white/40" />
                                        <span>{format(parseISO(booking.date), "EEEE, MMM do, yyyy")}</span>
                                    </div>
                                    <div className="flex items-center text-white/60 text-sm gap-3">
                                        <Clock size={16} className="text-white/40" />
                                        <span>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
                                    </div>
                                    <div className="flex items-center text-white/60 text-sm gap-3">
                                        <MapPin size={16} className="text-white/40" />
                                        <span>Babcock University</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                                    <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Total Prcie</span>
                                    <span className="text-lg font-black text-white">₦{booking.totalPrice.toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: Booking['status'] }) {
    if (status === "cancelled") {
        return (
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded">
                Cancelled
            </span>
        );
    }
    if (status === "pending") {
        return (
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-1 rounded">
                Pending
            </span>
        );
    }
    if (status === "completed") {
        return (
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/60 bg-white/5 border border-white/10 px-2 py-1 rounded">
                Completed
            </span>
        );
    }
    return (
        <span className="text-[10px] font-bold uppercase tracking-wider text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-1 rounded">
            Confirmed
        </span>
    );
}
