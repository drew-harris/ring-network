import { createContext, useEffect, useState } from "react";

type User = {
  userId: string;
  name: string;
  email: string;
  type: "admin" | "operator";
};

export interface UserStoreContext {
  user: User | null;
  setUser: (user: User | null) => void;
  logOut: () => void;
}

const defaultStore = {
  user: null,
  setUser: (_user: User | null) => {},
  logOut: () => {},
};

export const UserContext = createContext<UserStoreContext>(defaultStore);

export const UserContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(
    localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user")!)
      : null,
  );

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setUser(JSON.parse(user));
    }
  }, []);

  const logOut = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const setUserProxy: typeof setUser = (user) => {
    setUser(user);
    localStorage.setItem("user", JSON.stringify(user));
  };

  return (
    <UserContext.Provider value={{ user, setUser: setUserProxy, logOut }}>
      {children}
    </UserContext.Provider>
  );
};
