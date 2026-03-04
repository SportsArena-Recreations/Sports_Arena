/**
 * auto-complete.ts
 *
 * Isolated logic for automatically marking confirmed bookings as "completed"
 * when their booking date has passed.
 *
 * Rules:
 *  - Only bookings with status "confirmed" are affected (never "pending")
 *  - A booking is considered expired when its date (day) is strictly before today
 *  - This runs silently in the background and does not throw; errors are logged only
 *
 * To change the completion criteria (e.g. use end_time instead of just date),
 * update the `buildExpiredQuery` function below.
 */

import { supabase } from "@/lib/supabase";

// ─── Configurable criteria ────────────────────────────────────────────────────

/**
 * Returns today's date as a YYYY-MM-DD string in local time.
 * A booking is "expired" when its `date` field is strictly before this value.
 */
function getTodayString(): string {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

// ─── Public helper ────────────────────────────────────────────────────────────

/**
 * Marks all confirmed bookings whose date has already passed as "completed".
 * Optionally scoped to a specific user ID (for the public-side getMine call).
 *
 * @param userId - If provided, only updates bookings belonging to this user.
 *                 Omit (or pass undefined) for the admin-side getAll call.
 */
export async function autoCompleteExpiredBookings(
    userId?: string
): Promise<void> {
    const today = getTodayString();

    let query = supabase
        .from("bookings")
        .update({ status: "completed" })
        .eq("status", "confirmed")  // only touch confirmed — never pending
        .lt("date", today);         // strictly before today

    if (userId) {
        query = query.eq("user_id", userId);
    }

    const { error } = await query;

    if (error) {
        console.error("[autoCompleteExpiredBookings] Failed to update:", error.message);
    }
}
