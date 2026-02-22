import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    ReactNode,
} from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export type UserRole = "user" | "admin" | null;

interface AuthContextValue {
    session: Session | null;
    user: User | null;
    role: UserRole;
    isAdmin: boolean;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
    session: null,
    user: null,
    role: null,
    isAdmin: false,
    loading: true,
    signOut: async () => { },
});

/** Fetch role with a 5-second timeout so it never hangs the app */
async function fetchRoleWithTimeout(userId: string): Promise<UserRole> {
    const fetchPromise = (async (): Promise<UserRole> => {
        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", userId)
                .single();
            if (error || !data) return "user";
            return data.role as UserRole;
        } catch {
            return "user";
        }
    })();

    const timeoutPromise = new Promise<UserRole>((resolve) =>
        setTimeout(() => resolve("user"), 5000)
    );

    return Promise.race([fetchPromise, timeoutPromise]);
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [role, setRole] = useState<UserRole>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // onAuthStateChange is the single source of truth
        const { data: listener } = supabase.auth.onAuthStateChange(
            (event, newSession) => {
                // Update session + clear loading IMMEDIATELY — don't wait for role
                setSession(newSession);
                setLoading(false);

                if (newSession?.user) {
                    // Fetch role in the background — doesn't block auth flow
                    fetchRoleWithTimeout(newSession.user.id).then(setRole);
                } else {
                    setRole(null);
                }
            }
        );

        return () => listener.subscription.unsubscribe();
    }, []);

    const signOut = useCallback(async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) console.error("[Auth] Sign out error:", error.message);
        } catch (err) {
            console.error("[Auth] Sign out exception:", err);
        }
    }, []);

    return (
        <AuthContext.Provider
            value={{
                session,
                user: session?.user ?? null,
                role,
                isAdmin: role === "admin",
                loading,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    return useContext(AuthContext);
}
