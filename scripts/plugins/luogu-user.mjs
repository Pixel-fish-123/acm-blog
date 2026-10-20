// 插件：抓取洛谷账号数据，更新 docs/.vitepress/theme/profile.json
// 说明：洛谷接口未开放 CORS，只能在构建端抓取，无法浏览器实时请求。
// 不再直接改 .vue 源码：组件统一从 profile.json 读取资料。
import fs from 'node:fs'
import path from 'node:path'
import { fetchText, parseLentilleContext } from '../lib/http.mjs'
import { changedProfileKeys, mergeProfile } from '../lib/luogu-profile.mjs'

function profileFile(blogRoot) {
  return path.join(blogRoot, 'docs', '.vitepress', 'theme', 'profile.json')
}

function uidOf(profile) {
  if (profile.uid) return String(profile.uid)
  const m = String(profile.home || '').match(/luogu\.com\.cn\/user\/(\d+)/)
  return m ? m[1] : ''
}

export async function updateLuoguUser({ blogRoot, log = console.log, warn = console.warn } = {}) {
  const file = profileFile(blogRoot)

  let current
  try {
    current = JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch (e) {
    warn(`洛谷数据更新：读取 ${file} 失败（${e.message}），跳过`)
    return
  }

  const uid = uidOf(current)
  if (!uid) {
    warn('洛谷数据更新：profile.json 里没有 uid / home，跳过')
    return
  }

  let user
  try {
    const html = await fetchText(`https://www.luogu.com.cn/user/${uid}?_contentOnly=1`)
    user = parseLentilleContext(html)?.data?.user
    if (!user || !user.uid) throw new Error('数据中没有 user 字段')
  } catch (e) {
    warn(`洛谷数据更新：抓取失败（${e.message}），保留原数据`)
    return
  }

  const next = mergeProfile(current, user, { uid })
  const changed = changedProfileKeys(current, next)
  if (!changed.length) {
    log('洛谷数据更新：无变化')
    return
  }

  fs.writeFileSync(file, JSON.stringify(next, null, 2) + '\n')
  log(`洛谷数据更新：${changed.map((key) => `${key}: ${next[key]}`).join('，')}`)
}

export default {
  name: 'luogu-user',
  async onFinish(index, ctx) {
    if (ctx.offline) return
    await updateLuoguUser(ctx)
  },
}
