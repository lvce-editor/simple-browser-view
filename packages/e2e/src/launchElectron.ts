import { _electron as electron, ElectronApplication } from 'playwright'
import { join } from 'node:path'
import { existsSync } from 'node:fs'
import { root } from './root.ts'

const serverPath = join(root, 'packages/server')

const getElectronExecutablePath = (): string => {
  const electronDistPath = join(serverPath, 'node_modules', 'electron', 'dist', 'electron')
  if (existsSync(electronDistPath)) {
    return electronDistPath
  }

  const electronBinPath = join(serverPath, 'node_modules', '.bin', 'electron')
  if (existsSync(electronBinPath)) {
    return electronBinPath
  }

  const electronPackagePath = join(serverPath, 'node_modules', 'electron')
  if (existsSync(electronPackagePath)) {
    return electronPackagePath
  }

  throw new Error(
    `Electron executable not found. Please install electron in packages/server. Checked: ${electronDistPath}, ${electronBinPath}, ${electronPackagePath}`,
  )
}

export const launchElectron = async (userDataDir?: string): Promise<ElectronApplication> => {
  const electronExecutablePath = getElectronExecutablePath()

  const env: Record<string, string> = {
    ...process.env,
    LVCE_SHARED_PROCESS_PATH: join(root, 'packages', 'server', 'node_modules', '@lvce-editor', 'shared-process', 'src', 'sharedProcessMain.js'),
    LVCE_PRELOAD_URL: join(root, 'packages', 'server', 'node_modules', '@lvce-editor', 'preload', 'src', 'index.js'),
  }

  if (userDataDir) {
    env.XDG_DATA_HOME = userDataDir
    env.XDG_CACHE_HOME = userDataDir
  }

  const electronApp = await electron.launch({
    executablePath: electronExecutablePath,
    cwd: serverPath,
    args: ['.', '--no-sandbox'],
    env,
    ...(userDataDir ? { userDataDir } : {}),
  })

  return electronApp
}
