export interface TopWorkshopReport {
  workshopId: number;
  code: string;
  title: string;
  instructorName: string;
  startDateTime: string;
  endDateTime: string;
  capacity: number;
  activeEnrollmentsCount: number;
  occupancyRate: number;
}

export interface ExcelRowError {
  rowNumber: number;
  participantEmail: string;
  workshopCode: string;
  reason: string;
}

export interface ExcelImportResult {
  totalRows: number;
  successfulCount: number;
  rejectedCount: number;
  rejectedDetails: ExcelRowError[];
}
