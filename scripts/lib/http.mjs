// HTTP 工具：洛谷会对首次请求 302 并下发 cookie（C3VK），带上 cookie 重试才能拿到数据。
// 这里同时处理多 cookie、重定向和偶发 429/5xx，网络插件失败时由调用方回退到旧数据。

export const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'

const REDIRECT_STATUS = new Set([301, 302, 303, 307, 308])

function setCookieValues(headers) {
  if (typeof headers.getSetCookie === 'function') return headers.getSetCookie()
  const raw = headers.get('set-cookie')
  if (!raw) return []
  // 兼容没有 getSetCookie 的运行时：按 ", name=value" 粗分，避免把 Expires 里的逗号切开。
  return raw.split(/,(?=\s*[^;,=\s]+=)/)
}

function rememberCookies(jar, headers) {
  for (const value of setCookieValues(headers)) {
    const pair = String(value).split(';')[0].trim()
    const at = pair.indexOf('=')
    if (at <= 0) continue
    jar.set(pair.slice(0, at), pair.slice(at + 1))
  }
}

function cookieHeader(jar) {
  return [...jar.entries()].map(([name, value]) => `${name}=${value}`).join('; ')
}

function retryDelayFor(headers, baseDelayMs, attempt) {
  const retryAfter = headers.get('retry-after')
  if (retryAfter) {
    const seconds = Number(retryAfter)
    if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000)
    const date = Date.parse(retryAfter)
    if (Number.isFinite(date)) return Math.max(0, date - Date.now())
  }
  return baseDelayMs * 2 ** attempt
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// 带 cookie / 重定向 / 有限重试的 GET，返回响应文本。
export async function fetchText(
  url,
  { timeout = 15000, maxRedirects = 4, retries = 2, retryDelayMs = 500 } = {}
) {
  const jar = new Map()
  let current = String(url)
  let redirects = 0
  let attempt = 0

  while (true) {
    let res
    try {
      const headers = { 'User-Agent': UA }
      if (jar.size) headers.Cookie = cookieHeader(jar)
      res = await fetch(current, {
        headers,
        redirect: 'manual',
        signal: AbortSignal.timeout(timeout),
      })
    } catch (e) {
      if (attempt < retries) {
        await sleep(retryDelayMs * 2 ** attempt)
        attempt++
        continue
      }
      throw e
    }

    rememberCookies(jar, res.headers)

    if (REDIRECT_STATUS.has(res.status)) {
      const location = res.headers.get('location')
      if (!location) throw new Error(`HTTP ${res.status} 但没有 Location`)
      if (redirects >= maxRedirects) throw new Error(`重定向次数超过 ${maxRedirects} 次`)
      redirects++
      current = new URL(location, current).href
      // 重定向不计入重试次数，重新走一轮。
      continue
    }

    if ((res.status === 429 || res.status >= 500) && attempt < retries) {
      await sleep(retryDelayFor(res.headers, retryDelayMs, attempt))
      attempt++
      continue
    }

    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.text()
  }
}

// 取出 Next.js 风格的 <script id="lentille-context"> JSON
export function parseLentilleContext(html, id = 'lentille-context') {
  const m = String(html).match(new RegExp(`<script id="${id}"[^>]*>([\\s\\S]*?)</script>`))
  if (!m) throw new Error(`未找到 ${id} 数据`)
  return JSON.parse(m[1])
}
