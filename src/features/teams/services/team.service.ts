import { Team } from "../types";
import { mockTeams } from "../mock.data";
import { simulateDelay, ServiceResponse, createServiceResponse } from "@/services/base.service";

export const teamService = {
  async getAll(): Promise<ServiceResponse<Team[]>> {
    const data = await simulateDelay(mockTeams);
    return createServiceResponse(data);
  },

  async getById(id: string): Promise<ServiceResponse<Team | undefined>> {
    const team = await simulateDelay(mockTeams.find((t) => t.id === id));
    return createServiceResponse(team);
  },
};
