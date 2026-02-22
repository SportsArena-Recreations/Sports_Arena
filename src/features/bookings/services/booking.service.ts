import { supabase } from "@/lib/supabase";
import { Booking, BookingStatus } from "../types";
import { ServiceResponse, createServiceResponse } from "@/services/base.service";

function mapRow(row: Record<string, unknown>): Booking {
  return {
    id: row.id as string,
    facilityId: row.facility_id as string,
    facilityName: (row.facility_name as string) ?? "",
    userId: row.user_id as string,
    userName: (row.user_name as string) ?? "",
    userEmail: (row.user_email as string) ?? "",
    userPhone: (row.user_phone as string) ?? "",
    date: row.date as string,
    startTime: row.start_time as string,
    endTime: row.end_time as string,
    totalPrice: row.total_price as number,
    status: row.status as BookingStatus,
    notes: (row.notes as string) ?? undefined,
    createdAt: row.created_at as string,
  };
}

export const bookingService = {
  /** Admin: get all bookings with facility name joined */
  async getAll(): Promise<ServiceResponse<Booking[]>> {
    const { data, error } = await supabase
      .from("bookings")
      .select("*, facilities(name)")
      .order("created_at", { ascending: false });

    if (error) return createServiceResponse([], error.message);
    const mapped = (data ?? []).map((row) => mapRow({
      ...row,
      facility_name: (row.facilities as { name: string } | null)?.name ?? "",
    }));
    return createServiceResponse(mapped);
  },

  /** User: get their own bookings */
  async getMine(): Promise<ServiceResponse<Booking[]>> {
    const { data, error } = await supabase
      .from("bookings")
      .select("*, facilities(name)")
      .order("date", { ascending: false });

    if (error) return createServiceResponse([], error.message);
    const mapped = (data ?? []).map((row) => mapRow({
      ...row,
      facility_name: (row.facilities as { name: string } | null)?.name ?? "",
    }));
    return createServiceResponse(mapped);
  },

  /** Get all booked slots for a facility on a given date (for TimeSlotPicker) */
  async getBookedSlots(facilityId: string, date: string): Promise<ServiceResponse<{ startTime: string; endTime: string }[]>> {
    const { data, error } = await supabase
      .from("bookings")
      .select("start_time, end_time")
      .eq("facility_id", facilityId)
      .eq("date", date)
      .in("status", ["pending", "confirmed"]);

    if (error) return createServiceResponse([], error.message);
    return createServiceResponse(
      (data ?? []).map((r) => ({ startTime: r.start_time, endTime: r.end_time }))
    );
  },

  /** Create a booking */
  async create(payload: {
    facilityId: string;
    userId: string;
    userName: string;
    userEmail: string;
    userPhone: string;
    date: string;
    startTime: string;
    endTime: string;
    totalPrice: number;
    notes?: string;
  }): Promise<ServiceResponse<Booking>> {
    const { data, error } = await supabase
      .from("bookings")
      .insert({
        facility_id: payload.facilityId,
        user_id: payload.userId,
        user_name: payload.userName,
        user_email: payload.userEmail,
        user_phone: payload.userPhone,
        date: payload.date,
        start_time: payload.startTime,
        end_time: payload.endTime,
        total_price: payload.totalPrice,
        notes: payload.notes ?? null,
        status: "confirmed",   // auto-confirm — slot was empty when chosen
      })
      .select()
      .single();

    if (error) return createServiceResponse({} as Booking, error.message);
    return createServiceResponse(mapRow(data));
  },

  /** User: get their bookings for a specific facility (shown on detail page) */
  async getMineForFacility(facilityId: string): Promise<ServiceResponse<Booking[]>> {
    const { data, error } = await supabase
      .from("bookings")
      .select("*, facilities(name)")
      .eq("facility_id", facilityId)
      .in("status", ["confirmed", "pending"])
      .order("date", { ascending: true });

    if (error) return createServiceResponse([], error.message);
    const mapped = (data ?? []).map((row) => mapRow({
      ...row,
      facility_name: (row.facilities as { name: string } | null)?.name ?? "",
    }));
    return createServiceResponse(mapped);
  },

  /** Admin: update booking status */
  async updateStatus(id: string, status: BookingStatus): Promise<ServiceResponse<Booking>> {
    const { data, error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) return createServiceResponse({} as Booking, error.message);
    return createServiceResponse(mapRow(data));
  },
};
