"use client";

function SectionBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h3 className="text-lg font-bold text-foreground">{title}</h3>
      {children}
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-2">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground leading-relaxed">{children}</p>
  );
}

function ChapterHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl font-extrabold text-foreground pb-2 border-b border-border">
      {children}
    </h2>
  );
}

export default function TermsPage() {
  return (
    <div className="pt-32 pb-24 min-h-screen">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl font-extrabold mb-4">Conditions d'Utilisation</h1>
        <p className="text-sm text-muted-foreground mb-2 font-medium uppercase tracking-wide">
          SharePay - Documents Contractuels
        </p>
        <p className="text-muted-foreground mb-14 leading-relaxed">
          Dernière mise à jour : 13 Mai 2026. Veuillez lire attentivement
          l'ensemble des présentes conditions avant d'utiliser la plateforme
          SharePay.
        </p>

        <div className="space-y-14">

          {/* ─── I. MENTIONS LÉGALES ─── */}
          <div className="space-y-8">
            <ChapterHeading>I. Mentions Légales</ChapterHeading>

            <SectionBlock title="1. Éditeur du site">
              <Prose>
                Nom : SharePay<br />
                Statut : Entreprise / Projet<br />
                Email : contact@sharepay.cm<br />
                Localisation : Yaoundé, Cameroun
              </Prose>
            </SectionBlock>

            <SectionBlock title="2. Hébergement">
              <Prose>
                Le site est hébergé par Vercel Inc. (https://vercel.com).
              </Prose>
            </SectionBlock>

            <SectionBlock title="3. Activité">
              <Prose>SharePay est une plateforme d'agrégation de paiement permettant :</Prose>
              <BulletList items={["Paiements électroniques", "Gestion de transactions"]} />
            </SectionBlock>

            <SectionBlock title="4. Responsabilité">
              <Prose>
                SharePay met tout en œuvre pour assurer la fiabilité du service.
                Cependant, il ne garantit pas l'absence d'erreurs ni l'accès
                continu.
              </Prose>
            </SectionBlock>

            <SectionBlock title="5. Propriété intellectuelle">
              <Prose>
                Tout le contenu du site est protégé. Toute reproduction est
                interdite sans autorisation.
              </Prose>
            </SectionBlock>

            <SectionBlock title="6. Données personnelles">
              <Prose>
                Les données sont traitées conformément à la Politique de
                Confidentialité.
              </Prose>
            </SectionBlock>

            <SectionBlock title="7. Loi applicable">
              <Prose>
                Le site est soumis aux lois en vigueur au Cameroun.
              </Prose>
            </SectionBlock>

            <SectionBlock title="8. Contact">
              <Prose>Email : contact@sharepay.cm</Prose>
            </SectionBlock>
          </div>

          {/* ─── II. CGU ─── */}
          <div className="space-y-8">
            <ChapterHeading>II. Conditions Générales d'Utilisation</ChapterHeading>

            <SectionBlock title="1. Objet">
              <Prose>
                Les présentes conditions régissent l'utilisation de la
                plateforme SharePay permettant de réaliser des paiements
                électroniques.
              </Prose>
            </SectionBlock>

            <SectionBlock title="2. Acceptation">
              <Prose>
                L'utilisateur accepte les présentes conditions en utilisant la
                plateforme.
              </Prose>
            </SectionBlock>

            <SectionBlock title="3. Services">
              <Prose>SharePay permet :</Prose>
              <BulletList
                items={[
                  "D'envoyer et recevoir des paiements",
                  "De gérer des transactions",
                  "D'utiliser des moyens de paiement intégrés",
                ]}
              />
            </SectionBlock>

            <SectionBlock title="4. Inscription">
              <Prose>
                L'utilisateur doit fournir des informations exactes. SharePay
                se réserve le droit de suspendre un compte en cas de fraude.
              </Prose>
            </SectionBlock>

            <SectionBlock title="5. Obligations de l'utilisateur">
              <Prose>L'utilisateur s'engage à :</Prose>
              <BulletList
                items={[
                  "Ne pas utiliser la plateforme à des fins illégales",
                  "Ne pas frauder",
                  "Protéger ses identifiants",
                ]}
              />
            </SectionBlock>

            <SectionBlock title="6. Vérification KYC (Know Your Customer)">
              <Prose>SharePay peut demander :</Prose>
              <BulletList
                items={["Pièce d'identité", "Numéro de téléphone vérifié"]}
              />
              <Prose>Sans cela, l'accès peut être limité.</Prose>
            </SectionBlock>

            <SectionBlock title="7. Transactions">
              <BulletList
                items={[
                  "Les transactions sont irréversibles une fois validées",
                  "SharePay agit comme intermédiaire",
                  "Les délais peuvent dépendre des opérateurs",
                ]}
              />
            </SectionBlock>

            <SectionBlock title="8. Frais">
              <Prose>
                Des frais peuvent être appliqués. Ils seront clairement
                affichés avant chaque transaction.
              </Prose>
            </SectionBlock>

            <SectionBlock title="9. Responsabilité">
              <Prose>SharePay ne garantit pas :</Prose>
              <BulletList
                items={["L'absence d'interruption", "L'absence d'erreurs"]}
              />
              <Prose>SharePay n'est pas responsable :</Prose>
              <BulletList
                items={[
                  "Des erreurs utilisateur",
                  "Des problèmes liés aux opérateurs externes",
                ]}
              />
            </SectionBlock>

            <SectionBlock title="10. Sécurité">
              <Prose>L'utilisateur est responsable de :</Prose>
              <BulletList items={["Ses identifiants", "Ses accès"]} />
            </SectionBlock>

            <SectionBlock title="11. Suspension / Résiliation">
              <Prose>SharePay peut suspendre un compte en cas de :</Prose>
              <BulletList
                items={[
                  "Suspicion de fraude",
                  "Non-respect des conditions",
                ]}
              />
            </SectionBlock>

            <SectionBlock title="12. Propriété intellectuelle">
              <Prose>La plateforme reste propriété de SharePay.</Prose>
            </SectionBlock>

            <SectionBlock title="13. Données personnelles">
              <Prose>
                Les données sont traitées conformément à la Politique de
                Confidentialité.
              </Prose>
            </SectionBlock>

            <SectionBlock title="14. Droit applicable">
              <Prose>
                Les présentes conditions sont régies par les lois en vigueur
                dans le pays d'exploitation.
              </Prose>
            </SectionBlock>

            <SectionBlock title="15. Contact">
              <Prose>Email : contact@sharepay.cm</Prose>
            </SectionBlock>
          </div>

          {/* ─── III. CONDITIONS MARCHANDS ─── */}
          <div className="space-y-8">
            <ChapterHeading>III. Conditions Marchands</ChapterHeading>

            <SectionBlock title="1. Objet">
              <Prose>
                Les présentes conditions régissent l'utilisation de SharePay
                par les entreprises (marchands).
              </Prose>
            </SectionBlock>

            <SectionBlock title="2. Inscription">
              <Prose>Le marchand doit fournir :</Prose>
              <BulletList
                items={[
                  "Informations légales",
                  "Adresse",
                  "Contact valide",
                ]}
              />
            </SectionBlock>

            <SectionBlock title="3. Obligations du marchand">
              <Prose>Le marchand s'engage à :</Prose>
              <BulletList
                items={[
                  "Fournir des services licites",
                  "Respecter les lois en vigueur",
                  "Ne pas pratiquer de fraude",
                  "Honorer les commandes",
                ]}
              />
            </SectionBlock>

            <SectionBlock title="4. Produits interdits">
              <Prose>Il est interdit de vendre :</Prose>
              <BulletList
                items={[
                  "Produits illégaux",
                  "Activités frauduleuses",
                  "Contenus interdits par la loi",
                ]}
              />
            </SectionBlock>

            <SectionBlock title="5. Paiements">
              <Prose>SharePay agit comme intermédiaire :</Prose>
              <BulletList
                items={[
                  "Collecte les paiements",
                  "Les reverse au marchand",
                ]}
              />
            </SectionBlock>

            <SectionBlock title="6. Frais">
              <Prose>Des frais de service sont appliqués :</Prose>
              <BulletList
                items={["Commission par transaction", "Frais techniques"]}
              />
            </SectionBlock>

            <SectionBlock title="7. Retrait des fonds">
              <Prose>
                Les marchands peuvent retirer leurs fonds selon :
              </Prose>
              <BulletList
                items={["Délais définis", "Vérifications nécessaires"]}
              />
            </SectionBlock>

            <SectionBlock title="8. Litiges">
              <Prose>Le marchand est responsable :</Prose>
              <BulletList
                items={[
                  "Des réclamations clients",
                  "Du service fourni",
                ]}
              />
            </SectionBlock>

            <SectionBlock title="9. Suspension">
              <Prose>
                SharePay peut suspendre un marchand en cas de :
              </Prose>
              <BulletList
                items={[
                  "Fraude",
                  "Non-respect des règles",
                  "Activité suspecte",
                ]}
              />
            </SectionBlock>

            <SectionBlock title="10. Responsabilité">
              <Prose>SharePay n'est pas responsable :</Prose>
              <BulletList
                items={[
                  "Des produits vendus",
                  "Des litiges commerciaux",
                ]}
              />
            </SectionBlock>

            <SectionBlock title="11. Résiliation">
              <Prose>Le compte peut être résilié à tout moment.</Prose>
            </SectionBlock>

            <SectionBlock title="12. Modification">
              <Prose>Ces conditions peuvent être modifiées.</Prose>
            </SectionBlock>
          </div>

          {/* ─── VII. REMBOURSEMENT ─── */}
          <div className="space-y-8">
            <ChapterHeading>VII. Politique de Remboursement</ChapterHeading>

            <SectionBlock title="1. Principe général">
              <Prose>
                Les transactions effectuées via SharePay sont en principe
                irréversibles une fois validées.
              </Prose>
            </SectionBlock>

            <SectionBlock title="2. Cas éligibles au remboursement">
              <Prose>
                Un remboursement peut être envisagé dans les cas suivants :
              </Prose>
              <BulletList
                items={[
                  "Transaction en double",
                  "Erreur technique de la plateforme",
                  "Paiement non autorisé signalé rapidement",
                  "Service non fourni par le marchand",
                ]}
              />
            </SectionBlock>

            <SectionBlock title="3. Cas non éligibles">
              <Prose>
                Aucun remboursement ne sera effectué en cas de :
              </Prose>
              <BulletList
                items={[
                  "Erreur de saisie de l'utilisateur",
                  "Mauvaise utilisation du service",
                  "Litige entre client et marchand sans preuve",
                  "Validation volontaire de la transaction",
                ]}
              />
            </SectionBlock>

            <SectionBlock title="4. Procédure de remboursement">
              <Prose>
                Pour demander un remboursement, contacter le support à{" "}
                contact@sharepay.cm et fournir :
              </Prose>
              <BulletList
                items={[
                  "Preuve de transaction",
                  "Description du problème",
                ]}
              />
              <Prose>Délai de traitement : 3 à 14 jours ouvrables.</Prose>
            </SectionBlock>

            <SectionBlock title="5. Mode de remboursement">
              <Prose>Les remboursements seront effectués :</Prose>
              <BulletList
                items={[
                  "Sur le moyen de paiement initial",
                  "Ou via un autre moyen validé",
                ]}
              />
            </SectionBlock>

            <SectionBlock title="6. Frais">
              <Prose>
                Certains frais peuvent être non remboursables (frais
                opérateur).
              </Prose>
            </SectionBlock>

            <SectionBlock title="7. Responsabilité">
              <Prose>
                SharePay agit comme intermédiaire et n'est pas responsable des
                litiges commerciaux entre utilisateurs.
              </Prose>
            </SectionBlock>

            <SectionBlock title="8. Modification">
              <Prose>
                Cette politique peut être modifiée à tout moment.
              </Prose>
            </SectionBlock>
          </div>

          {/* ─── VIII. SLA ─── */}
          <div className="space-y-8">
            <ChapterHeading>VIII. Accord de Niveau de Service (SLA)</ChapterHeading>

            <SectionBlock title="1. Objet">
              <Prose>
                Le présent SLA définit les engagements de disponibilité et de
                performance du service SharePay.
              </Prose>
            </SectionBlock>

            <SectionBlock title="2. Disponibilité du service">
              <Prose>
                SharePay s'engage à fournir une disponibilité mensuelle de :
              </Prose>
              <BulletList
                items={["99% du temps (hors maintenance planifiée)"]}
              />
            </SectionBlock>

            <SectionBlock title="3. Maintenance">
              <Prose>
                Les opérations de maintenance peuvent entraîner des
                interruptions :
              </Prose>
              <BulletList
                items={[
                  "Maintenance planifiée : notification préalable",
                  "Maintenance d'urgence : sans préavis si nécessaire",
                ]}
              />
            </SectionBlock>

            <SectionBlock title="4. Performance">
              <Prose>SharePay s'efforce de garantir :</Prose>
              <BulletList
                items={[
                  "Temps de réponse rapide",
                  "Traitement efficace des transactions",
                  "Disponibilité continue des API",
                ]}
              />
            </SectionBlock>

            <SectionBlock title="5. Support technique">
              <Prose>Support disponible via : contact@sharepay.cm</Prose>
              <Prose>Délais de réponse :</Prose>
              <BulletList
                items={[
                  "Urgence critique : < 24h",
                  "Problème standard : 24–72h",
                ]}
              />
            </SectionBlock>

            <SectionBlock title="6. Incidents">
              <Prose>En cas d'incident :</Prose>
              <BulletList
                items={[
                  "Identification rapide",
                  "Résolution dans les meilleurs délais",
                  "Communication aux utilisateurs",
                ]}
              />
            </SectionBlock>

            <SectionBlock title="7. Limitations">
              <Prose>Le SLA ne couvre pas :</Prose>
              <BulletList
                items={[
                  "Pannes des fournisseurs externes (Mobile Money, Orange Money, banques)",
                  "Mauvaise utilisation du service",
                  "Problèmes réseau utilisateur",
                ]}
              />
            </SectionBlock>

            <SectionBlock title="8. Amélioration continue">
              <Prose>
                SharePay s'engage à améliorer constamment la qualité du
                service.
              </Prose>
            </SectionBlock>

            <SectionBlock title="9. Modification">
              <Prose>Ce SLA peut être mis à jour à tout moment.</Prose>
            </SectionBlock>
          </div>

        </div>
      </div>
    </div>
  );
}
