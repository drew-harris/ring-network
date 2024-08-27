import { WriteTransaction, ReadTransaction } from "replicache";
import { type ZodSchema, type z } from "zod";

export function fn<
  Arg1 extends ZodSchema,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Callback extends (arg1: z.output<Arg1>) => any,
>(arg1: Arg1, cb: Callback) {
  const result = function (input: z.input<typeof arg1>): ReturnType<Callback> {
    const parsed = arg1.parse(input);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return cb.apply(cb, [parsed]);
  };
  result.schema = arg1;
  result.rawCb = cb as (arg1: z.output<Arg1>) => ReturnType<Callback>;
  return result;
}

type Mutator<
  Arg1 extends ZodSchema,
  Callback extends (tx: WriteTransaction, arg1: z.output<Arg1>) => any,
> = (tx: WriteTransaction, arg1: z.input<Arg1>) => ReturnType<Callback>;

export const mutation = <
  Arg1 extends ZodSchema,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Callback extends (tx: WriteTransaction, arg1: z.output<Arg1>) => any,
>(
  arg1: Arg1,
  cb: Callback,
) => {
  const result = function (tx: WriteTransaction, input: z.input<typeof arg1>) {
    const parsed = input.parse(input);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return cb.apply(cb, [tx, parsed]);
  };

  return result as Mutator<Arg1, Callback>;
};

type Query<
  Arg1 extends ZodSchema,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Callback extends (tx: ReadTransaction, arg1: z.output<Arg1>) => any,
> = (tx: ReadTransaction, arg1: z.input<Arg1>) => ReturnType<Callback>;

export const query = <
  Arg1 extends ZodSchema,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Callback extends (tx: ReadTransaction, arg1: z.output<Arg1>) => any,
>(
  arg1: Arg1,
  cb: Callback,
) => {
  const result = function (tx: ReadTransaction, input: z.input<typeof arg1>) {
    const parsed = input.parse(input);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return cb.apply(cb, [tx, parsed]);
  };

  return result as Query<Arg1, Callback>;
};
