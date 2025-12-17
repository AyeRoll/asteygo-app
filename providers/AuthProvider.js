
// imports to call for this to work
import { createContext, useContext, useEffect, useState } from "react";
import { auth, onAuthStateChanged } from "../config/firebase.js";

// AuthContext for creating context
const AuthContext = createContext(null);

// Main AuthProvider function, reason for this file
export function AuthProvider ({ children }) {
    

    //grab user and intitalize state
    const [user, setUser] = useState(null);
    const [initializing, setInitializing] = useState(true)

    useEffect (() => {
        // when AuthState is changed we know
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        console.log("Auth State:", firebaseUser?.uid ?? "no user"); 
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

export function useAuth(){
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be inside AuthProvider");
    return ctx;
}