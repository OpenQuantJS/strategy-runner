import { TransformOptions, Transform } from 'stream'

export type Strategy = (chunk: any) => boolean

export interface StrategyRunnerOptions extends TransformOptions {
  strategy: Strategy
  size?: number
}

export interface ProcessedArgs {
  chunk: any
  isValid: boolean
  cursor?: number
  size?: number
}

export class StrategyRunner extends Transform {
  _strategy: Strategy
  _size?: number
  _cursor?: number

  constructor(opts: StrategyRunnerOptions) {
    super({ ...opts, objectMode: true })
    this._strategy = opts.strategy
    this._size = opts.size
    this._cursor = opts.size
  }

  _transform(chunk: any, _: string, callback: (error?: Error | null) => void) {
    try {
      const isValid = this._strategy(chunk)
      if (this._cursor !== undefined) {
        this._cursor = this._cursor - 1
      }

      this.emit('processed', {
        chunk,
        isValid,
        cursor: this._cursor,
        size: this._size,
      })

      if (isValid) {
        this.push(chunk)
      }

      callback()

      if (this._cursor === 0) {
        this.end()
      }

    } catch (e) {
      this.emit('error', e)
    }
  }
}
