import { Accessor, createBinding, createComputed, createState } from "ags";
import GObject from "gnim/gobject";

export const isAccessor = <T>(value: unknown): value is Accessor<T> => {
  return (
    !!value &&
    typeof (value as Accessor<T>).get === "function" &&
    typeof (value as Accessor<T>).as === "function" &&
    typeof (value as Accessor<T>).subscribe === "function"
  );
};

// copied from ags
type SubscribeCallback = () => void;
type DisposeFunction = () => void;
type SubscribeFunction = (callback: SubscribeCallback) => DisposeFunction;

export const flattenAccessor = <T>(
  accessor: Accessor<Accessor<T>>,
): Accessor<T> => {
  const get = () => accessor.get().get();

  const subscribe: SubscribeFunction = (callback) => {
    let disposeInner: DisposeFunction | undefined;

    const resubscribeToInner = () => {
      disposeInner?.();
      const innerAccessor = accessor.get();
      disposeInner = innerAccessor.subscribe(() => callback());
      callback();
    };

    const disposeOuter = accessor.subscribe(resubscribeToInner);
    resubscribeToInner();

    return () => {
      disposeOuter();
      disposeInner?.();
    };
  };

  return new Accessor(get, subscribe);
};

export const createOptionalBinding = <
  T extends GObject.Object,
  K extends keyof T,
>(
  object: T | undefined,
  key: Extract<K, string>,
): Accessor<T[K]> | Accessor<undefined> => {
  if (object !== undefined) {
    return createBinding(object, key);
  } else {
    return new Accessor(
      () => undefined,
      (_) => () => {},
    );
  }
};

export const constantAccessor = <T>(value: T) =>
  new Accessor(
    () => value,
    (_) => () => {},
  );

export type OptionalAccessor<T> = T | Accessor<T> | undefined;

export function getOptionalAccessor<T>(
  value: OptionalAccessor<T>,
  fallback: T,
): T;
export function getOptionalAccessor<T>(
  value: OptionalAccessor<T>,
): T | undefined;
export function getOptionalAccessor<T>(
  value: OptionalAccessor<T>,
  fallback?: T,
): T | typeof fallback {
  if (isAccessor(value)) return value.get();
  else if (value === undefined && fallback !== undefined) return fallback;
  else return value;
}

export const optionalAccessorAs = <T, R>(
  value: OptionalAccessor<T>,
  transform: (value: T | undefined) => R,
): Accessor<R> => {
  if (isAccessor(value)) return value.as(transform);
  else return constantAccessor(transform(value));
};

export const joinClasses = <T extends string | string[]>(
  ...classes: OptionalAccessor<T>[]
): OptionalAccessor<T> => {
  classes = classes.filter((e) => e !== undefined);
  if (classes.length === 0) return undefined;

  if (classes.find((e) => isAccessor(e)) !== undefined) {
    if (typeof getOptionalAccessor(classes[0]) === "string") {
      return createComputed(
        (get) =>
          classes.map((e) => (isAccessor(e) ? get(e)! : e!)).join(" ") as T,
      );
    } else {
      return createComputed(
        (get) => classes.flatMap((e) => (isAccessor(e) ? get(e)! : e!)) as T,
      );
    }
  } else {
    if (typeof classes[0] === "string") {
      return classes.join(" ") as T;
    } else {
      return classes.flatMap((e) => e as T) as T;
    }
  }
};

export const stateFromAccessor = <T>(accessor: Accessor<T>) => {
  const [state, setState] = createState(accessor.get());

  accessor.subscribe(() => {
    setState(accessor.get());
  });

  return [state, setState] as const;
};
