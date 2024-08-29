import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/simulator/")({
  component: () => <div>Hello /simulator/!</div>,
});

