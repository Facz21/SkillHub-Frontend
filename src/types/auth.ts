export type UserRole = "Participant" | "Employee";

export interface UserSession {
  id?: string;
  email: string;
  fullName: string;
  role: UserRole;
  specialty?: string;
  createdAt?: string;
  emailConfirmed?: boolean;
}

export interface AuthResponse {
  token: string;
  email: string;
  fullName: string;
  role: UserRole;
  expiresAt: string;
  emailConfirmed: boolean;
  emailDispatchedViaSmtp?: boolean;
  devEmailToken?: string;
}

export interface UserProfileResponse {
  id: string;
  email: string;
  fullName: string;
  specialty?: string;
  role: UserRole;
  createdAt: string;
  emailConfirmed: boolean;
}

export interface UpdateProfileDto {
  fullName: string;
  specialty?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface AuthTokenDispatchResponse {
  message: string;
  email: string;
  sentViaSmtp: boolean;
  devToken?: string;
}
