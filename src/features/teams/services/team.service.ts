import { supabase } from "@/lib/supabase";
import { Team, TeamMember } from "../types";
import { ServiceResponse, createServiceResponse } from "@/services/base.service";

// Helper to map DB row to frontend Team type
const mapToTeam = (row: any): Team => ({
  id: row.id,
  name: row.name,
  sport: row.sport,
  captainId: "", // Not storing captain ID currently in the simplified table
  captainName: row.captain_name || "",
  members: [],   // We can do an members table later if needed, for now empty
  createdAt: row.created_at,
  logoUrl: row.logo_url,
  // Add additional properties mapped from captain_phone if required
  ...(row.captain_phone ? { phone: row.captain_phone } : {})
});

export const teamService = {
  async getAll(): Promise<ServiceResponse<Team[]>> {
    try {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return createServiceResponse((data || []).map(mapToTeam));
    } catch (err: any) {
      console.error("Error fetching teams:", err);
      return { success: false, data: [], message: err.message };
    }
  },

  async getById(id: string): Promise<ServiceResponse<Team | undefined>> {
    try {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return createServiceResponse(data ? mapToTeam(data) : undefined);
    } catch (err: any) {
      console.error("Error fetching team:", err);
      return { success: false, data: undefined, message: err.message };
    }
  },

  async create(data: Partial<Team> & { captainPhone?: string }): Promise<ServiceResponse<Team>> {
    try {
      const dbPayload = {
        name: data.name,
        sport: data.sport,
        captain_name: data.captainName,
        captain_phone: data.captainPhone || null,
        logo_url: data.logoUrl || null,
      };

      const { data: insertedData, error } = await supabase
        .from("teams")
        .insert([dbPayload])
        .select()
        .single();

      if (error) throw error;
      return createServiceResponse(mapToTeam(insertedData));
    } catch (err: any) {
      console.error("Error creating team:", err);
      return { success: false, data: null as any, message: err.message };
    }
  },

  async update(id: string, data: Partial<Team> & { captainPhone?: string }): Promise<ServiceResponse<Team>> {
    try {
      const dbPayload: any = {};
      if (data.name !== undefined) dbPayload.name = data.name;
      if (data.sport !== undefined) dbPayload.sport = data.sport;
      if (data.captainName !== undefined) dbPayload.captain_name = data.captainName;
      if (data.captainPhone !== undefined) dbPayload.captain_phone = data.captainPhone;
      if (data.logoUrl !== undefined) dbPayload.logo_url = data.logoUrl;

      const { data: updatedData, error } = await supabase
        .from("teams")
        .update(dbPayload)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return createServiceResponse(mapToTeam(updatedData));
    } catch (err: any) {
      console.error("Error updating team:", err);
      return { success: false, data: null as any, message: err.message };
    }
  },

  async delete(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await supabase
        .from("teams")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return createServiceResponse(true);
    } catch (err: any) {
      console.error("Error deleting team:", err);
      return { success: false, data: false, message: err.message };
    }
  }
};
