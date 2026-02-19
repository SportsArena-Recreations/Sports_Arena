import { Tournament } from "../types";
import { mockTournaments } from "../mock.data";
import { simulateDelay, ServiceResponse, createServiceResponse } from "@/services/base.service";

export const tournamentService = {
  async getAll(): Promise<ServiceResponse<Tournament[]>> {
    const data = await simulateDelay(mockTournaments);
    return createServiceResponse(data);
  },

  async getById(id: string): Promise<ServiceResponse<Tournament | undefined>> {
    const tournament = await simulateDelay(mockTournaments.find((t) => t.id === id));
    return createServiceResponse(tournament);
  },
};
