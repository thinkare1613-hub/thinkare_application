export function Footer() {
  return (
    <footer className="border-t border-[#d8e2d9] bg-[#fcfdf9] px-6 py-4 text-sm text-[#587068]">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 Thinkare. Clinic operations system.</p>
        <div className="flex items-center gap-5">
          <span>Privacy</span>
          <span>Terms</span>
          <span>Support</span>
        </div>
      </div>
    </footer>
  );
}
