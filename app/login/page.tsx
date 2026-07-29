"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login?confirme=1`,
        },
      });
      setLoading(false);
      if (error) {
        setError(error.message);
      } else {
        setMessage("Compte créé ! Vérifie ta boîte mail pour confirmer ton adresse.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) {
        setError(error.message);
      } else {
        router.push("/");
      }
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

        <div className="mb-8 flex rounded-full bg-black/5 p-1">
          <button
            onClick={() => {
              setMode("login");
              setError(null);
              setMessage(null);
            }}
            className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition ${
              mode === "login" ? "bg-white text-[#1D1D1F] shadow-sm" : "text-[#1D1D1F]/50"
            }`}
          >
            Connexion
          </button>
          <button
            onClick={() => {
              setMode("signup");
              setError(null);
              setMessage(null);
            }}
            className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition ${
              mode === "signup" ? "bg-white text-[#1D1D1F] shadow-sm" : "text-[#1D1D1F]/50"
            }`}
          >
            Créer un compte
          </button>
        </div>

        <h1 className="mb-1 text-2xl font-bold tracking-tight text-[#1D1D1F]">
          {mode === "login" ? "Content de te revoir" : "Rejoins ZeMarket"}
        </h1>
        <p className="mb-8 text-sm font-light text-[#1D1D1F]/50">
          {mode === "login"
            ? "Connecte-toi pour vendre et gérer tes annonces."
            : "Crée ton compte pour publier tes premières annonces."}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1D1D1F]/40" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Adresse e-mail"
              className="w-full rounded-2xl border border-black/10 bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-[#00A651]/40 focus:ring-2 focus:ring-[#00A651]/20"
            />
          </div>

          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1D1D1F]/40" />
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
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
          {message && (
            <p className="rounded-xl bg-[#00A651]/10 px-4 py-3 text-sm text-[#00A651]">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex items-center justify-center gap-2 rounded-full bg-[#00A651] py-3.5 text-sm font-semibold text-white shadow-md shadow-[#00A651]/25 transition hover:shadow-lg disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "login" ? "Se connecter" : "Créer mon compte"}
          </button>
        </form>
      </motion.div>
    </main>
  );
            }
