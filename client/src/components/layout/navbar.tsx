import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";

export const Navbar = () => {
  const router = useRouterState();
  const navigate = useNavigate();
  return (
    <div>
      <div className="flex border-b-neutral-300 bg-neutral-200 border-b dark:border-b-neutral-700 dark:bg-neutral-800 py-2 px-8 items-center justify-between">
        <div>Ring Network Simulator</div>
        <Popover>
          <PopoverTrigger>
            <div className="rounded-full grid place-items-center bg-neutral-200 border dark:border-transparent border-neutral-400 dark:bg-neutral-700 w-8 h-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-40">
            <div className="text-sm pb-2 text-center">drewh</div>
            <Link
              to="/userinfo"
              className="text-sm block dark:hover:bg-neutral-800 rounded-md py-1 font-semibold text-center w-full"
            >
              Manage User
            </Link>
            <Link
              to="/admin"
              className="text-sm block dark:hover:bg-neutral-800 rounded-md py-1 font-semibold text-center w-full"
            >
              Admin
            </Link>
          </PopoverContent>
        </Popover>
      </div>
      <div className="w-full">
        <Tabs
          className=""
          defaultValue={router.location.pathname}
          value={router.location.pathname}
        >
          <TabsList className="w-full h-auto p-0">
            <Link className="grow text-center" to="/simulator">
              <TabsTrigger className="w-full" value="/simulator">
                Simulator
              </TabsTrigger>
            </Link>
            <Link className="grow text-center" to="/simulator/messages">
              <TabsTrigger
                className="w-full"
                onClick={() => navigate({ to: "/simulator/messages" })}
                value="/simulator/messages"
              >
                Messages
              </TabsTrigger>
            </Link>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};
