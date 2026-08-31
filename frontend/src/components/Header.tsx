type HeaderProps = {
  title: string;
  subtitle: string;
  userName?: string;
  userRole?: string;
  brandName?: string;
  onSignOut?: () => void;
};

export function Header({ title, subtitle, userName = "Admin", userRole = "Clinic Ops", brandName = "Thinkare", onSignOut }: HeaderProps) {
  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "AD";

  return (
    <header className="border-b border-[#d8e2d9] bg-[#fcfdf9] px-6 py-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[#19b3a2]">{brandName}</p>
          <h1 className="mt-1 font-serif text-3xl text-[#17362c]">{title}</h1>
          <p className="mt-1 text-sm text-[#587068]">{subtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden rounded-xl border border-[#d8e2d9] bg-white px-3 py-2 text-sm text-[#587068] sm:block">
            Search patients or doctors
          </div>
          <button type="button" className="grid size-10 place-items-center rounded-full border border-[#d8e2d9] bg-white text-lg text-[#19b3a2]">
            🔔
          </button>
          <div className="flex items-center gap-3 rounded-full border border-[#d8e2d9] bg-white px-2 py-1.5">
            <span className="grid size-8 place-items-center rounded-full bg-[#19b3a2] text-[10px] font-bold text-white">{initials}</span>
            <div className="text-left leading-tight">
              <p className="text-sm font-semibold text-[#17362c]">{userName}</p>
              <p className="text-[10px] uppercase tracking-[.12em] text-[#587068]">{userRole}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onSignOut}
            className="rounded-xl border border-[#c7d5ca] bg-white px-3 py-2 text-sm font-semibold text-[#17362c] transition hover:border-[#19b3a2] hover:text-[#19b3a2]"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
