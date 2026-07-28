import Link from "next/link";

export default function ConfidentialitePage() {
  return (
    <main className="min-h-screen bg-[#F5F5F7] px-4 py-16">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="mb-8 inline-block text-sm font-medium text-[#00A651]">
          ← Retour à l'accueil
        </Link>

        <h1 className="text-3xl font-bold tracking-tight text-[#1D1D1F]">
          Politique de confidentialité
        </h1>
        <p className="mt-2 text-sm font-light text-[#1D1D1F]/50">
          Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long" })}
        </p>

        <div className="mt-8 flex flex-col gap-6 text-[#1D1D1F]/80">
          <section>
            <h2 className="mb-2 text-lg font-semibold text-[#1D1D1F]">1. Données collectées</h2>
            <p className="leading-7">
              Lors de l'inscription : ton adresse email et un mot de passe (stocké de façon
              chiffrée, jamais en clair). Lors de la publication d'une annonce : titre, prix, ville,
              description, photo, et numéro WhatsApp. Lors d'une demande de vérification : une photo
              de ta pièce d'identité et un selfie.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-[#1D1D1F]">2. Utilisation des données</h2>
            <p className="leading-7">
              Ces informations servent uniquement à faire fonctionner la plateforme : afficher tes
              annonces, permettre aux acheteurs de te contacter, et vérifier ton identité si tu en
              fais la demande. Nous ne vendons aucune donnée à des tiers.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-[#1D1D1F]">3. Documents de vérification</h2>
            <p className="leading-7">
              Les pièces d'identité et selfies envoyés pour la vérification sont stockés dans un
              espace privé, non accessible publiquement, et consultés uniquement par l'équipe
              ZeMarket dans le cadre de l'examen de ta demande.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-[#1D1D1F]">4. Hébergement</h2>
            <p className="leading-7">
              Les données sont hébergées via des prestataires techniques tiers (infrastructure de
              base de données et d'hébergement web) utilisés pour faire fonctionner ZeMarket.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-[#1D1D1F]">5. Tes droits</h2>
            <p className="leading-7">
              Tu peux demander la suppression de ton compte et de tes données à tout moment en nous
              contactant. Tu peux aussi supprimer toi-même tes annonces depuis ton tableau de bord.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-[#1D1D1F]">6. Contact</h2>
            <p className="leading-7">
              Pour toute question sur tes données, écris-nous à{" "}
              <a href="mailto:lakoujieedwing5@gmail.com" className="text-[#00A651] underline">
                lakoujieedwing5@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
      }
      
