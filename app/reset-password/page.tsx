"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F5F7] px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-3xl border border-white/50 bg-white/70 p-8 backdrop-blur-xl shadow-xl sm:p-10"
      >
        <div className="mb-8 flex items-center justify-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00A651] text-white font-bold text-sm">
            Z
          </span>
          <span className="text-lg font-bold tracking-tight text-[#1D1D1F]">ZeMarket</span>
        </div>

        <h1 className="mb-1 text-2xl font-bold tracking-tight text-[#1D1D1F]">
          Nouveau mot de passe
        </h1>
        <p className="mb-8 text-sm font-light text-[#1D1D1F]/50">
          Choisis un nouveau mot de passe pour ton compte.
        </p>

        {success ? (
          <p className="rounded-xl bg-[#00A651]/10 px-4 py-3 text-sm text-[#00A651]">
            ✓ Mot de passe mis à jour. Redirection vers la connexion...
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1D1D1F]/40" />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nouveau mot de passe"
                className="w-full rounded-2xl border border-black/10 bg-white py-3.5 pl-11 pr-11 text-sm outline-none transition focus:border-[#00A651]/40 focus:ring-2 focus:ring-[#00A651]/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1D1D1F]/40"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex items-center justify-center gap-2 rounded-full bg-[#00A651] py-3.5 text-sm font-semibold text-white shadow-md shadow-[#00A651]/25 transition hover:shadow-lg disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Mettre à jour le mot de passe
            </button>
          </form>
        )}
      </motion.div>
    </main>
  );
          }
