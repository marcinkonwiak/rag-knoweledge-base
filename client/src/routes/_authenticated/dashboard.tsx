import { createFileRoute } from "@tanstack/react-router";
import {useAuth} from "@/authHooks.ts";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardComponent,
});

function DashboardComponent() {
  const { user } = useAuth();

  return (
      <div>
        <h2>Dashboard (Protected)</h2>
        <p>Welcome, {user?.name || "User"}!</p>
        <p>This content is only visible to authenticated users.</p>
      </div>
  );
}
