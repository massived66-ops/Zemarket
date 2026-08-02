"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, Trash2, BadgeCheck, Rocket, Package, Wrench, Plus } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

type Listing = {
  id: string;
  title: string;
  price: string;
  city: string;
  image_url: string | null;
  listing_type: string | null;
  created_at: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [listings, setListings] = useState<Listing[]>([]);
  const [favoriteCounts, setFavoriteCounts] = useState<Record<string, number>>({});
  const [isVerified, setIsVerified] = useState(false);
  const [isBoosted, setIsBoosted] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        router.push("/login");
        return;
      }
      const uid = data.session.user.id;
      setUserId(uid);
      setUserEmail(data.session.user.email ?? null);

 const { data: myListings } = await supabase
        .from("listings")
        .select("id, title, price, city, image_url, listing_type, created_at")
        .eq("user_id", uid)
        .order("created_at", { ascending: false });

      if (myListings && myListings.length > 0) {
        const listingIds = myListings.map((l) => l.id);
        const { data: favData } = await supabase
          .from("favorites")
          .select("listing_id")
          .in("listing_id", listingIds);

        const counts: Record<string, number> = {};
        (favData || []).forEach((f) => {
          counts[f.listing_id] = (counts[f.listing_id] || 0) + 1;
        });

        setFavoriteCounts(counts);
      }

      setListings(myListings ?? []);

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_verified, is_boosted")
        .eq("id", uid)
        .maybeSingle();

      setIsVerified(profile?.is_verified === true);
      setIsBoosted(profile?.is_boosted === true);

      setCheckingAuth(false);
    });
  }, [router]);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Supprimer définitivement cette annonce ?");
    if (!confirmed) return;

    setDeletingId(id);
    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (!error) {
      setListings((prev) => prev.filter((l) => l.id !== id));
    }
    setDeletingId(null);
  };

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5F5F7]">
        <Loader2 className="h-6 w-6 animate-spin text-[#00A651]" />
      </main>
    );
  }

  const limit = isBoosted ? "Illimité" : `${listings.length}/10`;

  return (
    <main className="min-h-screen bg-[#F5F5F7] px-4 py-16">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold tracking-tight text-[#1D1D1F]">
            Tableau de bord vendeur
          </h1>
          <p className="mt-1 text-sm font-light text-[#1D1D1F]/50">{userEmail}</p>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/50 bg-white/70 p-4 backdrop-blur-xl">
              <p className="text-2xl font-bold text-[#1D1D1F]">{listings.length}</p>
              <p className="text-xs font-light text-[#1D1D1F]/50">Annonces publiées</p>
            </div>
            <div className="rounded-2xl border border-white/50 bg-white/70 p-4 backdrop-blur-xl">
              <p className="text-2xl font-bold text-[#1D1D1F]">{limit}</p>
              <p className="text-xs font-light text-[#1D1D1F]/50">Limite du compte</p>
            </div>
            <div className="flex flex-col justify-center rounded-2xl border border-white/50 bg-white/70 p-4 backdrop-blur-xl">
              <div className="flex items-center gap-1.5">
                <BadgeCheck
                  className={`h-4 w-4 ${isVerified ? "text-[#00A651]" : "text-[#1D1D1F]/20"}`}
                />
                <p className="text-sm font-semibold text-[#1D1D1F]">
                  {isVerified ? "Vérifié" : "Non vérifié"}
                </p>
              </div>
              {!isVerified && (
                <Link href="/verification" className="mt-1 text-xs font-medium text-[#00A651]">
                  Se faire vérifier →
                </Link>
              )}
            </div>
            <div className="flex flex-col justify-center rounded-2xl border border-white/50 bg-white/70 p-4 backdrop-blur-xl">
              <div className="flex items-center gap-1.5">
                <Rocket className={`h-4 w-4 ${isBoosted ? "text-[#00A651]" : "text-[#1D1D1F]/20"}`} />
                <p className="text-sm font-semibold text-[#1D1D1F]">
                  {isBoosted ? "Boosté" : "Standard"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#1D1D1F]">Mes annonces</h2>
            <Link
              href="/publier"
              className="flex items-center gap-1.5 rounded-full bg-[#00A651] px-4 py-2 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" /> Publier
            </Link>
          </div>

          {listings.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-black/10 bg-white/50 p-10 text-center">
              <p className="text-sm font-light text-[#1D1D1F]/50">
                Tu n'as encore publié aucune annonce.
              </p>
            </div>
          ) : (
            <div className="mt-6 flex flex-col gap-3">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="flex items-center gap-4 rounded-2xl border border-white/50 bg-white/70 p-4 backdrop-blur-xl"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-black/5">
                    {listing.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={listing.image_url}
                        alt={listing.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[#1D1D1F]/20">
                        {listing.listing_type === "service" ? (
                          <Wrench className="h-6 w-6" />
                        ) : (
                          <Package className="h-6 w-6" />
                        )}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-[#1D1D1F]">{listing.title}</p>
                    <p className="text-sm text-[#00A651]">{listing.price}</p>
                    <p className="text-xs font-light text-[#1D1D1F]/40">{listing.city}</p>
                  </div>

                  <button
                    onClick={() => handleDelete(listing.id)}
                    disabled={deletingId === listing.id}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500 transition hover:bg-red-100 disabled:opacity-50"
                  >
                    {deletingId === listing.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
                                    }
                
