import { supabase } from "@/lib/supabase";
import { Match, MatchType, MatchStatus } from "../types";

// Helper to map DB row to frontend Match type
const mapToMatch = (row: any): Match => ({
    id: row.id,
    type: row.type as MatchType,
    sport: row.sport,
    tournamentId: row.tournament_id,
    tournamentName: row.tournament_name,
    round: row.round,
    homeTeamId: row.home_team_id,
    homeTeamName: row.home_team_name,
    awayTeamId: row.away_team_id,
    awayTeamName: row.away_team_name,
    homeScore: row.home_score,
    awayScore: row.away_score,
    date: row.match_date,
    time: row.match_time,
    venue: row.venue,
    status: row.status as MatchStatus,
    createdAt: row.created_at,
});

export const matchService = {
    async getAll(): Promise<{ data: Match[]; error: string | null }> {
        try {
            const { data, error } = await supabase
                .from("matches")
                .select("*")
                .order("match_date", { ascending: false })
                .order("match_time", { ascending: false });

            if (error) throw error;
            return { data: (data || []).map(mapToMatch), error: null };
        } catch (err: any) {
            console.error("Error fetching matches:", err);
            return { data: [], error: err.message };
        }
    },

    async getByType(type: MatchType): Promise<{ data: Match[]; error: string | null }> {
        try {
            const { data, error } = await supabase
                .from("matches")
                .select("*")
                .eq("type", type)
                .order("match_date", { ascending: false })
                .order("match_time", { ascending: false });

            if (error) throw error;
            return { data: (data || []).map(mapToMatch), error: null };
        } catch (err: any) {
            console.error(`Error fetching matches of type ${type}:`, err);
            return { data: [], error: err.message };
        }
    },

    async create(data: Omit<Match, "id" | "createdAt">): Promise<{ data: Match | null; error: string | null }> {
        try {
            const dbPayload = {
                type: data.type,
                sport: data.sport,
                tournament_id: data.tournamentId || null,
                tournament_name: data.tournamentName || null,
                round: data.round || null,
                home_team_id: data.homeTeamId,
                home_team_name: data.homeTeamName,
                away_team_id: data.awayTeamId,
                away_team_name: data.awayTeamName,
                home_score: data.homeScore || 0,
                away_score: data.awayScore || 0,
                match_date: data.date,
                match_time: data.time,
                venue: data.venue,
                status: data.status || 'scheduled'
            };

            const { data: insertedData, error } = await supabase
                .from("matches")
                .insert([dbPayload])
                .select()
                .single();

            if (error) throw error;
            return { data: mapToMatch(insertedData), error: null };
        } catch (err: any) {
            console.error("Error creating match:", err);
            return { data: null, error: err.message };
        }
    },

    async update(id: string, data: Partial<Match>): Promise<{ data: Match | null; error: string | null }> {
        try {
            const dbPayload: any = {};
            if (data.type !== undefined) dbPayload.type = data.type;
            if (data.sport !== undefined) dbPayload.sport = data.sport;
            if (data.tournamentId !== undefined) dbPayload.tournament_id = data.tournamentId;
            if (data.tournamentName !== undefined) dbPayload.tournament_name = data.tournamentName;
            if (data.round !== undefined) dbPayload.round = data.round;
            if (data.homeTeamId !== undefined) dbPayload.home_team_id = data.homeTeamId;
            if (data.homeTeamName !== undefined) dbPayload.home_team_name = data.homeTeamName;
            if (data.awayTeamId !== undefined) dbPayload.away_team_id = data.awayTeamId;
            if (data.awayTeamName !== undefined) dbPayload.away_team_name = data.awayTeamName;
            if (data.homeScore !== undefined) dbPayload.home_score = data.homeScore;
            if (data.awayScore !== undefined) dbPayload.awayScore = data.awayScore;
            if (data.date !== undefined) dbPayload.match_date = data.date;
            if (data.time !== undefined) dbPayload.match_time = data.time;
            if (data.venue !== undefined) dbPayload.venue = data.venue;
            if (data.status !== undefined) dbPayload.status = data.status;
            dbPayload.updated_at = new Date().toISOString();

            const { data: updatedData, error } = await supabase
                .from("matches")
                .update(dbPayload)
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return { data: mapToMatch(updatedData), error: null };
        } catch (err: any) {
            console.error("Error updating match:", err);
            return { data: null, error: err.message };
        }
    },

    async delete(id: string): Promise<{ success: boolean; error: string | null }> {
        try {
            const { error } = await supabase
                .from("matches")
                .delete()
                .eq("id", id);

            if (error) throw error;
            return { success: true, error: null };
        } catch (err: any) {
            console.error("Error deleting match:", err);
            return { success: false, error: err.message };
        }
    }
};
