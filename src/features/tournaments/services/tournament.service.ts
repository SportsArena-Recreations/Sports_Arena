import { supabase } from "@/lib/supabase";
import { Tournament } from "../types";
import { ServiceResponse, createServiceResponse } from "@/services/base.service";

export interface TeamRegistration {
  id?: string;
  tournamentId: string;
  teamName: string;
  captainName: string;
  captainEmail: string;
  captainPhone: string;
  playerCount: number;
  paymentStatus?: string;
  createdAt?: string;
}

// Map Supabase snake_case → camelCase
function mapRow(row: Record<string, unknown>): Tournament {
  return {
    id: row.id as string,
    name: row.name as string,
    sport: row.sport as string,
    description: (row.description as string) ?? "",
    startDate: row.start_date as string,
    endDate: row.end_date as string,
    // These columns may not exist yet if the migration hasn't been run
    startTime: row.start_time ? (row.start_time as string) : undefined,
    endTime: row.end_time ? (row.end_time as string) : undefined,
    registrationDeadline: row.registration_deadline as string,
    maxTeams: row.max_teams as number,
    registeredTeams: (row.registered_teams as number) ?? 0,
    entryFee: row.entry_fee as number,
    prizePool: row.prize_pool as number,
    status: row.status as Tournament["status"],
    rules: (row.rules as string[]) ?? [],
    facilityId: (row.facility_id as string) ?? "",
    facilityName: (row.facility_name as string) ?? "",
    imageUrl: (row.image_url as string) ?? "",
  };
}

export const tournamentService = {
  async getAll(): Promise<ServiceResponse<Tournament[]>> {
    const { data, error } = await supabase
      .from("tournaments")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) return createServiceResponse([], error.message);
    return createServiceResponse((data ?? []).map(mapRow));
  },

  async getById(id: string): Promise<ServiceResponse<Tournament | undefined>> {
    const { data, error } = await supabase
      .from("tournaments")
      .select("*")
      .eq("id", id)
      .single();
    if (error) return createServiceResponse(undefined, error.message);
    return createServiceResponse(mapRow(data));
  },

  async create(payload: Omit<Tournament, "id">): Promise<ServiceResponse<Tournament>> {
    const { data, error } = await supabase
      .from("tournaments")
      .insert({
        name: payload.name,
        sport: payload.sport,
        description: payload.description,
        start_date: payload.startDate,
        end_date: payload.endDate,
        start_time: payload.startTime || null,
        end_time: payload.endTime || null,
        registration_deadline: payload.registrationDeadline,
        max_teams: payload.maxTeams,
        registered_teams: payload.registeredTeams,
        entry_fee: payload.entryFee,
        prize_pool: payload.prizePool,
        status: payload.status,
        rules: payload.rules ?? [],
        facility_id: payload.facilityId,
        facility_name: payload.facilityName,
        image_url: payload.imageUrl,
      })
      .select()
      .single();
    if (error) return createServiceResponse({} as Tournament, error.message);
    return createServiceResponse(mapRow(data));
  },

  async update(id: string, payload: Partial<Omit<Tournament, "id">>): Promise<ServiceResponse<Tournament>> {
    const patch: Record<string, unknown> = {};
    if (payload.name !== undefined) patch.name = payload.name;
    if (payload.sport !== undefined) patch.sport = payload.sport;
    if (payload.description !== undefined) patch.description = payload.description;
    if (payload.startDate !== undefined) patch.start_date = payload.startDate;
    if (payload.endDate !== undefined) patch.end_date = payload.endDate;
    if (payload.startTime !== undefined) patch.start_time = payload.startTime || null;
    if (payload.endTime !== undefined) patch.end_time = payload.endTime || null;
    if (payload.registrationDeadline !== undefined) patch.registration_deadline = payload.registrationDeadline;
    if (payload.maxTeams !== undefined) patch.max_teams = payload.maxTeams;
    if (payload.registeredTeams !== undefined) patch.registered_teams = payload.registeredTeams;
    if (payload.entryFee !== undefined) patch.entry_fee = payload.entryFee;
    if (payload.prizePool !== undefined) patch.prize_pool = payload.prizePool;
    if (payload.status !== undefined) patch.status = payload.status;
    if (payload.rules !== undefined) patch.rules = payload.rules;
    if (payload.facilityId !== undefined) patch.facility_id = payload.facilityId;
    if (payload.facilityName !== undefined) patch.facility_name = payload.facilityName;
    if (payload.imageUrl !== undefined) patch.image_url = payload.imageUrl;

    const { data, error } = await supabase
      .from("tournaments")
      .update(patch)
      .eq("id", id)
      .select()
      .single();
    if (error) return createServiceResponse({} as Tournament, error.message);
    return createServiceResponse(mapRow(data));
  },

  async delete(id: string): Promise<ServiceResponse<null>> {
    const { error } = await supabase.from("tournaments").delete().eq("id", id);
    if (error) return createServiceResponse(null, error.message);
    return createServiceResponse(null);
  },

  /** Get tournaments for a specific facility (for calendar markers).
   * Fetches all non-cancelled tournaments and filters client-side — the
   * most reliable approach since PostgREST OR filters break on names with spaces. */
  async getByFacility(facilityId: string, facilityName?: string): Promise<ServiceResponse<Tournament[]>> {
    try {
      const { data, error } = await supabase
        .from("tournaments")
        .select("*")
        .neq("status", "cancelled");

      if (error) {
        console.error("[TournamentService] getByFacility error:", error.message);
        return createServiceResponse([], error.message);
      }

      const all = (data ?? []).map((row) => {
        try { return mapRow(row); }
        catch (e) { console.error("[TournamentService] mapRow error:", e); return null; }
      }).filter(Boolean) as Tournament[];

      // Filter client-side: match either facility UUID or facility name
      const matched = all.filter((t) => {
        if (facilityId && t.facilityId === facilityId) return true;
        if (facilityName && t.facilityName?.toLowerCase().trim() === facilityName.toLowerCase().trim()) return true;
        return false;
      });

      console.log(`[TournamentService] getByFacility → ${matched.length}/${all.length} match for "${facilityName}"`, matched.map(t => t.name));
      return createServiceResponse(matched);
    } catch (e) {
      console.error("[TournamentService] getByFacility unexpected error:", e);
      return createServiceResponse([], String(e));
    }
  },


  async registerTeam(registration: TeamRegistration): Promise<ServiceResponse<TeamRegistration>> {
    const { data, error } = await supabase
      .from("tournament_registrations")
      .insert({
        tournament_id: registration.tournamentId,
        team_name: registration.teamName,
        captain_name: registration.captainName,
        captain_email: registration.captainEmail,
        captain_phone: registration.captainPhone,
        player_count: registration.playerCount,
        payment_status: registration.paymentStatus ?? "pending"
      })
      .select()
      .single();

    if (error) return createServiceResponse({} as TeamRegistration, error.message);

    return createServiceResponse({
      id: data.id,
      tournamentId: data.tournament_id,
      teamName: data.team_name,
      captainName: data.captain_name,
      captainEmail: data.captain_email,
      captainPhone: data.captain_phone,
      playerCount: data.player_count,
      paymentStatus: data.payment_status,
      createdAt: data.created_at
    });
  },

  async getRegistrationById(id: string): Promise<ServiceResponse<TeamRegistration>> {
    const { data, error } = await supabase
      .from("tournament_registrations")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return createServiceResponse({} as TeamRegistration, error.message);

    return createServiceResponse({
      id: data.id,
      tournamentId: data.tournament_id,
      teamName: data.team_name,
      captainName: data.captain_name,
      captainEmail: data.captain_email,
      captainPhone: data.captain_phone,
      playerCount: data.player_count,
      paymentStatus: data.payment_status,
      createdAt: data.created_at
    });
  },

  async getAllRegistrations(): Promise<ServiceResponse<(TeamRegistration & { tournamentName?: string; sport?: string })[]>> {
    const { data, error } = await supabase
      .from("tournament_registrations")
      .select(`
        *,
        tournaments ( name, sport )
      `)
      .order("created_at", { ascending: false });

    if (error) return createServiceResponse([], error.message);

    return createServiceResponse((data ?? []).map((row: any) => ({
      id: row.id,
      tournamentId: row.tournament_id,
      teamName: row.team_name,
      captainName: row.captain_name,
      captainEmail: row.captain_email,
      captainPhone: row.captain_phone,
      playerCount: row.player_count,
      paymentStatus: row.payment_status,
      createdAt: row.created_at,
      tournamentName: row.tournaments?.name,
      sport: row.tournaments?.sport,
    })));
  },

  async updateRegistrationStatus(id: string, paymentStatus: string): Promise<ServiceResponse<null>> {
    const { error } = await supabase
      .from("tournament_registrations")
      .update({ payment_status: paymentStatus })
      .eq("id", id);

    if (error) return createServiceResponse(null, error.message);
    return createServiceResponse(null);
  },

  async cancelRegistration(id: string): Promise<ServiceResponse<null>> {
    const { error } = await supabase.from("tournament_registrations").delete().eq("id", id);
    if (error) return createServiceResponse(null, error.message);
    return createServiceResponse(null);
  },
};
