export interface Workshop {
  id: number;
  code: string;
  title: string;
  description: string;
  instructorName: string;
  instructorEmail: string;
  instructorSpecialty?: string;
  startDateTime: string;
  endDateTime: string;
  capacity: number;
  activeEnrollmentsCount: number;
  availableSeats: number;
}

export interface CreateWorkshopDto {
  code: string;
  title: string;
  description: string;
  instructorEmail: string;
  startDateTime: string;
  endDateTime: string;
  capacity: number;
}

export interface InstructorSummary {
  id: string;
  fullName: string;
  email: string;
  specialty?: string;
}
