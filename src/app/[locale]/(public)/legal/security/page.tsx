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

export default function SecurityPage() {
  return (
    <div className="pt-32 pb-24 min-h-screen">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl font-extrabold mb-4">
          Sécurité &amp; Conformité
        </h1>
        <p className="text-sm text-muted-foreground mb-2 font-medium uppercase tracking-wide">
          SharePay - Anti-Fraude, AML &amp; Audit
        </p>
        <p className="text-muted-foreground mb-14 leading-relaxed">
          Dernière mise à jour : 13 Mai 2026. SharePay s'engage à prévenir
          toute activité frauduleuse, le blanchiment d'argent ainsi qu'à
          maintenir une traçabilité complète de ses opérations.
        </p>

        <div className="space-y-14">

          {/* ─── V. ANTI-FRAUDE ─── */}
          <div className="space-y-8">
            <ChapterHeading>V. Politique Anti-Fraude</ChapterHeading>

            <SectionBlock title="1. Objectif">
              <Prose>
                La présente politique vise à prévenir, détecter et traiter
                toute activité frauduleuse sur la plateforme SharePay.
              </Prose>
            </SectionBlock>

            <SectionBlock title="2. Définition de fraude">
              <Prose>Est considérée comme fraude :</Prose>
              <BulletList
                items={[
                  "Utilisation de faux documents ou identité",
                  "Transactions non autorisées",
                  "Tentative de blanchiment d'argent",
                  "Utilisation abusive de moyens de paiement",
                  "Piratage ou tentative d'accès non autorisé",
                ]}
              />
            </SectionBlock>

            <SectionBlock title="3. Mesures de prévention">
              <Prose>SharePay met en œuvre :</Prose>
              <BulletList
                items={[
                  "Vérification d'identité (KYC)",
                  "Surveillance des transactions",
                  "Analyse comportementale",
                  "Détection automatique d'activités suspectes",
                  "Limitation des transactions inhabituelles",
                ]}
              />
            </SectionBlock>

            <SectionBlock title="4. Vérification des utilisateurs">
              <Prose>Nous pouvons exiger :</Prose>
              <BulletList
                items={[
                  "Pièce d'identité valide",
                  "Vérification du numéro de téléphone",
                  "Informations complémentaires",
                ]}
              />
              <Prose>En cas de refus, l'accès peut être restreint.</Prose>
            </SectionBlock>

            <SectionBlock title="5. Surveillance des transactions">
              <Prose>
                Les transactions sont analysées pour détecter :
              </Prose>
              <BulletList
                items={[
                  "Montants anormaux",
                  "Fréquence élevée",
                  "Activités suspectes",
                  "Incohérences géographiques",
                ]}
              />
            </SectionBlock>

            <SectionBlock title="6. Mesures en cas de fraude">
              <Prose>En cas de suspicion :</Prose>
              <BulletList
                items={[
                  "Suspension immédiate du compte",
                  "Blocage des fonds",
                  "Enquête interne",
                  "Signalement aux autorités compétentes",
                ]}
              />
            </SectionBlock>

            <SectionBlock title="7. Responsabilité de l'utilisateur">
              <Prose>L'utilisateur doit :</Prose>
              <BulletList
                items={[
                  "Protéger ses identifiants",
                  "Signaler toute activité suspecte",
                  "Fournir des informations exactes",
                ]}
              />
            </SectionBlock>

            <SectionBlock title="8. Coopération avec les autorités">
              <Prose>
                SharePay coopère avec les autorités en cas de fraude ou
                d'enquête.
              </Prose>
            </SectionBlock>

            <SectionBlock title="9. Mise à jour">
              <Prose>Cette politique peut être modifiée à tout moment.</Prose>
            </SectionBlock>
          </div>

          {/* ─── VI. AML ─── */}
          <div className="space-y-8">
            <ChapterHeading>VI. Politique AML (Anti-Blanchiment)</ChapterHeading>

            <SectionBlock title="1. Objectif">
              <Prose>
                SharePay s'engage à prévenir le blanchiment d'argent et le
                financement du terrorisme.
              </Prose>
            </SectionBlock>

            <SectionBlock title="2. Conformité">
              <Prose>
                SharePay respecte les réglementations locales et
                internationales applicables.
              </Prose>
            </SectionBlock>

            <SectionBlock title="3. Identification des clients KYC (Know Your Customer)">
              <Prose>Tous les utilisateurs doivent fournir :</Prose>
              <BulletList
                items={[
                  "Identité valide",
                  "Numéro de téléphone vérifié",
                  "Informations exactes",
                ]}
              />
              <Prose>
                Des vérifications supplémentaires peuvent être exigées.
              </Prose>
            </SectionBlock>

            <SectionBlock title="4. Surveillance des transactions">
              <Prose>
                Les transactions sont surveillées pour détecter :
              </Prose>
              <BulletList
                items={[
                  "Activités inhabituelles",
                  "Transactions importantes répétées",
                  "Comportements suspects",
                ]}
              />
            </SectionBlock>

            <SectionBlock title="5. Profil de risque">
              <Prose>
                Chaque utilisateur est évalué selon un niveau de risque :
              </Prose>
              <BulletList items={["Faible", "Moyen", "Élevé"]} />
              <Prose>
                Les utilisateurs à risque élevé font l'objet de contrôles
                renforcés.
              </Prose>
            </SectionBlock>

            <SectionBlock title="6. Transactions suspectes">
              <Prose>En cas de suspicion :</Prose>
              <BulletList
                items={[
                  "Blocage des fonds",
                  "Suspension du compte",
                  "Analyse approfondie",
                ]}
              />
            </SectionBlock>

            <SectionBlock title="7. Déclaration aux autorités">
              <Prose>
                SharePay peut signaler toute activité suspecte aux autorités
                compétentes.
              </Prose>
            </SectionBlock>

            <SectionBlock title="8. Conservation des données">
              <Prose>
                Les données liées aux transactions sont conservées pour audit
                et conformité.
              </Prose>
            </SectionBlock>

            <SectionBlock title="9. Formation et sensibilisation">
              <Prose>
                Les administrateurs du système sont sensibilisés aux risques
                AML.
              </Prose>
            </SectionBlock>

            <SectionBlock title="10. Sanctions">
              <Prose>
                Tout utilisateur impliqué dans des activités illicites sera :
              </Prose>
              <BulletList
                items={["Suspendu", "Signalé", "Poursuivi si nécessaire"]}
              />
            </SectionBlock>

            <SectionBlock title="11. Mise à jour">
              <Prose>Cette politique peut être modifiée.</Prose>
            </SectionBlock>
          </div>

          {/* ─── IX. JOURNALISATION & AUDIT ─── */}
          <div className="space-y-8">
            <ChapterHeading>IX. Politique de Journalisation et d'Audit</ChapterHeading>

            <SectionBlock title="1. Objectif">
              <Prose>
                Cette politique définit la collecte, la gestion et
                l'utilisation des logs pour assurer :
              </Prose>
              <BulletList
                items={["La sécurité", "La traçabilité", "La conformité"]}
              />
            </SectionBlock>

            <SectionBlock title="2. Données journalisées">
              <Prose>SharePay enregistre :</Prose>
              <div className="space-y-3 pl-2">
                <div>
                  <p className="font-semibold text-foreground text-sm mb-1">
                    a) Logs de connexion
                  </p>
                  <BulletList
                    items={["Date et heure", "Adresse IP", "Appareil"]}
                  />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm mb-1">
                    b) Logs de transaction
                  </p>
                  <BulletList
                    items={["Montant", "Statut", "Identifiants"]}
                  />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm mb-1">
                    c) Logs système
                  </p>
                  <BulletList
                    items={["Erreurs", "Accès API", "Activités internes"]}
                  />
                </div>
              </div>
            </SectionBlock>

            <SectionBlock title="3. Objectifs des logs">
              <Prose>Les logs servent à :</Prose>
              <BulletList
                items={[
                  "Détecter la fraude",
                  "Résoudre les incidents",
                  "Auditer les transactions",
                  "Assurer la conformité",
                ]}
              />
            </SectionBlock>

            <SectionBlock title="4. Sécurité des logs">
              <Prose>Les logs sont :</Prose>
              <BulletList
                items={[
                  "Stockés de manière sécurisée",
                  "Protégés contre modification",
                  "Accessibles uniquement aux personnes autorisées",
                ]}
              />
            </SectionBlock>

            <SectionBlock title="5. Conservation">
              <BulletList
                items={["6 à 24 mois selon les obligations légales"]}
              />
            </SectionBlock>

            <SectionBlock title="6. Audit">
              <Prose>Des audits peuvent être réalisés pour :</Prose>
              <BulletList
                items={[
                  "Vérifier la sécurité",
                  "Contrôler les transactions",
                  "Détecter les anomalies",
                ]}
              />
            </SectionBlock>

            <SectionBlock title="7. Accès aux logs">
              <Prose>L'accès est limité à :</Prose>
              <BulletList
                items={["Administrateurs autorisés", "Auditeurs"]}
              />
            </SectionBlock>

            <SectionBlock title="8. Intégrité">
              <Prose>
                Toute tentative de modification ou suppression non autorisée
                est interdite.
              </Prose>
            </SectionBlock>

            <SectionBlock title="9. Incident de sécurité">
              <Prose>En cas d'incident :</Prose>
              <BulletList
                items={[
                  "Analyse des logs",
                  "Identification de la source",
                  "Correction immédiate",
                ]}
              />
            </SectionBlock>

            <SectionBlock title="10. Conformité">
              <Prose>
                Les logs respectent les exigences légales et réglementaires.
              </Prose>
            </SectionBlock>

            <SectionBlock title="11. Mise à jour">
              <Prose>Cette politique peut être modifiée.</Prose>
            </SectionBlock>
          </div>

        </div>
      </div>
    </div>
  );
}
