import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { facilityService } from "@/features/facilities/services/facility.service";
import { Facility, TimeSlot } from "@/features/facilities/types";
import { TimeSlotPicker } from "@/features/facilities/components/TimeSlotPicker";
import { BookingForm } from "@/features/facilities/components/BookingForm";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Users, DollarSign } from "lucide-react";

const sportIcons: Record<string, string> = {
  basketball: "🏀", soccer: "⚽", tennis: "🎾", volleyball: "🏐",
  swimming: "🏊", badminton: "🏸", multipurpose: "🏟️",
};

const FacilityDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [facility, setFacility] = useState<Facility | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>();
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);

  useEffect(() => {
    if (id) {
      facilityService.getById(id).then((res) => res.data && setFacility(res.data));
      facilityService.getTimeSlots(id, selectedDate).then((res) => setTimeSlots(res.data));
    }
  }, [id, selectedDate]);

  const selectedSlotData = timeSlots.find((s) => s.id === selectedSlot);

  if (!facility) {
    return <div className="container py-20 text-center text-muted-foreground">Loading...</div>;
  }

  // Generate next 7 days for date picker
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0];
  });

  return (
    <div className="container py-10">
      <Link to="/facilities" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft size={16} />
        Back to Facilities
      </Link>

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Header */}
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-3xl">
              {sportIcons[facility.type] || "🏟️"}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-display text-3xl font-bold">{facility.name}</h1>
                <StatusBadge status={facility.status} />
              </div>
              <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Users size={14} /> Capacity: {facility.capacity}</span>
                <span className="flex items-center gap-1"><DollarSign size={14} /> ${facility.pricePerHour}/hr</span>
              </div>
            </div>
          </div>

          <p className="mb-6 text-muted-foreground">{facility.description}</p>

          {/* Amenities */}
          <div className="mb-8">
            <h3 className="font-display font-semibold mb-3">Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {facility.amenities.map((a) => (
                <span key={a} className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium">
                  {a}
                </span>
              ))}
            </div>
          </div>

          {/* Rules */}
          {facility.rules && facility.rules.length > 0 && (
            <div className="mb-8">
              <h3 className="font-display font-semibold mb-3">Rules</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {facility.rules.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Date selector */}
          <div className="mb-6">
            <h3 className="font-display font-semibold mb-3">Select Date</h3>
            <div className="flex flex-wrap gap-2">
              {dates.map((d) => (
                <Button
                  key={d}
                  variant={selectedDate === d ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setSelectedDate(d); setSelectedSlot(undefined); }}
                >
                  {new Date(d + 'T00:00:00').toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                </Button>
              ))}
            </div>
          </div>

          {/* Time slots */}
          <div>
            <h3 className="font-display font-semibold mb-3">Available Time Slots</h3>
            <TimeSlotPicker
              slots={timeSlots}
              selectedSlot={selectedSlot}
              onSelect={setSelectedSlot}
            />
          </div>
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-xl border border-border bg-card p-6 card-shadow">
            <h3 className="font-display text-xl font-bold mb-4">Book This Facility</h3>
            <BookingForm
              facilityName={facility.name}
              selectedSlot={
                selectedSlotData
                  ? {
                      date: selectedSlotData.date,
                      startTime: selectedSlotData.startTime,
                      endTime: selectedSlotData.endTime,
                      price: selectedSlotData.price,
                    }
                  : undefined
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilityDetail;
