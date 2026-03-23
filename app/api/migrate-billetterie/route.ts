import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS \`Billetterie\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`content\` json NOT NULL,
        \`updated_at\` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
    `);

    const initialData = {
      columns: [
        { id: "barbier", name: "Le Barbier de Séville", hasSerie2: true },
        { id: "piano", name: "Cherche piano aqueux", hasSerie2: false },
        { id: "requiem", name: "Requiem Fauré", hasSerie2: false },
        { id: "tenors", name: "Trois ténors", hasSerie2: false },
        { id: "pass", name: "Pass'Festival", hasSerie2: true },
      ],
      rows: [
        {
          id: "entree",
          category: "Entrée",
          prices: {
            barbier: { serie1: "39 €", serie2: "32 €" },
            piano: { serie1: "29 €", serie2: "" },
            requiem: { serie1: "34 €", serie2: "" },
            tenors: { serie1: "27 €", serie2: "" },
            pass: { serie1: "73 €", serie2: "66 €" }
          }
        },
        {
          id: "preferentiel",
          category: "Préférentiel",
          prices: {
            barbier: { serie1: "36 €", serie2: "29 €" },
            piano: { serie1: "27 €", serie2: "" },
            requiem: { serie1: "31 €", serie2: "" },
            tenors: { serie1: "25 €", serie2: "" },
            pass: { serie1: "67 €", serie2: "60 €" }
          }
        },
        {
          id: "jeunes",
          category: "Jeunes",
          prices: {
            barbier: { serie1: "15 €", serie2: "10 €" },
            piano: { serie1: "10 €", serie2: "" },
            requiem: { serie1: "12 €", serie2: "" },
            tenors: { serie1: "8 €", serie2: "" },
            pass: { serie1: "27 €", serie2: "22 €" }
          }
        }
      ],
      info: [
        "« Chéquier Jeune 01 » et « Carte Pass région » acceptés pour la billetterie et le Pass'Festival",
        "Tarif préférentiel : adhérents Estivales de Brou et JM France",
        "Groupes (dès 15 personnes)",
        "Tarif jeunes : moins de 20 ans",
        "Enfants gratuits jusqu'à 12 ans",
        "Places non numérotées, sauf au théâtre",
        "Ouverture des portes ½ heure avant le début de chaque représentation"
      ],
      reservation: {
        telephone: {
          titre: "Par téléphone",
          numero: "04 74 23 63 25",
          horaires: "10h à 12h et 15h à 18h du mardi au vendredi"
        },
        courrier: {
          titre: "Par courrier",
          lignes: ["Estivales de Brou", "13 avenue Alsace Lorraine", "01000 Bourg en Bresse"]
        },
        internet: {
          titre: "Par Internet",
          liens: [
            { nom: "FNAC Spectacles", url: "https://www.fnacspectacles.com/artist/les-estivales-de-brou/" },
            { nom: "France Billet", url: "https://www.francebillet.com/artist/les-estivales-de-brou/" }
          ]
        },
        bureau: {
          titre: "Au bureau de location",
          lignes: ["Cinéma Amphi de Bourg", "Les mercredis et samedis de 15h à 18h", "à partir du samedi 10 mai 2024"]
        }
      },
      notes: [
        "Les places retenues par téléphone et non réglées dans la quinzaine seront remises en vente.",
        "Les billets ne seront plus expédiés à partir du 22 juin.",
        "Ils devront alors être retirés au guichet 20 minutes au plus tard avant le début du spectacle.",
        "En aucun cas les billets ne seront repris."
      ],
      images: {
        page1: "/billetterie/programme_page1.png",
        page2: "/billetterie/programme_page2.png",
        pdf1: "/billetterie/programme_page1.pdf",
        pdf2: "/billetterie/programme_page2.pdf"
      }
    };

    const [rows] = await db.query("SELECT id FROM Billetterie WHERE id = 1");
    if ((rows as any[]).length === 0) {
      await db.query("INSERT INTO Billetterie (id, content) VALUES (1, ?)", [JSON.stringify(initialData)]);
      return NextResponse.json({ success: true, message: "Migration OK" });
    }
    
    return NextResponse.json({ success: true, message: "Déjà migré" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
