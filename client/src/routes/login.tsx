import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Api } from "@/hono";
import { UserContext } from "@/stores/userStore";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FormEventHandler, useContext, useState } from "react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const navigate = useNavigate();
  const userContext = useContext(UserContext);

  const formSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (!username) {
      setUsernameError("Username is required");
      return;
    }

    const loginResult = await Api.client.login.$post({
      json: {
        password,
        username,
      },
    });

    if (loginResult.status === 401) {
      setPasswordError("Invalid username or password");
      return;
    } else if (loginResult.status === 200) {
      const data = await loginResult.json();
      userContext.setUser(data.user);
      if (!data.auth.hasReset) {
        return navigate({
          to: "/userinfo",
        });
      }
    }

    navigate({
      to: "/simulator",
    });
  };

  return (
    <div className="min-h-screen background flex flex-col p-12 items-center justify-center">
      <div className="dark:bg-neutral-800 light:shadow-md min-w-60 bg-white border dark:border-neutral-700  border-neutral-300 rounded-md p-4 flex gap-1 flex-col">
        <div className="text-xl font-medium">Log In</div>
        <div className="opacity-80 text-sm">
          Log in with your username and password.
        </div>
        <form onSubmit={formSubmit} className="flex flex-col py-2 gap-2">
          <Input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          {usernameError && (
            <div className="text-red-500 text-sm">{usernameError}</div>
          )}
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {passwordError && (
            <div className="text-red-500 text-sm">{passwordError}</div>
          )}
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
