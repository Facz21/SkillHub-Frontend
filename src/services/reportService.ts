import { request } from "./apiClient";
import { TopWorkshopReport, ExcelImportResult } from "@/types/report";

export const reportService = {
  async getTopWorkshops(): Promise<TopWorkshopReport[]> {
    return request<TopWorkshopReport[]>("/reports/top-workshops");
  },

  async importEnrollmentsExcel(file: File): Promise<ExcelImportResult> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("File", file);

    return request<ExcelImportResult>("/enrollments/import", {
      method: "POST",
      body: formData,
    });
  },
};
