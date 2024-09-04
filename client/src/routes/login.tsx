import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FormEventHandler, useState } from "react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const fakeFormSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    navigate({
      to: "/simulator",
    });
  };

  return (
    <div className="min-h-screen background flex flex-col p-12 items-center justify-center">
      <div className="absolute hover:underline top-4 right-6">
        <Link to="/register">Register</Link>
      </div>
      <div className="bg-neutral-800 min-w-60 border border-neutral-700 rounded-md p-4 flex gap-1 flex-col">
        <div className="text-xl font-medium">Log In</div>
        <div className="opacity-80 text-sm">
          Log in with your email and password.
        </div>
        <form onSubmit={fakeFormSubmit} className="flex flex-col py-2 gap-2">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="h-1"></div>
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => console.log("login")}
          >
            Log In
          </Button>
        </form>
      </div>
    </div>
  );
}
