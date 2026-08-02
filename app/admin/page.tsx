"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, ShieldCheck, ShieldX, ArrowLeft, IdCard } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

type Request = {
  id: string;
  user_id: string;
  id_document_url: string;
  selfie_url: string;
  status: string;
  created_at: string;
};

export default function AdminPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [requests, setRequests] = useState<Request[]>([]);
  const [signedUrls, setSignedUrls] = useState<Record<string, { id: string; selfie: string }>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", data.session.user.id)
        .maybeSingle();

      if (!profile?.is_admin) {
        router.push("/");
        return;
      }

      setIsAdmin(true);
      await loadRequests();
      setChecking(false);
    });
  }, [router]);

  async function loadRequests() {
    const { data } = await supabase
      .from("verification_requests")
      .select("*")
      .eq("status", "en attente")
      .order("created_at", { ascending: true });

    const list = data ?? [];
    setRequests(list);

    const urls: Record<string, { id: string; selfie: string }> = {};
    for (const req of list) {
      const { data: idSigned } = await supabase.storage
        .from("verification-docs")
        .createSignedUrl(req.id_document_url, 3600);
      const { data: selfieSigned } = await supabase.storage
        .from("verification-docs")
        .createSignedUrl(req.selfie_url, 3600);

      urls[req.id] = {
        id: idSigned?.signedUrl || "",
        selfie: selfieSigned?.signedUrl || "",
      };
    }
    setSignedUrls(urls);
  }

  const handleDecision = async (req: Request, approve: boolean) => {
    setProcessingId(req.id);

    await supabase
      .from("verification_requests")
      .update({ status: approve ? "approuvé" : "refusé" })
      .eq("id", req.id);

    if (approve) {
      await supabase
        .from("profiles")
        .update({ is_verified: true })
        .eq("id", req.user_id);
    }

    await supabase.from("notifications").insert({
      user_id: req.user_id,
      message: approve
        ? "✓ Ton compte est maintenant vérifié sur ZeMarket !"
        : "Ta demande de vérification a été refusée. Tu peux en soumettre une nouvelle.",
    });

    setRequests((prev) => prev.filter((r) => r.id !== req.id));
    setProcessingId(null);
  };

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5F5F7]">
        <Loader2 className="h-6 w-6 animate-spin text-[#00A651]" />
      </main>
    );
  }

  if (!isAdmin) return null;

  return (
    <main className="min-h-screen bg-[#F5F5F7] px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-[#1D1D1F]/60"
        >
          <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
        </Link>

        <h1 className="text-2xl font-bold tracking-tight text-[#1D1D1F]">
          Administration — Vérifications
        </h1>
        <p className="mt-1 text-sm font-light text-[#1D1D1F]/50">
          {requests.length} demande(s) en attente
        </p>

        {requests.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-black/10 bg-white/50 p-10 text-center">
            <IdCard className="mx-auto mb-3 h-8 w-8 text-[#1D1D1F]/20" />
            <p className="text-sm font-light text-[#1D1D1F]/50">
              Aucune demande en attente pour le moment.
            </p>
          </div>
        ) : (
          <div className="mt-8 flex flex-col gap-6">
            {requests.map((req) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-white/50 bg-white/70 p-6 backdrop-blur-xl shadow-sm"
              >
                <p className="mb-4 text-xs font-light text-[#1D1D1F]/40">
                  Utilisateur : {req.user_id}
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="mb-1 text-xs font-medium text-[#1D1D1F]/50">Pièce d'identité</p>
                    {signedUrls[req.id]?.id ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={signedUrls[req.id].id}
                        alt="Pièce d'identité"
                        className="h-40 w-full rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="flex h-40 items-center justify-center rounded-2xl bg-black/5">
                        <Loader2 className="h-5 w-5 animate-spin text-[#1D1D1F]/30" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-medium text-[#1D1D1F]/50">Selfie</p>
                    {signedUrls[req.id]?.selfie ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={signedUrls[req.id].selfie}
                        alt="Selfie"
                        className="h-40 w-full rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="flex h-40 items-center justify-center rounded-2xl bg-black/5">
                        <Loader2 className="h-5 w-5 animate-spin text-[#1D1D1F]/30" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => handleDecision(req, true)}
                    disabled={processingId === req.id}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#00A651] py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {processingId === req.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ShieldCheck className="h-4 w-4" />
                    )}
                    Approuver
                  </button>
                  <button
                    onClick={() => handleDecision(req, false)}
                    disabled={processingId === req.id}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full bg-red-50 py-2.5 text-sm font-semibold text-red-600 disabled:opacity-50"
                  >
                    <ShieldX className="h-4 w-4" />
                    Refuser
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
    }
  
