import mysql from "mysql2/promise";

// Utilisation directe des variables d'environnement avec valeurs par défaut sécurisées
const host = process.env.DB_HOST || "localhost";
const port = parseInt(process.env.DB_PORT || "3306", 10);

const pool = mysql.createPool({
  host: host,
  port: port,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 60000, // Augmenter le timeout à 60 secondes
});

// Fonction pour tester la connexion
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    connection.release();
    return true;
  } catch (error) {
    console.error("Erreur de connexion à la base de données:", error);
    return false;
  }
}

export default pool;
