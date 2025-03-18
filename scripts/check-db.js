// Vérification de la structure de la table Media

require("dotenv").config({ path: ".env.local" });
const mysql = require("mysql2/promise");

async function main() {
  console.log("Connexion à la base de données...");

  // Création de la connexion
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    console.log("Vérification de la structure de la table Media...");

    // Obtenir la structure de la table Media
    const [columns] = await connection.execute("SHOW COLUMNS FROM Media");
    console.log("Structure de la table Media:");

    // Afficher chaque colonne et ses propriétés
    for (const column of columns) {
      console.log(
        `- ${column.Field}: ${column.Type} ${
          column.Null === "YES" ? "NULL" : "NOT NULL"
        } ${column.Key ? `(${column.Key})` : ""} ${
          column.Default ? `DEFAULT ${column.Default}` : ""
        } ${column.Extra}`
      );
    }

    console.log("\nListe des 5 derniers médias:");
    const [mediaRows] = await connection.execute(
      "SELECT * FROM Media ORDER BY id DESC LIMIT 5"
    );
    mediaRows.forEach((row) => {
      console.log(`[ID ${row.id}] ${row.title} (${row.type}) - ${row.url}`);
    });
  } catch (error) {
    console.error("Erreur lors de la vérification de la table Media:", error);
  } finally {
    console.log("Fermeture de la connexion...");
    await connection.end();
  }
}

main().catch(console.error);
