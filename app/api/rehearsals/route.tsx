import { verifyToken } from "@/lib/auth/jwt";
import pool from "@/lib/db/mysql";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token");

        if (!token) {
            return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
        }

        const decoded = await verifyToken(token.value);

        if (!decoded || (decoded.userType !== 0 && decoded.userType !== 1)) {
            return NextResponse.json({ message: "Accès refusé" }, { status: 403 });
        }

        const connection = await pool.getConnection();

        try {
            const [rehearsals] = await connection.query(
                `SELECT id, title, type, date, location, description
         FROM Rehearsals
         ORDER BY date ASC`
            );

            return NextResponse.json({ rehearsals });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error("Erreur GET /api/rehearsals:", error);
        return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token");

        if (!token) {
            return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
        }

        const decoded = await verifyToken(token.value);

        if (!decoded || (decoded.userType !== 0 && decoded.userType !== 1)) {
            return NextResponse.json({ message: "Accès refusé" }, { status: 403 });
        }

        const body = await req.json();

        const { title, type, date, location, description } = body;

        const formattedDate = formatSQLDate(date);

        if (!title || !type || !date) {
            return NextResponse.json(
                { message: "Champs obligatoires manquants" },
                { status: 400 }
            );
        }

        const connection = await pool.getConnection();

        try {
            await connection.query(
                `INSERT INTO Rehearsals
        (title, type, date, location, description, createdBy)
        VALUES (?, ?, ?, ?, ?, ?)`,
                [title, type, formattedDate, location, description, decoded.userId]
            );

            return NextResponse.json({ message: "Répétition ajoutée" });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error("Erreur POST /api/rehearsals:", error);
        return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token");

        if (!token) {
            return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
        }

        const decoded = await verifyToken(token.value);

        if (!decoded || (decoded.userType !== 0 && decoded.userType !== 1)) {
            return NextResponse.json({ message: "Accès refusé" }, { status: 403 });
        }

        const body = await req.json();
        const { id, title, type, date, location, description } = body;

        const formattedDate = formatSQLDate(date);

        const connection = await pool.getConnection();

        try {
            await connection.query(
                `UPDATE Rehearsals
        SET title=?, type=?, date=?, location=?, description=?
        WHERE id=?`,
                [title, type, formattedDate, location, description, id]
            );

            return NextResponse.json({ message: "Répétition modifiée" });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error("Erreur PUT /api/rehearsals:", error);
        return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token");

        if (!token) {
            return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
        }

        const decoded = await verifyToken(token.value);

        if (!decoded || (decoded.userType !== 0 && decoded.userType !== 1)) {
            return NextResponse.json({ message: "Accès refusé" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        const connection = await pool.getConnection();

        try {
            await connection.query(
                `DELETE FROM Rehearsals WHERE id=?`,
                [id]
            );

            return NextResponse.json({ message: "Répétition supprimée" });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error("Erreur DELETE /api/rehearsals:", error);
        return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
    }
}

export function formatSQLDate(date: string | Date) {
    return new Date(date).toISOString().slice(0, 19).replace("T", " ");
}