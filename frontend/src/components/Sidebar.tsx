export type NavItem = {
  key: string;
  label: string;
  icon: string;
};

const navItems: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: "▣" },
  { key: "appointments", label: "Appointments", icon: "◫" },
  { key: "patients", label: "Patients", icon: "◌" },
  { key: "doctors", label: "Doctors", icon: "◎" },
  { key: "clinics", label: "Clinics", icon: "▤" },
  { key: "availability", label: "Availability", icon: "⏱" },
  { key: "billing", label: "Billing", icon: "◍" },
  { key: "settings", label: "Settings", icon: "⚙" },
];

type SidebarProps = {
  activePage: string;
  onSelectPage: (page: string) => void;
};

export function Sidebar({ activePage, onSelectPage }: SidebarProps) {
  return (
    <aside className="flex w-full max-w-[280px] flex-col border-r border-[#d8e2d9] bg-[#fcfdf9] p-5">
      <div className="flex items-center gap-3 border-b border-[#e4ebe5] pb-5">
        <div className="grid size-10 place-items-center rounded-xl bg-[#19b3a2] text-lg font-bold text-white">T</div>
        <div>
          <p className="font-serif text-2xl text-[#17362c]">Thinkare</p>
          <p className="text-[10px] uppercase tracking-[.18em] text-[#587068]">care, made clear</p>
        </div>
      </div>

      <nav className="mt-6 space-y-2">
        {navItems.map((item) => {
          const isActive = item.key === activePage;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelectPage(item.key)}
              className={[
                "flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-semibold transition",
                isActive ? "bg-[#19b3a2] text-white shadow-sm" : "text-[#17362c] hover:bg-[#edf4f0]",
              ].join(" ")}
            >
              <span className="flex items-center gap-3">
                <span className={isActive ? "text-white" : "text-[#19b3a2]"}>{item.icon}</span>
                {item.label}
              </span>
              {item.key === "appointments" && <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">12</span>}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl border border-[#d8e2d9] bg-[#f3f8f4] p-4">
        <p className="text-xs font-bold uppercase tracking-[.12em] text-[#19b3a2]">Support</p>
        <p className="mt-2 text-sm text-[#587068]">Need help with clinic operations?</p>
        <button className="mt-3 rounded-xl bg-[#19b3a2] px-3 py-2 text-sm font-semibold text-white">Contact team</button>
      </div>
    </aside>
  );
}
