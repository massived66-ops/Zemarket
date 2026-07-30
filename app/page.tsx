"use client";

/**
 * ZEMARKET — Homepage
 * Next.js 14 (App Router) · TypeScript · TailwindCSS · Framer Motion · lucide-react
 *
 * Single-file implementation of app/page.tsx.
 * NOTE: next/image is used with `unoptimized` for the placeholder Unsplash
 * source images so the file runs without extra next.config.js changes.
 * Remove `unoptimized` and add the relevant domain to images.remotePatterns
 * once real product photography is wired up.
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";
import { formatWhatsAppNumber } from "../lib/phone";
import {
  Search,
  Smartphone,
  Laptop,
  Car,
  Home as HouseIcon,
  Shirt,
  Briefcase,
  Bike,
  Package,
  Heart,
  MessageCircle,
  BadgeCheck,
  MapPin,
  Star,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  ArrowRight,
  Apple,
  PlayCircle,
  Send,
  Upload,
  MessagesSquare,
  Handshake,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";
import { motion, AnimatePresence, useInView, Variants } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

type Category = {
  id: string;
  label: string;
  count: string;
  icon: React.ElementType;
  color: string;
};

const CATEGORIES: Category[] = [
  { id: "phones", label: "Téléphones", count: "14 580", icon: Smartphone, color: "#00A651" },
  { id: "computers", label: "Ordinateurs", count: "8 210", icon: Laptop, color: "#0A84FF" },
  { id: "cars", label: "Voitures", count: "11 940", icon: Car, color: "#FF9500" },
  { id: "realestate", label: "Immobilier", count: "6 375", icon: HouseIcon, color: "#FF3B30" },
  { id: "fashion", label: "Mode", count: "19 860", icon: Shirt, color: "#AF52DE" },
  { id: "jobs", label: "Emplois", count: "4 120", icon: Briefcase, color: "#5856D6" },
  { id: "bikes", label: "Vélos & Motos", count: "3 040", icon: Bike, color: "#32ADE6" },
  { id: "other", label: "Autres", count: "9 275", icon: Package, color: "#8E8E93" },
];

type Product = {
  id: string;
  title: string;
  price: string;
  city: string;
  seller: string;
  verified: boolean;
  postedAt: string;
  image: string;
};

const PRODUCTS: Product[] = [
  {
    id: "p1",
    title: "iPhone 14 Pro 256Go — Excellent état",
    price: "350 000 FCFA",
    city: "Douala",
    seller: "Armand K.",
    verified: true,
    postedAt: "Il y a 2h",
    image: "https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=800&q=80",
  },
  {
    id: "p2",
    title: "Toyota Corolla 2018 — Climatisée",
    price: "8 500 000 FCFA",
    city: "Yaoundé",
    seller: "Marceline T.",
    verified: true,
    postedAt: "Il y a 5h",
    image: "https://images.unsplash.com/photo-1550355291-bbee04a92027?w=800&q=80",
  },
  {
    id: "p3",
    title: "Appartement meublé 2 chambres",
    price: "180 000 FCFA / mois",
    city: "Bafoussam",
    seller: "Immo Prestige",
    verified: true,
    postedAt: "Il y a 1j",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
  },
  {
    id: "p4",
    title: "MacBook Air M2 — Sous garantie",
    price: "780 000 FCFA",
    city: "Garoua",
    seller: "Ibrahim S.",
    verified: false,
    postedAt: "Il y a 3h",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
  },
  {
    id: "p5",
    title: "Sneakers Nike Air Max — Neuves",
    price: "35 000 FCFA",
    city: "Bertoua",
    seller: "Sandra M.",
    verified: true,
    postedAt: "Il y a 6h",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
  },
  {
    id: "p6",
    title: "Terrain 500m² — Titre foncier disponible",
    price: "12 000 000 FCFA",
    city: "Kribi",
    seller: "Foncier Sud",
    verified: true,
    postedAt: "Il y a 2j",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80",
  },
  {
    id: "p7",
    title: "Moto Haojue DK150 — 2022",
    price: "980 000 FCFA",
    city: "Limbe",
    seller: "Pierre N.",
    verified: false,
    postedAt: "Il y a 8h",
    image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&q=80",
  },
  {
    id: "p8",
    title: "Canapé d'angle en cuir — 6 places",
    price: "220 000 FCFA",
    city: "Bamenda",
    seller: "Deco & Style",
    verified: true,
    postedAt: "Il y a 12h",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
  },
];
function timeAgo(dateString: string) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Il y a ${days}j`;
}

function mapListingToProduct(row: any) {
  return {
    id: row.id,
    title: row.title,
    price: row.price,
    city: row.city,
    seller: row.seller_email ? row.seller_email.split("@")[0] : "Vendeur ZeMarket",
    verified: false,
    postedAt: timeAgo(row.created_at),
    image: row.image_url || "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800&q=80",
    phone: row.phone_number || null,
    listingType: row.listing_type || "produit",
  };
}

type Testimonial = {
  id: string;
  name: string;
  city: string;
  rating: number;
  comment: string;
  avatar: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    name: "Carine A.",
    city: "Douala",
    rating: 5,
    comment: "J'ai vendu mon frigo en moins d'une journée. Les acheteurs étaient vérifiés, aucune arnaque.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80",
  },
  {
    id: "t2",
    name: "Junior B.",
    city: "Yaoundé",
    rating: 5,
    comment: "Interface simple, rapide, et le support répond vraiment. Je recommande ZeMarket à tous mes proches.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
  },
  {
    id: "t3",
    name: "Estelle N.",
    city: "Bafoussam",
    rating: 4,
    comment: "Bonne expérience globale, la messagerie intégrée facilite vraiment les négociations.",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80",
  },
  {
    id: "t4",
    name: "Serge K.",
    city: "Kribi",
    rating: 5,
    comment: "J'ai trouvé un terrain sérieux avec titre foncier en une semaine. Bien plus fiable que les groupes Facebook.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80",
  },
  {
    id: "t5",
    name: "Aïcha M.",
    city: "Garoua",
    rating: 5,
    comment: "Le badge vérifié m'a rassurée avant d'acheter. Livraison rapide, vendeur très sérieux.",
    avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&q=80",
  },
  {
    id: "t6",
    name: "Patrick E.",
    city: "Limbe",
    rating: 4,
    comment: "Plateforme claire, bien pensée. J'aimerais juste plus d'options de paiement mobile.",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&q=80",
  },
];

const STATS = [
  { id: "s1", value: 250, suffix: "K+", label: "Annonces publiées" },
  { id: "s2", value: 35, suffix: "K+", label: "Vendeurs actifs" },
  { id: "s3", value: 4.9, suffix: "★", label: "Note moyenne", isDecimal: true },
  { id: "s4", value: 10, suffix: "", label: "Régions couvertes" },
];

/* ------------------------------------------------------------------ */
/*  ANIMATION VARIANTS                                                 */
/* ------------------------------------------------------------------ */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ------------------------------------------------------------------ */
/*  RIPPLE EFFECT                                                       */
/* ------------------------------------------------------------------ */

/** Spawns a short-lived ripple span at the click position on any button. */
function createRipple(e: React.MouseEvent<HTMLElement>) {
  const el = e.currentTarget as HTMLElement;
  const rect = el.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const ripple = document.createElement("span");
  ripple.className = "ripple-effect";
  ripple.style.width = `${size}px`;
  ripple.style.height = `${size}px`;
  ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
  ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
  if (getComputedStyle(el).position === "static") el.style.position = "relative";
  el.style.overflow = "hidden";
  el.appendChild(ripple);
  window.setTimeout(() => ripple.remove(), 600);
}

/* ------------------------------------------------------------------ */
/*  TOAST                                                              */
/* ------------------------------------------------------------------ */

type ToastState = { id: number; message: string } | null;

function Toast({ toast }: { toast: ToastState }) {
  return (
    <div className="fixed top-6 right-6 z-[100] pointer-events-none">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3 rounded-2xl border border-white/40 bg-white/80 backdrop-blur-xl px-5 py-3.5 shadow-xl"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00A651]/10">
              <Heart className="h-4 w-4 fill-[#00A651] text-[#00A651]" />
            </span>
            <p className="text-sm font-medium text-[#1D1D1F]">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  HEADER                                                             */
/* ------------------------------------------------------------------ */

function Header() {
  const [user, setUser] = useState<{ email?: string } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4">
      <motion.div
        animate={{
          maxWidth: scrolled ? 880 : 1120,
          paddingTop: scrolled ? 8 : 14,
          paddingBottom: scrolled ? 8 : 14,
          marginTop: scrolled ? 12 : 20,
        }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="flex w-full items-center justify-between gap-4 rounded-3xl border border-white/40 bg-white/70 px-5 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
      >
        <a href="#" className="flex shrink-0 items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#00A651] text-white font-bold text-sm">
            Z
          </span>
          <span className="text-[17px] font-bold tracking-tight text-[#1D1D1F]">
            ZeMarket
          </span>
        </a>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (searchQuery.trim()) {
              window.location.href = `/recherche?q=${encodeURIComponent(searchQuery.trim())}`;
            }
          }}
          className="relative hidden flex-1 max-w-md items-center md:flex"
        >
          <Search className="pointer-events-none absolute left-4 h-4 w-4 text-[#1D1D1F]/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un produit, une ville..."
            className="w-full rounded-full border border-black/5 bg-white/80 py-2.5 pl-11 pr-4 text-sm text-[#1D1D1F] placeholder:text-[#1D1D1F]/40 outline-none transition focus:border-[#00A651]/40 focus:ring-2 focus:ring-[#00A651]/20"
          />
        </form>

        <div className="hidden shrink-0 items-center gap-2 md:flex">
          {user ? (
            <>
              <Link
                href="/verification"
                className="rounded-full px-4 py-2 text-sm font-medium text-[#00A651] transition hover:bg-black/5"
              >
                Devenir vérifié
              </Link>
              <Link
                href="/dashboard"
                className="rounded-full px-4 py-2 text-sm font-medium text-[#1D1D1F] transition hover:bg-black/5"
              >
                Tableau de bord
              </Link>
              <Link
                href="/favoris"
                className="rounded-full px-4 py-2 text-sm font-medium text-[#1D1D1F] transition hover:bg-black/5"
              >
                Mes favoris
              </Link>
              <span className="max-w-[140px] truncate rounded-full px-4 py-2 text-sm font-medium text-[#1D1D1F]/70">
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="rounded-full px-4 py-2 text-sm font-medium text-[#1D1D1F] transition hover:bg-black/5"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-full px-4 py-2 text-sm font-medium text-[#1D1D1F] transition hover:bg-black/5">
                Connexion
              </Link>
              <Link href="/login" className="rounded-full px-4 py-2 text-sm font-medium text-[#1D1D1F] transition hover:bg-black/5">
                Créer un compte
              </Link>
            </>
          )}
          <Link
            href="/publier"
            onClick={createRipple}
            className="rounded-full bg-[#00A651] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#00A651]/20 outline-none transition hover:shadow-lg hover:shadow-[#00A651]/30 focus-visible:ring-2 focus-visible:ring-[#00A651] focus-visible:ring-offset-2"
          >
            Vendre
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Ouvrir le menu"
          className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-black/5 md:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </motion.div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="absolute top-24 z-40 w-[calc(100%-2rem)] max-w-md rounded-3xl border border-white/40 bg-white/90 p-4 backdrop-blur-xl shadow-xl md:hidden"
          >
            <div className="relative mb-3 flex items-center">
              <Search className="pointer-events-none absolute left-4 h-4 w-4 text-[#1D1D1F]/40" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-full rounded-full border border-black/5 bg-white py-2.5 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#00A651]/20"
              />
            </div>
            <div className="flex flex-col gap-1">
              {user ? (
                <>
                  <Link
                    href="/verification"
                    className="rounded-xl px-4 py-2.5 text-left text-sm font-medium text-[#00A651] hover:bg-black/5"
                  >
                    Devenir vérifié
                  </Link>
                  <Link
                    href="/dashboard"
                    className="rounded-xl px-4 py-2.5 text-left text-sm font-medium hover:bg-black/5"
                  >
                    Tableau de bord
                  </Link>
                  <Link
                    href="/favoris"
                    className="rounded-xl px-4 py-2.5 text-left text-sm font-medium hover:bg-black/5"
                  >
                    Mes favoris
                  </Link>
                  <span className="truncate rounded-xl px-4 py-2.5 text-sm font-medium text-[#1D1D1F]/70">
                    {user.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="rounded-xl px-4 py-2.5 text-left text-sm font-medium hover:bg-black/5"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="rounded-xl px-4 py-2.5 text-left text-sm font-medium hover:bg-black/5">
                    Connexion
                  </Link>
                  <Link href="/login" className="rounded-xl px-4 py-2.5 text-left text-sm font-medium hover:bg-black/5">
                    Créer un compte
                  </Link>
                </>
              )}
              <Link href="/publier" className="mt-1 rounded-xl bg-[#00A651] px-4 py-2.5 text-sm font-semibold text-white text-center">
                Vendre
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  HERO                                                                */
/* ------------------------------------------------------------------ */

const HERO_STATS = [
  { label: "gratuit à publier", value: "100%" },
  { label: "vérification manuelle", value: "✓" },
  { label: "contact direct", value: "WhatsApp" },
  { label: "nouveau", value: "🚀" },
];

function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-24 pt-40 sm:pt-48">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-10%] h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-[#00A651]/15 blur-[120px]" />
        <div className="absolute right-[-10%] top-[20%] h-[320px] w-[320px] rounded-full bg-[#0A84FF]/10 blur-[100px]" />
      </div>

      <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 rounded-full border border-black/10 bg-white/70 px-4 py-1.5 text-xs font-medium text-[#1D1D1F]/70 backdrop-blur-xl"
        >
          La marketplace de confiance au Cameroun
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-balance text-5xl font-bold tracking-tight text-[#1D1D1F] sm:text-6xl md:text-7xl"
        >
          Le Marché N°1 <br className="hidden sm:block" /> au Cameroun
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 max-w-xl text-lg font-light text-[#1D1D1F]/60 sm:text-xl"
        >
          Vendez et achetez partout au Cameroun en moins de 60 secondes.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col gap-3 sm:flex-row"
        >
          <Link
            href="/publier"
            onClick={createRipple}
            className="rounded-full bg-[#00A651] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#00A651]/25 outline-none transition focus-visible:ring-2 focus-visible:ring-[#00A651] focus-visible:ring-offset-2"
          >
            Commencer à vendre
          </Link>
          <motion.a
            href="#annonces"
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={createRipple}
            className="flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white/70 px-8 py-3.5 text-sm font-semibold text-[#1D1D1F] backdrop-blur-xl outline-none transition hover:bg-white focus-visible:ring-2 focus-visible:ring-[#00A651] focus-visible:ring-offset-2"
          >
            Explorer <ArrowRight className="h-4 w-4" />
          </motion.a>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mt-16 grid w-full max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4"
        >
          {HERO_STATS.map((s) => (
            <motion.div
              key={s.label}
              variants={fadeUp}
              className="rounded-2xl border border-white/50 bg-white/60 px-4 py-4 backdrop-blur-xl"
            >
              <p className="text-xl font-bold text-[#1D1D1F]">{s.value}</p>
              <p className="mt-1 text-xs font-light text-[#1D1D1F]/50">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Floating product collage */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="mx-auto mt-20 grid max-w-5xl grid-cols-3 gap-4 sm:grid-cols-6"
      >
        {[
          "https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=400&q=80",
          "https://images.unsplash.com/photo-1550355291-bbee04a92027?w=400&q=80",
          "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80",
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80",
          "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400&q=80",
        ].map((src, i) => (
          <motion.div
            key={src}
            whileHover={{ y: -6, scale: 1.03 }}
            transition={{ duration: 0.3 }}
            className={`relative aspect-square overflow-hidden rounded-2xl border border-white/50 shadow-md ${
              i % 2 === 0 ? "sm:mt-6" : ""
            }`}
          >
            <Image src={src} alt="Produit en vedette sur ZeMarket" fill unoptimized className="object-cover" />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  CATEGORIES                                                         */
/* ------------------------------------------------------------------ */

function Categories() {
  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-10 flex items-end justify-between"
        >
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-[#1D1D1F]">
  Parcourir les catégories
</h2>

<p className="mt-3 max-w-2xl text-[#1D1D1F]/60">
  Découvrez des milliers d'annonces classées par catégorie,
  partout au Cameroun.
</p>
</div>

<a
  href="#annonces"
  className="hidden items-center gap-2 text-sm font-semibold text-[#00A651] transition hover:gap-3 md:flex"
>
  Voir toutes
  <ArrowRight className="h-4 w-4" />
</a>
</motion.div>

<motion.div
  variants={staggerContainer}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true }}
  className="grid grid-cols-2 gap-5 md:grid-cols-4"
>
  {CATEGORIES.map((category) => {
    const Icon = category.icon;

    return (
      <motion.a
        key={category.id}
        href={`/recherche?q=${encodeURIComponent(category.label)}`}
        variants={fadeUp}
        whileHover={{ y: -8, scale: 1.03 }}
        transition={{ duration: 0.3 }}
        className="group block cursor-pointer rounded-3xl border border-white/50 bg-white p-6 shadow-lg transition hover:shadow-2xl"
      >
        <div
          className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{
            backgroundColor: `${category.color}20`,
          }}
        >
          <Icon
            className="h-8 w-8"
            style={{ color: category.color }}
          />
        </div>

        <h3 className="text-lg font-semibold text-[#1D1D1F]">
          {category.label}
        </h3>

        <div className="mt-5 flex items-center gap-2 text-sm font-medium text-[#00A651] opacity-0 transition group-hover:opacity-100">
          Explorer
          <ArrowRight className="h-4 w-4" />
        </div>
      </motion.a>
    );
  })}
</motion.div>
</div>
</section>
);
  }

const PRO_CATEGORIES = [
  { icon: "🏠", label: "Maison", query: "Maison" },
  { icon: "🚗", label: "Automobile", query: "Automobile" },
  { icon: "💄", label: "Beauté", query: "Beauté" },
  { icon: "💻", label: "Informatique", query: "Informatique" },
  { icon: "📷", label: "Événementiel", query: "Événementiel" },
  { icon: "🔧", label: "Réparation", query: "Réparation" },
];

function FindProfessional() {
  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-10"
        >
          <h2 className="text-3xl font-bold tracking-tight text-[#1D1D1F]">
            Trouver un professionnel
          </h2>
          <p className="mt-3 max-w-2xl text-[#1D1D1F]/60">
            Peu importe ton besoin, trouve rapidement le bon prestataire près de chez toi.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
        >
          {PRO_CATEGORIES.map((cat) => (
            <motion.a
              key={cat.label}
              href={`/recherche?q=${encodeURIComponent(cat.query)}`}
              variants={fadeUp}
              whileHover={{ y: -4, scale: 1.02 }}
              className="flex flex-col items-center gap-3 rounded-3xl border border-white/50 bg-white/60 p-6 text-center backdrop-blur-xl shadow-sm transition-shadow duration-300 hover:shadow-lg"
            >
              <span className="text-4xl">{cat.icon}</span>
              <span className="text-sm font-semibold text-[#1D1D1F]">{cat.label}</span>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
   }
/* ------------------------------------------------------------------ */
/*  FEATURED PRODUCTS                                                  */
/* ------------------------------------------------------------------ */

function FeaturedProducts() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [toast, setToast] = useState<ToastState>(null);
  const [listings, setListings] = useState<any[]>([]);

  useEffect(() => {
    async function loadFavorites() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from("favorites")
        .select("listing_id")
        .eq("user_id", session.user.id);

      if (data) setFavorites(data.map((f) => f.listing_id));
    }
    loadFavorites();
  }, []);

  useEffect(() => {
    async function loadListings() {
      const { data } = await supabase
        .from("listings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(8);

      if (!data) return;

      const userIds = [...new Set(data.map((row) => row.user_id))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, is_verified, is_boosted")
        .in("id", userIds);

      const verifiedMap = new Map(
        (profilesData || []).map((p) => [p.id, p.is_verified])
      );
      const boostedMap = new Map(
        (profilesData || []).map((p) => [p.id, p.is_boosted])
      );

      const mapped = data
        .map((row) => ({
          ...mapListingToProduct(row),
          verified: verifiedMap.get(row.user_id) === true,
          boosted: boostedMap.get(row.user_id) === true,
        }))
        .sort((a, b) => Number(b.boosted) - Number(a.boosted));

      setListings(mapped);
    }

    loadListings();
  }, []);
  const toggleFavorite = async (id: string) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      window.location.href = "/login";
      return;
    }

    const exists = favorites.includes(id);

    if (exists) {
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", session.user.id)
        .eq("listing_id", id);
      setFavorites((prev) => prev.filter((item) => item !== id));
    } else {
      await supabase.from("favorites").insert({
        user_id: session.user.id,
        listing_id: id,
      });
      setFavorites((prev) => [...prev, id]);
    }

    setToast({
      id: Date.now(),
      message: exists
        ? "Produit retiré des favoris."
        : "Produit ajouté aux favoris ❤️",
    });

    setTimeout(() => setToast(null), 2500);
  };

  return (
    <section id="annonces" className="bg-[#F8F9FB] px-4 py-24">
      <div className="mx-auto max-w-7xl">

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-12 flex items-center justify-between"
        >
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-[#1D1D1F]">
              Produits en vedette
            </h2>

            <p className="mt-2 text-[#1D1D1F]/60">
              Les meilleures annonces sélectionnées aujourd'hui.
            </p>
          </div>

          <button className="hidden rounded-full border border-black/10 px-5 py-2 text-sm font-medium transition hover:bg-white md:block">
            Voir tout
          </button>
        </motion.div>
        <motion.div
  variants={staggerContainer}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true }}
  className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
>
  {(listings.length > 0 ? listings : PRODUCTS).map((product) => {
    const liked = favorites.includes(product.id);

    return (
      <motion.div
        key={product.id}
        variants={fadeUp}
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden rounded-3xl border border-white/60 bg-white shadow-lg"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={product.image}
            alt={product.title}
            fill
            unoptimized
            className="object-cover transition duration-500 hover:scale-110"
          />

          <button
            onClick={() => toggleFavorite(product.id)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur"
          >
            <Heart
              className={`h-5 w-5 ${
                liked
                  ? "fill-red-500 text-red-500"
                  : "text-[#1D1D1F]"
              }`}
            />
          </button>
        </div>

        <div className="space-y-4 p-5">

          <h3 className="line-clamp-2 text-lg font-semibold text-[#1D1D1F]">
            {product.title}
          </h3>

          <p className="text-2xl font-bold text-[#00A651]">
            {product.price}
          </p>

          <span
            className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
              product.listingType === "service"
                ? "bg-blue-50 text-blue-600"
                : "bg-[#00A651]/10 text-[#00A651]"
            }`}
          >
            {product.listingType === "service" ? "🛠️ Service" : "📦 Produit"}
          </span>

          <div className="flex items-center gap-2 text-sm text-[#1D1D1F]/60">
            <MapPin className="h-4 w-4" />
            {product.city}
          </div>

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-2">

              <span className="text-sm font-medium">
                {product.seller}
              </span>

              {product.verified && (
                <BadgeCheck className="h-4 w-4 text-[#00A651]" />
              )}

            </div>

            <span className="text-xs text-[#1D1D1F]/45">
              {product.postedAt}
            </span>

          </div>

          <div className="flex gap-3">

            {product.phone ? (
              <a
                href={`https://wa.me/${formatWhatsAppNumber(product.phone)}?text=${encodeURIComponent(
                  `Bonjour, je suis intéressé(e) par votre annonce "${product.title}" sur ZeMarket.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={createRipple}
                className="flex-1 rounded-full bg-[#00A651] py-3 text-center text-sm font-semibold text-white transition hover:opacity-90"
              >
                Contacter
              </a>
            ) : (
              <button
                disabled
                className="flex-1 rounded-full bg-black/10 py-3 text-sm font-semibold text-[#1D1D1F]/40"
              >
                Contact indisponible
              </button>
            )}

            <button
              onClick={createRipple}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-black/10"
            >
              <MessageCircle className="h-5 w-5" />
            </button>

          </div>

        </div>

      </motion.div>
    );
  })}
</motion.div>

<Toast toast={toast} />

</div>
</section>
);
              }
/* ------------------------------------------------------------------ */
/*  HOW IT WORKS                                                       */
/* ------------------------------------------------------------------ */

function HowItWorks() {
  const steps = [
    {
      icon: Upload,
      title: "Publiez votre annonce",
      description:
        "Prenez quelques photos, ajoutez une description et publiez gratuitement votre produit en moins d'une minute.",
    },
    {
      icon: MessagesSquare,
      title: "Discutez avec les acheteurs",
      description:
        "Échangez facilement grâce à la messagerie intégrée et négociez en toute sécurité.",
    },
    {
      icon: Handshake,
      title: "Vendez rapidement",
      description:
        "Rencontrez l'acheteur et concluez votre vente en toute confiance.",
    },
  ];

  return (
    <section className="px-4 py-24 bg-white">
      <div className="mx-auto max-w-7xl">

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <h2 className="text-4xl font-bold tracking-tight text-[#1D1D1F]">
            Comment ça fonctionne ?
          </h2>

          <p className="mt-4 text-lg text-[#1D1D1F]/60">
            Trois étapes simples pour acheter ou vendre partout au Cameroun.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-8 md:grid-cols-3"
        >
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.title}
                variants={fadeUp}
                whileHover={{ y: -8 }}
                className="rounded-3xl border border-black/5 bg-[#F8F9FB] p-8 shadow-sm"
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#00A651]/10">
                  <Icon className="h-8 w-8 text-[#00A651]" />
                </div>

                <span className="text-sm font-semibold text-[#00A651]">
                  Étape {index + 1}
                </span>

                <h3 className="mt-2 text-2xl font-bold text-[#1D1D1F]">
                  {step.title}
                </h3>

                <p className="mt-4 leading-7 text-[#1D1D1F]/60">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
      }
/* ------------------------------------------------------------------ */
/*  STATS                                                              */
/* ------------------------------------------------------------------ */

function StatsSection() {
  const [liveStats, setLiveStats] = useState([
    { id: "s1", value: 0, suffix: "", label: "Annonces publiées" },
    { id: "s2", value: 0, suffix: "", label: "Vendeurs actifs" },
    { id: "s3", value: 0, suffix: "", label: "Villes couvertes" },
    { id: "s4", value: 100, suffix: "%", label: "Publication gratuite" },
  ]);

  useEffect(() => {
    async function loadStats() {
      const { data } = await supabase.from("listings").select("user_id, city");
      if (!data) return;

      const totalListings = data.length;
      const uniqueSellers = new Set(data.map((row) => row.user_id)).size;
      const uniqueCities = new Set(data.map((row) => row.city)).size;

      setLiveStats([
        { id: "s1", value: totalListings, suffix: "", label: "Annonces publiées" },
        { id: "s2", value: uniqueSellers, suffix: "", label: "Vendeurs actifs" },
        { id: "s3", value: uniqueCities, suffix: "", label: "Villes couvertes" },
        { id: "s4", value: 100, suffix: "%", label: "Publication gratuite" },
      ]);
    }
    loadStats();
  }, []);

  return (
    <section className="bg-[#00A651] px-4 py-24">
      <div className="mx-auto max-w-7xl">

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <span className="rounded-full bg-white/20 px-4 py-1.5 text-xs font-semibold text-white">
            🚀 Plateforme en pleine croissance
          </span>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {liveStats.map((stat) => (
            <motion.div
              key={stat.id}
              variants={fadeUp}
              className="rounded-3xl bg-white/10 p-8 text-center backdrop-blur-xl"
            >
              <h3 className="text-5xl font-bold text-white">
                {stat.value}
                {stat.suffix}
              </h3>

              <p className="mt-3 text-lg text-white/80">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
    }
/* ------------------------------------------------------------------ */
/*  TESTIMONIALS                                                       */
/* ------------------------------------------------------------------ */
function Testimonials() {
  const reasons = [
    {
      icon: "🆓",
      title: "100% gratuit pour commencer",
      description: "Publie tes 10 premières annonces sans payer un centime.",
    },
    {
      icon: "🛡️",
      title: "Vérification manuelle",
      description: "Chaque badge Vérifié est examiné personnellement, pas juste automatisé.",
    },
    {
      icon: "💬",
      title: "Contact direct",
      description: "Discute directement avec le vendeur via WhatsApp, sans intermédiaire.",
    },
  ];

  return (
    <section className="bg-[#F8F9FB] px-4 py-24">
      <div className="mx-auto max-w-7xl">

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <h2 className="text-4xl font-bold tracking-tight text-[#1D1D1F]">
            Pourquoi choisir ZeMarket
          </h2>

          <p className="mt-4 text-lg text-[#1D1D1F]/60">
            Une plateforme pensée pour les vendeurs et acheteurs camerounais.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-8 md:grid-cols-3"
        >
          {reasons.map((reason) => (
            <motion.div
              key={reason.title}
              variants={fadeUp}
              whileHover={{ y: -6 }}
              className="rounded-3xl bg-white p-8 shadow-lg"
            >
              <span className="mb-4 block text-4xl">{reason.icon}</span>
              <h3 className="mb-2 text-lg font-semibold text-[#1D1D1F]">{reason.title}</h3>
              <p className="leading-7 text-[#1D1D1F]/60">{reason.description}</p>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
      }

/* ------------------------------------------------------------------ */
/*  DOWNLOAD APP                                                       */
/* ------------------------------------------------------------------ */

function DownloadApp() {
  return (
    <section className="px-4 py-24">
      <div className="mx-auto max-w-7xl">

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="overflow-hidden rounded-[40px] bg-gradient-to-r from-[#00A651] to-[#009245] p-10 text-white md:p-16"
        >
          <div className="grid items-center gap-12 lg:grid-cols-2">

            <div>
              <span className="rounded-full bg-white/20 px-4 py-2 text-sm font-semibold">
                Application mobile
              </span>

              <h2 className="mt-6 text-4xl font-bold leading-tight">
                Achetez et vendez partout, directement depuis votre téléphone.
              </h2>

              <p className="mt-6 max-w-xl text-lg text-white/90">
                Téléchargez l'application ZeMarket et profitez d'une
                expérience encore plus rapide, avec des notifications
                instantanées, une messagerie intégrée et des milliers
                d'annonces à portée de main.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">

                <button
                  onClick={createRipple}
                  className="rounded-2xl bg-white px-8 py-4 font-semibold text-[#00A651] transition hover:scale-105"
                >
                  Télécharger sur Android
                </button>

                <button
                  onClick={createRipple}
                  className="rounded-2xl border border-white/40 px-8 py-4 font-semibold transition hover:bg-white/10"
                >
                  Télécharger sur iPhone
                </button>

              </div>
            </div>

            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative mx-auto h-[500px] w-[260px]"
            >
              <Image
                src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800"
                alt="Application ZeMarket"
                fill
                unoptimized
                className="rounded-[40px] object-cover shadow-2xl"
              />
            </motion.div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}
/* ------------------------------------------------------------------ */
/*  FAQ                                                                */
/* ------------------------------------------------------------------ */

function FAQ() {
  const faqs = [
    {
      question: "Publier une annonce est-il gratuit ?",
      answer:
        "Oui. Vous pouvez publier gratuitement vos annonces sur ZeMarket en quelques minutes.",
    },
    {
      question: "Comment contacter un vendeur ?",
      answer:
        "Il suffit d'ouvrir l'annonce puis de cliquer sur « Contacter ». Vous pourrez discuter directement avec le vendeur.",
    },
    {
      question: "Puis-je vendre partout au Cameroun ?",
      answer:
        "Oui. ZeMarket est disponible dans toutes les régions du Cameroun afin de faciliter les échanges entre particuliers et professionnels.",
    },
    {
      question: "Comment éviter les arnaques ?",
      answer:
        "Privilégiez les rencontres dans un lieu public, vérifiez le produit avant le paiement et utilisez les outils de signalement disponibles sur la plateforme.",
    },
  ];

  return (
    <section className="bg-[#F8F9FB] px-4 py-24">
      <div className="mx-auto max-w-4xl">

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="text-4xl font-bold text-[#1D1D1F]">
            Questions fréquentes
          </h2>

          <p className="mt-4 text-lg text-[#1D1D1F]/60">
            Les réponses aux questions les plus posées.
          </p>
        </motion.div>

        <div className="space-y-5">
          {faqs.map((faq) => (
            <motion.div
              key={faq.question}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="rounded-2xl bg-white p-6 shadow-md"
            >
              <h3 className="text-lg font-semibold text-[#1D1D1F]">
                {faq.question}
              </h3>

              <p className="mt-3 leading-7 text-[#1D1D1F]/65">
                {faq.answer}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
/* ------------------------------------------------------------------ */
/*  FOOTER                                                             */
/* ------------------------------------------------------------------ */

function Footer() {
  return (
    <footer className="bg-[#111111] px-4 py-20 text-white">
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-4">

        <div>
          <h2 className="text-3xl font-extrabold">
            <span className="text-[#00A651]">Ze</span>Market
          </h2>

          <p className="mt-5 leading-7 text-white/70">
            La marketplace moderne qui connecte acheteurs et vendeurs
            partout au Cameroun.
          </p>
        </div>

        <div>
          <h3 className="mb-5 text-lg font-semibold">
            Marketplace
          </h3>

          <ul className="space-y-3 text-white/70">
            <li>
              <a href="#" className="transition hover:text-white">
                Accueil
              </a>
            </li>

            <li>
              <a href="#" className="transition hover:text-white">
                Catégories
              </a>
            </li>

            <li>
              <a href="#" className="transition hover:text-white">
                Publier une annonce
              </a>
            </li>

            <li>
              <a href="#" className="transition hover:text-white">
                Contact
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-5 text-lg font-semibold">
            Entreprise
          </h3>

          <ul className="space-y-3 text-white/70">
            <li>
              <a href="#" className="transition hover:text-white">
                À propos
              </a>
            </li>

            <li>
              
              <a href="/conditions" className="transition hover:text-white">
                Conditions d'utilisation
              </a>
            </li>

            <li>
              <a href="/confidentialite" className="transition hover:text-white">
                Politique de confidentialité
              </a>
            </li>

            <li>
              <a href="mailto:lakoujieedwing5@gmail.com" className="transition hover:text-white">
                Assistance
              </a>
            </li>
          </ul>
        </div>

      </div>
      <div className="mx-auto mt-16 max-w-7xl border-t border-white/10 pt-8 text-center text-sm text-white/60">
        © {new Date().getFullYear()} ZeMarket. Tous droits réservés.
      </div>
    </footer>
  );
              }
/* ------------------------------------------------------------------ */
/*  HOME PAGE                                                          */
/* ------------------------------------------------------------------ */

function Pricing() {
  const plans = [
    {
      name: "Gratuit",
      price: "0 FCFA",
      description: "Pour découvrir ZeMarket et publier tes premières annonces.",
      features: [
        "Jusqu'à 10 annonces (produits ou services)",
        "Contact direct via WhatsApp",
        "Vérification d'identité possible",
        "Visible dans les résultats de recherche",
      ],
      cta: "Commencer gratuitement",
      href: "/publier",
      highlighted: false,
    },
    {
      name: "Boost",
      price: "5 000 FCFA / mois",
      description: "Pour les vendeurs qui veulent plus de visibilité.",
      features: [
        "Annonces illimitées",
        "Priorité dans les résultats de recherche",
        "Badge mis en avant",
        "Toutes les fonctionnalités du compte Gratuit",
      ],
      cta: "Devenir Boosté",
      href: "https://wa.me/237687542666?text=Bonjour%2C%20je%20veux%20devenir%20Boost%C3%A9%20sur%20ZeMarket",
      highlighted: true,
    },
  ];

  return (
    <section className="px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-[#1D1D1F] sm:text-4xl">
            Nos offres
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[#1D1D1F]/60">
            Commence gratuitement, passe au Boost quand tu es prêt à vendre plus vite.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-6 sm:grid-cols-2"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={fadeUp}
              whileHover={{ y: -6 }}
              className={`rounded-3xl p-8 ${
                plan.highlighted
                  ? "bg-[#1D1D1F] text-white shadow-xl"
                  : "border border-black/10 bg-white"
              }`}
            >
              <h3 className={`text-xl font-bold ${plan.highlighted ? "text-white" : "text-[#1D1D1F]"}`}>
                {plan.name}
              </h3>
              <p
                className={`mt-2 text-2xl font-bold ${
                  plan.highlighted ? "text-[#00A651]" : "text-[#00A651]"
                }`}
              >
                {plan.price}
              </p>
              <p
                className={`mt-2 text-sm font-light ${
                  plan.highlighted ? "text-white/60" : "text-[#1D1D1F]/50"
                }`}
              >
                {plan.description}
              </p>

              <ul className="mt-6 flex flex-col gap-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className={`flex items-start gap-2 text-sm ${
                      plan.highlighted ? "text-white/80" : "text-[#1D1D1F]/70"
                    }`}
                  >
                    <span className="mt-0.5 text-[#00A651]">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <a
                href={plan.href}
                className={`mt-8 block rounded-full py-3 text-center text-sm font-semibold transition ${
                  plan.highlighted
                    ? "bg-[#00A651] text-white hover:opacity-90"
                    : "bg-[#1D1D1F]/5 text-[#1D1D1F] hover:bg-[#1D1D1F]/10"
                }`}
              >
                {plan.cta}
              </a>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-[#1D1D1F]">

      <Header />

      <Hero />

      <Categories />
      <FindProfessional />
      <Pricing />

      <FeaturedProducts />

      <HowItWorks />

      <StatsSection />

      <Testimonials />

      <FAQ />

      <Footer />
    </main>
  );
}
