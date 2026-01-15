import pool from "@/lib/db/mysql";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute("DESCRIBE Media");
        connection.release();
        return NextResponse.json(rows);
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
