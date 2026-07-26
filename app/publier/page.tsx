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

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [city, setCity] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push("/login");
      } else {
        setUserId(data.session.user.id);
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
