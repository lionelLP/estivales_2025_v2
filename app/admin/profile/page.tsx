"use client";

import PasswordField from "@/components/common/PasswordField";
import ShinyButton from "@/components/magicui/shiny-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key, Mail, User } from "lucide-react";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState({ text: "", type: "" });
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await fetch("/api/auth/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: "Profil mis à jour avec succès", type: "success" });
        setIsEditing(false);
      } else {
        setMessage({ text: data.message, type: "error" });
      }
    } catch {
      setMessage({ text: "Une erreur est survenue", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="relative h-32 bg-gradient-to-r from-blue-500 to-blue-600">
            <div className="absolute -bottom-12 left-8">
              <div className="bg-white rounded-full p-2 shadow-lg">
                <User className="w-20 h-20 text-blue-500" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="pt-16 px-8 pb-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
              <ShinyButton
                text={isEditing ? "Annuler" : "Modifier le profil"}
                onClick={() => setIsEditing(!isEditing)}
                className="px-6"
              />
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-lg font-medium flex items-center gap-2"
                  >
                    <Mail className="w-5 h-5 text-blue-500" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="h-12 text-lg bg-gray-50 border-gray-200 focus:ring-blue-500"
                    disabled={!isEditing}
                  />
                </div>

                {/* Username Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="username"
                    className="text-lg font-medium flex items-center gap-2"
                  >
                    <User className="w-5 h-5 text-blue-500" />
                    Nom d&apos;utilisateur
                  </Label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="h-12 text-lg bg-gray-50 border-gray-200 focus:ring-blue-500"
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {isEditing && (
                <>
                  <div className="border-t border-gray-100 pt-8 mt-8">
                    <div className="flex items-center gap-2 mb-6">
                      <Key className="w-6 h-6 text-blue-500" />
                      <h2 className="text-2xl font-semibold text-gray-900">
                        Changer le mot de passe
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <Label
                          htmlFor="currentPassword"
                          className="text-lg font-medium"
                        >
                          Mot de passe actuel
                        </Label>
                        <PasswordField
                          onChange={(value) =>
                            setFormData({ ...formData, currentPassword: value })
                          }
                          showValidation={false}
                        />
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label
                            htmlFor="newPassword"
                            className="text-lg font-medium"
                          >
                            Nouveau mot de passe
                          </Label>
                          <PasswordField
                            onChange={(value) =>
                              setFormData({ ...formData, newPassword: value })
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
        </div>
      </div>
    </div>
  );
}
