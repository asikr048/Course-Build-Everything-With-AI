"use client";
import { useRef, useState } from "react";
import { Upload, Link2, Loader2, X, Crosshair } from "lucide-react";
import { toast } from "sonner";

interface Props {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  /** "wide" for banners/covers, "square" for avatars/logos */
  aspect?: "wide" | "square";
  /** Optional objectPosition string (e.g. "50% 30%"). When paired with
   *  onFocusChange and an image, a click-to-set focal-point picker is shown. */
  focus?: string;
  onFocusChange?: (v: string) => void;
}

export default function ImageUpload({ value, onChange, label, aspect = "wide", focus, onFocusChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [showUrl, setShowUrl] = useState(false);

  const focusVal = focus && focus.trim() ? focus : "50% 50%";
  const [fx, fy] = (() => {
    const m = focusVal.match(/(-?\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)%/);
    return m ? [parseFloat(m[1]), parseFloat(m[2])] : [50, 50];
  })();

  function setFocusFromEvent(e: React.MouseEvent<HTMLDivElement>) {
    if (!onFocusChange) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = Math.round(Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)));
    const y = Math.round(Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100)));
    onFocusChange(`${x}% ${y}%`);
  }

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
          <img src={value} alt="" className="w-full h-full object-cover" style={{ objectPosition: focusVal }} />
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

      {/* ── Focal-point picker with live preview ── */}
      {value && onFocusChange && (
        <div className="flex flex-col gap-2 rounded-xl p-3"
          style={{ background: "hsl(210 60% 5% / 0.7)", border: "1px solid hsl(var(--p) / 0.1)" }}>
          <div className="flex items-center gap-1.5 text-white/40 text-[11px]">
            <Crosshair size={11} style={{ color: "hsl(var(--p))" }} /> Focal point — click the image to set where it centers
          </div>
          <div className="flex gap-3 items-start">
            {/* clickable source image */}
            <div className="relative flex-1 rounded-lg overflow-hidden cursor-crosshair select-none"
              style={{ background: "hsl(210 60% 3%)" }} onClick={setFocusFromEvent}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={value} alt="" className="w-full max-h-40 object-contain pointer-events-none mx-auto" />
              <div className="absolute w-5 h-5 rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${fx}%`, top: `${fy}%`, border: "2px solid #fff",
                  boxShadow: "0 0 0 2px hsl(var(--p)), 0 0 12px rgba(0,0,0,0.7)" }} />
            </div>
            {/* live crop previews */}
            <div className="flex flex-col gap-2 shrink-0">
              <div className="w-20 h-20 rounded-lg overflow-hidden" style={{ border: "1px solid hsl(var(--p) / 0.2)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={value} alt="" className="w-full h-full object-cover" style={{ objectPosition: focusVal }} />
              </div>
              <div className="w-20 h-11 rounded-lg overflow-hidden" style={{ border: "1px solid hsl(var(--p) / 0.2)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={value} alt="" className="w-full h-full object-cover" style={{ objectPosition: focusVal }} />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/30 text-[10px] font-mono">{focusVal}</span>
            <button type="button" onClick={() => onFocusChange("50% 50%")} className="text-[10px]" style={{ color: "hsl(var(--p))" }}>
              Reset to center
            </button>
          </div>
        </div>
      )}

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
