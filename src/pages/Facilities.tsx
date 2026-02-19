import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { FacilityCard } from "@/features/facilities/components/FacilityCard";
import { facilityService } from "@/features/facilities/services/facility.service";
import { Facility, FacilityType } from "@/features/facilities/types";
import { Button } from "@/components/ui/button";

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
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [filter, setFilter] = useState<FacilityType | "all">("all");

  useEffect(() => {
    facilityService.getAll().then((res) => setFacilities(res.data));
  }, []);

  const filtered = filter === "all" ? facilities : facilities.filter((f) => f.type === filter);

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
          <FacilityCard key={f.id} facility={f} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-12 text-center text-muted-foreground">No facilities found for this category.</p>
      )}
    </div>
  );
};

export default Facilities;
