import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/simulator/_layout")({
  component: () => <div>Hello /simulator/_layout!</div>,
});

