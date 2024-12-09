import { RealtimeClientContext } from "@/main";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useContext, useEffect } from "react";
import { dropAllDatabases } from "replicache";

type SearchParams = {
  scope: string | undefined;
};
export const Route = createFileRoute("/reset")({
  validateSearch: (search: Record<string, string>): SearchParams => {
    return {
      scope: search.scope,
    };
  },
  component: ResetPage,
});

const TS_PATH = import.meta.env.VITE_PUBLIC_BACKEND_URL!;

function ResetPage() {
  const rep = useContext(RealtimeClientContext);

  const { scope } = Route.useSearch();

  useEffect(() => {
    const reset = async () => {
      await rep.close();
      await dropAllDatabases();
      if (scope === "all") {
        await fetch(TS_PATH + "/reset", {
          method: "get",
        });
      }

      // Redirect
      redirect({
        to: "/",
      });
    };
    reset();
  }, [rep, scope]);

  return <div className="p-24 text-center">Resetting...</div>;
}
