declare module 'redlock' {
  import { Redis } from 'ioredis';

  interface Lock {
    release(): Promise<void>;
  }

  interface Settings {
    driftFactor?: number;
    retryCount?: number;
    retryDelay?: number;
    retryJitter?: number;
    automaticExtensionThreshold?: number;
  }

  export default class Redlock {
    constructor(clients: Redis[], settings?: Settings);
    acquire(resources: string[], duration: number): Promise<Lock>;
    release(lock: Lock): Promise<void>;
  }

  export { Lock };
}
