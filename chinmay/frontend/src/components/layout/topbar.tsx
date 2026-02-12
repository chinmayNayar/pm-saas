import { OrgSwitcher } from "./org-switcher";
import { useAuthStore } from "../../store/authStore";

export function Topbar() {
  const user = useAuthStore((s) => s.user);

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-4">
      <OrgSwitcher />
      <div className="text-xs text-slate-300">
        {user ? user.email : "Guest"}
      </div>
    </header>
  );
}

