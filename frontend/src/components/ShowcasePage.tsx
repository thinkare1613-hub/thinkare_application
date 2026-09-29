import { BadgeCheck, CreditCard, Sparkles, Stethoscope, Users } from "lucide-react";

type ShowcaseCard = {
  title: string;
  role: string;
  note: string;
  accent: string;
  points: string[];
};

const showcaseCards: ShowcaseCard[] = [
  {
    title: "Patient journey",
    role: "Patient",
    note: "A calmer entry point with live AI guidance for booking, reminders, and records.",
    accent: "from-[#eaf9f7] to-[#f7fbf9]",
    points: ["Clinic-scoped sign-in", "AI next best action", "Appointment booking"],
  },
  {
    title: "Doctor workflow",
    role: "Doctor",
    note: "Daily schedule, patient context, and follow-up decisions stay visible together.",
    accent: "from-[#f5f7ff] to-[#eef4ff]",
    points: ["Live schedule", "Patient context", "Visit follow-up"],
  },
  {
    title: "Clinic operations",
    role: "Clinic Admin",
    note: "A sharper operations shell for teams, doctors, patients, and billing oversight.",
    accent: "from-[#fff9ef] to-[#f7fbf9]",
    points: ["Doctor management", "Patient management", "Appointment oversight"],
  },
  {
    title: "Platform control",
    role: "Platform Admin",
    note: "A central panel for platform monitoring, clinic status, and subscription health.",
    accent: "from-[#f4f7f5] to-[#eef6f2]",
    points: ["Clinic monitoring", "Payments", "Status escalation"],
  },
];

export function ShowcasePage() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-8 sm:py-10">
      <div className="overflow-hidden rounded-[2rem] border border-[#d8e2d9] bg-[linear-gradient(160deg,#f8fcfa_0%,#eef7f2_56%,#f6f4ed_100%)] shadow-[0_18px_50px_rgba(20,108,82,0.08)]">
        <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#cfe1d7] bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#19b3a2] shadow-[0_8px_24px_rgba(18,58,49,0.05)]">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              AI-native showcase
            </div>

            <h1 className="mt-5 max-w-[12ch] font-serif text-4xl leading-[0.96] tracking-[-0.05em] text-[#17362c] sm:text-5xl lg:text-[4.4rem]">
              Care, made clear, across every screen.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-[#587068] sm:text-lg">
              The product now presents a unified AI-native experience: every role sees the next best action, the context behind it, and the safest next step before anything happens.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                { label: "Screens", value: "Live + concept" },
                { label: "Roles", value: "Patient · Doctor · Admin · Platform" },
                { label: "AI", value: "Context, ranking, approval" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-[#dfe9e1] bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-[.12em] text-[#19b3a2]">{item.label}</p>
                  <p className="mt-2 text-sm font-semibold text-[#17362c]">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                "AI shows what it sees before any action",
                "Patient, doctor, and admin flows share the same design language",
                "Approval remains explicit for sensitive actions",
                "Mobile and web now follow the same clinic context",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-[#dfe9e1] bg-white/90 p-4 text-sm text-[#17362c] shadow-[0_8px_24px_rgba(18,58,49,0.05)]">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-[#d8e2d9] bg-white/70 p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-10">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: BadgeCheck, label: "Patient", value: "AI booking" },
                { icon: Stethoscope, label: "Doctor", value: "Schedule + context" },
                { icon: Users, label: "Clinic", value: "Operations" },
                { icon: CreditCard, label: "Platform", value: "Payments" },
              ].map((item) => (
                <div key={item.label} className="rounded-3xl border border-[#dfe9e1] bg-[linear-gradient(135deg,#ffffff_0%,#f7fbf9_100%)] p-4">
                  <item.icon className="h-5 w-5 text-[#19b3a2]" />
                  <p className="mt-4 text-xs font-bold uppercase tracking-[.12em] text-[#19b3a2]">{item.label}</p>
                  <p className="mt-2 text-lg font-semibold text-[#17362c]">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-3xl border border-[#dfe9e1] bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-[.12em] text-[#19b3a2]">Design direction</p>
              <p className="mt-3 text-sm leading-6 text-[#587068]">
                The showcase leans into a calmer, more editorial layout with stronger hierarchy, softer surfaces, and AI cards that explain the reasoning before the action.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-[#17362c]">
                {["Fraunces headlines", "Fresh neutrals", "AI-native cards", "Review-first actions"].map((item) => (
                  <span key={item} className="rounded-full bg-[#f5faf7] px-3 py-1">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#d8e2d9] p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[.12em] text-[#19b3a2]">Role-based view</p>
              <h2 className="mt-2 font-serif text-3xl tracking-[-0.04em] text-[#17362c]">Four roles, one system</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-[#587068]">
              The screen set is designed as a showcase of the full workflow, not just isolated pages, so each role feels connected to the same product.
            </p>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {showcaseCards.map((card) => (
              <article key={card.title} className={`rounded-3xl border border-[#dfe9e1] bg-gradient-to-br ${card.accent} p-5 shadow-[0_10px_30px_rgba(20,108,82,0.06)]`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[.12em] text-[#19b3a2]">{card.role}</p>
                    <h3 className="mt-2 font-serif text-2xl tracking-[-0.03em] text-[#17362c]">{card.title}</h3>
                  </div>
                  <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#17362c]">Showcase</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-[#587068]">{card.note}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {card.points.map((point) => (
                    <span key={point} className="rounded-full border border-[#dfe9e1] bg-white/90 px-3 py-1 text-xs font-medium text-[#17362c]">
                      {point}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}