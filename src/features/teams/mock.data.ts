import { Team } from "./types";

export const mockTeams: Team[] = [
  {
    id: "tm1",
    name: "Thunder Bolts",
    sport: "Basketball",
    captainId: "u1",
    captainName: "John Smith",
    createdAt: "2026-01-15T10:00:00Z",
    members: [
      { id: "m1", name: "John Smith", email: "john@email.com", role: "captain", jerseyNumber: 7 },
      { id: "m2", name: "Alex Turner", email: "alex@email.com", role: "player", jerseyNumber: 11 },
      { id: "m3", name: "Chris Park", email: "chris@email.com", role: "player", jerseyNumber: 23 },
      { id: "m4", name: "Dan Lee", email: "dan@email.com", role: "player", jerseyNumber: 3 },
      { id: "m5", name: "Eric Brown", email: "eric@email.com", role: "substitute", jerseyNumber: 14 },
    ],
  },
  {
    id: "tm2",
    name: "Storm Chasers",
    sport: "Soccer",
    captainId: "u2",
    captainName: "Sarah Johnson",
    createdAt: "2026-01-20T14:00:00Z",
    members: [
      { id: "m6", name: "Sarah Johnson", email: "sarah@email.com", role: "captain", jerseyNumber: 10 },
      { id: "m7", name: "Lisa Wang", email: "lisa@email.com", role: "player", jerseyNumber: 8 },
      { id: "m8", name: "Maria Garcia", email: "maria@email.com", role: "player", jerseyNumber: 5 },
    ],
  },
  {
    id: "tm3",
    name: "Iron Eagles",
    sport: "Basketball",
    captainId: "u3",
    captainName: "Mike Williams",
    createdAt: "2026-02-01T09:00:00Z",
    members: [
      { id: "m9", name: "Mike Williams", email: "mike@email.com", role: "captain", jerseyNumber: 1 },
      { id: "m10", name: "Tom Harris", email: "tom@email.com", role: "player", jerseyNumber: 22 },
    ],
  },
];
