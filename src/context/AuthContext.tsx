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

interface ProfileData {
    role: UserRole;
    fullName: string | null;
}

interface AuthContextValue {
    session: Session | null;
    user: User | null;
    role: UserRole;
    isAdmin: boolean;
    fullName: string | null;
    loading: boolean;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
    session: null,
    user: null,
    role: null,
    isAdmin: false,
    fullName: null,
    loading: true,
    signOut: async () => { },
    refreshProfile: async () => { },
});

/** Fetch role + full_name with a 5-second timeout */
async function fetchProfileData(userId: string): Promise<ProfileData> {
    const fetchPromise = (async (): Promise<ProfileData> => {
        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("role, full_name")
                .eq("id", userId)
                .single();
            if (error || !data) return { role: "user", fullName: null };
            return {
                role: (data.role as UserRole) ?? "user",
                fullName: data.full_name ?? null,
            };
        } catch {
            return { role: "user", fullName: null };
        }
    })();

    const timeoutPromise = new Promise<ProfileData>((resolve) =>
        setTimeout(() => resolve({ role: "user", fullName: null }), 5000)
    );

    return Promise.race([fetchPromise, timeoutPromise]);
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [role, setRole] = useState<UserRole>(null);
    const [fullName, setFullName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const applyProfile = useCallback((data: ProfileData) => {
        setRole(data.role);
        setFullName(data.fullName);
    }, []);

    const refreshProfile = useCallback(async () => {
        const uid = (await supabase.auth.getUser()).data.user?.id;
        if (!uid) return;
        const data = await fetchProfileData(uid);
        applyProfile(data);
    }, [applyProfile]);

    useEffect(() => {
        const { data: listener } = supabase.auth.onAuthStateChange(
            (_, newSession) => {
                setSession(newSession);

                if (newSession?.user) {
                    fetchProfileData(newSession.user.id).then((data) => {
                        applyProfile(data);
                        setLoading(false);
                    });
                } else {
                    setRole(null);
                    setFullName(null);
                    setLoading(false);
                }
            }
        );

        return () => listener.subscription.unsubscribe();
    }, [applyProfile]);

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
                fullName,
                loading,
                signOut,
                refreshProfile,
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
