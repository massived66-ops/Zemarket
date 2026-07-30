"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, Camera, ArrowLeft, Save } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

export default function ParametresPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        router.push("/login");
        return;
      }
      const uid = data.session.user.id;
      setUserId(uid);

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, bio")
        .eq("id", uid)
        .maybeSingle();

      if (profile) {
        setFullName(profile.full_name || "");
        setBio(profile.bio || "");
        setAvatarUrl(profile.avatar_url || null);
      }

      setCheckingAuth(false);
    });
  }, [router]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordError(null);
    setPasswordSuccess(false);

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    setPasswordSaving(false);

    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordSuccess(true);
      setNewPassword("");
    }
  };
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      let finalAvatarUrl = avatarUrl;

      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop();
        const path = `avatars/${userId}-${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("listings-images")
          .upload(path, avatarFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("listings-images")
          .getPublicUrl(path);

        finalAvatarUrl = publicUrlData.publicUrl;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          bio,
          avatar_url: finalAvatarUrl,
        })
        .eq("id", userId);

      if (updateError) throw updateError;

      setAvatarUrl(finalAvatarUrl);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message ?? "Une erreur est survenue. Réessaie.");
    } finally {
      setSaving(false);
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
      <div className="mx-auto max-w-xl">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-[#1D1D1F]/60"
        >
          <ArrowLeft className="h-4 w-4" /> Retour au tableau de bord
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl border border-white/50 bg-white/70 p-8 backdrop-blur-xl shadow-xl sm:p-10"
        >
          <h1 className="mb-1 text-2xl font-bold tracking-tight text-[#1D1D1F]">
            Mon profil
          </h1>
          <p className="mb-8 text-sm font-light text-[#1D1D1F]/50">
            Personnalise ton profil visible par les autres utilisateurs.
          </p>

          <form onSubmit={handleSave} className="flex flex-col gap-5">
            <div className="flex justify-center">
              <label className="relative flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-black/10 bg-white">
                {avatarPreview || avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarPreview || avatarUrl || ""}
                    alt="Photo de profil"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Camera className="h-6 w-6 text-[#1D1D1F]/30" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>

            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ton nom complet"
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#00A651]/40 focus:ring-2 focus:ring-[#00A651]/20"
            />

            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Une courte description de toi (optionnel)"
              rows={3}
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#00A651]/40 focus:ring-2 focus:ring-[#00A651]/20"
            />

            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
            )}
            {success && (
              <p className="rounded-xl bg-[#00A651]/10 px-4 py-3 text-sm text-[#00A651]">
                ✓ Profil mis à jour.
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="mt-2 flex items-center justify-center gap-2 rounded-full bg-[#00A651] py-3.5 text-sm font-semibold text-white shadow-md shadow-[#00A651]/25 transition hover:shadow-lg disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </form>
        </motion.div>
      </div>
    </main>
  );
      }
        
