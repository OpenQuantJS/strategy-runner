import { Writable, WritableOptions } from 'stream'

export class DevNull extends Writable {
  constructor(opts?: WritableOptions) {
    super(opts)
  }

  _write(_: string, __: string, callback: (error?: Error | null) => void) {
    setImmediate(callback)
  }
}
