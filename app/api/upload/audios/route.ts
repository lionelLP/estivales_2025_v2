import pool from "@/lib/db/mysql";
import { access, mkdir, writeFile } from "fs/promises";
import { ResultSetHeader } from "mysql2";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { apiMiddleware } from "../../middleware";

export async function POST(request: NextRequest) {
    const middlewareResponse = await apiMiddleware(request);
    if (middlewareResponse.status !== 200) {
        return middlewareResponse;
    }

    try {
        const formData = await request.formData();
        const files = formData.getAll("files") as File[];
        const eventId = formData.get("eventId");
        const isOeuvre = formData.get("isOeuvre") === "true";

        if (!files || files.length === 0) {
            return NextResponse.json(
                { error: "Aucun fichier fourni" },
                { status: 400 }
            );
        }

        // Vérifier si le répertoire d'upload existe, sinon le créer
        let uploadDir;
        if (isOeuvre) {
            uploadDir = path.join(process.cwd(), "public", "uploads", "oeuvres", "audio");
        } else {
            uploadDir = path.join(process.cwd(), "public", "uploads", "audios");
        }

        try {
            await access(uploadDir);
        } catch {
            await mkdir(uploadDir, { recursive: true });
        }

        const connection = await pool.getConnection();
        const uploadedFiles = [];

        try {
            // Vérifier la structure de la table Media pour déterminer les champs disponibles
            const [tableInfo] = await connection.execute("DESCRIBE Media");
            const columns = (tableInfo as { Field: string }[]).map(
                (col) => col.Field
            );

            for (const file of files) {
                // Convertir le fichier en Buffer
                let buffer;
                try {
                    buffer = Buffer.from(await file.arrayBuffer());
                } catch (bufferError) {
                    console.error("Erreur lors de la création du buffer:", bufferError);
                    return NextResponse.json(
                        { error: `Erreur lors de la lecture du fichier ${file.name}` },
                        { status: 500 }
                    );
                }

                // Vérification simple du type MIME (optionnel, peut être amélioré)
                if (!file.type.startsWith("audio/")) {
                    console.error(`Format non supporté: ${file.name} (${file.type})`);
                    return NextResponse.json(
                        { error: `Le fichier ${file.name} n'est pas un fichier audio valide.` },
                        { status: 400 }
                    );
                }

                // Créer un nom de fichier unique
                const originalName = path.parse(file.name).name;
                // Obtenir l'extension du fichier original
                const extension = path.parse(file.name).ext;

                const sanitizedOriginalName = originalName.replace(
                    /[^a-zA-Z0-9-_]/g,
                    "_"
                );
                const timestamp = Date.now();
                // Conserver l'extension originale pour l'audio
                const filename = `${timestamp}_${sanitizedOriginalName}${extension}`;
                const filepath = path.join(uploadDir, filename);
                const relativePath = isOeuvre 
                    ? `/uploads/oeuvres/audio/${filename}`
                    : `/uploads/audios/${filename}`;

                // Écrire le fichier sur le disque
                try {
                    await writeFile(filepath, buffer);
                } catch (writeError) {
                    return NextResponse.json(
                        {
                            error: `Erreur lors de l'enregistrement du fichier ${file.name}`,
                            details:
                                writeError instanceof Error
                                    ? writeError.message
                                    : String(writeError),
                        },
                        { status: 500 }
                    );
                }

                try {
                    if (isOeuvre) {
                        // Pour les oeuvres, on ne sauvegarde pas dans Media
                        uploadedFiles.push({
                            id: null,
                            url: relativePath,
                            name: file.name,
                        });
                        continue;
                    }

                    // Préparer la requête SQL en fonction des colonnes disponibles
                    let query, params;

                    if (columns.includes("is_published")) {
                        query =
                            "INSERT INTO Media (url, type, title, size, is_published) VALUES (?, ?, ?, ?, ?)";
                        params = [
                            relativePath,
                            file.type || "audio/mpeg", // Utiliser le type mime du fichier ou un défaut
                            file.name,
                            buffer.length,
                            1,
                        ];
                    } else {
                        query =
                            "INSERT INTO Media (url, type, title, size) VALUES (?, ?, ?, ?)";
                        params = [relativePath, file.type || "audio/mpeg", file.name, buffer.length];
                    }

                    // Insérer dans la base de données
                    const [mediaResult] = await connection.execute(query, params);

                    const mediaId = (mediaResult as ResultSetHeader).insertId;

                    // Créer la relation Event_Media si necessaire
                    if (eventId) {
                        try {
                            await connection.execute(
                                `INSERT INTO Event_Media (event_id, media_id) VALUES (?, ?)`,
                                [eventId, mediaId]
                            );
                        } catch (relationError) {
                            console.error(
                                "Erreur lors de la création de la relation Event_Media:",
                                relationError
                            );
                            // On continue même si la création de la relation échoue
                        }
                    }

                    uploadedFiles.push({
                        id: mediaId,
                        url: relativePath,
                        name: file.name,
                    });
                } catch (dbError) {
                    console.error(
                        "Erreur lors de l'insertion en base de données:",
                        dbError
                    );
                    return NextResponse.json(
                        {
                            error: "Erreur lors de l'enregistrement en base de données",
                            details:
                                dbError instanceof Error ? dbError.message : String(dbError),
                        },
                        { status: 500 }
                    );
                }
            }

            return NextResponse.json({ files: uploadedFiles });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error("Erreur générale lors de l'upload:", error);
        return NextResponse.json(
            {
                error: "Erreur lors de l'upload",
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}
