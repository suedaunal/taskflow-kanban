"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const register = async () => {
    if (!email.trim() || !password.trim()) return;

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error(error.message);
      alert(error.message);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <div className="w-full max-w-sm bg-slate-900 p-6 rounded-2xl shadow">
        <h1 className="text-2xl font-bold mb-4">Register</h1>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
         className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
         className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={register}
          className="w-full bg-green-600 py-2 rounded font-semibold"
        >
          Register
        </button>

        <p className="text-sm text-slate-400 mt-4">
          Zaten hesabın var mı?{" "}
          <Link href="/login" className="text-blue-400">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
