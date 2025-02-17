/**
 * Takes two objects and does a Set Difference of them.
 * Set Difference is generally defined as follows:
 * ```
 * 𝑥 ∈ A ∖ B ⟺ 𝑥 ∈ A ∧ 𝑥 ∉ B
 * ```
 * Meaning that the returned object contains all properties of A expect those that also
 * appear in B. Notice that properties that appear in B, but not in A, have no effect.
 *
 * @see [Set Difference]{@link https://proofwiki.org/wiki/Definition:Set_Difference}
 *
 * @param objectA The object on which the difference is being calculated
 * @param objectB The object whose properties will be removed from objectA
 * @returns objectA without properties from objectB
 */
export function setDiff<
  ObjectA extends Record<any, unknown>,
  ObjectB extends Record<any, unknown>,
>(objectA: ObjectA, objectB: ObjectB): Diff<ObjectA, ObjectB> {
  return Object.entries(objectA).reduce<Record<any, unknown>>(
    (acc, [key, value]) => {
      if (!(key in objectB)) {
        acc[key] = value;
      }
      return acc;
    },
    {},
  ) as Diff<ObjectA, ObjectB>;
}

/**
 * Use in the default case of a switch that you want to be fully exhaustive.
 * Using this function forces the compiler to enforces exhaustivity during compile-time
 *
 * @example
 * ```
 * const snapPrefix = snapIdToSnapPrefix(snapId);
 * switch (snapPrefix) {
 *   case SnapIdPrefixes.local:
 *     ...
 *   case SnapIdPrefixes.npm:
 *     ...
 *   default:
 *     assertExhaustive(snapPrefix);
 * }
 * ```
 *
 * @param _ The object on which the switch is being operated
 */
/* istanbul ignore next */
export function assertExhaustive(_: never): never {
  throw new Error(
    'Invalid branch reached. Should be detected during compilation',
  );
}

/**
 * Checks whether the type is composed of literal types
 * @returns @type {true} if whole type is composed of literals, @type {false} if whole type is not literals, @type {boolean} if mixed
 *
 * @example
 * ```
 * type t1 = IsLiteral<1 | 2 | "asd" | true>;
 * // t1 = true
 *
 * type t2 = IsLiteral<number | string>;
 * // t2 = false
 *
 * type t3 = IsLiteral<1 | string>;
 * // t3 = boolean
 *
 * const s = Symbol();
 * type t4 = IsLiteral<typeof s>;
 * // t4 = true
 *
 * type t5 = IsLiteral<symbol>
 * // t5 = false;
 * ```
 */
type IsLiteral<T> = T extends string | number | boolean | symbol
  ? Extract<string | number | boolean | symbol, T> extends never
    ? true
    : false
  : false;

/**
 * Returns all keys of an object, that are literal, as an union
 *
 * @example
 * ```
 * type t1 = _LiteralKeys<{a: number, b: 0, c: 'foo', d: string}>
 * // t1 = 'b' | 'c'
 * ```
 *
 * @see [Literal types]{@link https://www.typescriptlang.org/docs/handbook/literal-types.html}
 */
type _LiteralKeys<T> = NonNullable<
  {
    [Key in keyof T]: IsLiteral<Key> extends true ? Key : never;
  }[keyof T]
>;

/**
 * Returns all keys of an object, that are not literal, as an union
 *
 * @example
 * ```
 * type t1 = _NonLiteralKeys<{a: number, b: 0, c: 'foo', d: string}>
 * // t1 = 'a' | 'd'
 * ```
 *
 * @see [Literal types]{@link https://www.typescriptlang.org/docs/handbook/literal-types.html}
 */
type _NonLiteralKeys<T> = NonNullable<
  {
    [Key in keyof T]: IsLiteral<Key> extends false ? Key : never;
  }[keyof T]
>;

/**
 * A set difference of two objects based on their keys
 *
 * @example
 * ```
 * type t1 = Diff<{a: string, b: string}, {a: number}>
 * // t1 = {b: string};
 * type t2 = Diff<{a: string, 0: string}, Record<string, unknown>>;
 * // t2 = { a?: string, 0: string};
 * type t3 = Diff<{a: string, 0: string, 1: string}, Record<1 | string, unknown>>;
 * // t3 = {a?: string, 0: string}
 * ```
 *
 * @see {@link setDiff} for the main use-case
 */
export type Diff<A, B> = Omit<A, _LiteralKeys<B>> &
  Partial<Pick<A, Extract<keyof A, _NonLiteralKeys<B>>>>;

/**
 * Makes every specified property of the specified object type mutable.
 *
 * @template T - The object whose readonly properties to make mutable.
 * @template TargetKey - The property key(s) to make mutable.
 */
export type Mutable<
  T extends Record<string, unknown>,
  TargetKey extends string,
> = {
  -readonly [Key in keyof Pick<T, TargetKey>]: T[Key];
} &
  {
    [Key in keyof Omit<T, TargetKey>]: T[Key];
  };
