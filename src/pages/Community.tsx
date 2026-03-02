import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, Plus, X, Heart, MessageCircle, Share2, ChevronRight, ChevronDown,
    Trophy, HelpCircle, MessageSquare, Megaphone, Flame, Calendar,
    Users, Send, ThumbsUp, CornerDownRight, ArrowUpDown, Filter, Loader2, AlertCircle, Trash2,
} from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import {
    type DBPost,
    type DBComment,
    type PostCategory,
    type SidebarTournament,
    fetchPosts,
    fetchPostLikes,
    createPost,
    deletePost,
    togglePostLike,
    fetchComments,
    fetchCommentLikes,
    addComment,
    toggleCommentLike,
    fetchMemberCount,
    fetchTrendingTopics,
    fetchUpcomingTournaments,
    getAvatarColor,
    formatRelativeTime,
} from "@/services/communityService";


// ─── Helpers ───────────────────────────────────────────────────────────────────
function getInitials(name: string) {
    return name.trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

type PostFilter = "All" | PostCategory;

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

// ─── Comment Item ──────────────────────────────────────────────────────────────
function CommentItem({
    comment,
    postId,
    postAuthorId,
    userId,
    userFullName,
    userAvatarColor,
    nested = false,
    onReply,
}: {
    comment: DBComment;
    postId: string;
    postAuthorId: string;
    userId?: string;
    userFullName?: string | null;
    userAvatarColor?: string;
    nested?: boolean;
    onReply?: (parentId: string, content: string) => Promise<void>;
}) {
    const isAuthor = comment.author_id === postAuthorId;
    const [liked, setLiked] = useState(comment.liked ?? false);
    const [likes, setLikes] = useState(comment.likes_count);
    const [showReply, setShowReply] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [showReplies, setShowReplies] = useState(true);

    const replyCount = comment.replies?.length ?? 0;

    const handleLike = async () => {
        if (!userId) return;
        const next = !liked;
        setLiked(next);
        setLikes((c) => (next ? c + 1 : Math.max(c - 1, 0)));
        try {
            await toggleCommentLike(comment.id, userId, !next);
        } catch {
            setLiked(!next);
            setLikes((c) => (!next ? c + 1 : Math.max(c - 1, 0)));
        }
    };

    const submitReply = async () => {
        if (!replyText.trim() || !onReply) return;
        setSubmitting(true);
        await onReply(comment.id, replyText.trim());
        setReplyText("");
        setShowReply(false);
        setSubmitting(false);
    };

    return (
        <div className={`flex gap-3 ${nested ? "pl-8 mt-3" : ""}`}>
            <Avatar name={comment.author_name} colorClass={comment.avatar_color} size="sm" />
            <div className="flex-1 min-w-0">
                <div className={`bg-white/[0.04] rounded-2xl px-4 py-3 border ${isAuthor ? "border-orange-500/20" : "border-white/[0.06]"}`}>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-sm font-semibold text-white/90">{comment.author_name}</span>
                        {isAuthor && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase bg-orange-500/15 border border-orange-500/30 text-orange-400">
                                ✍ Author
                            </span>
                        )}
                        <span className="text-[10px] text-white/30">{formatRelativeTime(comment.created_at)}</span>
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
                    {!nested && userId && (
                        <button
                            onClick={() => setShowReply((s) => !s)}
                            className="flex items-center gap-1.5 text-xs font-semibold text-white/30 hover:text-white/60 transition-colors"
                        >
                            <CornerDownRight size={11} strokeWidth={2.5} />
                            Reply
                        </button>
                    )}
                </div>

                {showReply && userId && (
                    <div className="mt-2 flex gap-2">
                        <input
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && submitReply()}
                            placeholder="Write a reply…"
                            className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/20 transition-colors"
                        />
                        <button
                            onClick={submitReply}
                            disabled={submitting || !replyText.trim()}
                            className="px-3 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-white/60 hover:text-white transition-all disabled:opacity-30"
                        >
                            {submitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                        </button>
                    </div>
                )}

                {replyCount > 0 && (
                    <button
                        onClick={() => setShowReplies((s) => !s)}
                        className="flex items-center gap-1.5 mt-2 px-2 text-xs font-semibold text-white/35 hover:text-white/70 transition-colors"
                    >
                        <motion.span
                            animate={{ rotate: showReplies ? 0 : -90 }}
                            transition={{ duration: 0.2 }}
                            className="inline-flex"
                        >
                            <ChevronDown size={12} strokeWidth={2.5} />
                        </motion.span>
                        {showReplies
                            ? `Hide ${replyCount} ${replyCount === 1 ? "reply" : "replies"}`
                            : `Show ${replyCount} ${replyCount === 1 ? "reply" : "replies"}`}
                    </button>
                )}

                <AnimatePresence initial={false}>
                    {showReplies && replyCount > 0 && (
                        <motion.div
                            key="replies"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                            style={{ overflow: "hidden" }}
                        >
                            {comment.replies!.map((r) => (
                                <CommentItem
                                    key={r.id}
                                    comment={r}
                                    postId={postId}
                                    postAuthorId={postAuthorId}
                                    userId={userId}
                                    userFullName={userFullName}
                                    userAvatarColor={userAvatarColor}
                                    nested
                                />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

// ─── Discussion Modal ──────────────────────────────────────────────────────────
function DiscussionModal({
    post,
    onClose,
    userId,
    userFullName,
    userAvatarColor,
    onLikePost,
}: {
    post: DBPost;
    onClose: () => void;
    userId?: string;
    userFullName?: string | null;
    userAvatarColor?: string;
    onLikePost: (postId: string, liked: boolean) => void;
}) {
    const [liked, setLiked] = useState(post.liked ?? false);
    const [likes, setLikes] = useState(post.likes_count);
    const [newComment, setNewComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [comments, setComments] = useState<DBComment[]>([]);
    const [loadingComments, setLoadingComments] = useState(true);
    const [sortComments, setSortComments] = useState<"newest" | "top">("top");
    const meta = CATEGORY_META[post.category];

    // Load comments + their liked state
    useEffect(() => {
        let cancelled = false;
        setLoadingComments(true);
        fetchComments(post.id).then(async (rows) => {
            if (cancelled) return;
            if (userId) {
                const liked = await fetchCommentLikes(userId, post.id);
                const withLiked = applyLikesToComments(rows, liked);
                if (!cancelled) setComments(withLiked);
            } else {
                if (!cancelled) setComments(rows);
            }
            if (!cancelled) setLoadingComments(false);
        });
        return () => { cancelled = true; };
    }, [post.id, userId]);

    function applyLikesToComments(rows: DBComment[], likedSet: Set<string>): DBComment[] {
        return rows.map((c) => ({
            ...c,
            liked: likedSet.has(c.id),
            replies: c.replies?.map((r) => ({ ...r, liked: likedSet.has(r.id) })),
        }));
    }

    const handleLike = async () => {
        if (!userId) return;
        const next = !liked;
        setLiked(next);
        setLikes((c) => (next ? c + 1 : Math.max(c - 1, 0)));
        onLikePost(post.id, next);
        try {
            await togglePostLike(post.id, userId, !next);
        } catch {
            setLiked(!next);
            setLikes((c) => (!next ? c + 1 : Math.max(c - 1, 0)));
            onLikePost(post.id, !next);
        }
    };

    const submitComment = async () => {
        if (!newComment.trim() || !userId || !userFullName) return;
        setSubmitting(true);
        try {
            const added = await addComment({
                postId: post.id,
                authorId: userId,
                authorName: userFullName,
                avatarColor: userAvatarColor ?? "bg-blue-500",
                content: newComment.trim(),
            });
            setComments((prev) => [...prev, { ...added, replies: [] }]);
            setNewComment("");
        } finally {
            setSubmitting(false);
        }
    };

    const handleReply = async (parentId: string, content: string) => {
        if (!userId || !userFullName) return;
        const added = await addComment({
            postId: post.id,
            parentId,
            authorId: userId,
            authorName: userFullName,
            avatarColor: userAvatarColor ?? "bg-blue-500",
            content,
        });
        setComments((prev) =>
            prev.map((c) =>
                c.id === parentId
                    ? { ...c, replies: [...(c.replies ?? []), added] }
                    : c
            )
        );
    };

    const sortedComments = useMemo(() => {
        return [...comments].sort((a, b) =>
            sortComments === "top" ? b.likes_count - a.likes_count : 0
        );
    }, [comments, sortComments]);

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
                            <Avatar name={post.author_name} colorClass={post.avatar_color} size="lg" />
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <span className="text-sm font-semibold text-white/80">{post.author_name}</span>
                                    <span className="text-[10px] text-white/30">{formatRelativeTime(post.created_at)}</span>
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
                <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 space-y-6 custom-scroll-hover">
                    <div>
                        <p className="text-sm text-white/65 leading-relaxed">{post.content}</p>
                        {post.tournament_date && (
                            <div className="mt-3 flex items-center gap-2 text-xs text-white/40">
                                <Calendar size={12} />
                                <span>Tournament date: <strong className="text-white/70">{post.tournament_date}</strong></span>
                            </div>
                        )}
                        <div className="flex items-center gap-5 mt-4 pt-4 border-t border-white/[0.06]">
                            <button
                                onClick={handleLike}
                                title={userId ? undefined : "Sign in to like"}
                                className={`flex items-center gap-2 text-sm font-semibold transition-colors ${liked ? "text-rose-400" : "text-white/40 hover:text-white/70"} ${!userId ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                <Heart size={15} strokeWidth={2} fill={liked ? "currentColor" : "none"} />
                                {likes}
                            </button>
                            <span className="flex items-center gap-2 text-sm text-white/40">
                                <MessageCircle size={15} strokeWidth={2} />
                                {comments.length}
                            </span>
                        </div>
                    </div>

                    {/* Sort */}
                    <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-bold tracking-widest uppercase text-white/40">
                            {comments.length} Comments
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

                    {/* Comments list */}
                    {loadingComments ? (
                        <div className="flex justify-center py-8">
                            <Loader2 size={20} className="animate-spin text-white/30" />
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {sortedComments.length === 0 ? (
                                <p className="text-sm text-white/25 text-center py-6">No comments yet. Be the first!</p>
                            ) : (
                                sortedComments.map((c) => (
                                    <CommentItem
                                        key={c.id}
                                        comment={c}
                                        postId={post.id}
                                        postAuthorId={post.author_id}
                                        userId={userId}
                                        userFullName={userFullName}
                                        userAvatarColor={userAvatarColor}
                                        onReply={handleReply}
                                    />
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Comment input footer */}
                <div className="flex-shrink-0 px-5 py-4 sm:px-6 border-t border-white/[0.06] bg-black/30">
                    {userId ? (
                        <div className="flex gap-3 items-center">
                            <Avatar name={userFullName ?? "Me"} colorClass={userAvatarColor ?? "bg-white/10"} size="sm" />
                            <input
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && submitComment()}
                                placeholder="Add a comment…"
                                className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/20 transition-colors"
                            />
                            <button
                                onClick={submitComment}
                                disabled={!newComment.trim() || submitting}
                                className="px-4 py-2.5 rounded-xl bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-white/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                            >
                                {submitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                            </button>
                        </div>
                    ) : (
                        <p className="text-sm text-white/30 text-center">
                            <a href="/login" className="text-white/60 underline hover:text-white transition-colors">Sign in</a> to join the discussion
                        </p>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}

// ─── Post Card ─────────────────────────────────────────────────────────────────
function PostCard({
    post,
    onOpen,
    userId,
    isAdmin,
    onLike,
    onDelete,
}: {
    post: DBPost;
    onOpen: () => void;
    userId?: string;
    isAdmin?: boolean;
    onLike: (postId: string, liked: boolean) => void;
    onDelete: (postId: string) => void;
}) {
    const [liked, setLiked] = useState(post.liked ?? false);
    const [likes, setLikes] = useState(post.likes_count);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const meta = CATEGORY_META[post.category];

    const handleLike = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!userId) return;
        const next = !liked;
        setLiked(next);
        setLikes((c) => (next ? c + 1 : Math.max(c - 1, 0)));
        onLike(post.id, next);
        try {
            await togglePostLike(post.id, userId, !next);
        } catch {
            setLiked(!next);
            setLikes((c) => (!next ? c + 1 : Math.max(c - 1, 0)));
            onLike(post.id, !next);
        }
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirmDelete) {
            setConfirmDelete(true);
            // Auto-reset after 3 seconds if user doesn't confirm
            setTimeout(() => setConfirmDelete(false), 3000);
            return;
        }
        setDeleting(true);
        try {
            await deletePost(post.id);
            onDelete(post.id);
        } catch (err) {
            console.error("Delete failed:", err);
            setDeleting(false);
            setConfirmDelete(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="group relative bg-[#06060a] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-white/[0.13] transition-all duration-300"
        >
            <div className={`absolute top-0 right-0 w-48 h-48 blur-[80px] opacity-10 pointer-events-none ${meta.bg}`} />

            {post.pinned && (
                <div className="px-5 pt-3 pb-0">
                    <span className="text-[9px] font-bold tracking-widest uppercase text-amber-400/70 border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 rounded-full">
                        📌 Pinned
                    </span>
                </div>
            )}

            <div className="p-5 sm:p-6">
                <div className="flex items-start gap-3 mb-3">
                    <Avatar name={post.author_name} colorClass={post.avatar_color} />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-white/85">{post.author_name}</span>
                            <span className="text-[10px] text-white/30">{formatRelativeTime(post.created_at)}</span>
                        </div>
                        <div className="mt-1">
                            <CategoryTag category={post.category} />
                        </div>
                    </div>
                </div>

                <h3 className="text-base font-bold text-white leading-snug mb-2 tracking-tight">{post.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed line-clamp-3">{post.content}</p>

                {post.tournament_date && (
                    <div className="mt-3 flex items-center gap-4 flex-wrap">
                        <span className="flex items-center gap-1.5 text-xs text-white/40">
                            <Calendar size={11} />
                            {post.tournament_date}
                        </span>
                        {post.tournament_link && (
                            <a
                                href={post.tournament_link}
                                onClick={(e) => e.stopPropagation()}
                                className="text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors underline underline-offset-2"
                            >
                                View Tournament →
                            </a>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/[0.05]">
                    <button
                        onClick={handleLike}
                        title={userId ? undefined : "Sign in to like"}
                        className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${liked ? "text-rose-400" : "text-white/35 hover:text-white/70"} ${!userId ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        <Heart size={13} strokeWidth={2} fill={liked ? "currentColor" : "none"} />
                        {likes}
                    </button>
                    <button
                        onClick={onOpen}
                        className="flex items-center gap-1.5 text-xs font-semibold text-white/35 hover:text-white/70 transition-colors"
                    >
                        <MessageCircle size={13} strokeWidth={2} />
                        {post.comments_count}
                    </button>
                    <button className="flex items-center gap-1.5 text-xs font-semibold text-white/35 hover:text-white/70 transition-colors ml-auto">
                        <Share2 size={13} strokeWidth={2} />
                        Share
                    </button>
                    {isAdmin && (
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            title={confirmDelete ? "Click again to confirm" : "Delete post"}
                            className={`flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5 border transition-all ${confirmDelete
                                ? "text-rose-400 border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20"
                                : "text-white/30 border-white/10 hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/5"
                                } disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                            {deleting
                                ? <Loader2 size={12} className="animate-spin" />
                                : <Trash2 size={12} strokeWidth={2} />}
                            {confirmDelete ? "Confirm?" : "Delete"}
                        </button>
                    )}
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
function Sidebar({
    memberCount,
    postCount,
    trendingTopics,
    upcomingTournaments,
}: {
    memberCount: number;
    postCount: number;
    trendingTopics: string[];
    upcomingTournaments: SidebarTournament[];
}) {
    return (
        <aside className="hidden lg:flex flex-col gap-5 w-[300px] flex-shrink-0">
            {/* Community Stats */}
            <div className="bg-[#06060a] border border-white/[0.07] rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Users size={14} className="text-green-400" strokeWidth={2} />
                    <h3 className="text-xs font-bold tracking-widest uppercase text-white/50">Community Stats</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 text-center">
                        <p className="text-2xl font-black text-white">{memberCount}</p>
                        <p className="text-[10px] font-bold tracking-widest uppercase text-white/30 mt-0.5">Members</p>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 text-center">
                        <p className="text-2xl font-black text-white">{postCount}</p>
                        <p className="text-[10px] font-bold tracking-widest uppercase text-white/30 mt-0.5">Posts</p>
                    </div>
                </div>
            </div>

            {/* Trending Topics */}
            <div className="bg-[#06060a] border border-white/[0.07] rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Flame size={14} className="text-orange-400" strokeWidth={2} />
                    <h3 className="text-xs font-bold tracking-widest uppercase text-white/50">Trending Topics</h3>
                </div>
                <div className="flex flex-col gap-1">
                    {trendingTopics.length === 0 ? (
                        <p className="text-xs text-white/25 px-3 py-2">No posts yet</p>
                    ) : (
                        trendingTopics.map((topic, i) => (
                            <button
                                key={i}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/55 hover:text-white hover:bg-white/[0.05] transition-all text-left"
                            >
                                <span className="text-[10px] font-bold tabular-nums text-white/20 w-4">{i + 1}</span>
                                <span className="truncate">{topic}</span>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Upcoming Tournaments */}
            <div className="bg-[#06060a] border border-white/[0.07] rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Calendar size={14} className="text-blue-400" strokeWidth={2} />
                    <h3 className="text-xs font-bold tracking-widest uppercase text-white/50">Upcoming Tournaments</h3>
                </div>
                <div className="flex flex-col gap-3">
                    {upcomingTournaments.length === 0 ? (
                        <p className="text-xs text-white/25 px-3 py-2">No upcoming tournaments</p>
                    ) : (
                        upcomingTournaments.map((t) => (
                            <div
                                key={t.id}
                                className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-all"
                            >
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-white/85 truncate">{t.name}</p>
                                    <p className="text-[10px] text-white/35 mt-0.5">
                                        {new Date(t.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · {t.sport}
                                    </p>
                                </div>
                                <a
                                    href={`/tournaments/${t.id}`}
                                    className="flex-shrink-0 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/[0.12] transition-all"
                                >
                                    Join
                                </a>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </aside>
    );
}

// ─── Create Post Modal ─────────────────────────────────────────────────────────
function CreatePostModal({
    onClose,
    onCreated,
    userId,
    userFullName,
    userAvatarColor,
}: {
    onClose: () => void;
    onCreated: (post: DBPost) => void;
    userId?: string;
    userFullName?: string | null;
    userAvatarColor?: string;
}) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState<PostCategory>("Discussion");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePublish = async () => {
        if (!title.trim() || !content.trim() || !userId || !userFullName) return;
        setSubmitting(true);
        setError(null);
        try {
            const post = await createPost({
                authorId: userId,
                authorName: userFullName,
                avatarColor: userAvatarColor ?? "bg-blue-500",
                category,
                title: title.trim(),
                content: content.trim(),
            });
            onCreated(post);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to publish post.");
        } finally {
            setSubmitting(false);
        }
    };

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

                    {error && (
                        <div className="flex items-center gap-2 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
                            <AlertCircle size={14} />
                            {error}
                        </div>
                    )}
                </div>

                <div className="px-6 pb-6 flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl border border-white/10 text-sm text-white/50 hover:text-white hover:border-white/25 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handlePublish}
                        disabled={!title.trim() || !content.trim() || submitting}
                        className="px-6 py-2.5 rounded-xl bg-white text-black text-sm font-bold tracking-widest uppercase hover:bg-white/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {submitting && <Loader2 size={13} className="animate-spin" />}
                        Publish
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ─── Filter Tabs ───────────────────────────────────────────────────────────────
const FILTERS: PostFilter[] = ["All", "Tournament", "Discussion", "Question", "Announcement"];

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function Community() {
    const { user, fullName, isAdmin } = useAuth();

    const [posts, setPosts] = useState<DBPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [memberCount, setMemberCount] = useState(0);
    const [trendingTopics, setTrendingTopics] = useState<string[]>([]);
    const [upcomingTournaments, setUpcomingTournaments] = useState<SidebarTournament[]>([]);
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState<PostFilter>("All");
    const [openPost, setOpenPost] = useState<DBPost | null>(null);
    const [showCreate, setShowCreate] = useState(false);

    const userAvatarColor = user ? getAvatarColor(user.id) : "bg-blue-500";

    // ── Load posts + liked state ──
    const loadPosts = useCallback(async () => {
        setLoading(true);
        try {
            const [rows, count, trending, tournaments] = await Promise.all([
                fetchPosts(),
                fetchMemberCount(),
                fetchTrendingTopics(),
                fetchUpcomingTournaments(),
            ]);

            if (user) {
                const likedSet = await fetchPostLikes(user.id);
                setPosts(rows.map((p) => ({ ...p, liked: likedSet.has(p.id) })));
            } else {
                setPosts(rows);
            }

            setMemberCount(count);
            setTrendingTopics(trending);
            setUpcomingTournaments(tournaments);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadPosts();
    }, [loadPosts]);

    // Keep openPost in sync after a like from the modal
    const handleModalLike = (postId: string, liked: boolean) => {
        setPosts((prev) =>
            prev.map((p) =>
                p.id === postId
                    ? { ...p, liked, likes_count: liked ? p.likes_count + 1 : Math.max(p.likes_count - 1, 0) }
                    : p
            )
        );
        if (openPost?.id === postId) {
            setOpenPost((prev) =>
                prev
                    ? { ...prev, liked, likes_count: liked ? prev.likes_count + 1 : Math.max(prev.likes_count - 1, 0) }
                    : prev
            );
        }
    };

    const handleCardLike = (postId: string, liked: boolean) => {
        setPosts((prev) =>
            prev.map((p) =>
                p.id === postId
                    ? { ...p, liked, likes_count: liked ? p.likes_count + 1 : Math.max(p.likes_count - 1, 0) }
                    : p
            )
        );
    };

    const handlePostCreated = (post: DBPost) => {
        setPosts((prev) => [{ ...post, liked: false }, ...prev]);
    };

    const handleDeletePost = (postId: string) => {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        if (openPost?.id === postId) setOpenPost(null);
    };

    const filtered = useMemo(() => {
        return posts.filter((p) => {
            const matchesFilter = activeFilter === "All" || p.category === activeFilter;
            const q = search.toLowerCase();
            const matchesSearch =
                !q ||
                p.title.toLowerCase().includes(q) ||
                p.content.toLowerCase().includes(q) ||
                p.author_name.toLowerCase().includes(q);
            return matchesFilter && matchesSearch;
        });
    }, [posts, search, activeFilter]);

    return (
        <div className="bg-[#020202] text-white min-h-screen font-sans custom-scroll">
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
                                Live
                            </span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter text-white mb-3">
                            Community
                        </h1>
                        <p className="text-lg text-white/40 mb-8">Connect. Discuss. Compete.</p>


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
                            {/* Only admins see the Create Post button */}
                            {isAdmin && (
                                <button
                                    onClick={() => setShowCreate(true)}
                                    className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-black text-sm font-bold tracking-wide hover:bg-white/90 transition-all flex-shrink-0"
                                >
                                    <Plus size={15} strokeWidth={2.5} />
                                    Create Post
                                </button>
                            )}
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
                                Sort: Newest
                            </button>
                        </div>

                        {/* Loading */}
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <Loader2 size={28} className="animate-spin text-white/25" />
                                <p className="text-sm text-white/25">Loading discussions…</p>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="text-center py-20 text-white/25">
                                <MessageSquare size={40} className="mx-auto mb-4 opacity-30" />
                                <p className="text-sm font-semibold">
                                    {posts.length === 0 ? "No posts yet — be the first!" : "No posts found"}
                                </p>
                                <p className="text-xs mt-1">
                                    {posts.length === 0 ? "Create a post to start the conversation." : "Try a different search or filter"}
                                </p>
                            </div>
                        ) : (
                            filtered.map((p) => (
                                <PostCard
                                    key={p.id}
                                    post={p}
                                    onOpen={() => setOpenPost(p)}
                                    userId={user?.id}
                                    isAdmin={isAdmin}
                                    onLike={handleCardLike}
                                    onDelete={handleDeletePost}
                                />
                            ))
                        )}
                    </div>

                    {/* Sidebar */}
                    <Sidebar
                        memberCount={memberCount}
                        postCount={posts.length}
                        trendingTopics={trendingTopics}
                        upcomingTournaments={upcomingTournaments}
                    />
                </div>
            </section>

            <Footer />

            {/* ── Modals ─────────────────────────────────────────────────── */}
            <AnimatePresence>
                {openPost && (
                    <DiscussionModal
                        key="discussion"
                        post={openPost}
                        onClose={() => setOpenPost(null)}
                        userId={user?.id}
                        userFullName={fullName}
                        userAvatarColor={userAvatarColor}
                        onLikePost={handleModalLike}
                    />
                )}
                {showCreate && (
                    <CreatePostModal
                        key="create"
                        onClose={() => setShowCreate(false)}
                        onCreated={handlePostCreated}
                        userId={user?.id}
                        userFullName={fullName}
                        userAvatarColor={userAvatarColor}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
