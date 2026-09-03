import { useState } from "react";

export type NavItem = {
  key: string;
  label: string;
  icon: string;
};

const clinicNavItems: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: "▣" },
  { key: "appointments", label: "Appointments", icon: "◫" },
  { key: "patients", label: "Patients", icon: "◌" },
  { key: "doctors", label: "Doctors", icon: "◎" },
  { key: "clinics", label: "Clinics", icon: "▤" },
  { key: "availability", label: "Availability", icon: "⏱" },
  { key: "billing", label: "Billing", icon: "◍" },
];

type SidebarProps = {
  activePage: string;
  onSelectPage: (page: string) => void;
  navItems?: NavItem[];
  omitSettings?: boolean;
  brandName?: string;
};

export function Sidebar({ activePage, onSelectPage, navItems = clinicNavItems, omitSettings = false, brandName = "Thinkare" }: SidebarProps) {
  const visibleNavItems = omitSettings ? navItems.filter((item) => item.key !== "settings") : navItems;
  const resolvedBrand = brandName?.trim() || "Thinkare";
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <aside className="flex w-full flex-col border-b border-[#d8e2d9] bg-[#fcfdf9] p-4 sm:p-5 lg:max-w-[280px] lg:border-b-0 lg:border-r">
      <div className="flex items-center gap-3 border-b border-[#e4ebe5] pb-4 lg:pb-5">
        <div className="grid size-10 place-items-center rounded-xl bg-[#19b3a2] text-lg font-bold text-white">
          {resolvedBrand.slice(0, 1).toUpperCase() || "T"}
        </div>
        <div>
          <p className="font-serif text-xl text-[#17362c] sm:text-2xl">{resolvedBrand}</p>
          <p className="text-[10px] uppercase tracking-[.18em] text-[#587068]">care, made clear</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
        aria-expanded={isMenuOpen}
        aria-controls="sidebar-navigation"
        className="mt-4 flex w-full items-center justify-between rounded-xl border border-[#d8e2d9] bg-white px-4 py-3 text-left text-sm font-semibold text-[#17362c] lg:hidden"
      >
        <span>Menu</span>
        <span className="text-lg leading-none text-[#19b3a2]" aria-hidden="true">
          {isMenuOpen ? "−" : "+"}
        </span>
      </button>

      <nav id="sidebar-navigation" className={`${isMenuOpen ? "grid" : "hidden"} mt-2 gap-2 lg:mt-6 lg:grid`}>
        {visibleNavItems.map((item) => {
          const isActive = item.key === activePage;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                onSelectPage(item.key);
                setIsMenuOpen(false);
              }}
              className={[
                "flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-semibold transition",
                isActive ? "bg-[#19b3a2] text-white shadow-sm" : "text-[#17362c] hover:bg-[#edf4f0]",
              ].join(" ")}
            >
              <span className="flex items-center gap-3">
                <span className={isActive ? "text-white" : "text-[#19b3a2]"}>{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </span>
              {item.key === "appointments" && <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">12</span>}
            </button>
          );
        })}
      </nav>

      <div className="mt-5 rounded-2xl border border-[#d8e2d9] bg-[#f3f8f4] p-4 lg:mt-auto">
        <p className="text-xs font-bold uppercase tracking-[.12em] text-[#19b3a2]">Support</p>
        <p className="mt-2 text-sm text-[#587068]">Need help with clinic operations?</p>
        <button className="mt-3 rounded-xl bg-[#19b3a2] px-3 py-2 text-sm font-semibold text-white">Contact team</button>
      </div>
    </aside>
  );
}
