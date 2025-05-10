import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardComponent,
});

function DashboardComponent() {
  return (
    <div>
      <h2>Dashboard (Protected)</h2>
      <p>This content is only visible to authenticated users.</p>
    </div>
  );
}
