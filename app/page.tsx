import ImageCarousel from "@/components/common/ImageCarousel";
import { TimelineHistory } from "@/components/common/TimelineHistory";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen">
      <ImageCarousel />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Texte à gauche */}
            <div className="text-left col-span-2">
              <h1 className="text-4xl font-bold mb-8 text-bleu-fonce dark:text-bleu-clair">
                Les Estivales de Brou
              </h1>

              <div className="prose prose-lg dark:prose-invert">
                <p className="mb-6">
                  Les Estivales de Brou, c&apos;est l&apos;histoire d&apos;une
                  passion pour la musique et les arts lyriques qui anime notre
                  région depuis plus de 20 ans. Notre festival est devenu un
                  rendez-vous incontournable pour les amateurs d&apos;opéra et
                  de musique classique.
                </p>

                <p className="mb-6">
                  Notre mission est de promouvoir de jeunes artistes
                  professionnels talentueux tout en rendant l&apos;art lyrique
                  accessible à tous. Chaque été, nous transformons des lieux
                  historiques en scènes magiques où la musique prend vie.
                </p>

                <p>
                  Rejoignez-nous pour vivre des moments inoubliables et
                  découvrir la beauté de l&apos;art lyrique dans un cadre
                  exceptionnel.
                </p>
              </div>
            </div>

            {/* Image droite */}
            <div className="relative h-[400px] rounded-lg overflow-hidden shadow-xl">
              <Image
                src="/homepage/description.jpg"
                alt="Scène de concert"
                fill
                className="object-cover transform hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-bleu-fonce dark:text-bleu-clair">
          Actualités
        </h2>
        <TimelineHistory />
      </div>
    </div>
  );
}

