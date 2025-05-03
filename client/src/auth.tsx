import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useMemo,
} from "react";
import {
    PublicClientApplication,
    EventType,
    EventMessage,
    AuthenticationResult,
    AccountInfo,
    InteractionStatus,
} from "@azure/msal-browser";
import {MsalProvider, useMsal, useIsAuthenticated} from "@azure/msal-react";
import {loginRequest, msalConfig} from "@/authConfig.ts";

const msalInstance = new PublicClientApplication(msalConfig);

const accounts = msalInstance.getAllAccounts();
if (accounts.length > 0) {
    msalInstance.setActiveAccount(accounts[0]);
}

msalInstance.addEventCallback((event: EventMessage) => {
    if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
        const payload = event.payload as AuthenticationResult;
        const account = payload.account;
        msalInstance.setActiveAccount(account);
    }
});

export interface AuthState {
    isAuthenticated: boolean;
    user: AccountInfo | null;
    login: (redirectPath?: string) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

interface AuthProviderProps {
    children: React.ReactNode;
}

const AuthProviderInternal: React.FC<AuthProviderProps> = ({children}) => {
    const {instance, accounts, inProgress} = useMsal();
    const isAuth = useIsAuthenticated();
    const [user, setUser] = useState<AccountInfo | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(inProgress !== InteractionStatus.None);

        if (accounts.length > 0) {
            setUser(accounts[0]);
        } else {
            setUser(null);
        }
    }, [accounts, inProgress]);

    useEffect(() => {
        instance
            .initialize()
            .then(() => {
                return instance.handleRedirectPromise();
            })
            .then((response) => {
                if (response) {
                    instance.setActiveAccount(response.account);
                    setUser(response.account);
                    if (response.state) {
                        console.log("Redirect state found:", response.state);
                    }
                }
            })
            .catch((error) => {
                console.error("MSAL handleRedirectPromise error:", error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [instance]);

    const login = (redirectPath?: string) => {
        setIsLoading(true);
        instance
            .loginRedirect({
                ...loginRequest,
                state: redirectPath || window.location.pathname + window.location.search,
            })
            .catch((e) => {
                console.error("MSAL loginRedirect error:", e);
                setIsLoading(false);
            });
    };

    const logout = () => {
        const currentAccount = instance.getActiveAccount();
        if (currentAccount) {
            instance.logoutRedirect({
                account: currentAccount,
                postLogoutRedirectUri: msalConfig.auth.postLogoutRedirectUri,
            });
        } else {
            instance.logoutRedirect({
                postLogoutRedirectUri: msalConfig.auth.postLogoutRedirectUri,
            });
        }
    };

    const authContextValue = useMemo(
        () => ({
            isAuthenticated: isAuth && !!user && !isLoading,
            user,
            login,
            logout,
            isLoading: isLoading || inProgress !== InteractionStatus.None,
        }),
        [isAuth, user, login, logout, isLoading, inProgress],
    );

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
    return (
        <MsalProvider instance={msalInstance}>
            <AuthProviderInternal>{children}</AuthProviderInternal>
        </MsalProvider>
    );
};

export const useAuth = (): AuthState => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
