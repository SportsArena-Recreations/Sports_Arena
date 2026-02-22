import { useState, useEffect, useRef } from "react";
import {
  Plus, Pencil, Trash2, X, Loader2, CheckCircle2,
  Search, ChevronDown, Trophy, Users, Clock,
  AlertTriangle, Tag, ImagePlus, Link2, UploadCloud,
  Calendar, MapPin
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { tournamentService } from "@/features/tournaments/services/tournament.service";
import { facilityService } from "@/features/facilities/services/facility.service";
import { Tournament, TournamentStatus } from "@/features/tournaments/types";
import { Facility } from "@/features/facilities/types";
import { supabase } from "@/lib/supabase";

// ─── constants ────────────────────────────────────────────────────────────────

const TOURNAMENT_STATUSES: TournamentStatus[] = [
  "upcoming", "registration_open", "registration_closed",
  "in_progress", "completed", "cancelled"
];

const STATUS_STYLES: Record<string, string> = {
  upcoming: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  registration_open: "bg-green-500/10 text-green-400 border-green-500/20",
  registration_closed: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  in_progress: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  completed: "bg-white/10 text-white/70 border-white/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

const EMPTY_FORM: Omit<Tournament, "id"> = {
  name: "", sport: "Soccer", description: "",
  startDate: "", endDate: "", registrationDeadline: "",
  maxTeams: 8, registeredTeams: 0, entryFee: 0, prizePool: 0,
  status: "upcoming", rules: [], facilityId: "", facilityName: "",
  imageUrl: "",
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

// ─── TournamentModal ──────────────────────────────────────────────────────────

interface ModalProps {
  editing: Tournament | null;
  facilities: Facility[];
  onClose: () => void;
  onSaved: () => void;
}

function TournamentModal({ editing, facilities, onClose, onSaved }: ModalProps) {
  const [form, setForm] = useState<Omit<Tournament, "id">>(
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

        const useWebP = canvas.toDataURL("image/webp").startsWith("data:image/webp");
        const mimeType = useWebP ? "image/webp" : "image/jpeg";
        const ext = useWebP ? "webp" : "jpg";

        canvas.toBlob(
          (blob) => blob ? resolve({ blob, ext }) : reject(new Error("Canvas compression failed")),
          mimeType,
          0.95 // 95% quality — preserves maximum visual quality while still reducing file size
        );
      };
      img.onerror = () => reject(new Error("Could not load image"));
      img.src = objectUrl;
    });

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) { setUploadError("Only image files are supported."); return; }
    if (file.size > 5 * 1024 * 1024) { setUploadError("Image must be under 5MB."); return; }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setUploadError("Not authenticated — please sign out and sign in again.");
      return;
    }

    setUploadError(null);
    setUploading(true);

    let blob: Blob;
    let ext: string;
    try {
      ({ blob, ext } = await compressImage(file));
    } catch {
      blob = file;
      ext = file.name.split(".").pop() ?? "jpg";
    }

    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("tournament-images")
      .upload(path, blob, {
        upsert: true,
        contentType: ext === "webp" ? "image/webp" : "image/jpeg",
      });

    if (upErr) {
      setUploadError(`Upload failed: ${upErr.message}`);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("tournament-images").getPublicUrl(path);
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

  const handleFacilityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const facId = e.target.value;
    const fac = facilities.find(f => f.id === facId);
    set("facilityId", facId);
    set("facilityName", fac?.name ?? "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Tournament name is required."); return; }
    if (!form.startDate || !form.endDate) { setError("Dates are required."); return; }
    if (form.entryFee < 0) { setError("Entry fee cannot be negative."); return; }
    setSaving(true);
    setError(null);
    const res = editing
      ? await tournamentService.update(editing.id, form)
      : await tournamentService.create(form);
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
              <Trophy size={14} className="text-white/55" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-none">
                {editing ? "Edit Tournament" : "Create New Tournament"}
              </h2>
              <p className="text-[11px] text-white/30 mt-0.5">
                {editing ? `Editing "${editing.name}"` : "Set up dates, prize pool, and entry fee"}
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
          id="tournament-form"
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
                Tournament Name <span className="text-red-400">*</span>
              </label>
              <input
                className={inputCls}
                placeholder="e.g. Lagos City Cup 2026"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/55">
                  Sport <span className="text-red-400">*</span>
                </label>
                <input
                  className={inputCls}
                  placeholder="e.g. Soccer, Basketball"
                  value={form.sport}
                  onChange={(e) => set("sport", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/55">
                  Facility
                </label>
                <div className="relative">
                  <select
                    className={`${inputCls} appearance-none pr-9 cursor-pointer`}
                    value={form.facilityId}
                    onChange={handleFacilityChange}
                  >
                    <option value="" className="bg-[#0d0d11]">None/TBD</option>
                    {facilities.map(f => (
                      <option key={f.id} value={f.id} className="bg-[#0d0d11]">{f.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/55">Description</label>
              <textarea
                className={`${inputCls} resize-none`}
                rows={3}
                placeholder="Details, format, rewards..."
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </div>
          </section>

          {/* ── Section: Schedule & Teams ── */}
          <section className="space-y-4">
            <p className="text-[10px] font-bold tracking-widest uppercase text-white/20 pb-1 border-b border-white/[0.04]">
              Schedule & Participation
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/55">Start Date <span className="text-red-400">*</span></label>
                <input
                  type="date"
                  className={inputCls + " [&::-webkit-calendar-picker-indicator]:invert-[1] [&::-webkit-calendar-picker-indicator]:opacity-50"}
                  value={form.startDate}
                  onChange={(e) => set("startDate", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/55">End Date <span className="text-red-400">*</span></label>
                <input
                  type="date"
                  className={inputCls + " [&::-webkit-calendar-picker-indicator]:invert-[1] [&::-webkit-calendar-picker-indicator]:opacity-50"}
                  value={form.endDate}
                  onChange={(e) => set("endDate", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/55">Reg. Deadline <span className="text-red-400">*</span></label>
                <input
                  type="date"
                  className={inputCls + " [&::-webkit-calendar-picker-indicator]:invert-[1] [&::-webkit-calendar-picker-indicator]:opacity-50"}
                  value={form.registrationDeadline}
                  onChange={(e) => set("registrationDeadline", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/55">Max Teams <span className="text-red-400">*</span></label>
                <input
                  type="number" min={2}
                  className={inputCls}
                  value={form.maxTeams}
                  onChange={(e) => set("maxTeams", Number(e.target.value))}
                  required
                />
              </div>
            </div>
          </section>

          {/* ── Section: Financials & Status ── */}
          <section className="space-y-4">
            <p className="text-[10px] font-bold tracking-widest uppercase text-white/20 pb-1 border-b border-white/[0.04]">
              Financials & Status
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/55">Entry Fee <span className="text-red-400">*</span></label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 text-sm font-semibold">₦</span>
                  <input
                    type="number" min={0}
                    className={`${inputCls} pl-8`}
                    placeholder="10000"
                    value={form.entryFee === 0 ? "" : form.entryFee}
                    onChange={(e) => set("entryFee", Number(e.target.value))}
                    onWheel={(e) => (e.target as HTMLElement).blur()}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/55">Prize Pool <span className="text-red-400">*</span></label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 text-sm font-semibold">₦</span>
                  <input
                    type="number" min={0}
                    className={`${inputCls} pl-8`}
                    placeholder="50000"
                    value={form.prizePool === 0 ? "" : form.prizePool}
                    onChange={(e) => set("prizePool", Number(e.target.value))}
                    onWheel={(e) => (e.target as HTMLElement).blur()}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/55">
                Status <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select
                  className={`${inputCls} appearance-none pr-9 cursor-pointer capitalize`}
                  value={form.status}
                  onChange={(e) => set("status", e.target.value as TournamentStatus)}
                >
                  {TOURNAMENT_STATUSES.map(s => (
                    <option key={s} value={s} className="bg-[#0d0d11] capitalize">{s.replace("_", " ")}</option>
                  ))}
                </select>
                <ChevronDown size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/55">Cover Image (Optional)</label>

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
                </>
              )}
            </div>

            <div className="space-y-1.5 pt-2">
              <TagInput label="Tournament Rules" value={form.rules ?? []} onChange={(v) => set("rules", v)} />
              <p className="text-[11px] text-white/25 leading-relaxed">
                Add standard rules players must follow. Press Enter to add.
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
            type="submit" form="tournament-form" disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white text-black text-sm font-bold hover:bg-white/90 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            {editing ? "Save changes" : "Create tournament"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── DeleteConfirm ───────────────────────────────────────────────────────────

function DeleteConfirm({
  tournament, onClose, onDeleted,
}: { tournament: Tournament; onClose: () => void; onDeleted: () => void }) {
  const [deleting, setDeleting] = useState(false);

  const confirm = async () => {
    setDeleting(true);
    await tournamentService.delete(tournament.id);
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
        <h3 className="text-base font-bold text-white mb-1">Delete tournament?</h3>
        <p className="text-sm text-white/40 mb-6">
          <span className="text-white/70 font-medium">{tournament.name}</span> will be permanently removed. All related team registrations might be affected.
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

// ─── ManageTournaments ─────────────────────────────────────────────────────────

const ManageTournaments = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TournamentStatus | "all">("all");
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Tournament | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Tournament | null>(null);

  const load = async () => {
    setLoading(true);
    const [tRes, fRes] = await Promise.all([
      tournamentService.getAll(),
      facilityService.getAll()
    ]);
    setTournaments(tRes.data);
    setFacilities(fRes.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = tournaments.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.sport.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openAdd = () => { setEditTarget(null); setShowModal(true); };
  const openEdit = (t: Tournament) => { setEditTarget(t); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditTarget(null); };
  const onSaved = () => { closeModal(); load(); };
  const onDeleted = () => { setDeleteTarget(null); load(); };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Tournaments</h1>
          <p className="text-sm text-white/40 mt-0.5">
            {tournaments.length} tournament{tournaments.length !== 1 ? "s" : ""} in total
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 h-10 px-5 rounded-xl bg-white text-black text-sm font-bold hover:bg-white/90 transition-all"
        >
          <Plus size={15} strokeWidth={2.5} />
          Create Tournament
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tournaments…"
            className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-all"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TournamentStatus | "all")}
            className="appearance-none bg-white/[0.04] border border-white/[0.07] rounded-xl pl-4 pr-9 py-2.5 text-sm text-white/70 focus:outline-none focus:border-white/20 transition-all cursor-pointer capitalize"
          >
            <option value="all" className="bg-[#0d0d11]">All Statuses</option>
            {TOURNAMENT_STATUSES.map((s) => (
              <option key={s} value={s} className="bg-[#0d0d11] capitalize">{s.replace("_", " ")}</option>
            ))}
          </select>
          <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-white/[0.05] text-xs font-semibold text-white/25 uppercase tracking-widest">
          <span>Tournament</span>
          <span>Sport</span>
          <span className="flex items-center gap-1"><Users size={10} />Teams</span>
          <span className="flex items-center gap-1"><Tag size={10} />Prize/Fee</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={20} className="text-white/30 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Trophy size={32} className="text-white/10" />
            <p className="text-sm text-white/30">
              {search || statusFilter !== "all" ? "No tournaments match your filters." : "No tournaments yet. Create one."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {filtered.map((t) => (
              <div
                key={t.id}
                className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-3 md:gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors items-center"
              >
                <div>
                  <p className="font-semibold text-white text-sm">{t.name}</p>
                  <p className="text-xs text-white/35 mt-0.5 flex flex-wrap gap-2 items-center">
                    <span className="flex items-center gap-1"><Calendar size={10} /> {t.startDate} - {t.endDate}</span>
                    {t.facilityName && <span className="flex items-center gap-1"><MapPin size={10} /> {t.facilityName}</span>}
                  </p>
                </div>
                <span className="text-sm capitalize text-white/50">{t.sport}</span>
                <span className="text-sm text-white/50 flex items-center gap-1.5">
                  <span className={t.registeredTeams >= t.maxTeams ? "text-orange-400" : ""}>{t.registeredTeams}</span> / {t.maxTeams}
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white/80">{fmt(t.prizePool)}</span>
                  <span className="text-[10px] text-white/30">Fee: {t.entryFee === 0 ? "Free" : fmt(t.entryFee)}</span>
                </div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border w-fit capitalize ${STATUS_STYLES[t.status]}`}>
                  {t.status.replace("_", " ")}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEdit(t)}
                    className="p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/[0.07] transition-all"
                    title="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(t)}
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
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            {tournaments.filter((t) => t.status === "upcoming").length} upcoming
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
            {tournaments.filter((t) => t.status === "registration_open").length} open
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
            {tournaments.filter((t) => t.status === "in_progress").length} active
          </span>
          <span className="ml-auto flex items-center gap-1.5">
            <Trophy size={11} />
            Total Prize Pool: {fmt(tournaments.reduce((a, t) => a + t.prizePool, 0))}
          </span>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showModal && (
          <TournamentModal editing={editTarget} facilities={facilities} onClose={closeModal} onSaved={onSaved} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {deleteTarget && (
          <DeleteConfirm tournament={deleteTarget} onClose={() => setDeleteTarget(null)} onDeleted={onDeleted} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageTournaments;
