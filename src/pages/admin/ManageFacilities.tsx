import { useState, useEffect, useRef } from "react";
import {
  Plus, Pencil, Trash2, X, Loader2, CheckCircle2,
  Search, ChevronDown, Building2, Users, Clock,
  AlertTriangle, Tag, ImagePlus, Link2, UploadCloud,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { facilityService } from "@/features/facilities/services/facility.service";
import { Facility, FacilityType } from "@/features/facilities/types";
import { supabase } from "@/lib/supabase";

// ─── constants ────────────────────────────────────────────────────────────────

const FACILITY_TYPES: FacilityType[] = [
  "basketball", "soccer", "tennis", "volleyball",
  "swimming", "badminton", "multipurpose",
];

const STATUS_OPTIONS = ["available", "maintenance", "closed"] as const;

const STATUS_STYLES: Record<string, string> = {
  available: "bg-green-500/10 text-green-400 border-green-500/20",
  maintenance: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  closed: "bg-red-500/10 text-red-400 border-red-500/20",
};

const EMPTY_FORM: Omit<Facility, "id"> = {
  name: "", type: "basketball", description: "",
  capacity: 0, pricePerHour: 0, amenities: [], rules: [],
  imageUrl: "", status: "available",
};

const fmt = (n: number) => "₦" + n.toLocaleString("en-NG", { minimumFractionDigits: 0 });

const inputCls =
  "w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25 focus:bg-white/[0.07] transition-all";

// ─── TagInput ────────────────────────────────────────────────────────────────

function TagInput({ label, value, onChange }: { label: string; value: string[]; onChange: (v: string[]) => void }) {
  const [input, setInput] = useState("");

  const add = () => {
    const t = input.trim();
    if (t && !value.includes(t)) onChange([...value, t]);
    setInput("");
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-white/55">{label}</label>
      <div className="flex flex-wrap gap-1.5 min-h-[40px] p-2 bg-white/[0.04] border border-white/[0.08] rounded-xl focus-within:border-white/20 transition-all">
        {value.map((v) => (
          <span key={v} className="flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-lg bg-white/[0.09] text-xs text-white/75 border border-white/[0.07]">
            {v}
            <button type="button" onClick={() => onChange(value.filter((x) => x !== v))} className="text-white/30 hover:text-white/80 transition-colors">
              <X size={10} />
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } }}
          onBlur={add}
          placeholder={value.length ? "Add more…" : "Type and press Enter…"}
          className="bg-transparent text-xs text-white placeholder:text-white/20 outline-none flex-1 min-w-[100px] py-0.5 px-1"
        />
      </div>
    </div>
  );
}

// ─── FacilityModal ──────────────────────────────────────────────────────────

interface ModalProps {
  editing: Facility | null;
  onClose: () => void;
  onSaved: () => void;
}

function FacilityModal({ editing, onClose, onSaved }: ModalProps) {
  const [form, setForm] = useState<Omit<Facility, "id">>(
    editing ? { ...editing } : { ...EMPTY_FORM }
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadTab, setUploadTab] = useState<"upload" | "url">("upload");
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  /** Compress + resize image using Canvas before upload.
   *  Max 1920px wide/tall, WebP at 85% quality (falls back to JPEG).
   *  Typical result: 3MB PNG → ~250KB WebP, visually identical. */
  const compressImage = (file: File): Promise<{ blob: Blob; ext: string }> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const MAX = 1920;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width >= height) { height = Math.round((height / width) * MAX); width = MAX; }
          else { width = Math.round((width / height) * MAX); height = MAX; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first (best compression), fall back to JPEG
        const useWebP = canvas.toDataURL("image/webp").startsWith("data:image/webp");
        const mimeType = useWebP ? "image/webp" : "image/jpeg";
        const ext = useWebP ? "webp" : "jpg";

        canvas.toBlob(
          (blob) => blob ? resolve({ blob, ext }) : reject(new Error("Canvas compression failed")),
          mimeType,
          0.95   // 95% quality — preserves maximum visual quality while still reducing file size
        );
      };
      img.onerror = () => reject(new Error("Could not load image"));
      img.src = objectUrl;
    });

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) { setUploadError("Only image files are supported."); return; }
    if (file.size > 5 * 1024 * 1024) { setUploadError("Image must be under 5MB."); return; }

    // Confirm the Supabase client has a live session before uploading
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setUploadError("Not authenticated — please sign out and sign in again.");
      return;
    }

    setUploadError(null);
    setUploading(true);

    // ── Step 1: Compress (Canvas → WebP/JPEG) ──────────────────────────
    let blob: Blob;
    let ext: string;
    try {
      ({ blob, ext } = await compressImage(file));
    } catch {
      // Compression failed — fall back to original file
      blob = file;
      ext = file.name.split(".").pop() ?? "jpg";
    }

    // ── Step 2: Upload compressed blob ─────────────────────────────────
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("facility-images")
      .upload(path, blob, {
        upsert: true,
        contentType: ext === "webp" ? "image/webp" : "image/jpeg",
      });

    if (upErr) {
      console.error("[Storage upload] full error →", upErr);
      setUploadError(`Upload failed: ${upErr.message}`);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("facility-images").getPublicUrl(path);
    set("imageUrl", data.publicUrl);
    setUploading(false);
  };


  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageUpload(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Facility name is required."); return; }
    if (form.pricePerHour <= 0) { setError("Price must be greater than ₦0."); return; }
    setSaving(true);
    setError(null);
    const res = editing
      ? await facilityService.update(editing.id, form)
      : await facilityService.create(form);
    setSaving(false);
    if (!res.success) { setError(res.message ?? "Something went wrong."); return; }
    onSaved();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center sm:p-4"
      style={{
        background: "rgba(0,0,0,0.72)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="w-full sm:max-w-xl flex flex-col bg-[#0d0d11] border border-white/[0.09] sm:rounded-2xl rounded-t-2xl"
        style={{
          maxHeight: "90vh",
          boxShadow: "0 32px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {/* Sticky header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.07] border border-white/[0.08]">
              <Building2 size={14} className="text-white/55" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-none">
                {editing ? "Edit Facility" : "Add New Facility"}
              </h2>
              <p className="text-[11px] text-white/30 mt-0.5">
                {editing ? `Editing "${editing.name}"` : "Fill every field to create a bookable facility"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-white/25 hover:text-white hover:bg-white/[0.06] transition-all"
          >
            <X size={15} />
          </button>
        </div>

        {/* Scrollable body */}
        <form
          id="facility-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-5 py-5 space-y-6"
          style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.08) transparent" }}
        >
          {/* ── Section: Basic Info ── */}
          <section className="space-y-4">
            <p className="text-[10px] font-bold tracking-widest uppercase text-white/20 pb-1 border-b border-white/[0.04]">
              Basic Information
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/55">
                Facility Name <span className="text-red-400">*</span>
              </label>
              <input
                className={inputCls}
                placeholder="e.g. Championship Court, Premier Soccer Pitch…"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                required
              />
              <p className="text-[11px] text-white/25 leading-relaxed">
                The public name users see when browsing. Make it descriptive and unique.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/55">
                Sport / Type <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select
                  className={`${inputCls} appearance-none pr-9 cursor-pointer`}
                  value={form.type}
                  onChange={(e) => set("type", e.target.value as FacilityType)}
                >
                  {FACILITY_TYPES.map((t) => (
                    <option key={t} value={t} className="bg-[#0d0d11] capitalize">{t}</option>
                  ))}
                </select>
                <ChevronDown size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
              </div>
              <p className="text-[11px] text-white/25 leading-relaxed">
                Used to categorise and filter the facility. Pick the primary sport it hosts.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/55">Description</label>
              <textarea
                className={`${inputCls} resize-none`}
                rows={3}
                placeholder="Describe what makes this facility special — surface type, equipment, dimensions, seating…"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
              <p className="text-[11px] text-white/25 leading-relaxed">
                Shown on the facility page. Be specific — it helps users decide whether to book.
              </p>
            </div>
          </section>

          {/* ── Section: Pricing & Capacity ── */}
          <section className="space-y-4">
            <p className="text-[10px] font-bold tracking-widest uppercase text-white/20 pb-1 border-b border-white/[0.04]">
              Pricing & Capacity
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/55">
                  Capacity <span className="text-red-400">*</span>
                </label>
                <input
                  type="number" min={0}
                  className={inputCls}
                  placeholder="e.g. 200"
                  value={form.capacity || ""}
                  onChange={(e) => set("capacity", Number(e.target.value))}
                />
                <p className="text-[11px] text-white/25">Max number of persons allowed at once.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/55">
                  Price / Hour <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 text-sm font-semibold">₦</span>
                  <input
                    type="number" min={0}
                    className={`${inputCls} pl-8`}
                    placeholder="15000"
                    value={form.pricePerHour || ""}
                    onChange={(e) => set("pricePerHour", Number(e.target.value))}
                  />
                </div>
                <p className="text-[11px] text-white/25">Booking cost in Nigerian Naira per hour.</p>
              </div>
            </div>
          </section>

          {/* ── Section: Status & Media ── */}
          <section className="space-y-4">
            <p className="text-[10px] font-bold tracking-widest uppercase text-white/20 pb-1 border-b border-white/[0.04]">
              Availability & Media
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/55">
                Status <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-2">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s} type="button"
                    onClick={() => set("status", s)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border capitalize transition-all ${form.status === s ? STATUS_STYLES[s] : "bg-white/[0.03] border-white/[0.06] text-white/30 hover:text-white/55"
                      }`}
                  >{s}</button>
                ))}
              </div>
              <p className="text-[11px] text-white/25 leading-relaxed">
                <span className="text-green-400/60 font-medium">Available</span> — users can book it.&emsp;
                <span className="text-yellow-400/60 font-medium">Maintenance</span> — temporarily disabled.&emsp;
                <span className="text-red-400/60 font-medium">Closed</span> — indefinitely unavailable.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/55">Cover Image</label>

              {/* Tab toggle */}
              <div className="flex gap-1 p-1 bg-white/[0.04] border border-white/[0.07] rounded-xl w-fit">
                <button
                  type="button"
                  onClick={() => setUploadTab("upload")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${uploadTab === "upload" ? "bg-white/10 text-white" : "text-white/35 hover:text-white/60"
                    }`}
                >
                  <UploadCloud size={12} /> Upload file
                </button>
                <button
                  type="button"
                  onClick={() => setUploadTab("url")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${uploadTab === "url" ? "bg-white/10 text-white" : "text-white/35 hover:text-white/60"
                    }`}
                >
                  <Link2 size={12} /> Paste URL
                </button>
              </div>

              {uploadTab === "upload" ? (
                <>
                  {/* Drop zone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={onDrop}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed transition-all cursor-pointer ${dragOver
                      ? "border-white/30 bg-white/[0.06]"
                      : "border-white/[0.1] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                      } ${form.imageUrl ? "h-32" : "h-28"}`}
                  >
                    {uploading ? (
                      <Loader2 size={22} className="animate-spin text-white/40" />
                    ) : form.imageUrl ? (
                      <>
                        <img
                          src={form.imageUrl}
                          alt="Preview"
                          className="h-full w-full object-cover rounded-[10px] opacity-60"
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/50 rounded-[10px] opacity-0 hover:opacity-100 transition-opacity">
                          <ImagePlus size={18} className="text-white/70" />
                          <span className="text-xs text-white/60">Click to replace</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06] border border-white/[0.1]">
                          <UploadCloud size={18} className="text-white/40" />
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-semibold text-white/50">Drop image here or <span className="text-white/70">click to browse</span></p>
                          <p className="text-[11px] text-white/25 mt-0.5">PNG, JPG, WEBP — max 5MB</p>
                        </div>
                      </>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
                  {uploadError && (
                    <p className="text-[11px] text-red-400 flex items-center gap-1">
                      <AlertTriangle size={11} /> {uploadError}
                    </p>
                  )}
                  <p className="text-[11px] text-white/25">
                    Image is uploaded to Supabase Storage and linked automatically.
                  </p>
                </>
              ) : (
                <>
                  <input
                    className={inputCls}
                    placeholder="https://images.unsplash.com/…"
                    value={form.imageUrl}
                    onChange={(e) => set("imageUrl", e.target.value)}
                  />
                  {form.imageUrl && (
                    <img src={form.imageUrl} alt="preview" className="h-20 w-full object-cover rounded-xl opacity-60" onError={() => setUploadError("URL didn't load — check the link.")} />
                  )}
                  <p className="text-[11px] text-white/25">Paste a direct HTTPS image link (Unsplash, Cloudinary, etc).</p>
                </>
              )}
            </div>
          </section>

          {/* ── Section: Amenities & Rules ── */}
          <section className="space-y-4">
            <p className="text-[10px] font-bold tracking-widest uppercase text-white/20 pb-1 border-b border-white/[0.04]">
              Amenities & Rules
            </p>

            <div className="space-y-1.5">
              <TagInput label="Amenities" value={form.amenities} onChange={(v) => set("amenities", v)} />
              <p className="text-[11px] text-white/25 leading-relaxed">
                Type each amenity and press <kbd className="px-1 py-px rounded bg-white/[0.08] font-mono text-[10px]">Enter</kbd> to add — e.g. Locker rooms, Air conditioning, Scoreboard, Sound system.
              </p>
            </div>

            <div className="space-y-1.5">
              <TagInput label="Rules & Restrictions" value={form.rules ?? []} onChange={(v) => set("rules", v)} />
              <p className="text-[11px] text-white/25 leading-relaxed">
                Add rules players must follow — e.g. Non-marking shoes required, No food on court, Max 30 players.
              </p>
            </div>
          </section>

          {/* Error banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-400"
            >
              <AlertTriangle size={13} className="flex-shrink-0" />
              {error}
            </motion.div>
          )}
        </form>

        {/* Sticky footer */}
        <div className="flex items-center gap-3 px-5 py-4 border-t border-white/[0.06] flex-shrink-0">
          <button
            type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-sm text-white/45 hover:text-white hover:border-white/20 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit" form="facility-form" disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white text-black text-sm font-bold hover:bg-white/90 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            {editing ? "Save changes" : "Add facility"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── DeleteConfirm ───────────────────────────────────────────────────────────

function DeleteConfirm({
  facility, onClose, onDeleted,
}: { facility: Facility; onClose: () => void; onDeleted: () => void }) {
  const [deleting, setDeleting] = useState(false);

  const confirm = async () => {
    setDeleting(true);
    await facilityService.delete(facility.id);
    setDeleting(false);
    onDeleted();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-sm bg-[#0d0d11] border border-white/[0.09] rounded-2xl p-6 shadow-2xl"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 mb-4">
          <AlertTriangle size={22} className="text-red-400" />
        </div>
        <h3 className="text-base font-bold text-white mb-1">Delete facility?</h3>
        <p className="text-sm text-white/40 mb-6">
          <span className="text-white/70 font-medium">{facility.name}</span> will be permanently removed. This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-sm text-white/50 hover:text-white transition-all">
            Cancel
          </button>
          <button
            onClick={confirm} disabled={deleting}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/90 text-white text-sm font-bold hover:bg-red-500 transition-all disabled:opacity-50"
          >
            {deleting && <Loader2 size={13} className="animate-spin" />}
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── ManageFacilities ─────────────────────────────────────────────────────────

const ManageFacilities = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<FacilityType | "all">("all");
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Facility | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Facility | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await facilityService.getAll();
    setFacilities(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = facilities.filter((f) => {
    const matchSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.type.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || f.type === typeFilter;
    return matchSearch && matchType;
  });

  const openAdd = () => { setEditTarget(null); setShowModal(true); };
  const openEdit = (f: Facility) => { setEditTarget(f); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditTarget(null); };
  const onSaved = () => { closeModal(); load(); };
  const onDeleted = () => { setDeleteTarget(null); load(); };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Facilities</h1>
          <p className="text-sm text-white/40 mt-0.5">
            {facilities.length} facilit{facilities.length !== 1 ? "ies" : "y"} total
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 h-10 px-5 rounded-xl bg-white text-black text-sm font-bold hover:bg-white/90 transition-all"
        >
          <Plus size={15} strokeWidth={2.5} />
          Add Facility
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search facilities…"
            className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-all"
          />
        </div>
        <div className="relative">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as FacilityType | "all")}
            className="appearance-none bg-white/[0.04] border border-white/[0.07] rounded-xl pl-4 pr-9 py-2.5 text-sm text-white/70 focus:outline-none focus:border-white/20 transition-all cursor-pointer"
          >
            <option value="all" className="bg-[#0d0d11]">All types</option>
            {FACILITY_TYPES.map((t) => (
              <option key={t} value={t} className="bg-[#0d0d11] capitalize">{t}</option>
            ))}
          </select>
          <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-white/[0.05] text-xs font-semibold text-white/25 uppercase tracking-widest">
          <span>Facility</span>
          <span>Type</span>
          <span className="flex items-center gap-1"><Users size={10} />Capacity</span>
          <span className="flex items-center gap-1"><Tag size={10} />Price/hr</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={20} className="text-white/30 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Building2 size={32} className="text-white/10" />
            <p className="text-sm text-white/30">
              {search || typeFilter !== "all" ? "No facilities match your filters." : "No facilities yet. Add your first one."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {filtered.map((f) => (
              <div
                key={f.id}
                className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-3 md:gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors items-center"
              >
                <div>
                  <p className="font-semibold text-white text-sm">{f.name}</p>
                  <p className="text-xs text-white/35 mt-0.5 line-clamp-1">{f.description}</p>
                </div>
                <span className="text-sm capitalize text-white/50">{f.type}</span>
                <span className="text-sm text-white/50 flex items-center gap-1.5">
                  <Users size={12} className="text-white/25" />{f.capacity}
                </span>
                <span className="text-sm font-semibold text-white/80">{fmt(f.pricePerHour)}</span>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border w-fit capitalize ${STATUS_STYLES[f.status]}`}>
                  {f.status}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEdit(f)}
                    className="p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/[0.07] transition-all"
                    title="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(f)}
                    className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/[0.08] transition-all"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {!loading && filtered.length > 0 && (
        <div className="flex flex-wrap gap-4 text-xs text-white/30">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
            {facilities.filter((f) => f.status === "available").length} available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
            {facilities.filter((f) => f.status === "maintenance").length} maintenance
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
            {facilities.filter((f) => f.status === "closed").length} closed
          </span>
          <span className="ml-auto flex items-center gap-1.5">
            <Clock size={11} />
            Avg {fmt(Math.round(facilities.reduce((a, f) => a + f.pricePerHour, 0) / (facilities.length || 1)))}/hr
          </span>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showModal && (
          <FacilityModal editing={editTarget} onClose={closeModal} onSaved={onSaved} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {deleteTarget && (
          <DeleteConfirm facility={deleteTarget} onClose={() => setDeleteTarget(null)} onDeleted={onDeleted} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageFacilities;
