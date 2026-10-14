import { Bell, ChevronDown, LogOut, Search } from "lucide-react";

type HeaderProps = {
  title: string;
  subtitle: string;
  userName?: string;
  userRole?: string;
  brandName?: string;
  onSignOut?: () => void;
};

export function Header({ title, subtitle, userName = "Admin", userRole = "Clinic Ops", brandName: _brandName = "Thinkare", onSignOut }: HeaderProps) {
  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "AD";

  return (
    <header className="border-b border-[#e2ebe4] bg-[rgba(252,253,249,0.9)] px-5 py-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#17362c]">{title}</p>
          <p className="mt-1 text-sm text-[#587068]">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="hidden min-w-[320px] items-center gap-3 rounded-full border border-[#dfe8e2] bg-white px-4 py-2.5 text-sm text-[#7b8a84] shadow-[0_8px_20px_rgba(19,51,43,0.04)] sm:flex">
            <Search className="size-4 text-[#9aa8a3]" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search patients, doctors, or appointments..."
              className="w-full border-0 bg-transparent text-sm text-[#17362c] placeholder:text-[#9aa8a3] outline-none"
            />
          </label>

          <button type="button" className="relative grid size-11 place-items-center rounded-full border border-[#dfe8e2] bg-white text-[#17362c] shadow-[0_8px_20px_rgba(19,51,43,0.04)]">
            <Bell className="size-4" aria-hidden="true" />
            <span className="absolute right-2 top-2 size-2 rounded-full bg-[#ff5a65] ring-2 ring-white" />
          </button>

          <button
            type="button"
            className="flex items-center gap-3 rounded-full border border-[#dfe8e2] bg-white px-2 py-1.5 pr-3 shadow-[0_8px_20px_rgba(19,51,43,0.04)]"
          >
            <span className="grid size-9 place-items-center rounded-full bg-[linear-gradient(135deg,#19b3a2_0%,#15a08e_100%)] text-sm font-bold text-white">
              {initials}
            </span>
            <div className="text-left leading-tight">
              <p className="text-sm font-semibold text-[#17362c]">{userName}</p>
              <p className="text-xs text-[#587068]">{userRole}</p>
            </div>
            <ChevronDown className="size-4 text-[#9aa8a3]" aria-hidden="true" />
          </button>

          {onSignOut ? (
            <button
              type="button"
              onClick={onSignOut}
              className="grid size-11 place-items-center rounded-full border border-[#dfe8e2] bg-white text-[#587068] shadow-[0_8px_20px_rgba(19,51,43,0.04)] transition hover:border-[#19b3a2] hover:text-[#19b3a2]"
              title="Sign out"
            >
              <LogOut className="size-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
