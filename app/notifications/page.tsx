"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, Bell, ArrowLeft } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

type Notification = {
  id: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

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

export default function NotificationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        router.push("/login");
        return;
      }

      const uid = data.session.user.id;

      const { data: notifs } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false });

      setNotifications(notifs ?? []);
      setLoading(false);

      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", uid)
        .eq("is_read", false);
    });
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5F5F7]">
        <Loader2 className="h-6 w-6 animate-spin text-[#00A651]" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F5F7] px-4 py-16">
      <div className="mx-auto max-w-xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-[#1D1D1F]/60"
        >
          <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
        </Link>

        <h1 className="text-2xl font-bold tracking-tight text-[#1D1D1F]">Notifications</h1>

        {notifications.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-black/10 bg-white/50 p-10 text-center">
            <Bell className="mx-auto mb-3 h-8 w-8 text-[#1D1D1F]/20" />
            <p className="text-sm font-light text-[#1D1D1F]/50">
              Tu n'as aucune notification pour le moment.
            </p>
          </div>
        ) : (
          <div className="mt-8 flex flex-col gap-3">
            {notifications.map((notif) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl border p-4 ${
                  notif.is_read
                    ? "border-white/50 bg-white/50"
                    : "border-[#00A651]/30 bg-[#00A651]/5"
                }`}
              >
                <p className="text-sm text-[#1D1D1F]">{notif.message}</p>
                <p className="mt-1 text-xs font-light text-[#1D1D1F]/40">
                  {timeAgo(notif.created_at)}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
    }
