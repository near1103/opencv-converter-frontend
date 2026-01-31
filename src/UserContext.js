import { createContext, useContext, useEffect, useState } from "react";
import { getAuthToken, clearAuthToken } from "./api";

const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = getAuthToken();
        if (!token) {
            setLoading(false);
            return;
        }

        (async () => {
            try {
                const res = await fetch("/api/auth/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) throw new Error(await res.text());

                const data = await res.json();
                setUser({ uid: data.uid, email: data.email });
            } catch (e) {
                clearAuthToken();
                setUser(null);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser, loading }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}