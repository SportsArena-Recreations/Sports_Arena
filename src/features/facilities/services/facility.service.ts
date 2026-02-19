import { Facility, TimeSlot } from "../types";
import { mockFacilities, mockTimeSlots } from "../mock.data";
import { simulateDelay, ServiceResponse, createServiceResponse } from "@/services/base.service";

export const facilityService = {
  async getAll(): Promise<ServiceResponse<Facility[]>> {
    const data = await simulateDelay(mockFacilities);
    return createServiceResponse(data);
  },

  async getById(id: string): Promise<ServiceResponse<Facility | undefined>> {
    const facility = await simulateDelay(mockFacilities.find((f) => f.id === id));
    return createServiceResponse(facility);
  },

  async getTimeSlots(facilityId: string, date?: string): Promise<ServiceResponse<TimeSlot[]>> {
    let slots = mockTimeSlots.filter((s) => s.facilityId === facilityId);
    if (date) {
      slots = slots.filter((s) => s.date === date);
    }
    const data = await simulateDelay(slots);
    return createServiceResponse(data);
  },
};
