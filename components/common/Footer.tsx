"use client";

import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  const addressForMaps = encodeURIComponent("13 avenue Alsace Lorraine, 01000 Bourg en Bresse, France");
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${addressForMaps}`;

  return (
    <footer className="bg-gradient-to-r from-rose-600 to-pink-600 text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Grille principale */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Estivale de Brou</h2>
            <p className="text-sm text-white/80">
              Association organisant des spectacles lyriques et événements
              culturels, promouvant de jeunes artistes professionnels.
            </p>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liens Rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/programme/passes" className="hover:text-white/80 transition">
                  Événements précédents
                </Link>
              </li>
              <li>
                <Link href="/programme/futur" className="hover:text-white/80 transition">
                  Programmes à venir
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white/80 transition">
                  À propos
                </Link>
              </li>
              <li>
                <Link
                  href="/pratique/contact"
                  className="hover:text-white/80 transition"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Informations de contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact</h3>
            <div className="space-y-3">
              <a
                href="mailto:estivales.brou@wanadoo.fr"
                className="flex items-center gap-2 hover:text-white/80 transition"
              >
                <Mail className="h-4 w-4" />
                <span>estivales.brou@wanadoo.fr</span>
              </a>
              <a
                href="tel:0474236325"
                className="flex items-center gap-2 hover:text-white/80 transition"
              >
                <Phone className="h-4 w-4" />
                <span>04 74 23 63 25</span>
              </a>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <a 
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white/80 transition"
                >
                  <span>
                    Soirées Estivales de Brou
                    <br />
                    13 avenue Alsace Lorraine
                    <br />
                    01000 Bourg en Bresse
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
            <form className="space-y-3">
              <input
                type="email"
                placeholder="Votre email"
                className="w-full px-4 py-2 rounded bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 transition"
              />
              <button
                type="submit"
                className="w-full px-4 py-2 bg-white text-rose-600 rounded font-medium hover:bg-white/90 transition"
              >
                S&apos;abonner
              </button>
            </form>
          </div>
        </div>

        {/* Barre de bas de page */}
        <div className="mt-12 pt-8 border-t border-white/20 text-center text-sm text-white/60">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p>
              © {new Date().getFullYear()} Estivale de Brou. Tous droits
              réservés.
            </p>
            <Link
              href="/mentions-legales"
              className="hover:text-white transition"
            >
              Mentions Légales
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
