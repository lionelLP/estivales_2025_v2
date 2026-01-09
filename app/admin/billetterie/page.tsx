import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Billetterie | Estivales de Brou",
    description: "Gestion des prix de la billetterie",
    robots: {
        index: false,
        follow: false,
    },
    openGraph: {
        title: "Billetterie | Estivales de Brou",
        description: "Gestion des prix de la billetterie",
        images: [
            {
                url: "/billetterie/banner.jpg",
                width: 1200,
                height: 630,
                alt: "Billetterie Estivales de Brou",
            },
        ],
    },
};

export {default} from "./billetterie";
