import { spawn, ChildProcess } from 'node:child_process'
import { join } from 'node:path'

const root = join(import.meta.dirname, '../../..')

export const startBuild = (): ChildProcess => {
  const buildProcess = spawn('npm', ['run', 'build:watch'], {
    cwd: root,
    stdio: 'pipe',
  })

  return buildProcess
}

export const waitForBuild = async (delayMs: number = 3000): Promise<void> => {
  const { promise: delayPromise, resolve: resolveDelay } = Promise.withResolvers<void>()
  setTimeout(resolveDelay, delayMs)
  await delayPromise
}
