import {createContext, useContext} from "react";
import {AuthState} from "@/auth.tsx";

export const AuthContext = createContext<AuthState | undefined>(undefined);

export const useAuth = (): AuthState => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
