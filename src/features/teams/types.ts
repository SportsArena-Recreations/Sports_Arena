export interface Team {
  id: string;
  name: string;
  sport: string;
  captainId: string;
  captainName: string;
  phone?: string;
  members: TeamMember[];
  createdAt: string;
  logoUrl?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "captain" | "player" | "substitute";
  jerseyNumber?: number;
}
