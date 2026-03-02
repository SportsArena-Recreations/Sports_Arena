/**
 * communityService.ts
 * All Supabase interactions for the Community feature.
 */

import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PostCategory = "Tournament" | "Discussion" | "Question" | "Announcement";

export interface DBPost {
    id: string;
    author_id: string;
    author_name: string;
    avatar_color: string;
    category: PostCategory;
    title: string;
    content: string;
    pinned: boolean;
    tournament_link: string | null;
    tournament_date: string | null;
    likes_count: number;
    comments_count: number;
    created_at: string;
    // joined client-side
    liked?: boolean;
}

export interface DBComment {
    id: string;
    post_id: string;
    parent_id: string | null;
    author_id: string;
    author_name: string;
    avatar_color: string;
    content: string;
    likes_count: number;
    created_at: string;
    // joined client-side
    liked?: boolean;
    replies?: DBComment[];
}

// ─── Posts ────────────────────────────────────────────────────────────────────

/** Fetch all posts ordered by pinned first, then newest. */
export async function fetchPosts(): Promise<DBPost[]> {
    const { data, error } = await supabase
        .from("community_posts")
        .select("*")
        .order("pinned", { ascending: false })
        .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []) as DBPost[];
}

/** Fetch liked post IDs for the current user. */
export async function fetchPostLikes(userId: string): Promise<Set<string>> {
    const { data, error } = await supabase
        .from("community_post_likes")
        .select("post_id")
        .eq("user_id", userId);

    if (error) throw error;
    return new Set((data ?? []).map((r) => r.post_id));
}

/** Create a new post. */
export async function createPost(payload: {
    authorId: string;
    authorName: string;
    avatarColor: string;
    category: PostCategory;
    title: string;
    content: string;
}): Promise<DBPost> {
    const { data, error } = await supabase
        .from("community_posts")
        .insert({
            author_id: payload.authorId,
            author_name: payload.authorName,
            avatar_color: payload.avatarColor,
            category: payload.category,
            title: payload.title,
            content: payload.content,
        })
        .select()
        .single();

    if (error) throw error;
    return data as DBPost;
}

/** Toggle post like — insert or delete. Returns new liked state. */
export async function togglePostLike(
    postId: string,
    userId: string,
    currentlyLiked: boolean
): Promise<void> {
    if (currentlyLiked) {
        const { error } = await supabase
            .from("community_post_likes")
            .delete()
            .eq("post_id", postId)
            .eq("user_id", userId);
        if (error) throw error;
    } else {
        const { error } = await supabase
            .from("community_post_likes")
            .insert({ post_id: postId, user_id: userId });
        if (error) throw error;
    }
}

// ─── Comments ─────────────────────────────────────────────────────────────────

/** Fetch all comments + replies for a post. Returns nested structure. */
export async function fetchComments(postId: string): Promise<DBComment[]> {
    const { data, error } = await supabase
        .from("community_comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

    if (error) throw error;
    const rows = (data ?? []) as DBComment[];

    // Nest replies under parent comments
    const topLevel: DBComment[] = [];
    const map: Record<string, DBComment> = {};

    for (const c of rows) {
        map[c.id] = { ...c, replies: [] };
    }
    for (const c of rows) {
        if (c.parent_id && map[c.parent_id]) {
            map[c.parent_id].replies!.push(map[c.id]);
        } else if (!c.parent_id) {
            topLevel.push(map[c.id]);
        }
    }
    return topLevel;
}

/** Fetch liked comment IDs for the current user. */
export async function fetchCommentLikes(userId: string, postId: string): Promise<Set<string>> {
    // Get comment ids for this post first
    const { data: commentRows } = await supabase
        .from("community_comments")
        .select("id")
        .eq("post_id", postId);

    if (!commentRows || commentRows.length === 0) return new Set();

    const commentIds = commentRows.map((r) => r.id);

    const { data, error } = await supabase
        .from("community_comment_likes")
        .select("comment_id")
        .eq("user_id", userId)
        .in("comment_id", commentIds);

    if (error) throw error;
    return new Set((data ?? []).map((r) => r.comment_id));
}

/** Add a comment or reply. */
export async function addComment(payload: {
    postId: string;
    parentId?: string | null;
    authorId: string;
    authorName: string;
    avatarColor: string;
    content: string;
}): Promise<DBComment> {
    const { data, error } = await supabase
        .from("community_comments")
        .insert({
            post_id: payload.postId,
            parent_id: payload.parentId ?? null,
            author_id: payload.authorId,
            author_name: payload.authorName,
            avatar_color: payload.avatarColor,
            content: payload.content,
        })
        .select()
        .single();

    if (error) throw error;
    return data as DBComment;
}

/** Toggle comment like. */
export async function toggleCommentLike(
    commentId: string,
    userId: string,
    currentlyLiked: boolean
): Promise<void> {
    if (currentlyLiked) {
        const { error } = await supabase
            .from("community_comment_likes")
            .delete()
            .eq("comment_id", commentId)
            .eq("user_id", userId);
        if (error) throw error;
    } else {
        const { error } = await supabase
            .from("community_comment_likes")
            .insert({ comment_id: commentId, user_id: userId });
        if (error) throw error;
    }
}

// ─── Stats ────────────────────────────────────────────────────────────────────

/** Get total member count (auth.users count via profiles table). */
export async function fetchMemberCount(): Promise<number> {
    const { count, error } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true });

    if (error) return 0;
    return count ?? 0;
}

/** Get user "colour" deterministically from their name initials. */
export const AVATAR_COLORS = [
    "bg-blue-500",
    "bg-purple-500",
    "bg-green-600",
    "bg-rose-500",
    "bg-amber-500",
    "bg-cyan-600",
    "bg-teal-500",
    "bg-indigo-500",
    "bg-pink-500",
    "bg-violet-500",
    "bg-orange-500",
    "bg-sky-500",
];

export function getAvatarColor(userId: string): string {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        hash = (hash << 5) - hash + userId.charCodeAt(i);
        hash |= 0;
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/** Format a DB timestamp to a relative string like "2h ago". */
export function formatRelativeTime(iso: string): string {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(iso).toLocaleDateString();
}
