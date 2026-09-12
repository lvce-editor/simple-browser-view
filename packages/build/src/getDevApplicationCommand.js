import { join } from 'node:path'

export const getDevApplicationCommand = (root, executablePath = process.env.LVCE_EXECUTABLE_PATH || 'lvce') => {
  return {
    args: ['--link', join(root, '.tmp', 'dist'), '--hot-reload', `--user-data-dir=${join(root, '.tmp', 'user-data')}`, '--wait', root],
    command: executablePath,
    cwd: root,
  }
}
