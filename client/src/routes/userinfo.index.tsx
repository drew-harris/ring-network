import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { User } from "core/user";
import { useState } from "react";

export const Route = createFileRoute("/userinfo/")({
  component: UserInfoPage,
});

function UserInfoPage() {
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");

  const updatePasswordMutation = useMutation({
    mutationFn: User.Api.updatePassword,
  });

  const saveNewPassword = async () => {
    // const result = User.passwordSchema.safeParse(newPassword);
    // if (result.error) {
    //   setNewPasswordError("Password must fufill requirements");
    //   return;
    // }
    updatePasswordMutation.mutate({
      userId: "HSw2Ko4z",
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
