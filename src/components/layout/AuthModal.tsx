"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { authService } from "@/services/authService";

export default function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalTab,
    setAuthModalTab,
    login,
    register,
    refreshProfile,
    loginAsParticipantDemo,
    loginAsInstructorDemo,
  } = useAuth();
  const { showToast } = useToast();

  // Login State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showLoginPass, setShowLoginPass] = useState(false);

  // Register State
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");
  const [showRegPass, setShowRegPass] = useState(false);

  // Forgot & Reset Password State
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [resetNewPass, setResetNewPass] = useState("");
  const [showResetPass, setShowResetPass] = useState(false);
  const [dispatchedViaSmtp, setDispatchedViaSmtp] = useState(false);
  const [devTokenHelper, setDevTokenHelper] = useState<string | null>(null);

  // Confirm Email State
  const [confirmEmailAddr, setConfirmEmailAddr] = useState("");
  const [confirmToken, setConfirmToken] = useState("");

  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(loginEmail, loginPass, rememberMe);
      showToast(
        "¡Bienvenido a SkillHub!",
        rememberMe
          ? "Sesión iniciada y recordada en este dispositivo."
          : "Sesión temporal iniciada."
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al iniciar sesión.";
      showToast("Error de autenticación", message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await register(regName, regEmail, regPass);
      setConfirmEmailAddr(res.email);
      setDispatchedViaSmtp(Boolean(res.emailDispatchedViaSmtp));
      setDevTokenHelper(res.devEmailToken || null);
      setConfirmToken("");
      setAuthModalTab("confirm-email");

      showToast(
        "¡Cuenta creada! Confirma tu correo",
        res.emailDispatchedViaSmtp
          ? `Enviamos un correo real de verificación a ${res.email}.`
          : "Ingresa el código de confirmación para verificar tu correo."
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al registrar cuenta.";
      showToast("Error de registro", message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.forgotPassword(forgotEmail);
      setDispatchedViaSmtp(res.sentViaSmtp);
      setDevTokenHelper(res.devToken || null);
      setResetToken("");
      setResetNewPass("");
      setAuthModalTab("reset");
      showToast(
        "Código de recuperación generado",
        res.sentViaSmtp
          ? `Revisa la bandeja de entrada de ${res.email}.`
          : res.message
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "No se pudo procesar la solicitud.";
      showToast("Error", message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.resetPassword(forgotEmail, resetToken, resetNewPass);
      showToast(
        "¡Contraseña restablecida!",
        "Ya puedes iniciar sesión con tu nueva contraseña."
      );
      setLoginEmail(forgotEmail);
      setLoginPass("");
      setAuthModalTab("login");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al restablecer contraseña.";
      showToast("Error", message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.confirmEmail(confirmEmailAddr, confirmToken);
      await refreshProfile();
      showToast(
        "¡Correo verificado exitosamente!",
        "Tu identidad ha sido confirmada en SkillHub."
      );
      closeAuthModal();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Código de verificación inválido.";
      showToast("Error de verificación", message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!confirmEmailAddr) return;
    setLoading(true);
    try {
      const res = await authService.resendConfirmation(confirmEmailAddr);
      setDispatchedViaSmtp(res.sentViaSmtp);
      setDevTokenHelper(res.devToken || null);
      showToast(
        "Código reenviado",
        res.sentViaSmtp
          ? `Se envió un nuevo correo a ${confirmEmailAddr}.`
          : "Se generó un nuevo código de confirmación."
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "No se pudo reenviar el código.";
      showToast("Error", message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoParticipant = async () => {
    setLoading(true);
    try {
      await loginAsParticipantDemo();
      showToast("Sesión iniciada como Participante", "Jorge Andrés Pérez");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error en demo.";
      showToast("Error", message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoInstructor = async () => {
    setLoading(true);
    try {
      await loginAsInstructorDemo();
      showToast("Sesión iniciada como Instructor", "Andrés Felipe Mejía (Admin)");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error en demo.";
      showToast("Error", message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
    >
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col scale-100 transition-all border border-slate-100">
        {/* Header Tabs */}
        <div className="flex items-center justify-between border-b border-slate-100 p-4 bg-slate-50/50">
          {authModalTab === "login" || authModalTab === "register" ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAuthModalTab("login")}
                className={`px-4 py-2 font-label-md text-sm rounded-lg transition-all cursor-pointer ${
                  authModalTab === "login"
                    ? "bg-white text-indigo-700 shadow-sm border border-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => setAuthModalTab("register")}
                className={`px-4 py-2 font-label-md text-sm rounded-lg transition-all cursor-pointer ${
                  authModalTab === "register"
                    ? "bg-white text-indigo-700 shadow-sm border border-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Crear Cuenta
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAuthModalTab("login")}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                Volver al inicio de sesión
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={closeAuthModal}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[82vh] overflow-y-auto">
          {/* 1. LOGIN TAB */}
          {authModalTab === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">Contraseña</label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(loginEmail);
                      setAuthModalTab("forgot");
                    }}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showLoginPass ? "text" : "password"}
                    required
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPass((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    title={showLoginPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    <span className="material-symbols-outlined text-[19px]">
                      {showLoginPass ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className="text-xs font-medium text-slate-600">
                    Recordar mi sesión en este navegador (7 días)
                  </span>
                </label>
              </div>

              {/* Demo Fill Shortcuts */}
              <div className="pt-2 space-y-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleDemoParticipant}
                  className="w-full py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
                  Demo Rápido: Jorge Andrés (Participante)
                </button>
                <button
                  type="button"
                  onClick={handleDemoInstructor}
                  className="w-full py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold rounded-lg border border-amber-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-amber-600">
                    shield
                  </span>
                  Demo Rápido: Andrés Mejía (Instructor / Admin)
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50 cursor-pointer"
              >
                <span>{loading ? "Ingresando..." : "Ingresar a mi cuenta"}</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </form>
          )}

          {/* 2. REGISTER TAB */}
          {authModalTab === "register" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Ej: Sofía Rodríguez"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Correo Electrónico Real
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="tu@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Contraseña (Mín. 6 caracteres, al menos 1 número)
                </label>
                <div className="relative">
                  <input
                    type={showRegPass ? "text" : "password"}
                    required
                    minLength={6}
                    value={regPass}
                    onChange={(e) => setRegPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPass((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    title={showRegPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    <span className="material-symbols-outlined text-[19px]">
                      {showRegPass ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 bg-indigo-50/70 p-3 rounded-xl border border-indigo-100 flex items-start gap-2">
                <span className="material-symbols-outlined text-[17px] text-indigo-600 shrink-0 mt-0.5">
                  mark_email_read
                </span>
                <span>
                  Al registrarte te enviaremos un correo real con el código de verificación de ASP.NET Core Identity.
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 cursor-pointer"
              >
                <span>{loading ? "Creando cuenta y enviando correo..." : "Crear cuenta y verificar correo"}</span>
                <span className="material-symbols-outlined text-[18px]">person_add</span>
              </button>
            </form>
          )}

          {/* 3. FORGOT PASSWORD TAB */}
          {authModalTab === "forgot" && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div className="space-y-1">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
                  <span className="material-symbols-outlined text-2xl">lock_reset</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">Recuperar Contraseña</h3>
                <p className="text-xs text-slate-500">
                  Ingresa el correo electrónico de tu cuenta y te enviaremos un token criptográfico de restablecimiento.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Correo Electrónico Registrado
                </label>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
                <span>{loading ? "Enviando correo..." : "Enviar Token de Recuperación"}</span>
              </button>
            </form>
          )}

          {/* 4. RESET PASSWORD TAB */}
          {authModalTab === "reset" && (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold mb-2 ${
                    dispatchedViaSmtp
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {dispatchedViaSmtp ? "mark_email_read" : "mail"}
                  </span>
                  {dispatchedViaSmtp
                    ? `Correo enviado por SMTP a ${forgotEmail}`
                    : `Token generado para ${forgotEmail}`}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Definir Nueva Contraseña
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Copia el código/token que recibiste en tu correo e ingresa tu nueva contraseña.
                </p>
              </div>

              {devTokenHelper && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">
                      Asistente Rápido de Prueba:
                    </span>
                    <button
                      type="button"
                      onClick={() => setResetToken(devTokenHelper)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] transition-colors cursor-pointer"
                    >
                      Autocompletar Token
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Token de Recuperación (enviado al correo)
                </label>
                <input
                  type="text"
                  required
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="Pega aquí el token recibido..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Nueva Contraseña (Mín. 6 caracteres)
                </label>
                <div className="relative">
                  <input
                    type={showResetPass ? "text" : "password"}
                    required
                    minLength={6}
                    value={resetNewPass}
                    onChange={(e) => setResetNewPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPass((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[19px]">
                      {showResetPass ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>{loading ? "Guardando..." : "Guardar Nueva Contraseña"}</span>
              </button>
            </form>
          )}

          {/* 5. CONFIRM EMAIL TAB */}
          {authModalTab === "confirm-email" && (
            <form onSubmit={handleConfirmEmailSubmit} className="space-y-4">
              <div>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold mb-2 ${
                    dispatchedViaSmtp
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">mark_email_read</span>
                  {dispatchedViaSmtp
                    ? `Correo real enviado a ${confirmEmailAddr}`
                    : `Verificación para ${confirmEmailAddr}`}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Verifica tu Correo Electrónico
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Revisa tu bandeja de entrada (o carpeta de Spam) y pega el token de confirmación que te enviamos desde SkillHub.
                </p>
              </div>

              {devTokenHelper && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 text-xs">
                  <span className="text-slate-600 font-medium">
                    ¿Quieres autocompletar el código ahora?
                  </span>
                  <button
                    type="button"
                    onClick={() => setConfirmToken(devTokenHelper)}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] shrink-0 cursor-pointer"
                  >
                    Autocompletar Token
                  </button>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Código / Token de Confirmación
                </label>
                <input
                  type="text"
                  required
                  value={confirmToken}
                  onChange={(e) => setConfirmToken(e.target.value)}
                  placeholder="Pega aquí el token enviado a tu correo..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>{loading ? "Verificando..." : "Confirmar Correo Electrónico"}</span>
                </button>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleResendConfirmation}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                  >
                    Reenviar correo de confirmación
                  </button>
                  <button
                    type="button"
                    onClick={closeAuthModal}
                    className="text-xs font-medium text-slate-500 hover:text-slate-700 cursor-pointer"
                  >
                    Verificar más tarde
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
