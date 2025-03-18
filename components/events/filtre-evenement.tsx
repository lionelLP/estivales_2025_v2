"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";

export interface FiltreEvenementProps {
  mode: "past" | "toCome";
  onFilter?: (filters: {
    location: string;
    dateRange: {
      from: Date | undefined;
      to: Date | undefined;
    };
  }) => void;
  locations?: string[];
}

export function FiltreEvenement({
  mode,
  onFilter,
  locations = [],
}: FiltreEvenementProps) {
  const [location, setLocation] = useState("Tous");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Log pour vérifier les locations reçues
  useEffect(() => {
    console.log("FiltreEvenement - locations reçues :", locations);
  }, [locations]);

  const handleFilter = () => {
    if (onFilter) {
      onFilter({ location, dateRange });
    }
  };

  // Date picker personnalisé avec un champ de texte simplifié
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full mt-4"
    >
      <Card className="p-6 shadow-lg border border-pink-100 dark:border-pink-900 bg-white dark:bg-gray-900 rounded-xl overflow-hidden">
        <h3 className="text-xl font-bold mb-6 text-bleu-fonce dark:text-bleu-clair border-b border-pink-100 dark:border-pink-900 pb-3">
          Filtrer les{" "}
          {mode === "past" ? "événements passés" : "événements à venir"}
        </h3>
        <div className="flex flex-col sm:flex-row gap-5 items-center">
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="w-full sm:w-[180px] border border-pink-200 dark:border-pink-800 hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
              <SelectValue placeholder="Sélectionner un lieu" />
            </SelectTrigger>
            <SelectContent className="border border-pink-200 dark:border-pink-800">
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

          <div className="w-full sm:w-[320px]">
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal border border-pink-200 dark:border-pink-800 hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:text-pink-600 dark:hover:text-pink-400 transition-colors",
                    !dateRange.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-5 w-5 text-pink-500 dark:text-pink-400" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "dd/MM/yyyy", { locale: fr })} -{" "}
                        {format(dateRange.to, "dd/MM/yyyy", { locale: fr })}
                      </>
                    ) : (
                      format(dateRange.from, "dd/MM/yyyy", { locale: fr })
                    )
                  ) : (
                    "Sélectionner des dates"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4 bg-white dark:bg-gray-900 border border-pink-200 dark:border-pink-800 shadow-lg rounded-md">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Date de début
                      </label>
                      <input
                        type="date"
                        className="w-full p-2 border border-pink-200 dark:border-pink-800 rounded-md"
                        value={
                          dateRange.from
                            ? format(dateRange.from, "yyyy-MM-dd")
                            : ""
                        }
                        onChange={(e) => {
                          const newDate = e.target.value
                            ? new Date(e.target.value)
                            : undefined;
                          setDateRange((prev) => ({ ...prev, from: newDate }));
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Date de fin
                      </label>
                      <input
                        type="date"
                        className="w-full p-2 border border-pink-200 dark:border-pink-800 rounded-md"
                        value={
                          dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : ""
                        }
                        onChange={(e) => {
                          const newDate = e.target.value
                            ? new Date(e.target.value)
                            : undefined;
                          setDateRange((prev) => ({ ...prev, to: newDate }));
                        }}
                        min={
                          dateRange.from
                            ? format(dateRange.from, "yyyy-MM-dd")
                            : undefined
                        }
                      />
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDateRange({ from: undefined, to: undefined });
                      }}
                      className="border border-pink-200 dark:border-pink-800 text-pink-500 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20"
                    >
                      Effacer
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setIsCalendarOpen(false)}
                      className="bg-gradient-to-r from-pink-500 to-red-500 text-white hover:from-pink-600 hover:to-red-600"
                    >
                      Appliquer
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <Button
            onClick={handleFilter}
            className="bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-full shadow-lg hover:shadow-xl hover:from-pink-600 hover:to-red-600 transition-all duration-200 font-medium py-6 px-5"
          >
            Appliquer filtres
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
