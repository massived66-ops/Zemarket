"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, MapPin, ArrowLeft } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { formatWhatsAppNumber } from "../../lib/phone";

type Result = {
  id: string;
  title: string;
  price: string;
  city: string;
  image_url: string | null;
  phone_number: string | null;
  category: string | null;
  listing_type: string | null;
};

function RechercheContent() {
  const params = useSearchParams();
  const query = params.get("q") || "";

  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function search() {
      setLoading(true);
      const { data } = await supabase
        .from("listings")
        .select("id, title, price, city, image_url, phone_number, category, listing_type")
        .or(
          `title.ilike.%${query}%,category.ilike.%${query}%,subcategory.ilike.%${query}%,description.ilike.%${query}%,city.ilike.%${query}%`
        )
        .order("created_at", { ascending: false });

      setResults(data ?? []);
      setLoading(false);
    }

    if (query) search();
  }, [query]);

  const filteredResults = results
    .filter((item) => (cityFilter ? item.city.toLowerCase().includes(cityFilter.toLowerCase()) : true))
    .filter((item) => (typeFilter === "tous" ? true : item.listing_type === typeFilter))
    .sort((a, b) => {
      if (sortBy === "prix_asc" || sortBy === "prix_desc") {
        const priceA = parseInt(a.price.replace(/[^0-9]/g, "")) || 0;
        const priceB = parseInt(b.price.replace(/[^0-9]/g, "")) || 0;
        return sortBy === "prix_asc" ? priceA - priceB : priceB - priceA;
      }
      return 0;
    });

  return (
    <main className="min-h-screen bg-[#F5F5F7] px-4 py-16">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-[#1D1D1F]/60"
        >
          <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
        </Link>

        <h1 className="text-2xl font-bold tracking-tight text-[#1D1D1F]">
          Professionnels pour "{query}"
        </h1>
        <p className="mt-1 text-sm font-light text-[#1D1D1F]/50">
          {loading ? "Recherche en cours..." : `${filteredResults.length} résultat(s) trouvé(s)`}
        </p>

        {!loading && results.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-3">
            <input
              type="text"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              placeholder="Filtrer par ville"
              className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm outline-none focus:border-[#00A651]/40"
            />

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
              className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm outline-none focus:border-[#00A651]/40"
            >
              <option value="tous">Tous types</option>
              <option value="produit">Produits</option>
              <option value="service">Services</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm outline-none focus:border-[#00A651]/40"
            >
              <option value="recent">Plus récent</option>
              <option value="prix_asc">Prix croissant</option>
              <option value="prix_desc">Prix décroissant</option>
            </select>
          </div>
        )}

        {loading ? (
          <div className="mt-16 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#00A651]" />
          </div>
        ) : results.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-black/10 bg-white/50 p-10 text-center">
            <p className="text-sm font-light text-[#1D1D1F]/50">
              Aucun professionnel trouvé pour cette catégorie pour l'instant.
            </p>
            <Link
              href="/publier-service"
              className="mt-4 inline-block rounded-full bg-[#00A651] px-5 py-2.5 text-sm font-semibold text-white"
            >
              Sois le premier à proposer ce service
            </Link>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
            className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {results.map((item) => (
              <motion.div
                key={item.id}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="overflow-hidden rounded-3xl border border-white/60 bg-white shadow-sm"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-black/5">
                  {item.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                  <span
                    className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      item.listing_type === "service"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-[#00A651]/10 text-[#00A651]"
                    }`}
                  >
                    {item.listing_type === "service" ? "🛠️ Service" : "📦 Produit"}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="line-clamp-2 font-semibold text-[#1D1D1F]">{item.title}</h3>
                  <p className="mt-1 text-lg font-bold text-[#00A651]">{item.price}</p>
                  <div className="mt-2 flex items-center gap-1.5 text-xs font-light text-[#1D1D1F]/45">
                    <MapPin className="h-3.5 w-3.5" />
                    {item.city}
                  </div>
                  {item.phone_number && (
                    <a
                      href={`https://wa.me/${formatWhatsAppNumber(item.phone_number)}?text=${encodeURIComponent(
                        `Bonjour, je suis intéressé(e) par votre service "${item.title}" sur ZeMarket.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 block rounded-full bg-[#00A651] py-2.5 text-center text-sm font-semibold text-white"
                    >
                      Contacter
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </main>
  );
}

export default function RecherchePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#F5F5F7]">
          <Loader2 className="h-6 w-6 animate-spin text-[#00A651]" />
        </main>
      }
    >
      <RechercheContent />
    </Suspense>
  );
                                             }
