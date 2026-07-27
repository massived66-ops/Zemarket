"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Upload, Loader2, ImagePlus } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

export default function PublishPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [listingType, setListingType] = useState<"produit" | "service" | null>(null);
  const [listingCount, setListingCount] = useState(0);
  const [isBoosted, setIsBoosted] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        router.push("/login");
      } else {
        const uid = data.session.user.id;
        setUserId(uid);
        setUserEmail(data.session.user.email ?? null);

        const { count } = await supabase
          .from("listings")
          .select("*", { count: "exact", head: true })
          .eq("user_id", uid);
        setListingCount(count ?? 0);

        const { data: profile } = await supabase
          .from("profiles")
          .select("is_boosted")
          .eq("id", uid)
          .maybeSingle();
        setIsBoosted(profile?.is_boosted === true);

        setCheckingAuth(false);
      }
    });
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!userId) return;

    if (!isBoosted && listingCount >= 10) {
      setError(
        "Tu as atteint la limite de 10 annonces pour un compte gratuit. Passe au compte Boost pour publier plus."
      );
      return;
    }

    setLoading(true);

    try {
      let imageUrl: string | null = null;

      if (file) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("listings-images")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("listings-images")
          .getPublicUrl(fileName);

        imageUrl = publicUrlData.publicUrl;
      }

      const { error: insertError } = await supabase.from("listings").insert({
        user_id: userId,
        title,
        price,
        city,
        description,
        image_url: imageUrl,
        seller_email: userEmail,
        phone_number: phone,
      });

      if (insertError) throw insertError;

      router.push("/");
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

  if (!listingType) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5F5F7] px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-xl rounded-3xl border border-white/50 bg-white/70 p-8 backdrop-blur-xl shadow-xl sm:p-10"
        >
          <h1 className="mb-1 text-2xl font-bold tracking-tight text-[#1D1D1F]">
            Que veux-tu publier ?
          </h1>
          <p className="mb-8 text-sm font-light text-[#1D1D1F]/50">
            Choisis le type d'annonce que tu veux créer.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <button
              onClick={() => setListingType("produit")}
              className="flex-1 rounded-2xl border border-black/10 bg-white p-6 text-left transition hover:border-[#00A651]/40 hover:shadow-md"
            >
              <span className="mb-2 block text-3xl">📦</span>
              <span className="block font-semibold text-[#1D1D1F]">Publier un produit</span>
              <span className="mt-1 block text-sm font-light text-[#1D1D1F]/50">
                Vends un objet, un article, un bien.
              </span>
            </button>

            <button
              onClick={() => router.push("/publier-service")}
              className="flex-1 rounded-2xl border border-black/10 bg-white p-6 text-left transition hover:border-[#00A651]/40 hover:shadow-md"
            >
              <span className="mb-2 block text-3xl">🛠️</span>
              <span className="block font-semibold text-[#1D1D1F]">Proposer un service</span>
              <span className="mt-1 block text-sm font-light text-[#1D1D1F]/50">
                Propose ton savoir-faire ou ta prestation.
              </span>
            </button>
          </div>
        </motion.div>
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
          Publier une annonce
        </h1>
        <p className="mb-8 text-sm font-light text-[#1D1D1F]/50">
          Remplis les informations ci-dessous pour mettre ton produit en ligne.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="relative flex h-48 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-black/10 bg-white transition hover:border-[#00A651]/40">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Aperçu" className="h-full w-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-[#1D1D1F]/40">
                <ImagePlus className="h-8 w-8" />
                <span className="text-sm">Ajouter une photo</span>
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>

          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre de l'annonce"
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#00A651]/40 focus:ring-2 focus:ring-[#00A651]/20"
          />

          <input
            type="text"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Prix (ex: 50 000 FCFA)"
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#00A651]/40 focus:ring-2 focus:ring-[#00A651]/20"
          />

          <input
            type="text"
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Ville"
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#00A651]/40 focus:ring-2 focus:ring-[#00A651]/20"
          />
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Numéro WhatsApp (ex: 6XXXXXXXX)"
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#00A651]/40 focus:ring-2 focus:ring-[#00A651]/20"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optionnel)"
            rows={4}
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#00A651]/40 focus:ring-2 focus:ring-[#00A651]/20"
          />

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex items-center justify-center gap-2 rounded-full bg-[#00A651] py-3.5 text-sm font-semibold text-white shadow-md shadow-[#00A651]/25 transition hover:shadow-lg disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {loading ? "Publication..." : "Publier l'annonce"}
          </button>
        </form>
      </motion.div>
    </main>
  );
      }
