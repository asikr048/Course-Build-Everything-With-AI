"use client";
import { useRef, useState } from "react";
import { Upload, Link2, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface Props {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  /** "wide" for banners/covers, "square" for avatars/logos */
  aspect?: "wide" | "square";
}

export default function ImageUpload({ value, onChange, label, aspect = "wide" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [showUrl, setShowUrl] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await r.json();
      if (r.ok && data.url) {
        onChange(data.url);
        toast.success("Image uploaded!");
      } else {
        toast.error(data.error ?? "Upload failed");
        setShowUrl(true);
      }
    } catch {
      toast.error("Upload failed");
      setShowUrl(true);
    } finally {
      setUploading(false);
    }
  }

  const boxAspect = aspect === "square" ? "aspect-square w-28" : "aspect-[16/9] w-full";

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-white/35 text-xs uppercase tracking-wider font-syne">{label}</label>}

      <div
        className={`relative ${boxAspect} rounded-xl overflow-hidden flex items-center justify-center cursor-pointer group transition-all`}
        style={{ background: "hsl(210 60% 6%)", border: "1px dashed hsl(var(--p) / 0.25)" }}
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0];
          if (f) handleFile(f);
        }}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-white/30">
            <Upload size={18} />
            <span className="text-[11px]">Click or drop image</span>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <Loader2 size={20} className="animate-spin text-white" />
          </div>
        )}

        {value && !uploading && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(""); }}
            className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-black/60 text-white/70 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={13} />
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
      />

      <button
        type="button"
        onClick={() => setShowUrl((s) => !s)}
        className="flex items-center gap-1.5 text-[11px] self-start transition-colors"
        style={{ color: "hsl(var(--p))" }}
      >
        <Link2 size={11} /> {showUrl ? "Hide URL field" : "Or paste an image URL"}
      </button>

      {showUrl && (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://…"
          className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white outline-none"
          style={{ background: "hsl(210 60% 6%)", border: "1px solid hsl(var(--p) / 0.12)" }}
        />
      )}
    </div>
  );
}
