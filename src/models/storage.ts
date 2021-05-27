import Listener from "./listener.js";

export class CStorage<T> {
    protected listeners: Listener<T>[] = [];
  
    addListener(fn: Listener<T>) {
      this.listeners.push(fn);
    }
  }
  