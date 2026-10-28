import { request } from "./apiClient";
import { Enrollment } from "@/types/enrollment";

export const enrollmentService = {
  async enroll(workshopId: number): Promise<Enrollment> {
    return request<Enrollment>("/enrollments", {
      method: "POST",
      body: JSON.stringify({ workshopId }),
    });
  },

  async getMyEnrollments(): Promise<Enrollment[]> {
    return request<Enrollment[]>("/enrollments/mine");
  },

  async cancelEnrollment(enrollmentId: number): Promise<Enrollment> {
    return request<Enrollment>(`/enrollments/${enrollmentId}/cancel`, {
      method: "PATCH",
    });
  },

  async downloadCertificate(enrollmentId: number): Promise<Blob> {
    const blob = await request<Blob>(`/enrollments/${enrollmentId}/certificate`);
    
    // Auto-download trigger if in browser
    if (typeof window !== "undefined" && blob) {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Certificado_SkillHub_${enrollmentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    }

    return blob;
  },
};
