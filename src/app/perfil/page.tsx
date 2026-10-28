"use client";

import React, { useState, useEffect } from "react";
import { authService } from "@/services/authService";
import { UserProfileResponse } from "@/types/auth";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export default function PerfilPage() {
  const { user, isAuthenticated, openAuthModal, refreshProfile } = useAuth();
  const { addToast } = useToast();

  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Edit profile state
  const [fullName, setFullName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Change password state + show/hide toggles
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Email verification state inside Profile
  const [verificationToken, setVerificationToken] = useState("");
  const [devVerifyToken, setDevVerifyToken] = useState<string | null>(null);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [isConfirmingEmail, setIsConfirmingEmail] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const data = await authService.getProfile();
        setProfile(data);
        setFullName(data.fullName);
        setSpecialty(data.specialty || "");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "No se pudo cargar el perfil.";
        addToast("error", msg);
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, [isAuthenticated, addToast]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      addToast("warning", "El nombre completo es obligatorio.");
      return;
    }
    try {
      setIsSavingProfile(true);
      const updated = await authService.updateProfile(
        fullName.trim(),
        specialty.trim() ? specialty.trim() : undefined
      );
      setProfile(updated);
      await refreshProfile();
      addToast("success", "Perfil actualizado correctamente.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al actualizar perfil.";
      addToast("error", msg);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      addToast("warning", "La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast("warning", "La confirmación de contraseña no coincide.");
      return;
    }
    try {
      setIsChangingPassword(true);
      await authService.changePassword(currentPassword, newPassword);
      addToast("success", "Contraseña actualizada exitosamente.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al cambiar contraseña.";
      addToast("error", msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSendEmailVerification = async () => {
    if (!profile) return;
    try {
      setIsSendingVerification(true);
      const res = await authService.resendConfirmation(profile.email);
      setDevVerifyToken(res.devToken || null);
      addToast(
        "success",
        res.sentViaSmtp
          ? `Correo de verificación enviado por SMTP a ${profile.email}.`
          : "Código de verificación generado."
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al enviar código.";
      addToast("error", msg);
    } finally {
      setIsSendingVerification(false);
    }
  };

  const handleConfirmEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !verificationToken.trim()) return;
    try {
      setIsConfirmingEmail(true);
      await authService.confirmEmail(profile.email, verificationToken.trim());
      const updated = await authService.getProfile();
      setProfile(updated);
      await refreshProfile();
      setVerificationToken("");
      setDevVerifyToken(null);
      addToast("success", "¡Tu correo electrónico ha sido verificado exitosamente!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Código de verificación inválido.";
      addToast("error", msg);
    } finally {
      setIsConfirmingEmail(false);
    }
  };

  if (!isAuthenticated && !isLoading) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 bg-slate-50/60">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-lg">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl">person</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Inicia sesión para ver tu perfil</h2>
          <p className="mt-2 text-sm text-slate-500">
            Gestiona tus datos personales, especialidad y credenciales de acceso a SkillHub.
          </p>
          <button
            type="button"
            onClick={() => openAuthModal("login")}
            className="mt-6 w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-sm transition-colors cursor-pointer"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 pb-24">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <span className="material-symbols-outlined text-sm">manage_accounts</span>
            Cuenta Registrada en SkillHub
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Mi Perfil y Seguridad
          </h1>
          <p className="text-slate-300 text-sm sm:text-base mt-1">
            Consulta los datos de tu cuenta, verifica tu correo electrónico y actualiza tu información o contraseña.
          </p>
        </div>
      </section>

      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Account Overview Card */}
        {profile && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Correo Electrónico
                </span>
                <span className="text-sm font-semibold text-slate-900 mt-1 block break-all">
                  {profile.email}
                </span>
                <div className="mt-1.5">
                  {profile.emailConfirmed ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="material-symbols-outlined text-[14px]">verified</span>
                      Correo Verificado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      Pendiente de Confirmar
                    </span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Rol en el Sistema
                </span>
                <span className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {profile.role === "Employee" ? "Employee (Instructor)" : "Participant (Alumno)"}
                </span>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Especialidad
                </span>
                <span className="text-sm font-semibold text-slate-900 mt-1 block">
                  {profile.specialty || "No especificada"}
                </span>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Fecha de Registro
                </span>
                <span className="text-sm font-semibold text-slate-900 mt-1 block">
                  {new Date(profile.createdAt).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Email Verification Banner if not yet confirmed */}
            {!profile.emailConfirmed && (
              <div className="p-4 sm:p-5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-amber-900 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base text-amber-600">
                        mark_email_unread
                      </span>
                      Confirma tu dirección de correo electrónico ({profile.email})
                    </h3>
                    <p className="text-xs text-amber-800/80 mt-0.5">
                      Solicita un código de confirmación a tu correo real y pégalo abajo para verificar tu cuenta en ASP.NET Core Identity.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isSendingVerification}
                    onClick={handleSendEmailVerification}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-colors shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    {isSendingVerification
                      ? "Enviando correo..."
                      : "Enviar Código a mi Correo"}
                  </button>
                </div>

                {devVerifyToken && (
                  <div className="flex items-center justify-between bg-white/90 px-3 py-2 rounded-lg border border-amber-200 text-xs">
                    <span className="text-slate-600">
                      Código generado para pruebas rápidas:
                    </span>
                    <button
                      type="button"
                      onClick={() => setVerificationToken(devVerifyToken)}
                      className="px-2.5 py-1 rounded bg-indigo-600 text-white font-bold text-[11px] cursor-pointer"
                    >
                      Autocompletar Token
                    </button>
                  </div>
                )}

                <form onSubmit={handleConfirmEmailSubmit} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    required
                    value={verificationToken}
                    onChange={(e) => setVerificationToken(e.target.value)}
                    placeholder="Pega aquí el token de verificación recibido en tu correo..."
                    className="flex-1 px-3.5 py-2 rounded-xl border border-amber-300 bg-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                  <button
                    type="submit"
                    disabled={isConfirmingEmail}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isConfirmingEmail ? "Verificando..." : "Confirmar Correo"}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form 1: Update Profile (PUT /api/v1/auth/profile) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600">badge</span>
                Actualizar Datos Personales
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Tu nombre completo se utilizará en la emisión de las constancias de inscripción en PDF.
              </p>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Especialidad {user?.role === "Employee" ? "(Docente)" : "(Opcional)"}
                </label>
                <input
                  type="text"
                  placeholder="Ej. Fotografía, Cocina, Oratoria, Diseño..."
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <button
                type="submit"
                disabled={isSavingProfile}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isSavingProfile ? "Guardando cambios..." : "Guardar Perfil"}
              </button>
            </form>
          </div>

          {/* Form 2: Change Password (PUT /api/v1/auth/change-password) with Show/Hide Toggles */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600">lock_reset</span>
                Cambiar Contraseña
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Ingresa tu contraseña actual y define una nueva clave de al menos 6 caracteres.
              </p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Contraseña Actual
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? "text" : "password"}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                    title={showCurrentPass ? "Ocultar" : "Mostrar"}
                  >
                    <span className="material-symbols-outlined text-[19px]">
                      {showCurrentPass ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nueva Contraseña (mín. 6 caracteres)
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? "text" : "password"}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                    title={showNewPass ? "Ocultar" : "Mostrar"}
                  >
                    <span className="material-symbols-outlined text-[19px]">
                      {showNewPass ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Confirmar Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                    title={showConfirmPass ? "Ocultar" : "Mostrar"}
                  >
                    <span className="material-symbols-outlined text-[19px]">
                      {showConfirmPass ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isChangingPassword}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isChangingPassword ? "Actualizando contraseña..." : "Actualizar Contraseña"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
