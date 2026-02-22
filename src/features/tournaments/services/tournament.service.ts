import { supabase } from "@/lib/supabase";
import { Tournament } from "../types";
import { ServiceResponse, createServiceResponse } from "@/services/base.service";

// Map Supabase snake_case → camelCase
function mapRow(row: Record<string, unknown>): Tournament {
  return {
    id: row.id as string,
    name: row.name as string,
    sport: row.sport as string,
    description: row.description as string,
    startDate: row.start_date as string,
    endDate: row.end_date as string,
    registrationDeadline: row.registration_deadline as string,
    maxTeams: row.max_teams as number,
    registeredTeams: row.registered_teams as number,
    entryFee: row.entry_fee as number,
    prizePool: row.prize_pool as number,
    status: row.status as Tournament["status"],
    rules: (row.rules as string[]) ?? [],
    facilityId: row.facility_id as string,
    facilityName: row.facility_name as string,
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
};
