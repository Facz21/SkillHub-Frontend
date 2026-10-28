import { request } from "./apiClient";
import { Workshop, CreateWorkshopDto, InstructorSummary } from "@/types/workshop";
import { WorkshopEnrollmentDetail } from "@/types/enrollment";

/**
 * Service managing workshop catalog queries, workshop creation, instructor directory,
 * and workshop participant rosters (/api/v1/workshops/*).
 */
export const workshopService = {
  /**
   * Fetches all upcoming workshops with real-time available seat counts.
   */
  async getWorkshops(): Promise<Workshop[]> {
    return request<Workshop[]>("/workshops");
  },

  /**
   * Fetches detailed information for a specific workshop by its numeric ID.
   */
  async getWorkshopById(id: number): Promise<Workshop> {
    return request<Workshop>(`/workshops/${id}`);
  },

  /**
   * Publishes a new workshop (restricted to users with the "Employee" role).
   */
  async createWorkshop(data: CreateWorkshopDto): Promise<Workshop> {
    return request<Workshop>("/workshops", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Retrieves all registered instructors ("Employee" role) to populate the instructor selector.
   */
  async getInstructors(): Promise<InstructorSummary[]> {
    return request<InstructorSummary[]>("/workshops/instructors");
  },

  /**
   * Retrieves the full roster of enrolled participants for a specific workshop ("Employee" role).
   */
  async getWorkshopEnrollments(workshopId: number): Promise<WorkshopEnrollmentDetail[]> {
    return request<WorkshopEnrollmentDetail[]>(`/workshops/${workshopId}/enrollments`);
  },
};
