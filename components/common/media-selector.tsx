"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Check, Image as ImageIcon, Search } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

interface Media {
    id: number;
    url: string;
    title: string;
    type: string;
    is_favorite: boolean;
}

interface MediaSelectorProps {
    onSelect: (selectedMedias: Media[]) => void;
    trigger?: React.ReactNode;
    maxSelection?: number;
}

export function MediaSelector({
    onSelect,
    trigger,
    maxSelection = 200,
}: MediaSelectorProps) {
    const [medias, setMedias] = useState<Media[]>([]);
    const [selectedMedias, setSelectedMedias] = useState<Media[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchMedias();
        }
    }, [isOpen]);

    const fetchMedias = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/medias");
            if (response.ok) {
                const data = await response.json();
                // Filter only images for now as requested
                setMedias(data.filter((m: Media) => m.type.startsWith("image/")));
            }
        } catch (error) {
            console.error("Erreur lors du chargement des médias:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSelection = (media: Media) => {
        setSelectedMedias((prev) => {
            const isSelected = prev.some((m) => m.id === media.id);
            if (isSelected) {
                return prev.filter((m) => m.id !== media.id);
            } else {
                if (prev.length >= maxSelection) return prev;
                return [...prev, media];
            }
        });
    };

    const handleConfirm = () => {
        onSelect(selectedMedias);
        setIsOpen(false);
        setSelectedMedias([]);
    };

    const filteredMedias = medias.filter((media) =>
        media.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button type="button" variant="outline">
                        <ImageIcon className="mr-2 h-4 w-4" />
                        Sélectionner depuis la bibliothèque
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Bibliothèque de médias</DialogTitle>
                </DialogHeader>

                <div className="flex items-center space-x-2 my-4">
                    <Search className="w-4 h-4 text-gray-500" />
                    <Input
                        placeholder="Rechercher une image..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1"
                    />
                </div>

                <div className="flex-1 overflow-y-auto min-h-[300px] p-2">
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            Chargement...
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {filteredMedias.map((media) => {
                                const isSelected = selectedMedias.some((m) => m.id === media.id);
                                return (
                                    <div
                                        key={media.id}
                                        className="cursor-pointer group"
                                        onClick={() => toggleSelection(media)}
                                    >
                                        <div
                                            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${isSelected
                                                ? "border-blue-500 ring-2 ring-blue-500 ring-offset-2"
                                                : "border-transparent group-hover:border-gray-300"
                                                }`}
                                        >
                                            <Image
                                                src={media.url}
                                                alt={media.title}
                                                fill
                                                className="object-cover"
                                            />
                                            {isSelected && (
                                                <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                                                    <div className="bg-blue-500 text-white rounded-full p-1">
                                                        <Check className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <p className="mt-1 text-xs text-center truncate px-1 text-gray-600 dark:text-gray-300">
                                            {media.title}
                                        </p>
                                    </div>

                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center mt-4 border-t pt-4">
                    <div className="text-sm text-gray-500">
                        {selectedMedias.length} média(s) sélectionné(s)
                    </div>
                    <div className="space-x-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            type="button"
                        >
                            Annuler
                        </Button>
                        <Button onClick={handleConfirm} type="button">
                            Confirmer
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
