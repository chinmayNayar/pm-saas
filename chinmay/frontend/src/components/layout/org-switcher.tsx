"use client";

import { useOrgStore } from "../../store/orgStore";

export function OrgSwitcher() {
  const { orgs, currentOrg, setCurrentOrg } = useOrgStore();

  if (!currentOrg) {
    return <span className="text-xs text-slate-400">No organization</span>;
  }

  return (
    <div className="relative inline-block text-left">
      <select
        className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
        value={currentOrg.id}
        onChange={(e) => {
          const org = orgs.find((o) => o.id === e.target.value) || null;
          setCurrentOrg(org);
        }}
      >
        {orgs.map((org) => (
          <option key={org.id} value={org.id}>
            {org.name}
          </option>
        ))}
      </select>
    </div>
  );
}

