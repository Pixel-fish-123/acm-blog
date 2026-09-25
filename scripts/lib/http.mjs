// HTTP 工具：洛谷会对首次请求 302 并下发 cookie（C3VK），带上 cookie 重试才能拿到数据

export const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'

// 带 cookie 重试的 GET，返回响应文本
export async function fetchText(url, { timeout = 15000, maxRedirects = 4 } = {}) {
  const headers = { 'User-Agent': UA }
  let res = await fetch(url, { headers, redirect: 'manual', signal: AbortSignal.timeout(timeout) })
  for (let i = 0; i < maxRedirects && res.status >= 300 && res.status < 400; i++) {
    const setCookie = res.headers.get('set-cookie')
    if (setCookie) headers['Cookie'] = setCookie.split(';')[0]
    res = await fetch(url, { headers, redirect: 'manual', signal: AbortSignal.timeout(timeout) })
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.text()
}

// 取出 Next.js 风格的 <script id="lentille-context"> JSON
export function parseLentilleContext(html, id = 'lentille-context') {
  const m = String(html).match(new RegExp(`<script id="${id}"[^>]*>([\\s\\S]*?)</script>`))
  if (!m) throw new Error(`未找到 ${id} 数据`)
  return JSON.parse(m[1])
}
