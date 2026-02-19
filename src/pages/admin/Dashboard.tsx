import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { facilityService } from "@/features/facilities/services/facility.service";
import { bookingService } from "@/features/bookings/services/booking.service";
import { tournamentService } from "@/features/tournaments/services/tournament.service";
import { teamService } from "@/features/teams/services/team.service";
import { Building2, CalendarDays, Trophy, Users } from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ facilities: 0, bookings: 0, tournaments: 0, teams: 0 });

  useEffect(() => {
    Promise.all([
      facilityService.getAll(),
      bookingService.getAll(),
      tournamentService.getAll(),
      teamService.getAll(),
    ]).then(([f, b, t, tm]) => {
      setStats({
        facilities: f.data.length,
        bookings: b.data.length,
        tournaments: t.data.length,
        teams: tm.data.length,
      });
    });
  }, []);

  const cards = [
    { icon: Building2, label: "Facilities", value: stats.facilities, color: "text-primary" },
    { icon: CalendarDays, label: "Bookings", value: stats.bookings, color: "text-info" },
    { icon: Trophy, label: "Tournaments", value: stats.tournaments, color: "text-accent" },
    { icon: Users, label: "Teams", value: stats.teams, color: "text-success" },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of your arena operations." />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-border bg-card p-6 card-shadow">
            <card.icon size={24} className={card.color} />
            <p className="mt-3 text-sm text-muted-foreground">{card.label}</p>
            <p className="font-display text-3xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
