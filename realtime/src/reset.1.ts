import { Transaction } from "./db";
import { Node_TB, Message_TB } from "./schema";


export const reset = async (tx: Transaction) => {
    await tx.delete(Node_TB);
    await tx.delete(Message_TB);
    await ;
    await tx.delete(Client_TB);
    await tx.delete(Auth_TB);
    await tx.delete(User_TB);
    await tx.delete(InFlight_TB);

    await tx.insert(Server_TB).values([
        {
            id: "server",
            version: 1,
        },
    ]);
};

