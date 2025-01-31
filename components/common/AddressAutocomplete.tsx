import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (address: {
    label: string;
    city: string;
    postcode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  }) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export function AddressAutocomplete({
  value,
  onChange,
  placeholder = "Entrez une adresse",
  className,
  required = false,
}: AddressAutocompleteProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (query: string) => {
    onChange(query);

    if (query.length > 2) {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(
            query
          )}&limit=5`
        );
        const data = await response.json();

        interface Feature {
          properties: {
            label: string;
            city: string;
            postcode: string;
          };
          geometry: {
            coordinates: number[];
          };
        }

        console.log(
          "Suggestions d'adresses:",
          data.features.map((feature: Feature) => ({
            adresse: feature.properties.label,
            ville: feature.properties.city,
            codePostal: feature.properties.postcode,
            coordonnees: {
              lat: feature.geometry.coordinates[1],
              lng: feature.geometry.coordinates[0],
            },
          }))
        );
      } catch (error) {
        console.error("Erreur lors de la recherche d'adresse:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Input
          type="text"
          value={value}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={placeholder}
          className={className}
          required={required}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          </div>
        )}
      </div>
    </div>
  );
}
