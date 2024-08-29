import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col p-8 items-center justify-center">
      <div className="bg-neutral-800 min-w-60 border border-neutral-700 rounded-md p-2 flex flex-col">
        <div className="text-lg font-medium">Log In</div>
        <div className="opacity-80">Log in with your email and password.</div>
        <form>
          <input type="text" />
        </form>
      </div>
    </div>
  );
}

