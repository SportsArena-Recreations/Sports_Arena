import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { facilityService } from "@/features/facilities/services/facility.service";
import { Facility } from "@/features/facilities/types";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const columns: Column<Facility>[] = [
  { key: "name", header: "Name", render: (f) => <span className="font-medium">{f.name}</span> },
  { key: "type", header: "Type", render: (f) => <span className="capitalize">{f.type}</span> },
  { key: "capacity", header: "Capacity", render: (f) => f.capacity },
  { key: "price", header: "Price/Hr", render: (f) => `$${f.pricePerHour}` },
  { key: "status", header: "Status", render: (f) => <StatusBadge status={f.status} /> },
];

const ManageFacilities = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);

  useEffect(() => {
    facilityService.getAll().then((res) => setFacilities(res.data));
  }, []);

  return (
    <div>
      <PageHeader title="Manage Facilities" description="Add, edit, and manage your arena facilities.">
        <Button size="sm" className="gap-1.5"><Plus size={16} /> Add Facility</Button>
      </PageHeader>
      <DataTable columns={columns} data={facilities} />
    </div>
  );
};

export default ManageFacilities;
