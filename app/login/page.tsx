"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    if (!email.trim() || !password.trim()) return;

    const { error } = await supabase.auth.signInWithPassword({
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
        <h1 className="text-2xl font-bold mb-4">Login</h1>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full mb-3 px-3 py-2 rounded text-black"
        />

        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          className="w-full mb-4 px-3 py-2 rounded text-black"
        />

        <button
          onClick={login}
          className="w-full bg-blue-600 py-2 rounded font-semibold"
        >
          Login
        </button>

        <p className="text-sm text-slate-400 mt-4">
          Hesabın yok mu?{" "}
          <Link href="/register" className="text-blue-400">
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}