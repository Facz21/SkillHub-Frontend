import { request } from "./apiClient";
import { Workshop, CreateWorkshopDto, InstructorSummary } from "@/types/workshop";
import { WorkshopEnrollmentDetail } from "@/types/enrollment";

export const workshopService = {
  async getWorkshops(): Promise<Workshop[]> {
    return request<Workshop[]>("/workshops");
  },

  async getWorkshopById(id: number): Promise<Workshop> {
    return request<Workshop>(`/workshops/${id}`);
  },

  async createWorkshop(data: CreateWorkshopDto): Promise<Workshop> {
    return request<Workshop>("/workshops", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getInstructors(): Promise<InstructorSummary[]> {
    return request<InstructorSummary[]>("/workshops/instructors");
  },

  async getWorkshopEnrollments(workshopId: number): Promise<WorkshopEnrollmentDetail[]> {
    return request<WorkshopEnrollmentDetail[]>(`/workshops/${workshopId}/enrollments`);
  },
};
