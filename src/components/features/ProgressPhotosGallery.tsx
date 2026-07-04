"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Trash2, Upload, X, ZoomIn } from "lucide-react";
import { useToastStore } from "@/stores/toast-store";

interface ProgressPhoto {
  id: string;
  date: string;
  base64: string;
  mime_type: string;
  label?: string;
  uploaded_at: string;
}

export function ProgressPhotosGallery() {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selected, setSelected] = useState<ProgressPhoto | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPhotos = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/photos");
      if (res.ok) {
        const data = await res.json() as { photos: ProgressPhoto[] };
        setPhotos(data.photos.slice().reverse());
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchPhotos();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      useToastStore.getState().show("Only JPEG, PNG, or WebP allowed", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      useToastStore.getState().show("Image must be under 5MB", "error");
      return;
    }

    setIsUploading(true);
    try {
      const base64 = await fileToBase64(file);
      const res = await fetch("/api/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64,
          mime_type: file.type,
          date: new Date().toISOString().slice(0, 10),
          label: file.name,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        useToastStore.getState().show(data.error ?? "Upload failed", "error");
        return;
      }
      useToastStore.getState().show("Photo saved", "success");
      void fetchPhotos();
    } catch {
      useToastStore.getState().show("Upload failed", "error");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const deletePhoto = async (id: string) => {
    const res = await fetch(`/api/photos?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setPhotos((prev) => prev.filter((p) => p.id !== id));
      if (selected?.id === id) setSelected(null);
      useToastStore.getState().show("Photo deleted", "success");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-4 text-sm text-cyan-500/50">Loading photos…</CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-cyan-400" />
            Progress Photos
            {photos.length > 0 && (
              <span className="text-xs text-cyan-500/50 font-normal ml-1">
                {photos.length}/20
              </span>
            )}
          </CardTitle>
          <label>
            <Button
              variant="hologram"
              size="sm"
              asChild
              disabled={isUploading || photos.length >= 20}
            >
              <span>
                <Upload className="w-3.5 h-3.5" />
                {isUploading ? "Uploading…" : "Add Photo"}
              </span>
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => void handleFileChange(e)}
              disabled={isUploading}
            />
          </label>
        </CardHeader>
        <CardContent>
          {photos.length === 0 ? (
            <div className="text-center py-8 text-cyan-500/40 text-sm">
              <Camera className="w-8 h-8 mx-auto mb-2 opacity-40" />
              No progress photos yet. Upload your first one to track visual progress.
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="group relative aspect-square rounded-lg overflow-hidden border border-slate-700/50 cursor-pointer"
                  onClick={() => setSelected(photo)}
                >
                  <img
                    src={`data:${photo.mime_type};base64,${photo.base64}`}
                    alt={photo.label ?? photo.date}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-1.5">
                    <p className="text-[10px] text-white/80 font-mono">{photo.date}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute -top-10 right-0 text-white/60 hover:text-white"
              onClick={() => setSelected(null)}
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={`data:${selected.mime_type};base64,${selected.base64}`}
              alt={selected.label ?? selected.date}
              className="w-full rounded-xl"
            />
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="text-white font-mono text-sm">{selected.date}</p>
                {selected.label && (
                  <p className="text-white/50 text-xs mt-0.5">{selected.label}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                onClick={() => void deletePhoto(selected.id)}
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
