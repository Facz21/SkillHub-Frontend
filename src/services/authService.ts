import { request } from "./apiClient";
import {
  AuthResponse,
  AuthTokenDispatchResponse,
  UserProfileResponse,
} from "@/types/auth";

export const authService = {
  async login(
    email: string,
    password: string,
    rememberMe: boolean = true
  ): Promise<AuthResponse> {
    return request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, rememberMe }),
    });
  },

  async register(
    fullName: string,
    email: string,
    password: string
  ): Promise<AuthResponse> {
    return request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ fullName, email, password }),
    });
  },

  async forgotPassword(email: string): Promise<AuthTokenDispatchResponse> {
    return request<AuthTokenDispatchResponse>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(
    email: string,
    token: string,
    newPassword: string
  ): Promise<{ message: string }> {
    return request<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, token, newPassword }),
    });
  },

  async resendConfirmation(email: string): Promise<AuthTokenDispatchResponse> {
    return request<AuthTokenDispatchResponse>("/auth/resend-confirmation", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  async confirmEmail(
    email: string,
    token: string
  ): Promise<{ message: string }> {
    return request<{ message: string }>("/auth/confirm-email", {
      method: "POST",
      body: JSON.stringify({ email, token }),
    });
  },

  async getProfile(): Promise<UserProfileResponse> {
    return request<UserProfileResponse>("/auth/profile");
  },

  async updateProfile(
    fullName: string,
    specialty?: string
  ): Promise<UserProfileResponse> {
    return request<UserProfileResponse>("/auth/profile", {
      method: "PUT",
      body: JSON.stringify({ fullName, specialty }),
    });
  },

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    return request<{ message: string }>("/auth/change-password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};
