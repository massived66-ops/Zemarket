"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Upload, Loader2, ImagePlus } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

const CATEGORIES = [
  "Plomberie",
  "Menuiserie",
  "Électricité",
  "Maçonnerie",
  "Développement",
  "Graphisme",
  "Beauté",
  "Couture",
  "Réparation",
  "Photographie",
  "Autre",
];

export default function PublishServicePage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [listingCount, setListingCount] = useState(0);
  const [isBoosted, setIsBoosted] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [subcategory, setSubcategory] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [interventionZone, setInterventionZone] = useState("");
  const [canTravel, setCanTravel] = useState<"oui" | "non">("oui");

  const [priceType, setPriceType] = useState<"fixe" | "a_partir_de" | "devis">("fixe");
  const [price, setPrice] = useState("");

  const [availability, setAvailability] = useState("");
  const [avgResponseTime, setAvgResponseTime] = useState("");
  const [languages, setLanguages] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        router.push("/login");
        return;
      }
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

      const priceLabel =
        priceType === "devis"
          ? "Sur devis"
          : priceType === "a_partir_de"
          ? `À partir de ${price} FCFA`
          : `${price} FCFA`;

      const { error: insertError } = await supabase.from("listings").insert({
        user_id: userId,
        title,
        price: priceLabel,
        city,
        description,
        image_url: imageUrl,
        seller_email: userEmail,
        phone_number: phone,
        listing_type: "service",
        category,
        subcategory,
        neighborhood,
        intervention_zone: interventionZone,
        can_travel: canTravel === "oui",
        price_type: priceType,
        availability,
        avg_response_time: avgResponseTime,
        languages,
        years_experience: yearsExperience,
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
          Proposer un service
        </h1>
        <p className="mb-8 text-sm font-light text-[#1D1D1F]/50">
          Remplis les informations ci-dessous pour présenter ta prestation.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="relative flex h-48 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-black/10 bg-white transition hover:border-[#00A651]/40">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Aperçu" className="h-full w-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-[#1D1D1F]/40">
                <ImagePlus className="h-8 w-8" />
                <span className="text-sm">Photo d'une réalisation</span>
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>

          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre du service"
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#00A651]/40 focus:ring-2 focus:ring-[#00A651]/20"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#00A651]/40 focus:ring-2 focus:ring-[#00A651]/20"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            placeholder="Sous-catégorie (ex: Installation sanitaire)"
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#00A651]/40 focus:ring-2 focus:ring-[#00A651]/20"
          />

          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description détaillée de ton service"
            rows={4}
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#00A651]/40 focus:ring-2 focus:ring-[#00A651]/20"
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ville"
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#00A651]/40 focus:ring-2 focus:ring-[#00A651]/20"
            />
            <input
              type="text"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              placeholder="Quartier"
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#00A651]/40 focus:ring-2 focus:ring-[#00A651]/20"
            />
          </div>

          <input
            type="text"
            value={interventionZone}
            onChange={(e) => setInterventionZone(e.target.value)}
            placeholder="Zone d'intervention (ex: Douala et environs)"
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#00A651]/40 focus:ring-2 focus:ring-[#00A651]/20"
          />

          <div>
            <p className="mb-2 text-sm font-medium text-[#1D1D1F]/70">Déplacement possible ?</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setCanTravel("oui")}
                className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition ${
                  canTravel === "oui"
                    ? "bg-[#00A651] text-white"
                    : "border border-black/10 bg-white text-[#1D1D1F]/60"
                }`}
              >
                Oui
              </button>
              <button
                type="button"
                onClick={() => setCanTravel("non")}
                className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition ${
                  canTravel === "non"
                    ? "bg-[#00A651] text-white"
                    : "border border-black/10 bg-white text-[#1D1D1F]/60"
                }`}
              >
                Non
              </button>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-[#1D1D1F]/70">Tarification</p>
            <div className="flex gap-2">
              {[
                { value: "fixe", label: "Fixe" },
                { value: "a_partir_de", label: "À partir de" },
                { value: "devis", label: "Sur devis" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPriceType(opt.value as typeof priceType)}
                  className={`flex-1 rounded-full py-2.5 text-xs font-semibold transition ${
                    priceType === opt.value
                      ? "bg-[#00A651] text-white"
                      : "border border-black/10 bg-white text-[#1D1D1F]/60"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {priceType !== "devis" && (
            <input
              type="text"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Montant en FCFA"
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#00A651]/40 focus:ring-2 focus:ring-[#00A651]/20"
            />
          )}

          <input
            type="text"
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            placeholder="Disponibilité (ex: Lun-Sam, 8h-18h)"
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#00A651]/40 focus:ring-2 focus:ring-[#00A651]/20"
          />

          <input
            type="text"
            value={avgResponseTime}
            onChange={(e) => setAvgResponseTime(e.target.value)}
            placeholder="Délai moyen d'intervention (ex: 24h)"
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#00A651]/40 focus:ring-2 focus:ring-[#00A651]/20"
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={languages}
              onChange={(e) => setLanguages(e.target.value)}
              placeholder="Langues parlées"
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#00A651]/40 focus:ring-2 focus:ring-[#00A651]/20"
            />
            <input
              type="text"
              value={yearsExperience}
              onChange={(e) => setYearsExperience(e.target.value)}
              placeholder="Années d'expérience"
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#00A651]/40 focus:ring-2 focus:ring-[#00A651]/20"
            />
          </div>

          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Numéro WhatsApp (ex: 6XXXXXXXX)"
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#00A651]/40 focus:ring-2 focus:ring-[#00A651]/20"
          />

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email (facultatif)"
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
            {loading ? "Publication..." : "Publier le service"}
          </button>
        </form>
      </motion.div>
    </main>
  );
            }
        
