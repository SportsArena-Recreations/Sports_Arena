import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, Plus, X, Heart, MessageCircle, Share2, ChevronRight,
    Trophy, HelpCircle, MessageSquare, Megaphone, Flame, Calendar,
    Users, Send, ThumbsUp, CornerDownRight, ArrowUpDown, Filter,
} from "lucide-react";
import { Footer } from "@/components/layout/Footer";

// ─── Types ─────────────────────────────────────────────────────────────────────
type PostCategory = "Tournament" | "Discussion" | "Question" | "Announcement";
type PostFilter = "All" | PostCategory;

interface Comment {
    id: string;
    author: string;
    avatarColor: string;
    time: string;
    content: string;
    likes: number;
    liked: boolean;
    replies?: Comment[];
}

interface Post {
    id: string;
    author: string;
    avatarColor: string;
    time: string;
    category: PostCategory;
    title: string;
    content: string;
    likes: number;
    liked: boolean;
    comments: Comment[];
    tournamentLink?: string;
    tournamentDate?: string;
    pinned?: boolean;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const POSTS: Post[] = [
    {
        id: "p1",
        author: "Arena Admin",
        avatarColor: "bg-orange-500",
        time: "2h ago",
        category: "Tournament",
        title: "Registration for Abuja Open ends Friday!",
        content:
            "Don't miss your chance to compete in the biggest tennis tournament of the season. Registration closes this Friday at midnight. Spots are filling up fast — over 80 players already signed up! Prizes include trophies, medals, and cash rewards for top 3 finishers.",
        likes: 47,
        liked: false,
        tournamentLink: "/tournaments",
        tournamentDate: "March 15, 2026",
        pinned: true,
        comments: [
            {
                id: "c1",
                author: "Emeka O.",
                avatarColor: "bg-blue-500",
                time: "1h ago",
                content: "Just registered! Can't wait to compete 🎾",
                likes: 12,
                liked: false,
                replies: [
                    {
                        id: "c1r1",
                        author: "Arena Admin",
                        avatarColor: "bg-orange-500",
                        time: "55m ago",
                        content: "Welcome Emeka! See you on the court 🏆",
                        likes: 5,
                        liked: false,
                    },
                ],
            },
            {
                id: "c2",
                author: "Fatima B.",
                avatarColor: "bg-purple-500",
                time: "45m ago",
                content: "Is there a beginner category or is it open level only?",
                likes: 8,
                liked: false,
                replies: [
                    {
                        id: "c2r1",
                        author: "Arena Admin",
                        avatarColor: "bg-orange-500",
                        time: "40m ago",
                        content: "Yes! We have Beginner, Intermediate, and Open divisions. You can select your level during registration.",
                        likes: 11,
                        liked: false,
                    },
                ],
            },
            {
                id: "c3",
                author: "Chidi A.",
                avatarColor: "bg-green-600",
                time: "30m ago",
                content: "Will there be livestreaming for the finals?",
                likes: 6,
                liked: false,
            },
        ],
    },
    {
        id: "p2",
        author: "Tunde K.",
        avatarColor: "bg-blue-500",
        time: "4h ago",
        category: "Discussion",
        title: "Who's playing this weekend at Central Court?",
        content:
            "Looking to get a good doubles game going this Saturday afternoon around 3pm. Anyone free? We already have two players — need two more to complete the set. Central Court is booked 3–5pm. DM me or comment below!",
        likes: 23,
        liked: false,
        comments: [
            {
                id: "c4",
                author: "Ngozi P.",
                avatarColor: "bg-pink-500",
                time: "3h ago",
                content: "I'm in! What's the skill level expectation?",
                likes: 7,
                liked: false,
                replies: [
                    {
                        id: "c4r1",
                        author: "Tunde K.",
                        avatarColor: "bg-blue-500",
                        time: "3h ago",
                        content: "Intermediate friendly — all are welcome as long as you're having fun 😄",
                        likes: 4,
                        liked: false,
                    },
                ],
            },
            {
                id: "c5",
                author: "Dele M.",
                avatarColor: "bg-teal-500",
                time: "2h ago",
                content: "Count me in! Bringing my own racket.",
                likes: 3,
                liked: false,
            },
        ],
    },
    {
        id: "p3",
        author: "Adaeze N.",
        avatarColor: "bg-purple-500",
        time: "8h ago",
        category: "Question",
        title: "What's the best beginner training plan?",
        content:
            "I'm fairly new to badminton and want to get serious about improving. I've been playing casually for about 3 months. What training plans or routines do you recommend? Are there coaches at this facility? Any advice from more experienced players would be really appreciated!",
        likes: 31,
        liked: false,
        comments: [
            {
                id: "c6",
                author: "Coach Samuel",
                avatarColor: "bg-amber-500",
                time: "7h ago",
                content: "Start with footwork drills 3x a week, light rally sessions, and focus on form over power. I offer beginner sessions every Tuesday and Thursday 6–8pm.",
                likes: 18,
                liked: false,
            },
            {
                id: "c7",
                author: "Kemi L.",
                avatarColor: "bg-rose-500",
                time: "6h ago",
                content: "YouTube channels like Badminton Famly are gold for beginners. Also, join the Sunday casual group — super welcoming crowd!",
                likes: 12,
                liked: false,
            },
            {
                id: "c8",
                author: "Victor O.",
                avatarColor: "bg-indigo-500",
                time: "5h ago",
                content: "Consistency is key. Even 30 minutes of dedicated practice daily beats 2 hours once a week.",
                likes: 9,
                liked: false,
            },
        ],
    },
    {
        id: "p4",
        author: "Arena Admin",
        avatarColor: "bg-orange-500",
        time: "1d ago",
        category: "Announcement",
        title: "New facility hours starting March 1st",
        content:
            "We're extending our opening hours starting March 1st! The facility will now be open Monday–Sunday from 6:00 AM to 11:00 PM. Early morning slots (6–8 AM) are available at a discounted rate. Book via the Facilities page.",
        likes: 89,
        liked: false,
        comments: [
            {
                id: "c9",
                author: "Ibrahim T.",
                avatarColor: "bg-cyan-600",
                time: "22h ago",
                content: "Finally! Early morning sessions are perfect before work 🙌",
                likes: 21,
                liked: false,
            },
            {
                id: "c10",
                author: "Blessing A.",
                avatarColor: "bg-violet-500",
                time: "20h ago",
                content: "What about weekend pricing? Will it remain the same?",
                likes: 8,
                liked: false,
            },
        ],
    },
    {
        id: "p5",
        author: "Obinna C.",
        avatarColor: "bg-green-600",
        time: "2d ago",
        category: "Discussion",
        title: "Best clay courts in town — your rankings?",
        content:
            "Been trying out a few facilities across the city and I think ours has some of the best maintained clay courts. What do others think? Anyone played at different venues recently and have comparisons? Let's settle the debate 😂",
        likes: 15,
        liked: false,
        comments: [
            {
                id: "c11",
                author: "Sade F.",
                avatarColor: "bg-lime-600",
                time: "1d ago",
                content: "100% agree — the maintenance here is top tier. Other courts I've tried are noticeably worse.",
                likes: 6,
                liked: false,
            },
        ],
    },
    {
        id: "p6",
        author: "Yomi A.",
        avatarColor: "bg-red-500",
        time: "3d ago",
        category: "Question",
        title: "Looking for doubles partner — Abuja League",
        content:
            "My regular partner just moved cities and I need a new doubles partner for the Abuja League starting next month. I'm a solid intermediate player, consistent backhand, strong net game. Anyone interested? We'd train twice a week and compete on weekends.",
        likes: 19,
        liked: false,
        comments: [
            {
                id: "c12",
                author: "Chukwu D.",
                avatarColor: "bg-sky-500",
                time: "2d ago",
                content: "Interested! DM me your contact — intermediate level here too.",
                likes: 4,
                liked: false,
            },
        ],
    },
];

const TRENDING = [
    "Abuja League Finals",
    "Best clay courts in town",
    "Looking for doubles partner",
    "New facility hours",
    "Sunday casual group",
];

const UPCOMING = [
    { name: "Abuja Open", date: "Mar 15, 2026", sport: "Tennis" },
    { name: "Summer Slam Festival", date: "Jun 10, 2026", sport: "Mixed" },
    { name: "Indoor Soccer League", date: "Feb 25, 2026", sport: "Soccer" },
];

const ACTIVE_MEMBERS = [
    { name: "Emeka O.", color: "bg-blue-500" },
    { name: "Fatima B.", color: "bg-purple-500" },
    { name: "Coach Samuel", color: "bg-amber-500" },
    { name: "Ngozi P.", color: "bg-pink-500" },
    { name: "Tunde K.", color: "bg-teal-500" },
    { name: "Kemi L.", color: "bg-rose-500" },
    { name: "Victor O.", color: "bg-indigo-500" },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
function getInitials(name: string) {
    return name.trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

const CATEGORY_META: Record<PostCategory, { icon: React.ElementType; color: string; bg: string; border: string }> = {
    Tournament: { icon: Trophy, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/25" },
    Discussion: { icon: MessageSquare, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/25" },
    Question: { icon: HelpCircle, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/25" },
    Announcement: { icon: Megaphone, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/25" },
};

// ─── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ name, colorClass, size = "md" }: { name: string; colorClass: string; size?: "sm" | "md" | "lg" }) {
    const sizes = { sm: "w-7 h-7 text-[10px]", md: "w-9 h-9 text-xs", lg: "w-11 h-11 text-sm" };
    return (
        <div className={`${sizes[size]} ${colorClass} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 shadow-md`}>
            {getInitials(name)}
        </div>
    );
}

// ─── Category Tag ──────────────────────────────────────────────────────────────
function CategoryTag({ category }: { category: PostCategory }) {
    const meta = CATEGORY_META[category];
    const Icon = meta.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${meta.color} ${meta.bg} ${meta.border}`}>
            <Icon size={10} strokeWidth={2.5} />
            {category}
        </span>
    );
}

// ─── Comment Thread ────────────────────────────────────────────────────────────
function CommentItem({
    comment,
    nested = false,
}: {
    comment: Comment;
    nested?: boolean;
}) {
    const [liked, setLiked] = useState(comment.liked);
    const [likes, setLikes] = useState(comment.likes);
    const [showReplyBox, setShowReplyBox] = useState(false);

    const handleLike = () => {
        setLiked((l) => {
            setLikes((c) => (l ? c - 1 : c + 1));
            return !l;
        });
    };

    return (
        <div className={`flex gap-3 ${nested ? "pl-8 mt-3" : ""}`}>
            <Avatar name={comment.author} colorClass={comment.avatarColor} size="sm" />
            <div className="flex-1 min-w-0">
                <div className="bg-white/[0.04] rounded-2xl px-4 py-3 border border-white/[0.06]">
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-sm font-semibold text-white/90">{comment.author}</span>
                        <span className="text-[10px] text-white/30">{comment.time}</span>
                    </div>
                    <p className="text-sm text-white/65 leading-relaxed">{comment.content}</p>
                </div>
                <div className="flex items-center gap-4 px-2 mt-1.5">
                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${liked ? "text-rose-400" : "text-white/30 hover:text-white/60"}`}
                    >
                        <ThumbsUp size={11} strokeWidth={2.5} />
                        {likes}
                    </button>
                    {!nested && (
                        <button
                            onClick={() => setShowReplyBox((s) => !s)}
                            className="flex items-center gap-1.5 text-xs font-semibold text-white/30 hover:text-white/60 transition-colors"
                        >
                            <CornerDownRight size={11} strokeWidth={2.5} />
                            Reply
                        </button>
                    )}
                </div>
                {showReplyBox && (
                    <div className="mt-2 pl-0 flex gap-2">
                        <input
                            placeholder="Write a reply…"
                            className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/20 transition-colors"
                        />
                        <button className="px-3 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-white/60 hover:text-white transition-all">
                            <Send size={13} />
                        </button>
                    </div>
                )}
                {comment.replies?.map((r) => (
                    <CommentItem key={r.id} comment={r} nested />
                ))}
            </div>
        </div>
    );
}

// ─── Discussion Modal ──────────────────────────────────────────────────────────
function DiscussionModal({ post, onClose }: { post: Post; onClose: () => void }) {
    const [sortComments, setSortComments] = useState<"newest" | "top">("top");
    const [liked, setLiked] = useState(post.liked);
    const [likes, setLikes] = useState(post.likes);
    const [newComment, setNewComment] = useState("");
    const meta = CATEGORY_META[post.category];

    const sorted = [...post.comments].sort((a, b) =>
        sortComments === "top" ? b.likes - a.likes : 0
    );

    const handleLike = () => {
        setLiked((l) => { setLikes((c) => (l ? c - 1 : c + 1)); return !l; });
    };

    return (
        <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

            <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 40, scale: 0.97 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full sm:max-w-2xl max-h-[85dvh] flex flex-col bg-[#08080a] border border-white/10 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
            >
                {/* Modal header */}
                <div className={`px-5 pt-5 pb-4 sm:px-6 sm:pt-6 border-b border-white/[0.06] flex-shrink-0 ${meta.bg}`}>
                    <div className="flex items-start gap-4 justify-between">
                        <div className="flex gap-3 flex-1 min-w-0">
                            <Avatar name={post.author} colorClass={post.avatarColor} size="lg" />
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <span className="text-sm font-semibold text-white/80">{post.author}</span>
                                    <span className="text-[10px] text-white/30">{post.time}</span>
                                    <CategoryTag category={post.category} />
                                </div>
                                <h2 className="text-lg font-bold text-white leading-snug tracking-tight">{post.title}</h2>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="flex-shrink-0 w-9 h-9 rounded-full bg-white/[0.07] border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.12] transition-all"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 space-y-6">
                    {/* Full post content */}
                    <div>
                        <p className="text-sm text-white/65 leading-relaxed">{post.content}</p>
                        {post.tournamentDate && (
                            <div className="mt-3 flex items-center gap-2 text-xs text-white/40">
                                <Calendar size={12} />
                                <span>Tournament date: <strong className="text-white/70">{post.tournamentDate}</strong></span>
                            </div>
                        )}
                        {/* Like / comment row */}
                        <div className="flex items-center gap-5 mt-4 pt-4 border-t border-white/[0.06]">
                            <button
                                onClick={handleLike}
                                className={`flex items-center gap-2 text-sm font-semibold transition-colors ${liked ? "text-rose-400" : "text-white/40 hover:text-white/70"}`}
                            >
                                <Heart size={15} strokeWidth={2} fill={liked ? "currentColor" : "none"} />
                                {likes}
                            </button>
                            <span className="flex items-center gap-2 text-sm text-white/40">
                                <MessageCircle size={15} strokeWidth={2} />
                                {post.comments.length}
                            </span>
                        </div>
                    </div>

                    {/* Comment sort */}
                    <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-bold tracking-widest uppercase text-white/40">
                            {post.comments.length} Comments
                        </h3>
                        <div className="flex gap-1">
                            {(["top", "newest"] as const).map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setSortComments(s)}
                                    className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all ${sortComments === s
                                        ? "bg-white/10 text-white border border-white/15"
                                        : "text-white/30 hover:text-white/60"
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Comments */}
                    <div className="space-y-5">
                        {sorted.map((c) => (
                            <CommentItem key={c.id} comment={c} />
                        ))}
                    </div>
                </div>

                {/* Comment input footer */}
                <div className="flex-shrink-0 px-5 py-4 sm:px-6 border-t border-white/[0.06] bg-black/30">
                    <div className="flex gap-3 items-center">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white/50">
                            Me
                        </div>
                        <input
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment…"
                            className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/20 transition-colors"
                        />
                        <button
                            disabled={!newComment.trim()}
                            className="px-4 py-2.5 rounded-xl bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-white/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                        >
                            <Send size={13} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ─── Post Card ─────────────────────────────────────────────────────────────────
function PostCard({ post, onOpen }: { post: Post; onOpen: () => void }) {
    const [liked, setLiked] = useState(post.liked);
    const [likes, setLikes] = useState(post.likes);
    const meta = CATEGORY_META[post.category];

    const handleLike = (e: React.MouseEvent) => {
        e.stopPropagation();
        setLiked((l) => { setLikes((c) => (l ? c - 1 : c + 1)); return !l; });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="group relative bg-[#06060a] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-white/[0.13] transition-all duration-300"
        >
            {/* accent glow */}
            <div className={`absolute top-0 right-0 w-48 h-48 blur-[80px] opacity-10 pointer-events-none ${meta.bg}`} />

            {post.pinned && (
                <div className="px-5 pt-3 pb-0">
                    <span className="text-[9px] font-bold tracking-widest uppercase text-amber-400/70 border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 rounded-full">
                        📌 Pinned
                    </span>
                </div>
            )}

            <div className="p-5 sm:p-6">
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                    <Avatar name={post.author} colorClass={post.avatarColor} />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-white/85">{post.author}</span>
                            <span className="text-[10px] text-white/30">{post.time}</span>
                        </div>
                        <div className="mt-1">
                            <CategoryTag category={post.category} />
                        </div>
                    </div>
                </div>

                {/* Body */}
                <h3 className="text-base font-bold text-white leading-snug mb-2 tracking-tight">{post.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed line-clamp-3">{post.content}</p>

                {/* Tournament meta */}
                {post.tournamentDate && (
                    <div className="mt-3 flex items-center gap-4 flex-wrap">
                        <span className="flex items-center gap-1.5 text-xs text-white/40">
                            <Calendar size={11} />
                            {post.tournamentDate}
                        </span>
                        <a
                            href={post.tournamentLink}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors underline underline-offset-2"
                        >
                            View Tournament →
                        </a>
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/[0.05]">
                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${liked ? "text-rose-400" : "text-white/35 hover:text-white/70"}`}
                    >
                        <Heart size={13} strokeWidth={2} fill={liked ? "currentColor" : "none"} />
                        {likes}
                    </button>
                    <button
                        onClick={onOpen}
                        className="flex items-center gap-1.5 text-xs font-semibold text-white/35 hover:text-white/70 transition-colors"
                    >
                        <MessageCircle size={13} strokeWidth={2} />
                        {post.comments.length}
                    </button>
                    <button className="flex items-center gap-1.5 text-xs font-semibold text-white/35 hover:text-white/70 transition-colors ml-auto">
                        <Share2 size={13} strokeWidth={2} />
                        Share
                    </button>
                    <button
                        onClick={onOpen}
                        className="flex items-center gap-1.5 text-xs font-semibold text-white border border-white/10 rounded-full px-3 py-1.5 hover:bg-white/[0.08] hover:border-white/20 transition-all"
                    >
                        View discussion
                        <ChevronRight size={12} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

// ─── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar() {
    return (
        <aside className="hidden lg:flex flex-col gap-5 w-[300px] flex-shrink-0">
            {/* Trending Topics */}
            <div className="bg-[#06060a] border border-white/[0.07] rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Flame size={14} className="text-orange-400" strokeWidth={2} />
                    <h3 className="text-xs font-bold tracking-widest uppercase text-white/50">Trending Topics</h3>
                </div>
                <div className="flex flex-col gap-1">
                    {TRENDING.map((topic, i) => (
                        <button
                            key={topic}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/55 hover:text-white hover:bg-white/[0.05] transition-all text-left"
                        >
                            <span className="text-[10px] font-bold tabular-nums text-white/20 w-4">{i + 1}</span>
                            {topic}
                        </button>
                    ))}
                </div>
            </div>

            {/* Upcoming Tournaments */}
            <div className="bg-[#06060a] border border-white/[0.07] rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Calendar size={14} className="text-blue-400" strokeWidth={2} />
                    <h3 className="text-xs font-bold tracking-widest uppercase text-white/50">Upcoming Tournaments</h3>
                </div>
                <div className="flex flex-col gap-3">
                    {UPCOMING.map((t) => (
                        <div
                            key={t.name}
                            className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-all"
                        >
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-white/85 truncate">{t.name}</p>
                                <p className="text-[10px] text-white/35 mt-0.5">{t.date} · {t.sport}</p>
                            </div>
                            <button className="flex-shrink-0 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/[0.12] transition-all">
                                Join
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Active Members */}
            <div className="bg-[#06060a] border border-white/[0.07] rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Users size={14} className="text-green-400" strokeWidth={2} />
                    <h3 className="text-xs font-bold tracking-widest uppercase text-white/50">Active Today</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                    {ACTIVE_MEMBERS.map((m) => (
                        <div key={m.name} className="relative group/avatar">
                            <div className={`w-9 h-9 rounded-full ${m.color} flex items-center justify-center text-[10px] font-bold text-white shadow-md cursor-pointer hover:scale-110 transition-transform`}>
                                {getInitials(m.name)}
                            </div>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded-lg bg-black/90 border border-white/10 text-[10px] text-white whitespace-nowrap opacity-0 group-hover/avatar:opacity-100 transition-opacity pointer-events-none z-10">
                                {m.name}
                            </div>
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-[#06060a]" />
                        </div>
                    ))}
                </div>
                <p className="text-[10px] text-white/30 mt-3">{ACTIVE_MEMBERS.length} members active in the last hour</p>
            </div>
        </aside>
    );
}

// ─── Create Post Modal ─────────────────────────────────────────────────────────
function CreatePostModal({ onClose }: { onClose: () => void }) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState<PostCategory>("Discussion");

    return (
        <motion.div
            key="create-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 40, scale: 0.97 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full sm:max-w-xl bg-[#08080a] border border-white/10 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
            >
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/[0.06]">
                    <h2 className="text-lg font-bold text-white">Create Post</h2>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-full bg-white/[0.07] border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.12] transition-all"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="px-6 py-5 space-y-4">
                    {/* Category selector */}
                    <div className="flex gap-2 flex-wrap">
                        {(["Discussion", "Question", "Tournament", "Announcement"] as PostCategory[]).map((c) => {
                            const m = CATEGORY_META[c];
                            return (
                                <button
                                    key={c}
                                    onClick={() => setCategory(c)}
                                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase border transition-all ${category === c
                                        ? `${m.color} ${m.bg} ${m.border}`
                                        : "text-white/30 border-white/10 hover:text-white/60"
                                        }`}
                                >
                                    {c}
                                </button>
                            );
                        })}
                    </div>

                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Post title…"
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm font-semibold text-white placeholder-white/25 focus:outline-none focus:border-white/20 transition-colors"
                    />

                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={5}
                        placeholder="What's on your mind? Share updates, questions, or start a discussion…"
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/20 transition-colors resize-none leading-relaxed"
                    />
                </div>

                <div className="px-6 pb-6 flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl border border-white/10 text-sm text-white/50 hover:text-white hover:border-white/25 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={!title.trim() || !content.trim()}
                        className="px-6 py-2.5 rounded-xl bg-white text-black text-sm font-bold tracking-widest uppercase hover:bg-white/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        Publish
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ─── Filter Tabs ────────────────────────────────────────────────────────────────
const FILTERS: PostFilter[] = ["All", "Tournament", "Discussion", "Question", "Announcement"];

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function Community() {
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState<PostFilter>("All");
    const [openPost, setOpenPost] = useState<Post | null>(null);
    const [showCreate, setShowCreate] = useState(false);

    const totalMembers = 342;
    const totalPosts = POSTS.length;

    const filtered = useMemo(() => {
        return POSTS.filter((p) => {
            const matchesFilter = activeFilter === "All" || p.category === activeFilter;
            const q = search.toLowerCase();
            const matchesSearch =
                !q ||
                p.title.toLowerCase().includes(q) ||
                p.content.toLowerCase().includes(q) ||
                p.author.toLowerCase().includes(q);
            return matchesFilter && matchesSearch;
        });
    }, [search, activeFilter]);

    return (
        <div className="bg-[#020202] text-white min-h-screen font-sans">
            {/* ── Hero ───────────────────────────────────────────────────── */}
            <section className="pt-16 pb-12 px-6 border-b border-white/[0.05] relative overflow-hidden bg-black">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 via-transparent to-purple-950/20 pointer-events-none" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-blue-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

                <div className="container mx-auto max-w-5xl relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="text-center"
                    >
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <span className="text-[10px] font-bold tracking-widest uppercase text-white/30 border border-white/10 px-3 py-1 rounded-full">
                                Sports Arena
                            </span>
                            <span className="text-[10px] font-bold tracking-widest uppercase text-green-400 border border-green-500/30 px-3 py-1 rounded-full bg-green-500/10 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                                {ACTIVE_MEMBERS.length} online now
                            </span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter text-white mb-3">
                            Community
                        </h1>
                        <p className="text-lg text-white/40 mb-8">Connect. Discuss. Compete.</p>

                        {/* Quick stats */}
                        <div className="flex justify-center flex-wrap gap-10 sm:gap-20 mb-10">
                            {[
                                { label: "Members", value: totalMembers },
                                { label: "Discussions", value: totalPosts },
                                { label: "Active Today", value: ACTIVE_MEMBERS.length },
                            ].map((s) => (
                                <div key={s.label} className="text-center">
                                    <p className="text-3xl font-black text-white">{s.value}</p>
                                    <p className="text-[10px] font-bold tracking-widest uppercase text-white/30 mt-1">{s.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Search + Create */}
                        <div className="flex gap-3 max-w-2xl mx-auto">
                            <div className="relative flex-1">
                                <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" strokeWidth={2} />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search discussions…"
                                    className="w-full bg-white/[0.05] border border-white/[0.10] rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/25 focus:bg-white/[0.07] transition-all"
                                />
                            </div>
                            <button
                                onClick={() => setShowCreate(true)}
                                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-black text-sm font-bold tracking-wide hover:bg-white/90 transition-all flex-shrink-0"
                            >
                                <Plus size={15} strokeWidth={2.5} />
                                Create Post
                            </button>
                        </div>

                        {/* Filter tabs */}
                        <div className="flex items-center gap-1.5 justify-center flex-wrap mt-5">
                            {FILTERS.map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setActiveFilter(f)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all border ${activeFilter === f
                                        ? "bg-white/10 text-white border-white/15"
                                        : "text-white/35 border-transparent hover:text-white/70 hover:border-white/10"
                                        }`}
                                >
                                    {f === "All" ? (
                                        <span className="flex items-center gap-1.5">
                                            <Filter size={10} strokeWidth={2.5} />
                                            All
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1.5">
                                            {(() => {
                                                const Icon = CATEGORY_META[f as PostCategory].icon;
                                                return <Icon size={10} strokeWidth={2.5} />;
                                            })()}
                                            {f}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── Feed + Sidebar ──────────────────────────────────────────── */}
            <section className="py-12 px-4 sm:px-6">
                <div className="container mx-auto max-w-6xl flex gap-8 items-start">
                    {/* Feed */}
                    <div className="flex-1 min-w-0 flex flex-col gap-5">
                        {/* Sort bar */}
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-white/30 font-semibold">
                                {filtered.length} {filtered.length === 1 ? "post" : "posts"}
                                {activeFilter !== "All" ? ` · ${activeFilter}` : ""}
                                {search ? ` matching "${search}"` : ""}
                            </p>
                            <button className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors font-semibold">
                                <ArrowUpDown size={11} strokeWidth={2.5} />
                                Sort: Trending
                            </button>
                        </div>

                        {filtered.length === 0 ? (
                            <div className="text-center py-20 text-white/25">
                                <MessageSquare size={40} className="mx-auto mb-4 opacity-30" />
                                <p className="text-sm font-semibold">No posts found</p>
                                <p className="text-xs mt-1">Try a different search or filter</p>
                            </div>
                        ) : (
                            filtered.map((p) => (
                                <PostCard key={p.id} post={p} onOpen={() => setOpenPost(p)} />
                            ))
                        )}
                    </div>

                    {/* Sidebar */}
                    <Sidebar />
                </div>
            </section>

            <Footer />

            {/* ── Modals ─────────────────────────────────────────────────── */}
            <AnimatePresence>
                {openPost && <DiscussionModal key="discussion" post={openPost} onClose={() => setOpenPost(null)} />}
                {showCreate && <CreatePostModal key="create" onClose={() => setShowCreate(false)} />}
            </AnimatePresence>
        </div>
    );
}
