"use client";

import { AddressAutocomplete } from "@/components/common/AddressAutocomplete";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Contact() {
  const [formData, setFormData] = useState({
    firstname: "",
    name: "",
    email: "",
    address: "",
    city: "",
    postcode: "",
    coordinates: {
      lat: 0,
      lng: 0,
    },
    subject: "",
    message: "",
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(
    null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    const formDataToSend = new FormData();
    formDataToSend.append("firstname", formData.firstname);
    formDataToSend.append("name", formData.name);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("address", formData.address);
    formDataToSend.append("city", formData.city);
    formDataToSend.append("postcode", formData.postcode);
    formDataToSend.append("subject", formData.subject);
    formDataToSend.append("message", formData.message);

    attachments.forEach((file) => {
      formDataToSend.append("attachments", file);
    });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Une erreur est survenue");
      }

      setSubmitStatus("success");
      setFormData({
        firstname: "",
        name: "",
        email: "",
        address: "",
        city: "",
        postcode: "",
        coordinates: { lat: 0, lng: 0 },
        subject: "",
        message: "",
      });
      setAttachments([]);
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="container mx-auto px-4 py-16 mt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <h1 className="text-3xl font-bold text-center mb-12">Contactez-nous</h1>

        <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {submitStatus === "error" && (
              <div className="bg-red-50 text-red-500 p-4 rounded-lg">
                Une erreur est survenue. Veuillez réessayer.
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Prénom</label>
                <Input
                  id="firstname"
                  name="firstname"
                  type="text"
                  value={formData.firstname}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Nom</label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Email</label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Adresse</label>
              <AddressAutocomplete
                value={formData.address}
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    address: value,
                  }))
                }
                onSelect={(address) =>
                  setFormData((prev) => ({
                    ...prev,
                    address: address.label,
                    city: address.city,
                    postcode: address.postcode,
                    coordinates: address.coordinates,
                  }))
                }
                placeholder="Entrez votre adresse"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Sujet</label>
              <Input
                id="subject"
                name="subject"
                type="text"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="block text-sm font-medium">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full rounded-lg border p-3 bg-white dark:bg-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            {submitStatus === "success" && (
              <div className="bg-green-50 text-green-600 p-4 rounded-lg">
                Message envoyé avec succès !
              </div>
            )}

            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isSubmitting ? "Envoi en cours..." : "Envoyer"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
