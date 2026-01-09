"use client";

import PasswordField from "@/components/common/PasswordField";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {useRouter} from "next/navigation";
import {useState} from "react";
import ShinyButton from "@/components/magicui/shiny-button";
import {Key, Mail, User, UserPlus, Users} from "lucide-react";

export default function CreateUser() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        userType: "1", // 1 pour utilisateur standard, 0 pour admin
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: formData.username,
                    email: formData.email,
                    password: formData.password,
                    userType: parseInt(formData.userType),
                }),
            });

            if (response.ok) {
                router.push("/admin");
                router.refresh();
            } else {
                const data = await response.json();
                setError(data.message || "Une erreur est survenue");
            }
        } catch {
            setError("Une erreur est survenue lors de la création de l'utilisateur");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const {name, value} = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
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
        <div className="container mx-auto px-4 py-8">
            <div className="items-center min-w-min mb-6">
                <div className="bg-white items-center text-center rounded-full p-3 justify-self-center">
                    <UserPlus className="w-20 h-20 text-red-brou"/>
                </div>
            </div>
            {/*<UserPlus className="h-12 w-12" />*/}
            <h1 className="text-3xl font-bold text-center mb-12">
                Créer un nouvel utilisateur
            </h1>

            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8">
                {error && (
                    <div className="bg-red-50 text-red-500 p-4 rounded-lg">{error}</div>
                )}

                {/* Nom d'utilisateur */}
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
                        type="text"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <Label
                        htmlFor="email"
                        className="text-lg font-medium flex items-center gap-2"
                    >
                        <Mail className="w-5 h-5 text-red-brou"/>
                        Adresse email
                    </Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Mot de passe */}
                <div className="space-y-2">
                    <Label htmlFor="password" className="text-lg font-medium flex items-center gap-2"
                    >
                        <Key className="w-5 h-5 text-red-brou"/>
                        Mot de passe
                    </Label>
                    <PasswordField
                        value={formData.password}
                        onChange={(value) =>
                            setFormData((prev) => ({...prev, password: value}))
                        }
                    />
                </div>
                {/* Bouton à génération auto mot de passe */}
                <ShinyButton
                    text="Générer un mot de passe"
                    onClick={() =>
                        setFormData((prev) => ({
                            ...prev,
                            password: generatePassword(),
                        }))
                    }
                    className="px-6"
                />

                {/* Type d'utilisateur */}
                <div className="space-y-2">
                    <Label htmlFor="userType" className="text-lg font-medium flex items-center gap-2"
                    >
                        <Users className="w-5 h-5 text-red-brou" />
                        Type d&apos;utilisateur
                    </Label>
                    <select
                        id="userType"
                        name="userType"
                        value={formData.userType}
                        onChange={handleChange}
                        className="w-full rounded-lg border p-2 bg-white dark:bg-zinc-800"
                        required
                    >
                        <option value="1">Choriste</option>
                        <option value="0">Administrateur</option>
                    </select>
                </div>

                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-4 py-2 text-gray-600 hover:text-red-brou transition"
                    >
                        Annuler
                    </button>
                    <ShinyButton
                        text={isSubmitting ? "Création..." : "Créer l'utilisateur"}
                        onClick={() =>
                            setFormData((prev) => ({
                                ...prev,
                                password: formData.password,
                            }))
                        }
                        disabled={isSubmitting}
                        className="px-6"
                        type="submit"
                    />
                </div>
            </form>
        </div>
    );
}
