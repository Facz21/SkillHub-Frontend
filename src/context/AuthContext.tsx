"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { AuthResponse, UserSession } from "@/types/auth";
import { authService } from "@/services/authService";

export type AuthModalTabType =
  | "login"
  | "register"
  | "forgot"
  | "reset"
  | "confirm-email";

interface AuthContextType {
  user: UserSession | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isEmployee: boolean;
  login: (email: string, pass: string, rememberMe?: boolean) => Promise<void>;
  register: (fullName: string, email: string, pass: string) => Promise<AuthResponse>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  loginAsParticipantDemo: () => Promise<void>;
  loginAsInstructorDemo: () => Promise<void>;
  loginAsDemo: (role: "participant" | "instructor") => Promise<void>;
  isAuthModalOpen: boolean;
  openAuthModal: (tab?: AuthModalTabType) => void;
  closeAuthModal: () => void;
  authModalTab: AuthModalTabType;
  setAuthModalTab: (tab: AuthModalTabType) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<AuthModalTabType>("login");

  const persistUserToActiveStorage = (updatedUser: UserSession) => {
    if (localStorage.getItem("skillhub_token")) {
      localStorage.setItem("skillhub_user", JSON.stringify(updatedUser));
    } else if (sessionStorage.getItem("skillhub_token")) {
      sessionStorage.setItem("skillhub_user", JSON.stringify(updatedUser));
    }
  };

  const refreshProfile = useCallback(async () => {
    try {
      const profile = await authService.getProfile();
      const updatedUser: UserSession = {
        id: profile.id,
        email: profile.email,
        fullName: profile.fullName,
        role: profile.role,
        specialty: profile.specialty,
        createdAt: profile.createdAt,
        emailConfirmed: profile.emailConfirmed,
      };
      persistUserToActiveStorage(updatedUser);
      setUser(updatedUser);
    } catch {
      localStorage.removeItem("skillhub_token");
      localStorage.removeItem("skillhub_user");
      sessionStorage.removeItem("skillhub_token");
      sessionStorage.removeItem("skillhub_user");
      setToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const initSession = async () => {
      try {
        const storedToken =
          localStorage.getItem("skillhub_token") ||
          sessionStorage.getItem("skillhub_token");
        const storedUser =
          localStorage.getItem("skillhub_user") ||
          sessionStorage.getItem("skillhub_user");

        if (storedToken) {
          setToken(storedToken);
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
          await refreshProfile();
        }
      } catch {
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    initSession();
  }, [refreshProfile]);

  const login = async (email: string, pass: string, rememberMe: boolean = true) => {
    const res = await authService.login(email, pass, rememberMe);

    // Clear both storages first, then store in the chosen one
    localStorage.removeItem("skillhub_token");
    localStorage.removeItem("skillhub_user");
    sessionStorage.removeItem("skillhub_token");
    sessionStorage.removeItem("skillhub_user");

    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem("skillhub_token", res.token);
    setToken(res.token);

    try {
      const profile = await authService.getProfile();
      const sessionUser: UserSession = {
        id: profile.id,
        email: profile.email,
        fullName: profile.fullName,
        role: profile.role,
        specialty: profile.specialty,
        createdAt: profile.createdAt,
        emailConfirmed: profile.emailConfirmed,
      };
      storage.setItem("skillhub_user", JSON.stringify(sessionUser));
      setUser(sessionUser);
    } catch {
      const fallbackUser: UserSession = {
        email: res.email,
        fullName: res.fullName,
        role: res.role,
        emailConfirmed: res.emailConfirmed,
      };
      storage.setItem("skillhub_user", JSON.stringify(fallbackUser));
      setUser(fallbackUser);
    }

    setIsAuthModalOpen(false);
  };

  const register = async (
    fullName: string,
    email: string,
    pass: string
  ): Promise<AuthResponse> => {
    const res = await authService.register(fullName, email, pass);
    localStorage.setItem("skillhub_token", res.token);
    setToken(res.token);

    const sessionUser: UserSession = {
      email: res.email,
      fullName: res.fullName,
      role: res.role,
      emailConfirmed: res.emailConfirmed,
    };
    localStorage.setItem("skillhub_user", JSON.stringify(sessionUser));
    setUser(sessionUser);
    return res;
  };

  const logout = () => {
    localStorage.removeItem("skillhub_token");
    localStorage.removeItem("skillhub_user");
    sessionStorage.removeItem("skillhub_token");
    sessionStorage.removeItem("skillhub_user");
    setToken(null);
    setUser(null);
  };

  const loginAsParticipantDemo = async () => {
    await login("jorge.perez@correo.com", "Skillhub2026*", true);
  };

  const loginAsInstructorDemo = async () => {
    await login("andres.mejia@correo.com", "Instructor2026*", true);
  };

  const loginAsDemo = async (role: "participant" | "instructor") => {
    if (role === "instructor") {
      await loginAsInstructorDemo();
    } else {
      await loginAsParticipantDemo();
    }
  };

  const openAuthModal = (tab: AuthModalTabType = "login") => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        isEmployee: user?.role === "Employee",
        login,
        register,
        logout,
        refreshProfile,
        loginAsParticipantDemo,
        loginAsInstructorDemo,
        loginAsDemo,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        authModalTab,
        setAuthModalTab,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
}
