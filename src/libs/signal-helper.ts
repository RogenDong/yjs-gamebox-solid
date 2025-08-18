import type { Accessor, Setter, Signal } from "solid-js";

export interface SignalGetSet<T> {
  get: Accessor<T>;
  set: Setter<T>;
}

export function toSignalGetSet<T>(signal: Signal<T>): SignalGetSet<T> {
  return {
    get: signal[0],
    set: signal[1],
  };
}
