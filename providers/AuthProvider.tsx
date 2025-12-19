
// imports to call for this to work
import type { User } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, onAuthStateChanged } from "../config/firebase.js";

type AuthContextType = {
    user: User | null;
    initializing: boolean;
};

// AuthContext for creating context
const AuthContext = createContext<AuthContextType | null>(null);

// Main AuthProvider function, reason for this file
export function AuthProvider ({ children }: { children: React.ReactNode}) {
    

    //grab user and intitalize state
    const [user, setUser] = useState<User | null>(null);
    const [initializing, setInitializing] = useState(true)

    useEffect (() => {
        // when AuthState is changed we know
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setInitializing(false);
    });

        return unsubscribe;
    }, []);
    
    return (<AuthContext.Provider value={{ user, initializing }}>
        { children }
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType{
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be inside AuthProvider");
    return ctx;
}