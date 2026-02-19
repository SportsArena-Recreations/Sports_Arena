import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, Column } from "@/components/shared/DataTable";
import { teamService } from "@/features/teams/services/team.service";
import { Team } from "@/features/teams/types";

const columns: Column<Team>[] = [
  { key: "name", header: "Team Name", render: (t) => <span className="font-medium">{t.name}</span> },
  { key: "sport", header: "Sport", render: (t) => t.sport },
  { key: "captain", header: "Captain", render: (t) => t.captainName },
  { key: "members", header: "Members", render: (t) => t.members.length },
  { key: "created", header: "Created", render: (t) => new Date(t.createdAt).toLocaleDateString() },
];

const ManageTeams = () => {
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    teamService.getAll().then((res) => setTeams(res.data));
  }, []);

  return (
    <div>
      <PageHeader title="Manage Teams" description="View and manage registered teams." />
      <DataTable columns={columns} data={teams} />
    </div>
  );
};

export default ManageTeams;
