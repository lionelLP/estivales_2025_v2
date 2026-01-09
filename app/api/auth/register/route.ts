import {verifyToken} from "@/lib/auth/jwt";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import {ResultSetHeader} from "mysql2";
import {cookies} from "next/headers";
import {NextResponse} from "next/server";
import {sendEmail} from "@/lib/email";
import {createEmailTemplate} from "@/lib/templates/emailTemplate";

export async function POST(request: Request) {
    // Vérification du rôle admin
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    if (!token) {
        return NextResponse.json(
            {error: "Non autorisé - Token manquant"},
            {status: 401}
        );
    }

    try {
        const decoded = await verifyToken(token.value);
        if (!decoded || decoded.userType !== 0) {
            return NextResponse.json(
                {error: "Non autorisé - Accès administrateur requis"},
                {status: 403}
            );
        }

        const body = await request.json();
        const {email, password, name: username, userType: userTypeOfNewAccount} = body;

        if (!email || !password || !username) {
            return NextResponse.json(
                {message: "Tous les champs sont requis"},
                {status: 400}
            );
        }

        const connection = await pool.getConnection();

        try {
            // Vérifier si l'email existe déjà
            const [existingUsers] = await connection.query(
                "SELECT email FROM User WHERE email = ?",
                [email]
            );

            if (Array.isArray(existingUsers) && existingUsers.length > 0) {
                return NextResponse.json(
                    {message: "Cet email est déjà utilisé"},
                    {status: 400}
                );
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            // Envoi du mail
            const emailResult = await sendEmail(
                email,
                "Création de votre compte",
                createEmailTemplate({
                    title: "Bienvenue sur Estivales",
                    content: `
                        <p>Bonjour <strong>${username}</strong>,</p>
                        <p>Votre compte vient d'être créé avec succès sur <i>Les Estivales de Brou</i>.</p>
                        <p>Vous pouvez dès maintenant vous connecter à la plateforme en tant <i>${(userTypeOfNewAccount == 0) ? 'qu\'administrateur' : 'que choriste'}</i>.
                        Voici vos identifiants pour vous connecter à votre espace personnel :</p> 
                        <p>Identifiant :<strong> ${username}</strong></p> 
                        <p>Email :<strong> ${email}</strong></p> 
                        <p>Mot de passe :<strong> ${password}</strong></p>
                        <p style="color: #6b7280; font-size: 14px;">
                        <strong>Attention</strong> : Ce mot de passe est temporaire et doit être modifié dès que possible. </p>

                        <div style="text-align: center; margin: 30px 0;">
                            <a href="estivalesdebrou.fr/login" 
                               style="background-color: #E11D48; color: white; padding: 12px 30px; 
                                      text-decoration: none; border-radius: 6px; display: inline-block;">
                                Se connecter
                            </a>
                        </div>
                    `,
                    email: email,
                    isNewsletter: false,
                }),
                false
            );

            if (!emailResult.success) {
                console.warn("Mail non envoyé :", emailResult.error);
                return NextResponse.json(
                    {message: "Cet email n'est pas valide"},
                    {status: 400}
                );
            }

            const [result] = await connection.query<ResultSetHeader>(
                "INSERT INTO User (username, password, email, userType, description) VALUES (?, ?, ?, ?, ?)",
                [username, hashedPassword, email, userTypeOfNewAccount, null]
            );

            return NextResponse.json(
                {
                    success: true,
                    user: {
                        id: result.insertId,
                        email,
                        username,
                        userTypeOfNewAccount,
                    },
                },
                {status: 201}
            );
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error("Erreur lors de l'inscription:", error);
        return NextResponse.json(
            {error: "Erreur lors de la création de l'utilisateur"},
            {status: 500}
        );
    }
}
