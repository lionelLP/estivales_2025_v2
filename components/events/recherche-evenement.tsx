"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

interface RechercheEvenementProps {
  mode: "past" | "toCome";
  onSearch?: (query: string) => void;
}

export function RechercheEvenement({
  mode,
  onSearch,
}: RechercheEvenementProps) {
  const placeholder =
    mode === "past"
      ? "Rechercher dans les événements passés..."
      : "Rechercher dans les événements à venir...";

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Card className="p-3 shadow-md">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder={placeholder}
            onChange={(e) => onSearch && onSearch(e.target.value)}
            className="pl-9 w-full border-gray-200 focus:ring-2 focus:ring-bleu-fonce focus:border-transparent transition-all duration-200"
          />
        </div>
      </Card>
    </motion.div>
  );
}
