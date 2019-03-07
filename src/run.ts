import { StrategyRunner, Strategy, ProcessedArgs } from './StrategyWritable'
import { Readable } from 'stream';

import { DevNull } from './DevNull'

export type ProcessedFunc = (r: ProcessedArgs) => any

export async function run<T = any>(strategy: Strategy, readable: Readable, size: number, processedFunc?: ProcessedFunc) {
  const results: T[] = []
  const strategyRunner = new StrategyRunner({
    strategy,
    size,
  })

  const devNull = new DevNull({ objectMode: true })

  strategyRunner.on('processed', (r: ProcessedArgs) => {
    if (r.isValid) {
      results.push(r.chunk)
    }
    if (processedFunc) {
      processedFunc(r)
    }
  })

  const r = new Promise<T[]>(resolve => {
    strategyRunner.on('finish', () => {
      resolve(results)
    })
  })

  readable.pipe(strategyRunner).pipe(devNull)

  return await r
}
