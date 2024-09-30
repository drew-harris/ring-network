import { createFileRoute, Link } from "@tanstack/react-router";
import { useContext, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RealtimeClientContext } from "@/main";
import { User } from "core/user";
import { useSubscribe } from "replicache-react";
import { IconButton } from "@/components/ui/iconbutton";
import { ChevronLeft, Trash } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminPage,
});

function AdminPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const r = useContext(RealtimeClientContext);
  const users = useSubscribe(
    r,
    async (tx) => {
      return await User.queries.getAllUsers(tx);
    },
    {
      default: [],
      dependencies: [],
    },
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Here you would typically call an API to create the user
    console.log("Creating user:", { username, email, password });
    // Reset form
    setUsername("");
    setEmail("");
    setPassword("");

    r.mutate.insertUser({
      name: username,
      email,
    });
  };

  return (
    <div className="p-4 mx-auto max-w-4xl">
      <Link className="flex gap-2 mb-4" to="/simulator">
        <ChevronLeft />
        Back to simulator
      </Link>
      <h1 className="text-2xl font-bold mb-4">Create New User</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block mb-1">
            Username
          </label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block mb-1">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block mb-1">
            Password
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit">Create User</Button>
      </form>
      <div className="h-10"></div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.userId}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <IconButton
                  onClick={() => {
                    r.mutate.deleteUser(user.userId);
                  }}
                >
                  <Trash size={12} />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
