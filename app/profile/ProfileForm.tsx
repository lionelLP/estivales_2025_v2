"use client";

import PasswordField from "@/components/common/PasswordField";
import ShinyButton from "@/components/magicui/shiny-button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Key, Mail, User} from "lucide-react";
import {useEffect, useState} from "react";

export default function ProfileForm({ user }: { user: any }) {
    const [formData, setFormData] = useState({
        email: user.email,
        username: user.username,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    })

    const [message, setMessage] = useState({text: "", type: ""});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch("/api/auth/me");
                const data = await response.json();
                if (response.ok) {
                    setFormData((prev) => ({
                        ...prev,
                        email: data.email,
                        username: data.username,
                    }));
                }
            } catch {
                setMessage({
                    text: "Erreur lors du chargement des données",
                    type: "error",
                });
            }
        };
        fetchUserData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage({text: "", type: ""});

        try {
            const response = await fetch("/api/auth/update-profile", {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({text: "Profil mis à jour avec succès", type: "success"});
                setIsEditing(false);
            } else {
                setMessage({text: data.message, type: "error"});
            }
        } catch {
            setMessage({text: "Une erreur est survenue", type: "error"});
        } finally {
            setIsSubmitting(false);
        }
    };

    const generatePassword = () => {
        const length = 14; // minimum
        const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const lowercase = "abcdefghijklmnopqrstuvwxyz";
        const digits = "0123456789";
        const specials = "!@#$%^&*()_-+=<>?/{}[]";
        const all = uppercase + lowercase + digits + specials;
        let pwd = "";
        pwd += uppercase[Math.floor(Math.random() * uppercase.length)];
        pwd += specials[Math.floor(Math.random() * specials.length)];
        for (let i = pwd.length; i < length; i++) {
            pwd += all[Math.floor(Math.random() * all.length)];
        }
        pwd = pwd
            .split("")
            .sort(() => Math.random() - 0.5)
            .join("");

        return pwd;
    };

    return (
        <div className="container mx-auto px-4 py-8 mt-7">
            <div className="items-center min-w-min mb-6">
                <div className="bg-white items-center text-center rounded-full p-3 justify-self-center">
                    <User className="w-20 h-20 text-red-brou"/>
                </div>
            </div>
            <h1 className="text-3xl font-bold text-center px-8 align-middle">
                Mon profil
            </h1>
            <div className="justify-self-center my-6">
                <ShinyButton
                    text={isEditing ? "Annuler" : "Modifier le profil"}
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-6"
                /></div>

            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8">
                {/* Username Field */}
                <div className="space-y-2">
                    <Label
                        htmlFor="username"
                        className="text-lg font-medium flex items-center gap-2"
                    >
                        <User className="w-5 h-5 text-red-brou"/>
                        Nom d&apos;utilisateur
                    </Label>
                    <Input
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        disabled={!isEditing}
                    />
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                    <Label
                        htmlFor="email"
                        className="text-lg font-medium flex items-center gap-2"
                    >
                        <Mail className="w-5 h-5 text-red-brou"/>
                        Email
                    </Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={!isEditing}
                    />
                </div>

                {isEditing && (
                    <>
                        <div className="border-t border-gray-700 pt-8 mt-8">
                            <h2 className="text-2xl font-semibold text-center gap-2 mb-6">
                                Changer de mot de passe
                            </h2>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="currentPassword"
                                    className="text-lg font-medium flex items-center gap-2"
                                >
                                    <Key className="w-5 h-5 text-red-brou"/>
                                    Mot de passe actuel
                                </Label>
                                <PasswordField
                                    onChange={(value) =>
                                        setFormData({...formData, currentPassword: value})
                                    }
                                    showValidation={false}
                                />
                            </div>

                            <ShinyButton
                                text="Générer un nouveau mot de passe"
                                onClick={() =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        newPassword: generatePassword(),
                                    }))
                                }
                                className="px-6 my-6"
                            />

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="newPassword"
                                        className="text-lg font-medium"
                                    >
                                        Nouveau mot de passe
                                    </Label>
                                    <PasswordField
                                        value={formData.newPassword}
                                        onChange={(value) =>
                                            setFormData({...formData, newPassword: value})
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="confirmPassword"
                                        className="text-lg font-medium"
                                    >
                                        Confirmer le nouveau mot de passe
                                    </Label>
                                    <PasswordField
                                        onChange={(value) =>
                                            setFormData({
                                                ...formData,
                                                confirmPassword: value,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        {message.text && (
                            <div
                                className={`p-4 rounded-lg ${
                                    message.type === "success"
                                        ? "bg-green-50 text-green-700 border border-green-200"
                                        : "bg-red-50 text-red-700 border border-red-200"
                                }`}
                            >
                                {message.text}
                            </div>
                        )}

                        <div className="flex justify-end">
                            <ShinyButton
                                text={
                                    isSubmitting
                                        ? "MISE À JOUR..."
                                        : "ENREGISTRER LES MODIFICATIONS"
                                }
                                className="px-8"
                                type="submit"
                                disabled={isSubmitting}
                            />
                        </div>
                    </>
                )}
            </form>
        </div>
    );
}