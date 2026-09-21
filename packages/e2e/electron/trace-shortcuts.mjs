import { glob, readFile, writeFile, rename } from 'node:fs/promises'
import { brotliCompressSync, gzipSync } from 'node:zlib'

const matches = []
for await (const path of glob('.test-with-playwright/electron/v0.115.14/linux/x64/app/**/rendererProcessMain.js')) matches.push(path)
if (matches.length !== 1) throw new Error(`Expected one cached renderer, found ${matches.length}`)
const path = matches[0]
if (process.argv.includes('--restore')) {
  for (const file of [path, `${path}.gz`, `${path}.br`]) {
    try {
      await rename(`${file}.capture-original`, file)
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
    }
  }
} else {
  const source = await readFile(path, 'utf8')
  const marker = /const handleJsonRpcMessage = async \(([^)]*)\) => \{/g
  if (source.matchAll(marker).toArray().length !== 1) throw new Error('RPC receiver layout changed')
  const patched = source.replaceAll(marker, (match, parameters) => {
    let expression = ''
    if (parameters.includes('...args')) expression = '(args.length === 1 ? args[0].message : args[1])'
    else if (parameters.includes('message')) expression = 'message'
    if (!expression) throw new Error(`Unknown receiver ${parameters}`)
    return `${match}\ntry { const capture = globalThis.___receivedMessages ||= []; if (capture.length < 10000) capture.push({time:performance.now(),payload:JSON.parse(JSON.stringify(${expression}))}); } catch {}`
  })
  for (const [file, content] of [
    [path, patched],
    [`${path}.gz`, gzipSync(patched)],
    [`${path}.br`, brotliCompressSync(patched)],
  ]) {
    try {
      await rename(file, `${file}.capture-original`)
    } catch (error) {
      if (error.code === 'ENOENT') continue
      throw error
    }
    await writeFile(file, content)
  }
  console.log(`Patched diagnostic renderer: ${path}`)
}
