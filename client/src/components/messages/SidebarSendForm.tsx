import { RealtimeClientContext } from "@/main";
import { useContext, useState } from "react";

interface SidebarSendFormeProps {
  nodeId: string;
}
export const SidebarSendForme = ({ nodeId }: SidebarSendFormeProps) => {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const r = useContext(RealtimeClientContext);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (message.length === 0) {
      setError("Message cannot be empty");
    } else {
      // r.mutate.sendMessage({
      //
      // })
      setError("");
    }
  };
};
