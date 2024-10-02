import { ExtractTablesWithRelations } from "drizzle-orm";
import postgres from "postgres";

import { createContext } from "./context";
import { drizzle, PostgresJsTransaction } from "drizzle-orm/postgres-js";

export type Transaction = PostgresJsTransaction<
  Record<string, never>,
  ExtractTablesWithRelations<Record<string, never>>
>;

const queryClient = postgres(process.env.DATABASE_URL!);
const db = drizzle(queryClient, { logger: false });

export type TxOrDb = Transaction | typeof queryClient;

const TransactionContext = createContext<{
  tx: Transaction;
  effects: (() => void | Promise<void>)[];
}>();

export async function useTransaction<T>(callback: (trx: TxOrDb) => Promise<T>) {
  try {
    const { tx } = TransactionContext.use();
    return callback(tx);
  } catch {
    return callback(queryClient);
  }
}

export async function afterTx(effect: () => any | Promise<any>) {
  try {
    const { effects } = TransactionContext.use();
    effects.push(effect);
  } catch {
    await effect();
  }
}

export async function createTransaction<T>(
  callback: (tx: Transaction) => Promise<T>,
): Promise<T> {
  try {
    const { tx } = TransactionContext.use();
    return callback(tx);
  } catch {
    const effects: (() => void | Promise<void>)[] = [];
    const result = await db.transaction(
      async (tx) => {
        return TransactionContext.with({ tx, effects }, () => callback(tx));
      },
      {
        isolationLevel: "repeatable read",
      },
    );
    await Promise.all(effects.map((x) => x()));
    return result as T;
  }
}
