import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    UserCircle2,
    Mail,
    Pencil,
    Save,
    Loader2,
    Lock,
    Eye,
    EyeOff,
    CheckCircle2,
    ShieldCheck,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export default function Profile() {
    const { user, isAdmin, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    // Profile state
    const [fullName, setFullName] = useState("");
    const [editingName, setEditingName] = useState(false);
    const [savingName, setSavingName] = useState(false);
    const [nameSaved, setNameSaved] = useState(false);

    // Password state
    const [newPassword, setNewPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [passwordSaved, setPasswordSaved] = useState(false);

    // Error state
    const [nameError, setNameError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);

    // Redirect unauthenticated users
    useEffect(() => {
        if (!authLoading && !user) navigate("/login");
    }, [authLoading, user, navigate]);

    // Fetch profile on mount
    useEffect(() => {
        if (!user) return;
        supabase
            .from("profiles")
            .select("full_name")
            .eq("id", user.id)
            .single()
            .then(({ data }) => {
                if (data?.full_name) setFullName(data.full_name);
            });
    }, [user]);

    const handleSaveName = async () => {
        if (!user || !fullName.trim()) return;
        setSavingName(true);
        setNameError(null);

        const { error } = await supabase
            .from("profiles")
            .update({ full_name: fullName.trim() })
            .eq("id", user.id);

        setSavingName(false);

        if (error) {
            setNameError(error.message);
        } else {
            setEditingName(false);
            setNameSaved(true);
            setTimeout(() => setNameSaved(false), 3000);
        }
    };

    const handleSavePassword = async () => {
        if (newPassword.length < 8) {
            setPasswordError("Password must be at least 8 characters.");
            return;
        }
        setSavingPassword(true);
        setPasswordError(null);

        const { error } = await supabase.auth.updateUser({ password: newPassword });

        setSavingPassword(false);

        if (error) {
            setPasswordError(error.message);
        } else {
            setNewPassword("");
            setPasswordSaved(true);
            setTimeout(() => setPasswordSaved(false), 3000);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 size={22} className="text-white/40 animate-spin" />
            </div>
        );
    }

    // Derive initials for avatar
    const initials = fullName
        ? fullName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
        : (user?.email?.[0] ?? "U").toUpperCase();

    return (
        <div className="min-h-screen bg-black flex flex-col">
            {/* Ambient glow */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-white/[0.02] blur-3xl" />
            </div>

            {/* Top bar */}
            <div className="relative z-10 flex items-center px-6 py-5 max-w-3xl mx-auto w-full">
                <Link
                    to="/"
                    className="flex items-center gap-2 text-white/40 hover:text-white/80 transition-colors text-sm font-medium group"
                >
                    <ArrowLeft
                        size={15}
                        className="group-hover:-translate-x-0.5 transition-transform"
                    />
                    Back to home
                </Link>
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center px-4 pb-16 pt-4">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-xl space-y-5"
                >
                    {/* Avatar + name header */}
                    <div className="flex flex-col items-center gap-3 py-6">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/[0.08] border border-white/[0.12] text-2xl font-bold text-white select-none">
                            {initials}
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-bold text-white tracking-tight">
                                {fullName || "Your Profile"}
                            </p>
                            <div className="flex items-center justify-center gap-1.5 mt-1">
                                <p className="text-sm text-white/40">{user?.email}</p>
                                {isAdmin && (
                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-xs text-white/50">
                                        <ShieldCheck size={11} />
                                        Admin
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Card: Personal info */}
                    <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-white/[0.06]">
                            <h2 className="text-sm font-semibold text-white/70 tracking-wide">
                                Personal Information
                            </h2>
                        </div>

                        <div className="p-5 space-y-5">
                            {/* Email — read-only */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-white/40 tracking-wide uppercase">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail
                                        size={14}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20"
                                    />
                                    <div className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-10 pr-4 py-3 text-sm text-white/40 select-none cursor-not-allowed">
                                        {user?.email}
                                    </div>
                                </div>
                                <p className="text-xs text-white/25">
                                    Email cannot be changed here.
                                </p>
                            </div>

                            {/* Full name — editable */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-white/40 tracking-wide uppercase">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <UserCircle2
                                        size={14}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
                                    />
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => { setFullName(e.target.value); setEditingName(true); }}
                                        onFocus={() => setEditingName(true)}
                                        placeholder="Enter your full name"
                                        className="w-full bg-white/[0.06] border border-white/[0.10] rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all"
                                    />
                                    {editingName && (
                                        <button
                                            onClick={handleSaveName}
                                            disabled={savingName}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                                        >
                                            {savingName ? (
                                                <Loader2 size={14} className="animate-spin" />
                                            ) : (
                                                <Pencil size={14} />
                                            )}
                                        </button>
                                    )}
                                </div>
                                {nameError && (
                                    <p className="text-xs text-red-400">{nameError}</p>
                                )}
                            </div>

                            {/* Save name button */}
                            {editingName && (
                                <motion.button
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={handleSaveName}
                                    disabled={savingName}
                                    className="flex items-center gap-2 h-10 px-5 rounded-xl bg-white text-black text-xs font-bold tracking-wide hover:bg-white/90 transition-all disabled:opacity-60"
                                >
                                    {savingName ? (
                                        <Loader2 size={13} className="animate-spin" />
                                    ) : (
                                        <Save size={13} />
                                    )}
                                    Save name
                                </motion.button>
                            )}

                            {nameSaved && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center gap-1.5 text-xs text-green-400"
                                >
                                    <CheckCircle2 size={13} />
                                    Name updated successfully
                                </motion.p>
                            )}
                        </div>
                    </div>

                    {/* Card: Change password */}
                    <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-white/[0.06]">
                            <h2 className="text-sm font-semibold text-white/70 tracking-wide">
                                Change Password
                            </h2>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-white/40 tracking-wide uppercase">
                                    New Password
                                </label>
                                <div className="relative">
                                    <Lock
                                        size={14}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
                                    />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Min. 8 characters"
                                        className="w-full bg-white/[0.06] border border-white/[0.10] rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        tabIndex={-1}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </div>
                                {passwordError && (
                                    <p className="text-xs text-red-400">{passwordError}</p>
                                )}
                                {passwordSaved && (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex items-center gap-1.5 text-xs text-green-400"
                                    >
                                        <CheckCircle2 size={13} />
                                        Password updated successfully
                                    </motion.p>
                                )}
                            </div>

                            <button
                                onClick={handleSavePassword}
                                disabled={savingPassword || !newPassword}
                                className="flex items-center gap-2 h-10 px-5 rounded-xl bg-white text-black text-xs font-bold tracking-wide hover:bg-white/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {savingPassword ? (
                                    <Loader2 size={13} className="animate-spin" />
                                ) : (
                                    <Save size={13} />
                                )}
                                Update password
                            </button>
                        </div>
                    </div>

                    {/* Card: Account info */}
                    <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-white/[0.06]">
                            <h2 className="text-sm font-semibold text-white/70 tracking-wide">
                                Account
                            </h2>
                        </div>
                        <div className="p-5 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-white/40">User ID</span>
                                <span className="text-white/30 font-mono text-xs truncate max-w-[200px]">
                                    {user?.id}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-white/40">Joined</span>
                                <span className="text-white/50">
                                    {user?.created_at
                                        ? new Date(user.created_at).toLocaleDateString("en-US", {
                                            month: "long",
                                            day: "numeric",
                                            year: "numeric",
                                        })
                                        : "—"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-white/40">Role</span>
                                <span className={`text-xs font-semibold ${isAdmin ? "text-white/70" : "text-white/40"}`}>
                                    {isAdmin ? "Administrator" : "Member"}
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
