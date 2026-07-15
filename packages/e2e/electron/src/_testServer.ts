import { createServer, type RequestListener, type Server } from 'node:http'

export interface TestResponse {
  readonly body?: string
  readonly headers?: Readonly<Record<string, string>>
  readonly statusCode?: number
  readonly statusMessage?: string
}

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

export const respond = ({ body = '', headers = {}, statusCode = 200, statusMessage }: TestResponse): RequestListener => {
  return (_request, response): void => {
    if (statusMessage) {
      response.writeHead(statusCode, statusMessage, headers)
    } else {
      response.writeHead(statusCode, headers)
    }
    response.end(body)
  }
}

const defaultHandler = respond({
  body: '<!doctype html><html><body><h1 id="greeting">hello world</h1></body></html>',
  headers: { 'content-type': 'text/html; charset=utf-8' },
})

export const start = async (handler: RequestListener = defaultHandler): Promise<TestServer> => {
  const server = createServer(handler)
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
