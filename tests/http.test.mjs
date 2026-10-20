import test from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import { fetchText } from '../scripts/lib/http.mjs'

async function withServer(handler, fn) {
  const server = http.createServer(handler)
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const { port } = server.address()
  try {
    return await fn(`http://127.0.0.1:${port}`)
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
}

test('fetchText 跟随重定向并携带多个 cookie', async () => {
  await withServer(
    (req, res) => {
      if (req.url === '/redirect') {
        res.writeHead(302, {
          Location: '/final',
          'Set-Cookie': ['a=1; Path=/', 'b=2; Path=/'],
        })
        res.end()
        return
      }
      if (req.url === '/final') {
        res.end(req.headers.cookie || '')
        return
      }
      res.statusCode = 404
      res.end()
    },
    async (base) => {
      const text = await fetchText(`${base}/redirect`, { retries: 0 })
      assert.equal(text.includes('a=1'), true)
      assert.equal(text.includes('b=2'), true)
    }
  )
})

test('fetchText 对 5xx 做有限重试', async () => {
  let calls = 0
  await withServer(
    (req, res) => {
      calls++
      if (calls === 1) {
        res.statusCode = 500
        res.end()
        return
      }
      res.end('ok')
    },
    async (base) => {
      const text = await fetchText(`${base}/retry`, { retries: 1, retryDelayMs: 1 })
      assert.equal(text, 'ok')
      assert.equal(calls, 2)
    }
  )
})

test('fetchText 不对 404 重试', async () => {
  let calls = 0
  await withServer(
    (req, res) => {
      calls++
      res.statusCode = 404
      res.end()
    },
    async (base) => {
      await assert.rejects(() => fetchText(`${base}/missing`, { retries: 2, retryDelayMs: 1 }), /HTTP 404/)
      assert.equal(calls, 1)
    }
  )
})

test('fetchText 限制重定向次数', async () => {
  await withServer(
    (req, res) => {
      res.writeHead(302, { Location: '/loop' })
      res.end()
    },
    async (base) => {
      await assert.rejects(
        () => fetchText(`${base}/loop`, { retries: 0, maxRedirects: 1 }),
        /重定向次数超过/
      )
    }
  )
})
