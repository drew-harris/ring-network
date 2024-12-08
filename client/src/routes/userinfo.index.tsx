import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Api } from "@/hono";
import { restrictPage } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useContext, useState } from "react";

export const Route = createFileRoute("/userinfo/")({
  beforeLoad: restrictPage,

  loader(ctx) {
    if (!ctx.context.auth.user) {
      throw redirect({ to: "/login" });
    }
    return {
      user: ctx.context.auth.user,
    };
  },
  component: UserInfoPage,
});

function UserInfoPage() {
  const info = Route.useLoaderData();
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");

  const updatePasswordMutation = useMutation({
    mutationFn: Api.updatePassword,
  });

  const saveNewPassword = async () => {
    updatePasswordMutation.mutate({
      userId: info.user.userId,
      password: newPassword,
    });
  };

  return (
    <div className="p-4 pt-4 mx-auto max-w-4xl">
      <div className="flex justify-between">
        <div className="text-lg pb-8">Manage User</div>
        <Link className="hover:underline" to="/simulator">
          Back To Simulator
        </Link>
      </div>
      <div className="flex items-end gap-2">
        <div>
          <label className="pt-4">Update Password</label>
          <Input
            type="password"
            placeholder="New Password..."
            className="max-w-[300px]"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          ></Input>
        </div>
        <Button
          onClick={saveNewPassword}
          disabled={newPassword.length < 8}
          className="block"
        >
          Save
        </Button>
      </div>
      {newPasswordError && (
        <div className="text-red-500 text-sm">{newPasswordError}</div>
      )}

      <div className="pt-8">
        <Button>
          <Link to="/login">Log Out</Link>
        </Button>
      </div>
    </div>
  );
}
