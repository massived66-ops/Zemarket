"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldCheck, Loader2, IdCard, User } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

export default function VerificationPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [idFile, setIdFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [idPreview, setIdPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [existingStatus, setExistingStatus] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        router.push("/login");
        return;
      }
      const uid = data.session.user.id;
      setUserId(uid);

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_verified")
        .eq("id", uid)
        .maybeSingle();

      if (profile?.is_verified) {
        setExistingStatus("approuvé");
        setCheckingAuth(false);
        return;
      }

      const { data: existing } = await supabase
        .from("verification_requests")
        .select("status")
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing) setExistingStatus(existing.status);
      setCheckingAuth(false);
    });
  }, [router]);

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setIdFile(f);
      setIdPreview(URL.createObjectURL(f));
    }
  };

  const handleSelfieChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setSelfieFile(f);
      setSelfiePreview(URL.createObjectURL(f));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!userId || !idFile || !selfieFile) {
      setError("Ajoute une photo de ta pièce d'identité et un selfie.");
      return;
    }

    setLoading(true);
    try {
      const idExt = idFile.name.split(".").pop();
      const idPath = `${userId}-id-${Date.now()}.${idExt}`;
      const { error: idUploadError } = await supabase.storage
        .from("verification-docs")
        .upload(idPath, idFile);
      if (idUploadError) throw idUploadError;

      const selfieExt = selfieFile.name.split(".").pop();
      const selfiePath = `${userId}-selfie-${Date.now()}.${selfieExt}`;
      const { error: selfieUploadError } = await supabase.storage
        .from("verification-docs")
        .upload(selfiePath, selfieFile);
      if (selfieUploadError) throw selfieUploadError;

      const { error: insertError } = await supabase.from("verification_requests").insert({
        user_id: userId,
        id_document_url: idPath,
        selfie_url: selfiePath,
        status: "en attente",
      });
      if (insertError) throw insertError;

      setSuccess(true);
    } catch (err: any) {
      setError(err.message ?? "Une erreur est survenue. Réessaie.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5F5F7]">
        <Loader2 className="h-6 w-6 animate-spin text-[#00A651]" />
      </main>
    );
  }

  if (success || existingStatus === "en attente") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5F5F7] px-4">
        <div className="max-w-md rounded-3xl border border-white/50 bg-white/70 p-8 text-center backdrop-blur-xl shadow-xl">
          <ShieldCheck className="mx-auto mb-4 h-10 w-10 text-[#00A651]" />
          <h1 className="mb-2 text-xl font-bold text-[#1D1D1F]">Demande envoyée</h1>
          <p className="text-sm font-light text-[#1D1D1F]/60">
            Ta demande de vérification est en cours d'examen. Tu recevras le badge "Vérifié" une
            fois validée manuellement.
          </p>
        </div>
      </main>
    );
  }

  if (existingStatus === "approuvé") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5F5F7] px-4">
        <div className="max-w-md rounded-3xl border border-white/50 bg-white/70 p-8 text-center backdrop-blur-xl shadow-xl">
          <ShieldCheck className="mx-auto mb-4 h-10 w-10 text-[#00A651]" />
          <h1 className="mb-2 text-xl font-bold text-[#1D1D1F]">Tu es déjà vérifié</h1>
          <p className="text-sm font-light text-[#1D1D1F]/60">
            Ton compte porte déjà le badge "Vérifié".
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F5F7] px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-xl rounded-3xl border border-white/50 bg-white/70 p-8 backdrop-blur-xl shadow-xl sm:p-10"
      >
        <h1 className="mb-1 text-2xl font-bold tracking-tight text-[#1D1D1F]">
          Vérification d'identité
        </h1>
        <p className="mb-8 text-sm font-light text-[#1D1D1F]/50">
          Envoie ta pièce d'identité et un selfie. Ta demande sera examinée manuellement avant
          l'obtention du badge "Vérifié".
        </p>

        {existingStatus === "refusé" && (
          <p className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            Ta précédente demande a été refusée. Tu peux en soumettre une nouvelle.
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="relative flex h-40 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-black/10 bg-white transition hover:border-[#00A651]/40">
            {idPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={idPreview} alt="Pièce d'identité" className="h-full w-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-[#1D1D1F]/40">
                <IdCard className="h-8 w-8" />
                <span className="text-sm">Photo de ta pièce d'identité</span>
              </div>
            )}
            <input type="file" accept="image/*" capture="environment" onChange={handleIdChange} className="hidden" />
          </label>

          <label className="relative flex h-40 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-black/10 bg-white transition hover:border-[#00A651]/40">
            {selfiePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={selfiePreview} alt="Selfie" className="h-full w-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-[#1D1D1F]/40">
                <User className="h-8 w-8" />
                <span className="text-sm">Ton selfie</span>
              </div>
            )}
            <input type="file" accept="image/*" capture="user" onChange={handleSelfieChange} className="hidden" />
          </label>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex items-center justify-center gap-2 rounded-full bg-[#00A651] py-3.5 text-sm font-semibold text-white shadow-md shadow-[#00A651]/25 transition hover:shadow-lg disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            {loading ? "Envoi..." : "Envoyer ma demande"}
          </button>
        </form>
      </motion.div>
    </main>
  );
      }
        
