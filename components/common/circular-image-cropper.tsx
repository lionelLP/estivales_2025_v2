"use client";

import { useState, useRef } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface CircularImageCropperProps {
  imageFile: File | null;
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

export function CircularImageCropper({ imageFile, onCropComplete, onCancel }: CircularImageCropperProps) {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 100,
    x: 0,
    y: 0,
    aspect: 1 / 1
  });
  const [imageSrc, setImageSrc] = useState<string>('');
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Load image when file is provided
  useState(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
      };
      reader.readAsDataURL(imageFile);
    }
  });

  const getCroppedImg = async (image: HTMLImageElement, crop: PixelCrop): Promise<Blob> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('No 2d context');
    }

    // Set canvas size to match the desired output size
    canvas.width = crop.width;
    canvas.height = crop.height;

    // Draw the cropped image
    ctx.drawImage(
      image,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      crop.width,
      crop.height
    );

    // Create circular clipping path
    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath();
    ctx.arc(
      crop.width / 2,
      crop.height / 2,
      Math.min(crop.width, crop.height) / 2,
      0,
      2 * Math.PI
    );
    ctx.fill();

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        }
      }, 'image/png');
    });
  };

  const handleCropComplete = async () => {
    if (imageRef.current && crop) {
      const croppedBlob = await getCroppedImg(imageRef.current, crop as PixelCrop);
      onCropComplete(croppedBlob);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Recadrer le logo</h3>
        
        <div className="relative">
          {imageSrc && (
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              circularCrop
              aspect={1}
            >
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Image à recadrer"
                className="max-h-[60vh] w-auto mx-auto"
              />
            </ReactCrop>
          )}
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
          >
            Annuler
          </button>
          <button
            onClick={handleCropComplete}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Appliquer
          </button>
        </div>
      </div>
    </div>
  );
} 