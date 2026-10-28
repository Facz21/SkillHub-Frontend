export type EnrollmentStatus = 1 | 2; // 1 = Active, 2 = Cancelled

export interface Enrollment {
  id: number;
  workshopId: number;
  workshopCode: string;
  workshopTitle: string;
  instructorName: string;
  startDateTime: string;
  endDateTime: string;
  status: EnrollmentStatus;
  enrolledAt: string;
  cancelledAt?: string;
  cancelledBy?: string;
  canParticipantCancel: boolean;
}

export interface WorkshopEnrollmentDetail {
  enrollmentId: number;
  participantId: string;
  participantName: string;
  participantEmail: string;
  status: EnrollmentStatus;
  enrolledAt: string;
  cancelledAt?: string;
  cancelledBy?: string;
}
