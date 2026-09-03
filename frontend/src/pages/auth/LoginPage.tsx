type LoginPageProps = {
  authMode: "clinic_admin" | "doctor" | "patient";
  email: string;
  mobile: string;
  otp: string;
  password: string;
  message: string;
  onAuthModeChange: (mode: "clinic_admin" | "doctor" | "patient") => void;
  onEmailChange: (value: string) => void;
  onMobileChange: (value: string) => void;
  onOtpChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCreateClinicClick: () => void;
};

export function LoginPage({
  authMode,
  email,
  mobile,
  otp,
  password,
  message,
  onAuthModeChange,
  onEmailChange,
  onMobileChange,
  onOtpChange,
  onPasswordChange,
  onSubmit,
  onCreateClinicClick,
}: LoginPageProps) {
  return (
    <main className="min-h-screen bg-[#e8f1ee] text-[#17362c]">
      <section className="grid min-h-screen w-full lg:grid-cols-[1.08fr_0.92fr]">
        <div className="bg-[#19b3a2] px-6 pb-8 pt-8 text-white sm:px-12 lg:px-14 lg:pb-12 lg:pt-12">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-white/10 backdrop-blur-sm">
              <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-[1.8]" aria-hidden="true">
                <path d="M12 21c4.5-2.7 7.5-6.2 7.5-10.8A4.7 4.7 0 0 0 14.8 5.5c-1.1 0-2.1.4-2.9 1.2A4.1 4.1 0 0 0 9 5.5 4.7 4.7 0 0 0 4.5 10.2C4.5 14.8 7.5 18.3 12 21Z" />
                <path d="M10 10.5c.6-1 1.5-1.5 2.5-1.5 1.1 0 2 .6 2.5 1.5" />
                <path d="M9 16.5h6" />
              </svg>
            </div>
            <span className="text-[1.8rem] font-bold tracking-[-0.04em] sm:text-[2.1rem]">Thinkare</span>
          </div>

          <div className="mt-10 inline-flex items-center rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white/95 shadow-sm backdrop-blur-sm sm:mt-16 sm:text-lg">
            <span className="mr-3 inline-block h-2.5 w-2.5 rounded-full bg-white" />
            Multi-tenant Healthcare Platform
          </div>

          <h1 className="mt-8 max-w-[620px] text-[2.8rem] font-bold leading-[0.96] tracking-[-0.06em] text-white sm:mt-12 sm:text-[4.2rem]">
            One platform for
            <span className="mt-2 block">many clinics</span>
          </h1>

          <p className="mt-6 max-w-[620px] text-base leading-[1.6] text-white/90 sm:mt-8 sm:text-[1.25rem]">
            Clinic owners can create their own workspace, upload a logo, manage doctors and patients, and keep data isolated inside their own tenant.
          </p>

          <div className="mt-14 grid max-w-[560px] grid-cols-3 gap-4 text-white">
            <div>
              <div className="text-[3rem] font-bold tracking-[-0.06em]">100+</div>
              <div className="mt-1 text-[1.03rem] text-white/85">Clinic Workspaces</div>
            </div>
            <div>
              <div className="text-[3rem] font-bold tracking-[-0.06em]">50K+</div>
              <div className="mt-1 text-[1.03rem] text-white/85">Patients Managed</div>
            </div>
            <div>
              <div className="text-[3rem] font-bold tracking-[-0.06em]">24/7</div>
              <div className="mt-1 text-[1.03rem] text-white/85">Operational Access</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center bg-[#f2f5f3] px-6 py-10 sm:px-10 lg:px-12">
          <div className="w-full max-w-[560px]">
            <h2 className="text-[3.2rem] font-bold tracking-[-0.06em] text-[#1d2d2a]">Welcome back</h2>
            <p className="mt-3 text-[1.15rem] text-[#5c6664]">{authMode === "patient" ? "Sign in with mobile and OTP for your clinic" : authMode === "doctor" ? "Sign in to your doctor dashboard" : "Sign in to your clinic dashboard"}</p>

            <div className="mt-6 flex rounded-2xl border border-[#d8e2d9] bg-white p-1.5">
              {(["clinic_admin", "doctor", "patient"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onAuthModeChange(mode)}
                  className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition ${authMode === mode ? "bg-[#19b3a2] text-white shadow" : "text-[#587068]"}`}
                >
                  {mode === "clinic_admin" ? "Clinic admin" : mode === "doctor" ? "Doctor" : "Patient"}
                </button>
              ))}
            </div>

            <form onSubmit={onSubmit} className="mt-8">
              {authMode !== "patient" ? (
                <label className="block text-[1.05rem] font-medium text-[#2b3d3a]">
                  Email address
                  <div className="mt-2 flex items-center gap-3 rounded-xl border border-[#d6e0db] bg-[#f9fbfa] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-[#5f6e6a] stroke-[1.8]" aria-hidden="true">
                      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z" />
                      <path d="m5 7 7 5 7-5" />
                    </svg>
                    <input
                      value={email}
                      onChange={(event) => onEmailChange(event.target.value)}
                      required
                      type="email"
                      placeholder={authMode === "doctor" ? "doctor@clinic.com" : "clinic@domain.com"}
                      className="w-full border-0 bg-transparent text-[1.05rem] text-[#1d2d2a] placeholder:text-[#7d8a86] focus:outline-none"
                    />
                  </div>
                </label>
              ) : (
                <label className="block text-[1.05rem] font-medium text-[#2b3d3a]">
                  Mobile number
                  <div className="mt-2 flex items-center gap-3 rounded-xl border border-[#d6e0db] bg-[#f9fbfa] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-[#5f6e6a] stroke-[1.8]" aria-hidden="true">
                      <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
                      <path d="M11 18.5h2" />
                    </svg>
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

              {authMode === "patient" && (
                <div className="mt-7">
                  <label className="block text-[1.05rem] font-medium text-[#2b3d3a]">
                    OTP
                    <div className="mt-2 flex items-center gap-3 rounded-xl border border-[#d6e0db] bg-[#f9fbfa] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-[#5f6e6a] stroke-[1.8]" aria-hidden="true">
                        <path d="M7 10V8a5 5 0 0 1 10 0v2" />
                        <rect x="5" y="10" width="14" height="9" rx="2" />
                      </svg>
                      <input
                        value={otp}
                        onChange={(event) => onOtpChange(event.target.value.replace(/\D/g, "").slice(0, 6))}
                        required
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="123456"
                        className="w-full border-0 bg-transparent text-[1.05rem] text-[#1d2d2a] placeholder:text-[#7d8a86] focus:outline-none"
                      />
                    </div>
                  </label>
                </div>
              )}

              {authMode !== "patient" && (
                <div className="mt-7">
                  <div className="flex items-center justify-between">
                    <label className="text-[1.05rem] font-medium text-[#2b3d3a]">Password</label>
                    <button type="button" className="text-[1.02rem] font-medium text-[#19b3a2] hover:text-[#118f88]">
                      Forgot password?
                    </button>
                  </div>

                  <div className="mt-2 flex items-center gap-3 rounded-xl border border-[#d6e0db] bg-[#f9fbfa] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-[#5f6e6a] stroke-[1.8]" aria-hidden="true">
                      <path d="M7 10V8a5 5 0 0 1 10 0v2" />
                      <rect x="5" y="10" width="14" height="9" rx="2" />
                    </svg>
                    <input
                      value={password}
                      onChange={(event) => onPasswordChange(event.target.value)}
                      required
                      type="password"
                      placeholder={authMode === "doctor" ? "Enter your password" : "Enter your password"}
                      className="w-full border-0 bg-transparent text-[1.05rem] text-[#1d2d2a] placeholder:text-[#7d8a86] focus:outline-none"
                    />
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-[#5f6e6a] stroke-[1.8]" aria-hidden="true">
                      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </div>
                </div>
              )}

              <label className="mt-6 flex items-center gap-3 text-[1rem] text-[#2b3d3a]">
                <input type="checkbox" className="h-4 w-4 rounded border-[#cbd6d2] accent-[#19b3a2]" />
                Remember me for 30 days
              </label>

              <button
                type="submit"
                className="mt-8 w-full rounded-xl bg-[#19b3a2] py-4 text-[1.1rem] font-bold text-white shadow-[0_12px_25px_rgba(25,179,162,0.28)] hover:bg-[#14a191]"
              >
                {authMode === "patient" ? "Verify mobile & OTP" : authMode === "doctor" ? "Sign In as doctor" : "Sign In as admin"}
              </button>
            </form>

            {message && (
              <p className="mt-6 rounded-xl border border-[#9bc7af] bg-[#e4f1e8] px-4 py-3 text-sm text-[#0d523e]">
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
