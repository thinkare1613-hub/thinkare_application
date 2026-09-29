import type { FormEvent } from "react";
import { Check, Eye, LockKeyhole, Mail, Phone, Sparkles, ShieldCheck } from "lucide-react";

type LoginPageProps = {
  authMode: "clinic_admin" | "patient";
  email: string;
  mobile: string;
  password: string;
  patientName: string;
  isPatientRegistration: boolean;
  message: string;
  onAuthModeChange: (mode: "clinic_admin" | "patient") => void;
  onEmailChange: (value: string) => void;
  onMobileChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onPatientNameChange: (value: string) => void;
  onPatientRegistrationChange: (value: boolean) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCreateClinicClick: () => void;
};

export function LoginPage({
  authMode,
  email,
  mobile,
  password,
  patientName,
  isPatientRegistration,
  message,
  onAuthModeChange,
  onEmailChange,
  onMobileChange,
  onPasswordChange,
  onPatientNameChange,
  onPatientRegistrationChange,
  onSubmit,
  onCreateClinicClick,
}: LoginPageProps) {
  return (
    <main className="min-h-screen overflow-hidden bg-[#e8f1ee] text-[#17362c]">
      <section className="grid min-h-screen w-full lg:grid-cols-[1.08fr_0.92fr]">
        <div className="relative isolate overflow-hidden bg-[linear-gradient(160deg,#19b3a2_0%,#0e6f74_56%,#0e3f53_100%)] px-6 pb-8 pt-8 text-white sm:px-12 lg:px-14 lg:pb-12 lg:pt-12">
          <div className="absolute inset-0 opacity-40 [background:radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_42%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.12),transparent_36%)]" />
          <div className="relative flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/30 bg-white/10 shadow-[0_14px_40px_rgba(5,34,41,0.2)] backdrop-blur-sm">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </div>
            <span className="text-[1.8rem] font-bold tracking-[-0.04em] sm:text-[2.1rem]">Thinkare</span>
          </div>

          <div className="relative mt-10 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/95 shadow-[0_10px_30px_rgba(6,27,32,0.18)] backdrop-blur-sm sm:mt-16 sm:text-lg">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Multi-tenant Healthcare Platform
          </div>

          <h1 className="relative mt-8 max-w-[620px] text-[2.8rem] font-bold leading-[0.96] tracking-[-0.06em] text-white sm:mt-12 sm:text-[4.2rem]">
            One platform for
            <span className="mt-2 block">many clinics</span>
          </h1>

          <p className="relative mt-6 max-w-[620px] text-base leading-[1.6] text-white/90 sm:mt-8 sm:text-[1.25rem]">
            Clinic owners can create their own workspace, upload a logo, manage doctors and patients, and keep data isolated inside their own tenant.
          </p>

          <div className="relative mt-14 grid max-w-[560px] grid-cols-3 gap-4 text-white">
            <div className="rounded-3xl border border-white/15 bg-white/8 p-4 shadow-[0_14px_35px_rgba(6,27,32,0.12)] backdrop-blur-sm">
              <div className="text-[3rem] font-bold tracking-[-0.06em]">100+</div>
              <div className="mt-1 text-[1.03rem] text-white/85">Clinic Workspaces</div>
            </div>
            <div className="rounded-3xl border border-white/15 bg-white/8 p-4 shadow-[0_14px_35px_rgba(6,27,32,0.12)] backdrop-blur-sm">
              <div className="text-[3rem] font-bold tracking-[-0.06em]">50K+</div>
              <div className="mt-1 text-[1.03rem] text-white/85">Patients Managed</div>
            </div>
            <div className="rounded-3xl border border-white/15 bg-white/8 p-4 shadow-[0_14px_35px_rgba(6,27,32,0.12)] backdrop-blur-sm">
              <div className="text-[3rem] font-bold tracking-[-0.06em]">24/7</div>
              <div className="mt-1 text-[1.03rem] text-white/85">Operational Access</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(25,179,162,0.08),transparent_30%),linear-gradient(180deg,#f4f7f5_0%,#eef4f1_100%)] px-6 py-10 sm:px-10 lg:px-12">
          <div className="w-full max-w-[560px]">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#cfe1d7] bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#19b3a2] shadow-[0_8px_24px_rgba(18,58,49,0.05)]">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Welcome back
            </div>
            <h2 className="mt-4 text-[3.2rem] font-bold tracking-[-0.06em] text-[#1d2d2a]">Welcome back</h2>
            <p className="mt-3 text-[1.15rem] text-[#5c6664]">{authMode === "patient" ? "Create or sign in to your patient account for this clinic" : "Sign in to your clinic dashboard"}</p>

            <div className="mt-6 flex rounded-2xl border border-[#d8e2d9] bg-white p-1.5 shadow-[0_16px_35px_rgba(18,58,49,0.05)]">
              {(["clinic_admin", "patient"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onAuthModeChange(mode)}
                  className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition ${authMode === mode ? "bg-[linear-gradient(135deg,#19b3a2_0%,#15a08e_100%)] text-white shadow-[0_10px_20px_rgba(25,179,162,0.24)]" : "text-[#587068]"}`}
                >
                  {mode === "clinic_admin" ? "Clinic admin" : "Patient"}
                </button>
              ))}
            </div>

            <form onSubmit={onSubmit} className="mt-8">
              {authMode === "patient" && isPatientRegistration && (
                <label className="block text-[1.05rem] font-medium text-[#2b3d3a]">
                  Full name
                  <input value={patientName} onChange={(event) => onPatientNameChange(event.target.value)} required className="mt-2 w-full rounded-xl border border-[#d6e0db] bg-[#f9fbfa] px-4 py-3 text-[1.05rem] text-[#1d2d2a] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] focus:outline-none" />
                </label>
              )}
              {authMode === "clinic_admin" && (
                <label className="block text-[1.05rem] font-medium text-[#2b3d3a]">
                  Email address
                  <div className="mt-2 flex items-center gap-3 rounded-xl border border-[#d6e0db] bg-[#f9fbfa] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
                    <Mail className="h-5 w-5 shrink-0 text-[#5f6e6a]" aria-hidden="true" />
                    <input
                      value={email}
                      onChange={(event) => onEmailChange(event.target.value)}
                      required
                      type="email"
                      placeholder="clinic@domain.com"
                      className="w-full border-0 bg-transparent text-[1.05rem] text-[#1d2d2a] placeholder:text-[#7d8a86] focus:outline-none"
                    />
                  </div>
                </label>
              )}
              {authMode === "patient" && (
                <label className="block text-[1.05rem] font-medium text-[#2b3d3a]">
                  Mobile number
                  <div className="mt-2 flex items-center gap-3 rounded-xl border border-[#d6e0db] bg-[#f9fbfa] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
                    <Phone className="h-5 w-5 shrink-0 text-[#5f6e6a]" aria-hidden="true" />
                    <input
                      value={mobile}
                      onChange={(event) => onMobileChange(event.target.value)}
                      required
                      type="tel"
                      placeholder="+91 98765 43210"
                      className="w-full border-0 bg-transparent text-[1.05rem] text-[#1d2d2a] placeholder:text-[#7d8a86] focus:outline-none"
                    />
                  </div>
                </label>
              )}

              {authMode === "clinic_admin" || isPatientRegistration ? (
                <div className="mt-7">
                  <div className="flex items-center justify-between">
                    <label className="text-[1.05rem] font-medium text-[#2b3d3a]">{authMode === "clinic_admin" ? "Password" : "Optional password"}</label>
                    {authMode === "clinic_admin" ? (
                      <button type="button" className="text-[1.02rem] font-medium text-[#19b3a2] hover:text-[#118f88]">
                        Forgot password?
                      </button>
                    ) : null}
                  </div>

                  <div className="mt-2 flex items-center gap-3 rounded-xl border border-[#d6e0db] bg-[#f9fbfa] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
                    <LockKeyhole className="h-5 w-5 shrink-0 text-[#5f6e6a]" aria-hidden="true" />
                    <input
                      value={password}
                      onChange={(event) => onPasswordChange(event.target.value)}
                      required={authMode === "clinic_admin"}
                      type="password"
                      placeholder={authMode === "clinic_admin" ? "Enter your password" : "Leave blank to continue without a password"}
                      className="w-full border-0 bg-transparent text-[1.05rem] text-[#1d2d2a] placeholder:text-[#7d8a86] focus:outline-none"
                    />
                    {authMode === "clinic_admin" ? (
                      <Eye className="h-5 w-5 shrink-0 text-[#5f6e6a]" aria-hidden="true" />
                    ) : null}
                  </div>
                </div>
              ) : null}

              <label className="mt-6 flex items-center gap-3 text-[1rem] text-[#2b3d3a]">
                <input type="checkbox" className="h-4 w-4 rounded border-[#cbd6d2] accent-[#19b3a2]" />
                Remember me for 30 days
              </label>

              <button
                type="submit"
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#19b3a2_0%,#119887_100%)] py-4 text-[1.1rem] font-bold text-white shadow-[0_16px_30px_rgba(25,179,162,0.34)] transition hover:translate-y-[-1px] hover:shadow-[0_18px_34px_rgba(25,179,162,0.38)]"
              >
                <Check className="h-5 w-5" aria-hidden="true" />
                {authMode === "patient" ? isPatientRegistration ? "Create patient account" : "Sign In as patient" : "Sign In as admin"}
              </button>
            </form>

            {authMode === "patient" && (
              <button type="button" onClick={() => onPatientRegistrationChange(!isPatientRegistration)} className="mt-5 text-sm font-semibold text-[#19b3a2] hover:text-[#118f88]">
                {isPatientRegistration ? "Already have an account? Sign in" : "New patient? Create an account"}
              </button>
            )}

            {message && (
              <p className="mt-6 rounded-2xl border border-[#9bc7af] bg-[linear-gradient(135deg,#eaf6ee_0%,#dff2e7_100%)] px-4 py-3 text-sm text-[#0d523e] shadow-[0_12px_24px_rgba(18,58,49,0.06)]">
                {message}
              </p>
            )}

            <p className="mt-8 text-center text-[1.03rem] text-[#5c6664]">
              Don&apos;t have a clinic account?{' '}
              <button
                type="button"
                onClick={onCreateClinicClick}
                className="font-semibold text-[#19b3a2] hover:text-[#118f88]"
              >
                Create clinic account
              </button>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
