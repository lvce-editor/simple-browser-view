import { ChildProcess } from 'node:child_process'

export const stopProcess = async (process: ChildProcess | null): Promise<void> => {
  if (!process) {
    return
  }

  process.kill('SIGTERM')
  const { promise: exitPromise, resolve: resolveExit } = Promise.withResolvers<void>()
  process.on('exit', resolveExit)
  setTimeout(resolveExit, 5000)
  await exitPromise
}
