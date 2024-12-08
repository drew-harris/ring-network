import { createFileRoute, Link, redirect } from "@tanstack/react-router";
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
import { Api } from "@/hono";
import { useContext } from "react";
import { UserContext } from "@/stores/userStore";

export const Route = createFileRoute("/admin/")({
  beforeLoad({ context }) {
    if (!(context.auth.user?.type === "admin")) {
      return redirect({
        to: "/simulator",
      });
    }
  },
  component: AdminPage,
});

interface FormData {
  firstName: string;
  lastName: string;
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
      firstName: "",
      lastName: "",
      email: "",
      password: nanoid(5),
      type: "admin" as "admin" | "operator",
    },
  });

  const queryUtils = useQueryClient();

  const deleteUserMutation = useMutation({
    mutationFn: Api.deleteUser,
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
    mutationFn: Api.createUser,
    onMutate(variables) {
      queryUtils.setQueryData(["users"], (oldData: User.Info[]) => {
        if (!oldData) {
          return oldData;
        }

        const newUser = {
          userId: User.createUsername(variables.firstName, variables.lastName),
          name: `${variables.firstName} ${variables.lastName}`,
          email: variables.email,
          type: variables.type,
        };

        const newData = [...oldData, newUser];
        return newData;
      });
    },
    onSuccess() {
      users.refetch();
    },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    addUserMutation.mutate({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      type: data.type,
      password: nanoid(5),
    });

    form.reset();
  };

  const users = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const users = await Api.client.users.$get();
      if (users.status === 401) {
        throw new Error("Not logged in");
      }
      return users.json();
    },
  });

  const userCtx = useContext(UserContext);

  return (
    <div className="p-4 mx-auto max-w-4xl">
      <Link className="flex gap-2 mb-4" to="/simulator">
        <ChevronLeft />
        Back to simulator
      </Link>
      <h1 className="text-2xl font-bold mb-4">Create New User</h1>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex w-full grow gap-2">
          <div className="grow">
            <label htmlFor="username" className="block mb-1">
              First Name
            </label>
            <Input
              id="username"
              onChange={(e) => form.setValue("firstName", e.target.value)}
              {...(form.register("firstName"), { required: true })}
            />
            {errors.firstName?.message && (
              <div className="text-red-500">{errors.firstName?.message}</div>
            )}
          </div>
          <div className="grow">
            <label htmlFor="username" className="block mb-1">
              Last Name
            </label>
            <Input
              id="username"
              onChange={(e) => form.setValue("lastName", e.target.value)}
              {...(form.register("lastName"), { required: true })}
            />
            {errors.lastName?.message && (
              <div className="text-red-500">{errors.lastName?.message}</div>
            )}
          </div>
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
            disabled={userCtx.user?.name !== "root"}
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
            <TableHead>Username</TableHead>
            <TableHead>Name</TableHead>
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
