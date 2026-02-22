import { supabase } from "@/lib/supabase";
import { ServiceResponse, createServiceResponse } from "@/services/base.service";

export interface Sport {
    id: string;
    name: string;
    icon?: string;
    createdAt: string;
}

const mapToSport = (row: any): Sport => ({
    id: row.id,
    name: row.name,
    icon: row.icon,
    createdAt: row.created_at,
});

export const sportService = {
    async getAll(): Promise<ServiceResponse<Sport[]>> {
        try {
            const { data, error } = await supabase
                .from("sports")
                .select("*")
                .order("name", { ascending: true });

            if (error) throw error;
            return createServiceResponse((data || []).map(mapToSport));
        } catch (err: any) {
            console.error("Error fetching sports:", err);
            return { success: false, data: [], message: err.message };
        }
    }
};
