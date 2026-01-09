import pool from "@/lib/db/mysql";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const connection = await pool.getConnection();
    
    try {
      const [dates] = await connection.execute(
        "SELECT * FROM Event_Date WHERE event_id = ? ORDER BY date_time ASC",
        [resolvedParams.id]
      );

      return NextResponse.json({ dates });
    } catch (error) {
      console.error("Erreur SQL:", error);
      return NextResponse.json(
        { error: "Erreur lors de la récupération des dates" },
        { status: 500 }
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
