import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/register")({
  component: Register,
});

function Register() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <div className="min-h-screen flex flex-col p-12 items-center justify-center">
      <div className="absolute hover:underline top-4 right-6">
        <Link to="/login">Login</Link>
      </div>
      <div className="bg-neutral-800 min-w-60 border border-neutral-700 rounded-md p-4 flex gap-1 flex-col">
        <div className="text-xl font-medium">Register</div>
        <div className="opacity-80 text-sm">
          Register with your email and password.
        </div>
        <form className="flex flex-col py-2 gap-2">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <Input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <div className="h-1"></div>
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => console.log("register")}
          >
            Register
          </Button>
        </form>
      </div>
    </div>
  );
}
