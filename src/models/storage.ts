import Listener from "./listener";

export class CStorage<T> {
    protected listeners: Listener<T>[] = [];
  
    addListener(fn: Listener<T>) {
      this.listeners.push(fn);
    }
  }
  