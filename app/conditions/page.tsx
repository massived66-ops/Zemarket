import Link from "next/link";

export default function ConditionsPage() {
  return (
    <main className="min-h-screen bg-[#F5F5F7] px-4 py-16">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="mb-8 inline-block text-sm font-medium text-[#00A651]">
          ← Retour à l'accueil
        </Link>

        <h1 className="text-3xl font-bold tracking-tight text-[#1D1D1F]">
          Conditions d'utilisation
        </h1>
        <p className="mt-2 text-sm font-light text-[#1D1D1F]/50">
          Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long" })}
        </p>

        <div className="mt-8 flex flex-col gap-6 text-[#1D1D1F]/80">
          <section>
            <h2 className="mb-2 text-lg font-semibold text-[#1D1D1F]">1. Présentation</h2>
            <p className="leading-7">
              ZeMarket est une plateforme de petites annonces permettant à des particuliers,
              commerçants et prestataires de services de publier des annonces et d'entrer en
              contact entre eux, au Cameroun.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-[#1D1D1F]">2. Rôle de ZeMarket</h2>
            <p className="leading-7">
              ZeMarket met en relation acheteurs et vendeurs. Nous ne sommes pas partie aux
              transactions conclues entre utilisateurs et n'intervenons pas dans la négociation, la
              livraison ou le paiement, sauf indication contraire explicitement proposée sur la
              plateforme.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-[#1D1D1F]">3. Compte utilisateur</h2>
            <p className="leading-7">
              La création d'un compte nécessite une adresse email valide. Tu es responsable de la
              confidentialité de ton mot de passe et de toute activité effectuée depuis ton compte.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-[#1D1D1F]">4. Contenu des annonces</h2>
            <p className="leading-7">
              Les annonces doivent être exactes, légales et ne pas induire en erreur. ZeMarket se
              réserve le droit de retirer toute annonce non conforme, frauduleuse ou signalée par
              d'autres utilisateurs, sans préavis.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-[#1D1D1F]">5. Vérification d'identité</h2>
            <p className="leading-7">
              Le badge "Vérifié" repose sur un examen manuel des documents fournis. Il atteste
              d'une vérification d'identité de base et ne constitue pas une garantie absolue contre
              la fraude.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-[#1D1D1F]">6. Offres payantes</h2>
            <p className="leading-7">
              Certaines fonctionnalités (mise en avant "Boost") sont proposées contre paiement. Les
              modalités précises seront communiquées avant toute activation.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-[#1D1D1F]">7. Contact</h2>
            <p className="leading-7">
              Pour toute question, écris-nous à{" "}
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
