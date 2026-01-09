import { spawn, ChildProcess, execSync } from 'node:child_process'
import { join } from 'node:path'
import { existsSync } from 'node:fs'

const root = join(import.meta.dirname, '../../..')
const buildOutputPath = join(root, '.tmp', 'dist', 'dist', 'simpleBrowserViewWorkerMain.js')

export const startBuild = (): ChildProcess => {
  const buildProcess = spawn('npm', ['run', 'build:watch'], {
    cwd: root,
    stdio: 'pipe',
  })

  return buildProcess
}

export const waitForBuild = async (maxWaitMs: number = 30000): Promise<void> => {
  const startTime = Date.now()
  const checkInterval = 500

  while (Date.now() - startTime < maxWaitMs) {
    if (existsSync(buildOutputPath)) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return
    }
    await new Promise((resolve) => setTimeout(resolve, checkInterval))
  }

  throw new Error(`Build did not complete within ${maxWaitMs}ms. Output file not found: ${buildOutputPath}`)
}
