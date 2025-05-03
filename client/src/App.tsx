import {createRouter, RouterProvider} from "@tanstack/react-router";
import {AuthState, useAuth} from "./auth";
import {routeTree} from "@/routeTree.gen.ts";

const router = createRouter({
    routeTree,
    context: {
        auth: undefined! as AuthState
    }
});

declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}


export function App() {
    const auth = useAuth();

    return <RouterProvider router={router} context={{auth}}/>;
}
