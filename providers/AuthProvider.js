import { auth, onAuthStateChanged } from "../config/firebase.js";
import { createContext, useContext, useEffect, useState } from React;

const AuthContext = createContext(null);

export function AuthProvider ({ children }) {
    
    var userState = null;

    var initState = true;

    var useEffect = onAuthStateChanged(auth, callback);
    callback = userState;
    callback= user, setUser, initializing, setInitializing;
    return unsubscribe;

    
}