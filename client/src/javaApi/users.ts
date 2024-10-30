import { User } from "core/user";

export module JavaApi {
  const apiUrl = import.meta.env.VITE_PUBLIC_JAVA_BACKEND_URL as string;
  export async function getAllUsers() {
    const response = await fetch(`${apiUrl}/users`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return (await response.json()) as User.Info;
  }
}
