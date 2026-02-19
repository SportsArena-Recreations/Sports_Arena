import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { bookingService } from "@/features/bookings/services/booking.service";
import { Booking } from "@/features/bookings/types";

const columns: Column<Booking>[] = [
  { key: "userName", header: "Customer", render: (b) => <span className="font-medium">{b.userName}</span> },
  { key: "facility", header: "Facility", render: (b) => b.facilityName },
  { key: "date", header: "Date", render: (b) => b.date },
  { key: "time", header: "Time", render: (b) => `${b.startTime} - ${b.endTime}` },
  { key: "total", header: "Total", render: (b) => `$${b.totalPrice}` },
  { key: "status", header: "Status", render: (b) => <StatusBadge status={b.status} /> },
];

const ManageBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    bookingService.getAll().then((res) => setBookings(res.data));
  }, []);

  return (
    <div>
      <PageHeader title="Manage Bookings" description="View and manage all facility bookings." />
      <DataTable columns={columns} data={bookings} />
    </div>
  );
};

export default ManageBookings;
