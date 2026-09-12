/**
 * @typedef {Promise<unknown> & { kill(signal?: NodeJS.Signals | number, error?: Error): unknown }} ChildProcessPromise
 * @typedef {{ off(event: string, listener: () => void): unknown, once(event: string, listener: () => void): unknown }} SignalEmitter
 */

/**
 * @param {{ application: ChildProcessPromise, processObject?: SignalEmitter, watcher: ChildProcessPromise }} options
 */
export const waitForDevProcesses = async ({ application, processObject = process, watcher }) => {
  let resolveSignal
  const signal = new Promise((resolve) => {
    resolveSignal = resolve
  })
  const handleSignal = () => {
    resolveSignal()
  }
  processObject.once('SIGINT', handleSignal)
  processObject.once('SIGTERM', handleSignal)
  try {
    await Promise.race([watcher, application, signal])
  } finally {
    processObject.off('SIGINT', handleSignal)
    processObject.off('SIGTERM', handleSignal)
    watcher.kill('SIGTERM')
    application.kill('SIGTERM')
    await Promise.allSettled([watcher, application])
  }
}
