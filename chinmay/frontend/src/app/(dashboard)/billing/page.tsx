"use client";

import { useState } from "react";
import { axiosClient } from "../../../lib/axiosClient";
import { getStripe } from "../../../lib/stripe";
import { useOrgStore } from "../../../store/orgStore";

const plans = [
  { id: "free", name: "Free", description: "Basic features", price: "$0" },
  { id: "pro", name: "Pro", description: "Advanced features", price: "$12 / user / mo" },
  { id: "enterprise", name: "Enterprise", description: "Custom & SSO", price: "Contact us" }
];

export default function BillingPage() {
  const { currentOrg } = useOrgStore();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  async function startCheckout(planId: string) {
    if (!currentOrg) return;
    setLoadingPlan(planId);
    try {
      const res = await axiosClient.post(
        "/billing/checkout-session",
        {
          planId,
          successUrl: window.location.origin + "/dashboard?billing=success",
          cancelUrl: window.location.href
        },
        { headers: { "x-org-id": currentOrg.id } }
      );
      const stripe = await getStripe();
      if (stripe && res.data.data.url) {
        window.location.href = res.data.data.url;
      }
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {plans.map((p) => (
        <div key={p.id} className="rounded-lg bg-slate-900 p-4 flex flex-col">
          <h3 className="font-semibold mb-1">{p.name}</h3>
          <p className="text-sm text-slate-400 mb-2">{p.description}</p>
          <p className="text-lg font-semibold mb-4">{p.price}</p>
          <button
            disabled={loadingPlan === p.id}
            onClick={() => startCheckout(p.id)}
            className="mt-auto rounded bg-primary px-3 py-2 text-sm font-medium"
          >
            {p.id === "free" ? "Current" : "Upgrade"}
          </button>
        </div>
      ))}
    </div>
  );
}

