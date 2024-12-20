"use client";

export default function MentionsLegales() {
  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-12">
          Mentions Légales
        </h1>

        <div className="space-y-8 px-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Édition du site</h2>
            <p>
              Le site estivales-brou.fr est édité par la Ville de
              Bourg-en-Bresse, située à :
            </p>
            <address className="not-italic">
              Place de l'Hôtel de Ville
              <br />
              BP 90419
              <br />
              01012 Bourg-en-Bresse Cedex
            </address>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Hébergement</h2>
            <p>
              Le site est hébergé par ..., situé à :<br />
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              3. Propriété intellectuelle
            </h2>
            <p>
              L'ensemble du contenu de ce site (textes, images, vidéos, etc.)
              est protégé par le droit d'auteur. Toute reproduction ou
              représentation, intégrale ou partielle, par quelque procédé que ce
              soit, est strictement interdite sans autorisation préalable.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              4. Protection des données personnelles
            </h2>
            <p>
              Conformément au Règlement Général sur la Protection des Données
              (RGPD), vous disposez d'un droit d'accès, de rectification et de
              suppression des données vous concernant. Pour exercer ces droits
              ou pour toute question, vous pouvez nous contacter via le
              formulaire de contact.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Cookies</h2>
            <p>
              Ce site utilise des cookies nécessaires à son bon fonctionnement.
              En naviguant sur ce site, vous acceptez leur utilisation. Ces
              cookies ne collectent aucune donnée personnelle.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Liens externes</h2>
            <p>
              Le site peut contenir des liens vers des sites externes. La Ville
              de Bourg-en-Bresse n'est pas responsable du contenu de ces sites
              et ne peut être tenue responsable des dommages résultant de leur
              utilisation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Contact</h2>
            <p>
              Pour toute question concernant ces mentions légales, vous pouvez
              nous contacter à l'adresse suivante :
            </p>
            <p>Email : contact@estivales-brou.fr</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              8. Modification des mentions légales
            </h2>
            <p>
              La Ville de Bourg-en-Bresse se réserve le droit de modifier ces
              mentions légales à tout moment. Les utilisateurs sont invités à
              les consulter régulièrement.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Dernière mise à jour : {new Date().toLocaleDateString()}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
