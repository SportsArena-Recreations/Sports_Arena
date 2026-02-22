import { Booking } from "../types";
import { mockBookings } from "../mock.data";
import { simulateDelay, ServiceResponse, createServiceResponse } from "@/services/base.service";

export const bookingService = {
  async getAll(): Promise<ServiceResponse<Booking[]>> {
    const data = await simulateDelay(mockBookings);
    return createServiceResponse(data);
  },

  async getById(id: string): Promise<ServiceResponse<Booking | undefined>> {
    const booking = await simulateDelay(mockBookings.find((b) => b.id === id));
    return createServiceResponse(booking);
  },

  async create(booking: Omit<Booking, "id" | "createdAt">): Promise<ServiceResponse<Booking>> {
    const newBooking: Booking = {
      ...booking,
      id: `b${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const data = await simulateDelay(newBooking);
    return createServiceResponse(data);
  },
};
