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
      <div className="flex border-b border-b-neutral-700 bg-neutral-800 py-2 px-8 items-center justify-between">
        <div>Ring Network Simulator</div>

        <Popover>
          <PopoverTrigger>
            <div className="rounded-full grid place-items-center bg-neutral-500 w-8 h-8">
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
            <div className="text-sm pb-2 text-center">harrisd@smu.edu</div>
            <Link
              to="/login"
              className="text-sm block hover:bg-neutral-800 rounded-md py-1 font-semibold text-center w-full"
            >
              Log Out
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
            <TabsTrigger
              className="grow"
              onClick={() => navigate({ to: "/simulator" })}
              value="/simulator"
            >
              Simulator
            </TabsTrigger>
            <TabsTrigger
              className="grow"
              onClick={() => navigate({ to: "/simulator/messages" })}
              value="/simulator/messages"
            >
              Messages
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};
