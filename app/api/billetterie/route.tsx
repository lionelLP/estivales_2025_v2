import { NextResponse } from "next/server";
import db from "@/lib/db";

const initialData = {
    columns: [
        { id: "barbier", name: "Le Barbier de Séville", seriesCount: 2 },
        { id: "piano", name: "Cherche piano aqueux", seriesCount: 1 },
        { id: "requiem", name: "Requiem Fauré", seriesCount: 1 },
        { id: "tenors", name: "Trois ténors", seriesCount: 1 },
        { id: "pass", name: "Pass'Festival", seriesCount: 2 },
    ],
    rows: [
        {
            id: "entree",
            category: "Entrée",
            prices: {
                barbier: ["39", "32"],
                piano: ["29"],
                requiem: ["34"],
                tenors: ["27"],
                pass: ["73", "66"]
            }
        },
        {
            id: "preferentiel",
            category: "Préférentiel",
            prices: {
                barbier: ["36", "29"],
                piano: ["27"],
                requiem: ["31"],
                tenors: ["25"],
                pass: ["67", "60"]
            }
        },
        {
            id: "jeunes",
            category: "Jeunes",
            prices: {
                barbier: ["15", "10"],
                piano: ["10"],
                requiem: ["12"],
                tenors: ["8"],
                pass: ["27", "22"]
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

// Fonction de migration à la volée du JSON pour supporter le nouveau format (hasSerie2 -> seriesCount)
function migrateLegacyFormat(content: any) {
    if (!content || !content.columns) return content;
    
    let isLegacy = false;
    const newColumns = content.columns.map((c: any) => {
        if (c.hasSerie2 !== undefined) {
            isLegacy = true;
            return {
                id: c.id,
                name: c.name,
                seriesCount: c.hasSerie2 ? 2 : 1
            };
        }
        return c;
    });

    if (isLegacy) {
        const newRows = content.rows.map((r: any) => {
            const newPrices: Record<string, string[]> = {};
            for (const colId in r.prices) {
                const legacyPrice = r.prices[colId];
                if (typeof legacyPrice === 'object' && !Array.isArray(legacyPrice)) {
                    const price1 = legacyPrice.serie1 ? legacyPrice.serie1.replace(" €", "").trim() : "";
                    const price2 = legacyPrice.serie2 ? legacyPrice.serie2.replace(" €", "").trim() : "";
                    
                    const col = newColumns.find((c: any) => c.id === colId);
                    if (col && col.seriesCount === 2) {
                        newPrices[colId] = [price1, price2];
                    } else {
                        newPrices[colId] = [price1];
                    }
                } else {
                    newPrices[colId] = legacyPrice;
                }
            }
            return {
                ...r,
                prices: newPrices
            };
        });

        return {
            ...content,
            columns: newColumns,
            rows: newRows
        };
    }

    return content;
}

// Récupérer les prix
export async function GET() {
    try {
        const [rows] = await db.query("SELECT content FROM Billetterie WHERE id = 1");
        const dataRows = rows as any[];
        
        if (dataRows.length > 0) {
            const content = migrateLegacyFormat(dataRows[0].content);
            return NextResponse.json(content);
        } else {
            await db.query("INSERT INTO Billetterie (id, content) VALUES (1, ?)", [JSON.stringify(initialData)]);
            return NextResponse.json(initialData);
        }
    } catch (e) {
        try {
            await db.query(`
              CREATE TABLE IF NOT EXISTS \`Billetterie\` (
                \`id\` int(11) NOT NULL AUTO_INCREMENT,
                \`content\` json NOT NULL,
                \`updated_at\` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
                PRIMARY KEY (\`id\`)
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            `);
            await db.query("INSERT INTO Billetterie (id, content) VALUES (1, ?)", [JSON.stringify(initialData)]);
            return NextResponse.json(initialData);
        } catch (err) {
            console.error(err);
            return NextResponse.json(initialData);
        }
    }
}

// Mettre à jour les prix
export async function POST(request: Request) {
    try {
        let body = await request.json();
        // S'assurer qu'il est migré si le front envoie un format curieux
        body = migrateLegacyFormat(body);

        await db.query("UPDATE Billetterie SET content = ? WHERE id = 1", [JSON.stringify(body)]);
        return NextResponse.json({ message: "Données de la billetterie mises à jour" });
    } catch (e: any) {
        console.error("Erreur de sauvegarde Billetterie:", e);
        return NextResponse.json({ message: "Erreur lors de la mise à jour", error: e.message }, { status: 500 });
    }
}
