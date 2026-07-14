import { createServer, type Server } from 'node:http'

export interface TestServer {
  readonly close: () => Promise<void>
  readonly url: string
}

const listen = async (server: Server): Promise<number> => {
  const { promise, reject, resolve } = Promise.withResolvers<number>()
  server.once('error', reject)
  server.listen(0, '127.0.0.1', () => {
    server.off('error', reject)
    const address = server.address()
    if (!address || typeof address === 'string') {
      reject(new Error('Failed to determine test server port'))
      return
    }
    resolve(address.port)
  })
  return promise
}

export const start = async (): Promise<TestServer> => {
  const server = createServer((_request, response) => {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
    response.end('<!doctype html><html><body><h1 id="greeting">hello world</h1></body></html>')
  })
  const port = await listen(server)
  return {
    close: async (): Promise<void> => {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error)
            return
          }
          resolve()
        })
      })
    },
    url: `http://127.0.0.1:${port}`,
  }
}
