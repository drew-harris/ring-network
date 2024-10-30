import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm, SubmitHandler } from "react-hook-form";

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
import { User } from "core/user";
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
      password: nanoid(5),
      type: "admin" as "admin" | "operator",
    },
  });

  const queryUtils = useQueryClient();

  const deleteUserMutation = useMutation({
    mutationFn: User.Api.deleteUser,
    onMutate(userId) {
      queryUtils.setQueryData(["users"], (oldData: User.Info[]) => {
        if (!oldData) {
          return oldData;
        }

        const newData = oldData.filter((user) => user.userId !== userId);
        return newData;
      });
    },
    onSuccess() {
      users.refetch();
    },
  });

  const addUserMutation = useMutation({
    mutationFn: User.Api.createUser,
    onMutate(variables) {
      queryUtils.setQueryData(["users"], (oldData: User.Info[]) => {
        if (!oldData) {
          return oldData;
        }

        const newData = [...oldData, variables.user];
        return newData;
      });
    },
    onSuccess() {
      users.refetch();
    },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    addUserMutation.mutate({
      user: {
        userId: nanoid(8),
        name: data.username,
        email: data.email,
        type: data.type,
      },
      password: nanoid(5),
    });

    form.reset();
  };

  const users = useQuery({
    queryKey: ["users"],
    queryFn: User.Api.getAllUsers,
  });

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
          {users.data?.map((user) => (
            <TableRow key={user.userId}>
              <TableCell>{user.userId}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <IconButton
                  onClick={() => {
                    deleteUserMutation.mutate(user.userId);
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
