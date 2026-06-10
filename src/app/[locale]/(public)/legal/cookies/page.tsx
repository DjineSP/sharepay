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
      <h2 className="text-xl font-bold text-foreground">{title}</h2>
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

export default function CookiesPage() {
  return (
    <div className="pt-32 pb-24 min-h-screen">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl font-extrabold mb-4">
          Politique relative aux Cookies
        </h1>
        <p className="text-sm text-muted-foreground mb-2 font-medium uppercase tracking-wide">
          SharePay - Cookies &amp; Traceurs
        </p>
        <p className="text-muted-foreground mb-12 leading-relaxed">
          Dernière mise à jour : 13 Mai 2026. SharePay utilise des cookies afin
          d'assurer le bon fonctionnement du service, d'analyser l'usage de la
          plateforme et d'améliorer l'expérience utilisateur.
        </p>

        <div className="space-y-10">

          <SectionBlock title="1. Qu'est-ce qu'un cookie ?">
            <Prose>
              Un cookie est un petit fichier texte déposé sur votre ordinateur
              ou appareil mobile lorsque vous visitez un site web. Il est
              largement utilisé pour faire fonctionner les sites web de manière
              plus efficace et pour fournir des informations aux propriétaires
              du site.
            </Prose>
          </SectionBlock>

          <SectionBlock title="2. Types de cookies utilisés">
            <Prose>Nous utilisons des cookies pour :</Prose>
            <div className="space-y-4 mt-2">
              <div className="bg-muted/30 p-5 rounded-xl border border-border/50">
                <p className="font-semibold text-foreground mb-1">
                  Fonctionnement du service
                </p>
                <p className="text-sm text-muted-foreground">
                  Cookies essentiels au bon fonctionnement de la plateforme,
                  à l'authentification des sessions et à la sécurité des
                  accès. Ils ne peuvent pas être désactivés.
                </p>
              </div>
              <div className="bg-muted/30 p-5 rounded-xl border border-border/50">
                <p className="font-semibold text-foreground mb-1">Analyse</p>
                <p className="text-sm text-muted-foreground">
                  Cookies permettant de comprendre comment les utilisateurs
                  interagissent avec la plateforme (pages visitées, durée de
                  session, erreurs rencontrées) afin d'améliorer le service.
                </p>
              </div>
              <div className="bg-muted/30 p-5 rounded-xl border border-border/50">
                <p className="font-semibold text-foreground mb-1">
                  Amélioration de l'expérience utilisateur (UX)
                </p>
                <p className="text-sm text-muted-foreground">
                  Cookies mémorisant vos préférences (langue, thème,
                  paramètres) afin de personnaliser votre expérience sur la
                  plateforme.
                </p>
              </div>
            </div>
          </SectionBlock>

          <SectionBlock title="3. Données techniques collectées via les cookies">
            <Prose>
              Dans le cadre de l'utilisation des cookies, SharePay peut
              collecter les données techniques suivantes :
            </Prose>
            <BulletList
              items={[
                "Adresse IP",
                "Navigateur et version",
                "Type d'appareil utilisé",
                "Données de connexion et d'activité",
              ]}
            />
          </SectionBlock>

          <SectionBlock title="4. Finalité des cookies">
            <Prose>Les cookies collectés sont utilisés exclusivement pour :</Prose>
            <BulletList
              items={[
                "Assurer la sécurité et l'authentification",
                "Analyser l'usage de la plateforme",
                "Prévenir la fraude",
                "Améliorer les fonctionnalités du service",
              ]}
            />
          </SectionBlock>

          <SectionBlock title="5. Durée de conservation">
            <Prose>
              Les cookies sont conservés selon leur nature :
            </Prose>
            <BulletList
              items={[
                "Cookies de session : supprimés à la fermeture du navigateur",
                "Cookies persistants : conservés selon les obligations légales (6 à 24 mois)",
              ]}
            />
          </SectionBlock>

          <SectionBlock title="6. Gestion de vos préférences">
            <Prose>
              Vous pouvez configurer votre navigateur pour bloquer ou vous
              alerter sur ces cookies. Veuillez noter que certaines parties de
              notre plateforme peuvent ne plus fonctionner correctement si vous
              désactivez les cookies essentiels.
            </Prose>
          </SectionBlock>

          <SectionBlock title="7. Partage des données issues des cookies">
            <Prose>
              Nous ne vendons aucune donnée issue des cookies. Ces données
              peuvent être partagées avec nos prestataires techniques
              (hébergement, API) dans le strict cadre du fonctionnement du
              service.
            </Prose>
          </SectionBlock>

          <SectionBlock title="8. Modification">
            <Prose>
              Cette politique relative aux cookies peut être modifiée à tout
              moment. Toute modification sera publiée sur cette page.
            </Prose>
          </SectionBlock>

          <SectionBlock title="9. Contact">
            <Prose>
              Pour toute question relative à l'utilisation des cookies,
              contactez-nous à : contact@sharepay.cm - Yaoundé, Cameroun.
            </Prose>
          </SectionBlock>

        </div>
      </div>
    </div>
  );
}
