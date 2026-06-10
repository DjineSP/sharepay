"use client";

export default function PrivacyPage() {
  return (
    <div className="pt-32 pb-24 min-h-screen">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl font-extrabold mb-4">
          Politique de Confidentialité
        </h1>
        <p className="text-sm text-muted-foreground mb-2 font-medium uppercase tracking-wide">
          SharePay - Vie Privée
        </p>
        <p className="text-muted-foreground mb-12 leading-relaxed">
          Dernière mise à jour : 13 Mai 2026. La présente Politique de
          Confidentialité décrit comment SharePay collecte, utilise, protège et
          partage les données personnelles dans le cadre de son service
          d'agrégation de paiement.
        </p>

        <div className="space-y-10">

          {/* 1. Introduction */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              SharePay fournit une plateforme permettant d'initier, de traiter
              et de gérer des paiements électroniques (Mobile Money, Orange
              Money, cartes bancaires, transferts). En utilisant nos services,
              vous acceptez cette politique.
            </p>
          </section>

          {/* 2. Données collectées */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">2. Données collectées</h2>
            <p className="text-muted-foreground leading-relaxed">
              Nous collectons les catégories suivantes :
            </p>

            <div className="space-y-4 pl-2">
              <div>
                <h3 className="font-semibold text-foreground mb-1">a) Données d'identification</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-2">
                  <li>Nom et prénom</li>
                  <li>Adresse email</li>
                  <li>Numéro de téléphone</li>
                  <li>Identifiant utilisateur</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">b) Données financières</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-2">
                  <li>Numéro de compte Mobile Money et Orange Money</li>
                  <li>Informations bancaires partielles</li>
                  <li>Historique des transactions</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">c) Données techniques</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-2">
                  <li>Adresse IP</li>
                  <li>Navigateur et appareil</li>
                  <li>Données de connexion</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">d) Données de localisation</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-2">
                  <li>Localisation approximative pour prévention de fraude</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 3. Finalités */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">3. Finalités de traitement</h2>
            <p className="text-muted-foreground leading-relaxed">Les données sont utilisées pour :</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-2">
              <li>Traiter les paiements</li>
              <li>Authentifier les utilisateurs (KYC)</li>
              <li>Prévenir la fraude et les abus</li>
              <li>Fournir un support client</li>
              <li>Améliorer la plateforme</li>
              <li>Respecter les obligations légales</li>
            </ul>
          </section>

          {/* 4. Partage */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">4. Partage des données</h2>
            <p className="text-muted-foreground leading-relaxed">
              Nous ne vendons aucune donnée. Les données peuvent être partagées avec :
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-2">
              <li>Fournisseurs de paiement (Mobile Money, Orange Money, banques)</li>
              <li>Prestataires techniques (hébergement, API)</li>
              <li>Autorités légales si requis</li>
            </ul>
          </section>

          {/* 5. Sécurité */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">5. Sécurité des données</h2>
            <p className="text-muted-foreground leading-relaxed">Nous mettons en œuvre :</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-2">
              <li>Chiffrement SSL/TLS</li>
              <li>Authentification sécurisée</li>
              <li>Surveillance des activités</li>
              <li>Protection contre accès non autorisé</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Cependant, aucun système n'est totalement sécurisé.
            </p>
          </section>

          {/* 6. Conservation */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">6. Conservation des données</h2>
            <p className="text-muted-foreground leading-relaxed">Les données sont conservées :</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-2">
              <li>Pendant la durée d'utilisation du service</li>
              <li>Selon les obligations légales</li>
              <li>Puis supprimées ou anonymisées</li>
            </ul>
          </section>

          {/* 7. Droits */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">7. Droits des utilisateurs</h2>
            <p className="text-muted-foreground leading-relaxed">L'utilisateur peut :</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-2">
              <li>Accéder à ses données</li>
              <li>Demander correction</li>
              <li>Demander suppression</li>
              <li>S'opposer à certains traitements</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Contact : contact@sharepay.cm
            </p>
          </section>

          {/* 8. Cookies */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">8. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">Nous utilisons des cookies pour :</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-2">
              <li>Fonctionnement du service</li>
              <li>Analyse</li>
              <li>Amélioration de l'expérience utilisateur (UX)</li>
            </ul>
          </section>

          {/* 9. Modification */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">9. Modification</h2>
            <p className="text-muted-foreground leading-relaxed">
              Cette politique peut être modifiée à tout moment.
            </p>
          </section>

          {/* 10. Contact */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">10. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              Email : contact@sharepay.cm<br />
              Ville : Yaoundé, Cameroun
            </p>
          </section>
        </div>

        <div className="mt-16 p-6 rounded-2xl bg-muted/50 border border-border/50 text-sm text-muted-foreground italic">
          Pour toute question relative à vos données personnelles, contactez-nous à{" "}
          <span className="font-medium not-italic">contact@sharepay.cm</span>.
        </div>
      </div>
    </div>
  );
}
