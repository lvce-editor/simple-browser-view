import { execa } from 'execa'
import { root } from './root.js'
import { join } from 'node:path'

const main = async () => {
  execa(`npm`, ['run', 'build:watch'], {
    cwd: root,
    stdio: 'inherit',
  })
  execa(
    'npx',

    ['electron', '.', '--wait'],
    {
      cwd: join(root, 'packages', 'server'),
      stdio: 'inherit',
      env: {
        ...process.env,
        LVCE_SHARED_PROCESS_PATH: join(root, 'packages', 'server', 'node_modules', '@lvce-editor', 'shared-process', 'src', 'sharedProcessMain.js'),
        LVCE_PRELOAD_URL: join(root, 'packages', 'server', 'node_modules', '@lvce-editor', 'preload', 'src', 'index.js'),
      },
    },
  )
}

main()
