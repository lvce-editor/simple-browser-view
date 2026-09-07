import { spawn } from 'node:child_process'
import { mkdir, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const args = process.argv.slice(2)
const filter = args.find((arg) => arg.startsWith('--filter='))?.slice('--filter='.length) || ''
const extraArgs = args.filter((arg) => !arg.startsWith('--filter='))
const entries = await readdir(join(import.meta.dirname, 'src'))
const files = entries
  .filter((file) => file.startsWith('simple-browser.') && file.endsWith('.ts') && file.includes(filter))
  .toSorted((a, b) => a.localeCompare(b))
if (files.length === 0) throw new Error(`No Electron tests match ${filter}`)
let failed = 0
for (const file of files) {
  const testModule = await import(`./src/${file}`)
  if (testModule.skip) {
    process.stdout.write(`SKIP ${file}\n`)
    continue
  }
  const profile = await mkdtemp(join(tmpdir(), 'simple-browser-e2e-'))
  const env = { ...process.env, SIMPLE_BROWSER_TEST_NAME: file, SIMPLE_BROWSER_TEST_PROFILE: profile, XDG_DOWNLOAD_DIR: join(profile, 'downloads') }
  await mkdir(env.XDG_DOWNLOAD_DIR, { recursive: true })
  for (const kind of ['CONFIG', 'DATA', 'CACHE', 'STATE']) env[`XDG_${kind}_HOME`] = join(profile, kind.toLowerCase())
  for (const name of ['lvce', 'lvce-oss']) {
    const config = join(profile, 'config', name)
    await mkdir(config, { recursive: true })
    await writeFile(join(config, 'settings.json'), '{}')
  }
  try {
    process.stdout.write(`RUN ${file}\n`)
    const processGroup = process.platform !== 'win32'
    const child = spawn(
      process.execPath,
      [
        './node_modules/@lvce-editor/test-with-playwright/bin/test-with-playwright.js',
        '--electron',
        '--only-extension=./extension',
        '--test-path=./electron',
        '--timeout=60000',
        `--electron-version=${process.env.LVCE_ELECTRON_VERSION || 'v0.113.19'}`,
        `--filter=${file}`,
        ...extraArgs,
      ],
      { detached: processGroup, env, stdio: 'inherit' },
    )
    const code = await new Promise<number>((resolve, reject) => {
      const deadline = setTimeout(() => {
        process.stderr.write(`FAIL ${file}: Electron startup, test, or shutdown exceeded 120 seconds\n`)
        if (processGroup && child.pid) process.kill(-child.pid, 'SIGKILL')
        else child.kill('SIGKILL')
      }, 120_000)
      child.once('error', (error) => {
        clearTimeout(deadline)
        reject(error)
      })
      child.once('exit', (value) => {
        clearTimeout(deadline)
        resolve(value ?? 1)
      })
    })
    if (code !== 0) failed++
  } finally {
    await rm(profile, { force: true, recursive: true })
  }
}
process.stdout.write(`Electron suite: ${files.length} cases considered, ${failed} failed\n`)
process.exitCode = failed > 0 ? 1 : 0
