import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { tournamentService } from "@/features/tournaments/services/tournament.service";
import { Tournament } from "@/features/tournaments/types";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const columns: Column<Tournament>[] = [
  { key: "name", header: "Name", render: (t) => <span className="font-medium">{t.name}</span> },
  { key: "sport", header: "Sport", render: (t) => t.sport },
  { key: "teams", header: "Teams", render: (t) => `${t.registeredTeams}/${t.maxTeams}` },
  { key: "dates", header: "Dates", render: (t) => `${t.startDate} — ${t.endDate}` },
  { key: "prize", header: "Prize Pool", render: (t) => `$${t.prizePool.toLocaleString()}` },
  { key: "status", header: "Status", render: (t) => <StatusBadge status={t.status} /> },
];

const ManageTournaments = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  useEffect(() => {
    tournamentService.getAll().then((res) => setTournaments(res.data));
  }, []);

  return (
    <div>
      <PageHeader title="Manage Tournaments" description="Create and manage tournaments and leagues.">
        <Button size="sm" className="gap-1.5"><Plus size={16} /> Create Tournament</Button>
      </PageHeader>
      <DataTable columns={columns} data={tournaments} />
    </div>
  );
};

export default ManageTournaments;
