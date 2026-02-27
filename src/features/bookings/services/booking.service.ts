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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return createServiceResponse([], "User not logged in");

    const { data, error } = await supabase
      .from("bookings")
      .select("*, facilities(name)")
      .eq("user_id", user.id) // Explicitly filter by user ID!
      .order("date", { ascending: false });

    if (error) return createServiceResponse([], error.message);
    const mapped = (data ?? []).map((row) => mapRow({
      ...row,
      facility_name: (row.facilities as { name: string } | null)?.name ?? "",
    }));
    return createServiceResponse(mapped);
  },

  /** Get dates in a specific month that have at least one booking (for calendar indicators) */
  async getBookedDaysInMonth(facilityId: string, year: number, month: number): Promise<ServiceResponse<string[]>> {
    const start = new Date(year, month, 1).toISOString().split("T")[0];
    const end = new Date(year, month + 1, 0).toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("bookings")
      .select("date")
      .eq("facility_id", facilityId)
      .in("status", ["confirmed", "pending"])
      .gte("date", start)
      .lte("date", end);

    if (error) {
      console.error("[BookingService] getBookedDaysInMonth error:", error);
      return createServiceResponse([], error.message);
    }
    const uniqueDates = Array.from(new Set((data ?? []).map((r) => r.date)));
    return createServiceResponse(uniqueDates);
  },

  /** Get all booked slots for a facility on a given date (for TimeSlotPicker) */
  async getBookedSlots(facilityId: string, date: string): Promise<ServiceResponse<{ startTime: string; endTime: string }[]>> {
    const { data, error } = await supabase
      .from("bookings")
      .select("start_time, end_time")
      .eq("facility_id", facilityId)
      .eq("date", date)
      .in("status", ["pending", "confirmed"]);

    if (error) {
      console.error("[BookingService] getBookedSlots error:", error);
      return createServiceResponse([], error.message);
    }
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return createServiceResponse([], "User not logged in");

    const { data, error } = await supabase
      .from("bookings")
      .select("*, facilities(name)")
      .eq("facility_id", facilityId)
      .eq("user_id", user.id) // Explicit filter!
      .in("status", ["confirmed", "pending"])
      .order("date", { ascending: true });

    if (error) return createServiceResponse([], error.message);
    const mapped = (data ?? []).map((row) => mapRow({
      ...row,
      facility_name: (row.facilities as { name: string } | null)?.name ?? "",
    }));
    return createServiceResponse(mapped);
  },

  /** User: check if the user has confirmed/pending bookings at other facilities for the selected date and slots */
  async getMyConflicts(date: string, facilityId: string, slots: string[]): Promise<ServiceResponse<Booking[]>> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return createServiceResponse([], "User not logged in");

    // postgres time might require the seconds, so ensure we check with seconds if the DB returns them
    // actually postgrest handles "HH:MM" vs "HH:MM:SS" quite well, but let's be safe
    const slotVariations = slots.flatMap(s => [s, `${s}:00`]);

    const { data, error } = await supabase
      .from("bookings")
      .select("*, facilities(name)")
      .eq("user_id", user.id)
      .eq("date", date)
      .neq("facility_id", facilityId)
      .in("status", ["confirmed", "pending"])
      .in("start_time", slotVariations)
      .order("start_time", { ascending: true });

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

  /** User: cancel their own booking */
  async cancel(id: string): Promise<ServiceResponse<Booking>> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return createServiceResponse({} as Booking, "User not logged in");

    const { data, error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", id)
      .eq("user_id", user.id) // Ensure they only cancel their own!
      .select()
      .single();

    if (error) return createServiceResponse({} as Booking, error.message);
    return createServiceResponse(mapRow(data));
  },
};
