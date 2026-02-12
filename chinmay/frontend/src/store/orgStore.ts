import { create } from "zustand";

export type Org = {
  id: string;
  name: string;
  slug: string;
};

type OrgState = {
  orgs: Org[];
  currentOrg: Org | null;
  setOrgs: (orgs: Org[]) => void;
  setCurrentOrg: (org: Org | null) => void;
};

export const useOrgStore = create<OrgState>((set) => ({
  orgs: [],
  currentOrg: null,
  setOrgs: (orgs) => set({ orgs }),
  setCurrentOrg: (currentOrg) => set({ currentOrg })
}));

