"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, Heart, MapPin, ArrowLeft } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { formatWhatsAppNumber } from "../../lib/phone";

type FavoriteListing = {
  id: string;
  title: string;
  price: string;
  city: string;
  image_url: string | null;
  phone_number: string | null;
  listing_type: string | null;
};

export default function FavorisPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<FavoriteListing[]>([]);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        router.push("/login");
        return;
      }
      const uid = data.session.user.id;
      setUserId(uid);

      const { data: favData } = await supabase
        .from("favorites")
        .select("listing_id, listings(id, title, price, city, image_url, phone_number, listing_type)")
        .eq("user_id", uid);

      const items = (favData ?? [])
        .map((row: any) => row.listings)
        .filter(Boolean);

      setFavorites(items);
      setCheckingAuth(false);
    });
  }, [router]);

  const handleRemove = async (listingId: string) => {
    if (!userId) return;
    setRemovingId(listingId);
    await supabase
      .from("favorites")
      .delete()
      .eq("user_id", userId)
      .eq("listing_id", listingId);
    setFavorites((prev) => prev.filter((f) => f.id !== listingId));
    setRemovingId(null);
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
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-[#1D1D1F]/60"
        >
          <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
        </Link>

        <h1 className="text-2xl font-bold tracking-tight text-[#1D1D1F]">Mes favoris</h1>
        <p className="mt-1 text-sm font-light text-[#1D1D1F]/50">
          {favorites.length} annonce(s) enregistrée(s)
        </p>

        {favorites.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-black/10 bg-white/50 p-10 text-center">
            <Heart className="mx-auto mb-3 h-8 w-8 text-[#1D1D1F]/20" />
            <p className="text-sm font-light text-[#1D1D1F]/50">
              Tu n'as encore aucune annonce en favoris.
            </p>
            <Link
              href="/"
              className="mt-4 inline-block rounded-full bg-[#00A651] px-5 py-2.5 text-sm font-semibold text-white"
            >
              Parcourir les annonces
            </Link>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
            className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {favorites.map((item) => (
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
                  <button
                    onClick={() => handleRemove(item.id)}
                    disabled={removingId === item.id}
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur"
                  >
                    {removingId === item.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                    )}
                  </button>
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
                      href={`https://wa.me/${formatWhatsAppNumber(
                        item.phone_number
                      )}?text=${encodeURIComponent(
                        `Bonjour, je suis intéressé(e) par votre annonce "${item.title}" sur ZeMarket.`
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
