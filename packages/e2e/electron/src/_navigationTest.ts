import * as TestServer from './_testServer.ts'

export const pageAPath = '/a.html'
export const pageBPath = '/b.html'

const pages: Readonly<Record<string, string>> = {
  [pageAPath]: '<!doctype html><html><body><h1>Page A</h1><a href="/b.html">Go to Page B</a></body></html>',
  [pageBPath]: '<!doctype html><html><body><h1>Page B</h1><a href="/a.html">Go to Page A</a></body></html>',
}

export const startServer = (): Promise<TestServer.TestServer> => {
  return TestServer.start((request, response) => {
    const body = pages[request.url || '']
    if (!body) {
      response.writeHead(404)
      response.end()
      return
    }
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
    response.end(body)
  })
}
