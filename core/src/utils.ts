import { WriteTransaction, ReadTransaction } from "replicache";
import { type ZodSchema, type z } from "zod";

export function fn<
  Arg1 extends ZodSchema,
  Callback extends (arg1: z.output<Arg1>) => any,
>(arg1: Arg1, cb: Callback) {
  const result = function (input: z.input<typeof arg1>): ReturnType<Callback> {
    const parsed = arg1.parse(input);
    return cb.apply(cb, [parsed]);
  };
  result.schema = arg1;
  result.rawCb = cb as (arg1: z.output<Arg1>) => ReturnType<Callback>;
  return result;
}

export type Mutator<
  Arg1 extends ZodSchema,
  Callback extends (tx: WriteTransaction, arg1: z.output<Arg1>) => any,
> = (tx: WriteTransaction, arg1: z.input<Arg1>) => ReturnType<Callback>;

// Server side type inference
export type InferCallback<M extends Mutator<any, any>> =
  M extends Mutator<any, infer T>
    ? (input: Parameters<T>[1]) => ReturnType<T>
    : never;

export const mutation = <
  Arg1 extends ZodSchema,
  Callback extends (tx: WriteTransaction, arg1: z.output<Arg1>) => any,
>(
  arg1: Arg1,
  cb: Callback,
) => {
  const result = function (tx: WriteTransaction, input: z.input<typeof arg1>) {
    // const parsed = arg1.parse(input);
    return cb.apply(cb, [tx, input]);
  };

  return result as Mutator<Arg1, Callback>;
};

type Query<
  Arg1 extends ZodSchema,
  Callback extends (tx: ReadTransaction, arg1: z.output<Arg1>) => any,
> = (tx: ReadTransaction, arg1: z.input<Arg1>) => ReturnType<Callback>;

export const query = <
  Arg1 extends ZodSchema,
  Callback extends (tx: ReadTransaction, arg1: z.output<Arg1>) => any,
>(
  arg1: Arg1,
  cb: Callback,
) => {
  const result = function (tx: ReadTransaction, input: z.input<typeof arg1>) {
    // const parsed = input.parse(input);
    return cb.apply(cb, [tx, input]);
  };

  return result as Query<Arg1, Callback>;
};

export class Mutations<Mutators> {
  public mutations = {} as {
    [name in keyof Mutators]: Mutators[name];
  };

  public register<
    Name extends string,
    Arg1 extends ZodSchema,
    Callback extends (tx: WriteTransaction, arg1: z.output<Arg1>) => any,
  >(
    name: Name,
    arg1: Arg1,
    cb: Callback,
  ): Mutations<Mutators & { [name in Name]: Mutator<Arg1, Callback> }> {
    this.mutations[name as string] = mutation(arg1, cb);
    return this as Mutations<
      Mutators & { [name in Name]: Mutator<Arg1, Callback> }
    >;
  }

  public build(): {
    [name in keyof Mutators]: Mutators[name];
  } {
    return this.mutations as any;
  }

  // Merge two mutations classes together
  public extend<OtherMutators extends Record<string, Mutator<any, any>>>(
    other: Mutations<OtherMutators>,
  ): Mutations<Mutators & OtherMutators> {
    this.mutations = {
      ...this.mutations,
      ...other.mutations,
    };
    return this as Mutations<Mutators & OtherMutators>;
  }
}
