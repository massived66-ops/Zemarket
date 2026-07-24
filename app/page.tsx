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
    price: "620 000 FCFA",
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
    price: "45 000 FCFA",
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
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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

        <div className="relative hidden flex-1 max-w-md items-center md:flex">
          <Search className="pointer-events-none absolute left-4 h-4 w-4 text-[#1D1D1F]/40" />
          <input
            type="text"
            placeholder="Rechercher un produit, une ville..."
            className="w-full rounded-full border border-black/5 bg-white/80 py-2.5 pl-11 pr-4 text-sm text-[#1D1D1F] placeholder:text-[#1D1D1F]/40 outline-none transition focus:border-[#00A651]/40 focus:ring-2 focus:ring-[#00A651]/20"
          />
        </div>

        <div className="hidden shrink-0 items-center gap-2 md:flex">
          <button className="rounded-full px-4 py-2 text-sm font-medium text-[#1D1D1F] transition hover:bg-black/5">
            Connexion
          </button>
          <button className="rounded-full px-4 py-2 text-sm font-medium text-[#1D1D1F] transition hover:bg-black/5">
            Créer un compte
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            onClick={createRipple}
            className="rounded-full bg-[#00A651] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#00A651]/20 outline-none transition hover:shadow-lg hover:shadow-[#00A651]/30 focus-visible:ring-2 focus-visible:ring-[#00A651] focus-visible:ring-offset-2"
          >
            Vendre
          </motion.button>
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
              <button className="rounded-xl px-4 py-2.5 text-left text-sm font-medium hover:bg-black/5">
                Connexion
              </button>
              <button className="rounded-xl px-4 py-2.5 text-left text-sm font-medium hover:bg-black/5">
                Créer un compte
              </button>
              <button className="mt-1 rounded-xl bg-[#00A651] px-4 py-2.5 text-sm font-semibold text-white">
                Vendre
              </button>
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
  { label: "annonces", value: "+250 000" },
  { label: "vendeurs", value: "+35 000" },
  { label: "régions couvertes", value: "10" },
  { label: "satisfaction", value: "4.9/5" },
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
          <motion.button
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={createRipple}
            className="rounded-full bg-[#00A651] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#00A651]/25 outline-none transition focus-visible:ring-2 focus-visible:ring-[#00A651] focus-visible:ring-offset-2"
          >
            Commencer à vendre
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={createRipple}
            className="flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white/70 px-8 py-3.5 text-sm font-semibold text-[#1D1D1F] backdrop-blur-xl outline-none transition hover:bg-white focus-visible:ring-2 focus-visible:ring-[#00A651] focus-visible:ring-offset-2"
          >
            Explorer <ArrowRight className="h-4 w-4" />
          </motion.button>
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
            <h2 className="text-3xl font-bold tracking-tight text-[#1D1D1
