import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { uploadVehicleImages } from "@/lib/storage";

/**
 * Reusable uploader used across the admin panel: multiple images, preview grid,
 * remove, and add more later. Values are stored URLs.
 */
export function ImageManager({
  label,
  hint,
  images,
  onChange,
  folder = "vehicles",
}: {
  label: string;
  hint?: string;
  images: string[];
  onChange: (images: string[]) => void;
  folder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const uploaded = await uploadVehicleImages(Array.from(files), folder);
      onChange([...images, ...uploaded]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label>{label}</Label>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus /> {busy ? "Uploading…" : "Upload images"}
        </Button>
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => void handleFiles(event.target.files)}
      />

      {images.length > 0 && (
        <ul className="flex flex-wrap gap-3">
          {images.map((image, index) => (
            <li
              key={`${image}-${index}`}
              className="relative h-20 w-28 overflow-hidden rounded-lg border border-border bg-secondary"
            >
              <img src={image} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                aria-label="Remove image"
                onClick={() => onChange(images.filter((_, i) => i !== index))}
                className="absolute right-1 top-1 rounded-full bg-background/90 p-1 text-foreground shadow-card hover:bg-destructive hover:text-destructive-foreground"
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {images.length === 0 && (
        <p className="rounded-lg border border-dashed border-border p-4 text-xs text-muted-foreground">
          No images yet.
        </p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
