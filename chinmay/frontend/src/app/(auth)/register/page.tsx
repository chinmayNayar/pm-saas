"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { axiosClient } from "../../../lib/axiosClient";
import { useAuthStore } from "../../../store/authStore";

export default function RegisterPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const setToken = useAuthStore((s) => s.setAccessToken);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await axiosClient.post("/auth/register", {
        name,
        email,
        password
      });
      setUser(res.data.user ?? null);
      setToken(res.data.accessToken ?? null);
      router.push("/dashboard");
    } catch (err: any) {
      // Surface backend error message if available to help debugging
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Registration failed";
      setError(message);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h1 className="text-xl font-semibold">Create account</h1>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <input
        className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        type="submit"
        className="w-full rounded bg-primary px-3 py-2 text-sm font-medium"
      >
        Sign up
      </button>
      <p className="text-center text-sm text-slate-400 mt-2">
        Already have an account?{" "}
        <a href="/login" className="text-primary hover:underline">
          Sign in
        </a>
      </p>
    </form>
  );
}

