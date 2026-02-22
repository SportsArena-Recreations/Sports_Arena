import { supabase } from "@/lib/supabase";
import { Facility, TimeSlot } from "../types";
import { ServiceResponse, createServiceResponse } from "@/services/base.service";

// Map Supabase snake_case → camelCase
function mapRow(row: Record<string, unknown>): Facility {
  return {
    id: row.id as string,
    name: row.name as string,
    type: row.type as Facility["type"],
    description: row.description as string,
    capacity: row.capacity as number,
    pricePerHour: row.price_per_hour as number,
    amenities: (row.amenities as string[]) ?? [],
    rules: (row.rules as string[]) ?? [],
    imageUrl: (row.image_url as string) ?? "",
    status: row.status as Facility["status"],
  };
}

export const facilityService = {
  async getAll(): Promise<ServiceResponse<Facility[]>> {
    const { data, error } = await supabase
      .from("facilities")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) return createServiceResponse([], error.message);
    return createServiceResponse((data ?? []).map(mapRow));
  },

  async getById(id: string): Promise<ServiceResponse<Facility | undefined>> {
    const { data, error } = await supabase
      .from("facilities")
      .select("*")
      .eq("id", id)
      .single();
    if (error) return createServiceResponse(undefined, error.message);
    return createServiceResponse(mapRow(data));
  },

  async create(payload: Omit<Facility, "id">): Promise<ServiceResponse<Facility>> {
    const { data, error } = await supabase
      .from("facilities")
      .insert({
        name: payload.name,
        type: payload.type,
        description: payload.description,
        capacity: payload.capacity,
        price_per_hour: payload.pricePerHour,
        amenities: payload.amenities,
        rules: payload.rules ?? [],
        image_url: payload.imageUrl,
        status: payload.status,
      })
      .select()
      .single();
    if (error) return createServiceResponse({} as Facility, error.message);
    return createServiceResponse(mapRow(data));
  },

  async update(id: string, payload: Partial<Omit<Facility, "id">>): Promise<ServiceResponse<Facility>> {
    const patch: Record<string, unknown> = {};
    if (payload.name !== undefined) patch.name = payload.name;
    if (payload.type !== undefined) patch.type = payload.type;
    if (payload.description !== undefined) patch.description = payload.description;
    if (payload.capacity !== undefined) patch.capacity = payload.capacity;
    if (payload.pricePerHour !== undefined) patch.price_per_hour = payload.pricePerHour;
    if (payload.amenities !== undefined) patch.amenities = payload.amenities;
    if (payload.rules !== undefined) patch.rules = payload.rules;
    if (payload.imageUrl !== undefined) patch.image_url = payload.imageUrl;
    if (payload.status !== undefined) patch.status = payload.status;

    const { data, error } = await supabase
      .from("facilities")
      .update(patch)
      .eq("id", id)
      .select()
      .single();
    if (error) return createServiceResponse({} as Facility, error.message);
    return createServiceResponse(mapRow(data));
  },

  async delete(id: string): Promise<ServiceResponse<null>> {
    const { error } = await supabase.from("facilities").delete().eq("id", id);
    if (error) return createServiceResponse(null, error.message);
    return createServiceResponse(null);
  },

  // Time slots are not yet in DB — kept as stub for future migration
  async getTimeSlots(_facilityId: string, _date?: string): Promise<ServiceResponse<TimeSlot[]>> {
    return createServiceResponse([]);
  },
};
