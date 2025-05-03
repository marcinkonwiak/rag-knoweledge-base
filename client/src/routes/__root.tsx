import {
    createRootRouteWithContext,
    Link,
    Outlet,
} from "@tanstack/react-router";
import {TanStackRouterDevtools} from "@tanstack/react-router-devtools";
import {RouterContext} from "@/routerContext.ts";
import {useAuth} from "@/auth.tsx";
import React from "react";


const RootComponent: React.FC = () => {
    const {isAuthenticated, user, login, logout, isLoading} = useAuth();

    return (
        <>
            <div style={{padding: "1rem", borderBottom: "1px solid #ccc"}}>
                <Link to="/" style={{marginRight: "1rem"}}>
                    Home
                </Link>
                {isAuthenticated && (
                    <Link to="/dashboard" style={{marginRight: "1rem"}}>
                        Dashboard (Protected)
                    </Link>
                )}
                <div style={{float: "right"}}>
                    {isLoading ? (
                        <span>Loading...</span>
                    ) : isAuthenticated ? (
                        <>
              <span style={{marginRight: "0.5rem"}}>
                Hello, {user?.name || user?.username || "User"}!
              </span>
                            <button onClick={() => logout()}>Logout</button>
                        </>
                    ) : (
                        <button onClick={() => login()}>Login</button>
                    )}
                </div>
            </div>
            <hr/>
            <div style={{padding: "1rem"}}>
                <Outlet/>
            </div>
            <TanStackRouterDevtools/>
        </>
    );
};

export const Route = createRootRouteWithContext<RouterContext>()({
    component: RootComponent,
});
