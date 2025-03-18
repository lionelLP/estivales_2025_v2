"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export interface FiltreEvenementProps {
  mode: "past" | "toCome";
  onFilter?: (filters: { location: string; category: string }) => void;
  locations?: string[];
}

export function FiltreEvenement({
  mode,
  onFilter,
  locations = [],
}: FiltreEvenementProps) {
  const [location, setLocation] = useState("Tous");
  const [category, setCategory] = useState("Tous");

  // Log pour vérifier les locations reçues
  useEffect(() => {
    console.log("FiltreEvenement - locations reçues :", locations);
  }, [locations]);

  const handleFilter = () => {
    if (onFilter) {
      onFilter({ location, category });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full mt-4"
    >
      <Card className="p-4 shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-bleu-fonce dark:text-bleu-clair">
          Filtrer les{" "}
          {mode === "past" ? "événements passés" : "événements à venir"}
        </h3>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sélectionner un lieu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tous">Tous les lieux</SelectItem>
              {locations.length > 0 ? (
                locations.map((lieu) => (
                  <SelectItem key={lieu} value={lieu}>
                    {lieu}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="Aucun" disabled>
                  Aucun lieu disponible
                </SelectItem>
              )}
            </SelectContent>
          </Select>

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sélectionner une catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tous">Toutes les catégories</SelectItem>
              <SelectItem value="Concert">Concert</SelectItem>
              <SelectItem value="Théâtre">Théâtre</SelectItem>
              <SelectItem value="Exposition">Exposition</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={handleFilter}
            className="bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-full shadow-md hover:shadow-lg transition-all duration-200"
          >
            Appliquer filtres
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
