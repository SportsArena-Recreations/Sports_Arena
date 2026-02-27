import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { FacilityCard } from "@/features/facilities/components/FacilityCard";
import { facilityService } from "@/features/facilities/services/facility.service";
import { bookingService } from "@/features/bookings/services/booking.service";
import { Facility, FacilityType } from "@/features/facilities/types";
import { Booking } from "@/features/bookings/types";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const facilityTypes: { label: string; value: FacilityType | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Basketball", value: "basketball" },
  { label: "Soccer", value: "soccer" },
  { label: "Tennis", value: "tennis" },
  { label: "Swimming", value: "swimming" },
  { label: "Volleyball", value: "volleyball" },
  { label: "Multipurpose", value: "multipurpose" },
];

const Facilities = () => {
  const { session } = useAuth();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [filter, setFilter] = useState<FacilityType | "all">("all");
  const [userBookings, setUserBookings] = useState<Booking[]>([]);

  useEffect(() => {
    facilityService.getAll().then((res) => setFacilities(res.data));
  }, []);

  useEffect(() => {
    if (session) {
      bookingService.getMine().then((res) => setUserBookings(res.data));
    } else {
      setUserBookings([]);
    }
  }, [session]);

  const filtered = filter === "all" ? facilities : facilities.filter((f) => f.type === filter);

  // Helper to find the closest upcoming booking for a facility
  const getClosestBooking = (facilityId: string) => {
    const now = new Date();
    // remove past bookings and non-confirmed/pending
    const upcoming = userBookings.filter(b => {
      if (b.facilityId !== facilityId || (b.status !== "confirmed" && b.status !== "pending")) return false;

      const bookingEnd = new Date(`${b.date}T${b.endTime}`);
      // Consider a booking 'upcoming' or 'active' until its end time has passed
      return bookingEnd > now;
    });

    if (upcoming.length === 0) return undefined;

    // sort by closest date/time
    upcoming.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`).getTime();
      const dateB = new Date(`${b.date}T${b.startTime}`).getTime();
      return dateA - dateB;
    });

    return upcoming[0];
  };

  return (
    <div className="container py-10">
      <PageHeader
        title="Our Facilities"
        description="Browse and book our world-class sports facilities."
      />

      <div className="mb-8 flex flex-wrap gap-2">
        {facilityTypes.map((type) => (
          <Button
            key={type.value}
            variant={filter === type.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(type.value)}
          >
            {type.label}
          </Button>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((f) => (
          <FacilityCard key={f.id} facility={f} closestBooking={getClosestBooking(f.id)} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-12 text-center text-muted-foreground">No facilities found for this category.</p>
      )}
    </div>
  );
};

export default Facilities;
