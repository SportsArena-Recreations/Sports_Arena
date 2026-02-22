import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { arenaConfig } from "@/config/arena.config";

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const result = await Promise.race([
                supabase.auth.signInWithPassword({ email, password }),
                new Promise<never>((_, reject) =>
                    setTimeout(
                        () => reject(new Error("Request timed out. Check your connection and try again.")),
                        10_000
                    )
                ),
            ]);

            const { error: authError } = result as Awaited<
                ReturnType<typeof supabase.auth.signInWithPassword>
            >;

            if (authError) {
                setError(authError.message);
            } else {
                navigate("/");
            }
        } catch (err: unknown) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col">
            {/* Ambient background glow */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-white/[0.03] blur-3xl" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-white/[0.02] blur-3xl" />
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
                    {/* Header text */}
                    <div className="mb-8 text-center">
                        <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">
                            Welcome back
                        </h1>
                        <p className="text-sm text-white/40">
                            Sign in to your {arenaConfig.name} account
                        </p>
                    </div>

                    {/* Card */}
                    <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-7 backdrop-blur-sm shadow-[0_8px_40px_rgba(0,0,0,0.4)]">
                        <form onSubmit={handleSubmit} className="space-y-4">
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
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-medium text-white/50 tracking-wide uppercase">
                                        Password
                                    </label>
                                    <Link
                                        to="/forgot-password"
                                        className="text-xs text-white/40 hover:text-white/70 transition-colors"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Lock
                                        size={15}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
                                    />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
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
                            </div>

                            {/* Error message */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-400"
                                >
                                    {error}
                                </motion.div>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 bg-white text-black font-bold text-sm tracking-wide rounded-xl py-3 mt-2 hover:bg-white/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <Loader2 size={15} className="animate-spin" />
                                ) : (
                                    "Sign in"
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Footer link */}
                    <p className="mt-6 text-center text-sm text-white/40">
                        Don't have an account?{" "}
                        <Link
                            to="/signup"
                            className="text-white/80 font-medium hover:text-white transition-colors underline underline-offset-4 decoration-white/20"
                        >
                            Create one
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
