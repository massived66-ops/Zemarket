"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, BadgeCheck, MapPin, ArrowLeft, User } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";
import { formatWhatsAppNumber } from "../../../lib/phone";

type Listing = {
  id: string;
  title: string;
  price: string;
  city: string;
  image_url: string | null;
  phone_number: string | null;
  listing_type: string | null;
};

export default function VendeurProfilePage() {
  const params = useParams();
  const sellerId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    is_verified: boolean;
    is_boosted: boolean;
    hours: string | null;
    banner_url: string | null;
  } | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    async function load() {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, bio, is_verified, is_boosted, hours, banner_url")
        .eq("id", sellerId)
        .maybeSingle();

      setProfile(profileData);

      const { data: listingsData } = await supabase
        .from("listings")
        .select("id, title, price, city, image_url, phone_number, listing_type")
        .eq("user_id", sellerId)
        .order("created_at", { ascending: false });

      setListings(listingsData ?? []);
      setLoading(false);
    }

    if (sellerId) load();
  }, [sellerId]);

  if (loading) {
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="overflow-hidden rounded-3xl border border-white/50 bg-white/70 backdrop-blur-xl shadow-xl"
        >
          {profile?.banner_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.banner_url}
              alt="Bannière"
              className="h-32 w-full object-cover sm:h-40"
            />
          )}

          <div className="p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-black/5">
              {profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name || "Vendeur"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-[#1D1D1F]/30" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[#1D1D1F]">
                  {profile?.full_name || "Vendeur ZeMarket"}
                </h1>
                {profile?.is_verified && (
                  <BadgeCheck className="h-5 w-5 text-[#00A651]" />
                )}
                {profile?.is_boosted && (
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                    ⚡ Boosté
                  </span>
                )}
              </div>
              <p className="text-sm font-light text-[#1D1D1F]/50">
                {listings.length} annonce(s) publiée(s)
              </p>
            </div>
          </div>

          {profile?.bio && (
            <p className="mt-6 leading-7 text-[#1D1D1F]/70">{profile.bio}</p>
          )}

          {profile?.hours && (
            <p className="mt-3 text-sm font-medium text-[#1D1D1F]/60">
              🕒 {profile.hours}
            </p>
          )}
          </div>
        </motion.div>

        <h2 className="mb-6 mt-10 text-lg font-semibold text-[#1D1D1F]">
          Annonces de ce vendeur
        </h2>

        {listings.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-black/10 bg-white/50 p-10 text-center">
            <p className="text-sm font-light text-[#1D1D1F]/50">
              Ce vendeur n'a aucune annonce active pour le moment.
            </p>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {listings.map((item) => (
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
            
