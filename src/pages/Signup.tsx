import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Zap,
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowLeft,
    Loader2,
    User,
    CheckCircle2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { arenaConfig } from "@/config/arena.config";

export default function Signup() {
    const navigate = useNavigate();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Password strength indicator
    const passwordStrength = (() => {
        if (password.length === 0) return 0;
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        return score;
    })();

    const strengthColors = ["", "bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-green-400"];
    const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const { error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName },
            },
        });

        setLoading(false);

        if (authError) {
            setError(authError.message);
        } else {
            setSuccess(true);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
                <div className="pointer-events-none fixed inset-0 overflow-hidden">
                    <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-white/[0.03] blur-3xl" />
                </div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="relative z-10 w-full max-w-[400px] text-center"
                >
                    <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-10 backdrop-blur-sm shadow-[0_8px_40px_rgba(0,0,0,0.4)]">
                        <div className="flex justify-center mb-5">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 border border-green-500/20">
                                <CheckCircle2 size={28} className="text-green-400" />
                            </div>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2 tracking-tight">
                            Check your inbox
                        </h2>
                        <p className="text-sm text-white/40 leading-relaxed mb-6">
                            We've sent a confirmation link to{" "}
                            <span className="text-white/70 font-medium">{email}</span>.
                            Click it to activate your account.
                        </p>
                        <Link
                            to="/login"
                            className="inline-flex items-center justify-center w-full bg-white text-black font-bold text-sm tracking-wide rounded-xl py-3 hover:bg-white/90 transition-all"
                        >
                            Go to sign in
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex flex-col">
            {/* Ambient glow */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -top-40 right-0 w-[600px] h-[600px] rounded-full bg-white/[0.03] blur-3xl" />
                <div className="absolute bottom-0 -left-20 w-[500px] h-[500px] rounded-full bg-white/[0.02] blur-3xl" />
            </div>

            {/* Top bar */}
            <div className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto w-full">
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
                <Link to="/" className="flex items-center gap-2.5 group">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 border border-white/20 group-hover:border-white/40 transition-all">
                        <Zap size={14} className="text-white" strokeWidth={2.5} />
                    </div>
                    <span className="font-bold text-white text-sm tracking-tight hidden sm:block">
                        {arenaConfig.name}
                    </span>
                </Link>
            </div>

            {/* Main card */}
            <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-[400px]"
                >
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">
                            Create an account
                        </h1>
                        <p className="text-sm text-white/40">
                            Join {arenaConfig.name} and start booking
                        </p>
                    </div>

                    {/* Card */}
                    <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-7 backdrop-blur-sm shadow-[0_8px_40px_rgba(0,0,0,0.4)]">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Full name */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-white/50 tracking-wide uppercase">
                                    Full name
                                </label>
                                <div className="relative">
                                    <User
                                        size={15}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
                                    />
                                    <input
                                        type="text"
                                        required
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="John Doe"
                                        className="w-full bg-white/[0.06] border border-white/[0.10] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-white/50 tracking-wide uppercase">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail
                                        size={15}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
                                    />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="w-full bg-white/[0.06] border border-white/[0.10] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-white/50 tracking-wide uppercase">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock
                                        size={15}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
                                    />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        minLength={8}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Min. 8 characters"
                                        className="w-full bg-white/[0.06] border border-white/[0.10] rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>

                                {/* Strength bar */}
                                {password.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="space-y-1.5"
                                    >
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div
                                                    key={i}
                                                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= passwordStrength
                                                            ? strengthColors[passwordStrength]
                                                            : "bg-white/10"
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-xs text-white/30">
                                            Strength:{" "}
                                            <span
                                                className={`font-medium ${passwordStrength === 4
                                                        ? "text-green-400"
                                                        : passwordStrength === 3
                                                            ? "text-yellow-400"
                                                            : passwordStrength === 2
                                                                ? "text-orange-400"
                                                                : "text-red-400"
                                                    }`}
                                            >
                                                {strengthLabels[passwordStrength]}
                                            </span>
                                        </p>
                                    </motion.div>
                                )}
                            </div>

                            {/* Error */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-400"
                                >
                                    {error}
                                </motion.div>
                            )}

                            {/* Terms note */}
                            <p className="text-xs text-white/25 leading-relaxed">
                                By creating an account you agree to our{" "}
                                <span className="text-white/40 underline underline-offset-2 cursor-pointer">
                                    Terms of Service
                                </span>{" "}
                                and{" "}
                                <span className="text-white/40 underline underline-offset-2 cursor-pointer">
                                    Privacy Policy
                                </span>
                                .
                            </p>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 bg-white text-black font-bold text-sm tracking-wide rounded-xl py-3 hover:bg-white/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <Loader2 size={15} className="animate-spin" />
                                ) : (
                                    "Create account"
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Footer */}
                    <p className="mt-6 text-center text-sm text-white/40">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="text-white/80 font-medium hover:text-white transition-colors underline underline-offset-4 decoration-white/20"
                        >
                            Sign in
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
