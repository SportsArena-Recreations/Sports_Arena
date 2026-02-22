export type MatchType = "tournament" | "friendly";
export type MatchStatus = "scheduled" | "in_progress" | "completed" | "postponed" | "cancelled";

export interface Match {
    id: string;
    type: MatchType;
    sport: string; // Used for "All Matches" vs specific sport categories / Friendly tags
    tournamentId?: string;
    tournamentName?: string;
    round?: string; // e.g., "Quarter-Final", "Week 1", etc.
    homeTeamId: string;
    homeTeamName: string;
    awayTeamId: string;
    awayTeamName: string;
    homeScore?: number;
    awayScore?: number;
    date: string; // ISO format YYYY-MM-DD
    time: string; // HH:MM
    venue: string;
    status: MatchStatus;
    createdAt: string;
}
