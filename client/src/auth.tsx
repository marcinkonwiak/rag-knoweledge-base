import React, {useCallback, useEffect, useMemo, useState,} from "react";
import {
    AccountInfo,
    AuthenticationResult,
    AuthError,
    EventMessage,
    EventType,
    InteractionStatus,
    PublicClientApplication,
} from "@azure/msal-browser";
import {MsalProvider, useIsAuthenticated, useMsal} from "@azure/msal-react";
import {loginRequest, msalConfig} from "@/authConfig";
import {AuthContext as AuthContext1} from "@/authHooks.ts";

const msalInstance = new PublicClientApplication(msalConfig);

const accounts = msalInstance.getAllAccounts();
if (accounts.length > 0) {
    msalInstance.setActiveAccount(accounts[0]);
}

msalInstance.addEventCallback((event: EventMessage) => {
    if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
        const payload = event.payload as AuthenticationResult;
        const account = payload.account;
        if (account) {
            msalInstance.setActiveAccount(account);
        }
    }
});

export interface AuthState {
    isAuthenticated: boolean;
    user: AccountInfo | null;
    login: (redirectPath?: string) => void;
    logout: () => void;
    isLoading: boolean;
}

interface AuthProviderProps {
    children: React.ReactNode;
}

const AuthProviderInternal: React.FC<AuthProviderProps> = ({children}) => {
    const {instance, accounts, inProgress} = useMsal();
    const isAuth = useIsAuthenticated();
    const [user, setUser] = useState<AccountInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (accounts.length > 0) {
            setUser(accounts[0]);
        } else {
            setUser(null);
        }
    }, [accounts]);

    useEffect(() => {
        instance
            .initialize()
            .then(() => {
                return instance.handleRedirectPromise();
            })
            .then((response: AuthenticationResult | null) => {
                if (response) {
                    instance.setActiveAccount(response.account);
                    setUser(response.account); // Update user state
                    if (response.state) {
                        console.log("Redirect state received:", response.state);
                    }
                }
            })
            .catch((error: AuthError | unknown) => {
                console.error("MSAL handleRedirectPromise error:", error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [instance]);

    const login = useCallback(
        (redirectPath?: string) => {
            setIsLoading(true);
            instance
                .loginRedirect({
                    ...loginRequest,
                    state:
                        redirectPath || window.location.pathname + window.location.search,
                })
                .catch((e) => {
                    console.error("MSAL loginRedirect error:", e);
                    setIsLoading(false);
                });
        },
        [instance, setIsLoading],
    );

    const logout = useCallback(() => {
        const currentAccount = instance.getActiveAccount();
        const logoutRequest = {
            account: currentAccount,
            postLogoutRedirectUri: msalConfig.auth.postLogoutRedirectUri,
        };

        instance.logoutRedirect(logoutRequest).catch((e) => {
            console.error("MSAL logoutRedirect error:", e);
        });
    }, [instance]);

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
        <AuthContext1 value={authContextValue}>
            {children}
        </AuthContext1>
    );
};

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
    return (
        <MsalProvider instance={msalInstance}>
            <AuthProviderInternal>{children}</AuthProviderInternal>
        </MsalProvider>
    );
};

