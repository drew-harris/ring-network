import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm, SubmitHandler } from "react-hook-form";

import { useContext } from "react";
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
import { nanoid } from "nanoid";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/admin/")({
  component: AdminPage,
});

interface FormData {
  username: string;
  email: string;
  password: string;
  type: "admin" | "operator";
}

function AdminPage() {
  const {
    formState: { errors },
    ...form
  } = useForm({
    defaultValues: {
      username: "",
      email: "",
      password: "",
      type: "admin" as "admin" | "operator",
    },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    r.mutate.insertUser({
      id: User.createId(),
      password: nanoid(8),
      type: data.type,
      name: data.username,
      email: data.email,
    });

    form.reset();
  };

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

  return (
    <div className="p-4 mx-auto max-w-4xl">
      <Link className="flex gap-2 mb-4" to="/simulator">
        <ChevronLeft />
        Back to simulator
      </Link>
      <h1 className="text-2xl font-bold mb-4">Create New User</h1>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="username" className="block mb-1">
            Username
          </label>
          <Input
            id="username"
            onChange={(e) => form.setValue("username", e.target.value)}
            {...(form.register("username"), { required: true })}
          />
          {errors.username?.message && (
            <div className="text-red-500">{errors.username?.message}</div>
          )}
        </div>
        <div>
          <label htmlFor="email" className="block mb-1">
            Email
          </label>
          <Input
            id="email"
            {...form.register("email", {
              required: true,
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: "Must be a valid email",
              },
            })}
          />
          <div className="text-red-500">{errors.email?.message}</div>
        </div>

        <div>
          <label>User Type</label>
          <Select
            value={form.getValues("type")}
            onValueChange={(e) =>
              form.setValue("type", e as "admin" | "operator")
            }
            defaultValue="admin"
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Target Node" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={"operator"}>Operator</SelectItem>
              <SelectItem value={"admin"}>Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit">Create User</Button>
      </form>
      <div className="h-10"></div>
      <div className="text-lg">Current Users</div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.userId}>
              <TableCell>{user.userId}</TableCell>
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
