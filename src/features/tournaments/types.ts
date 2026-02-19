export interface Tournament {
  id: string;
  name: string;
  sport: string;
  description: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  maxTeams: number;
  registeredTeams: number;
  entryFee: number;
  prizePool: number;
  status: TournamentStatus;
  rules: string[];
  facilityId: string;
  facilityName: string;
  imageUrl: string;
  matches?: Match[];
}

export type TournamentStatus =
  | "upcoming"
  | "registration_open"
  | "registration_closed"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface Match {
  id: string;
  tournamentId: string;
  round: number;
  teamAId: string;
  teamAName: string;
  teamBId: string;
  teamBName: string;
  scoreA?: number;
  scoreB?: number;
  date: string;
  time: string;
  status: "scheduled" | "in_progress" | "completed" | "postponed";
  facilityId: string;
}
