import { Mutations, Mutator } from "core/utils";
import { Transaction } from "./db";

type ServerMutator<T extends Mutator<any, any>> = (
  tx: Transaction,
  input: Parameters<T>[1],
  nextVersion: number,
) => void | Promise<void>;

export type ServerMutations<B extends Mutations<any>> = {
  [name in keyof B["mutations"]]: ServerMutator<B["mutations"][name]>;
};
