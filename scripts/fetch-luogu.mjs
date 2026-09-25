// 单独抓取洛谷账号数据（npm run luogu）
// 说明：npm run sync 时由 plugins/luogu-user.mjs 这个插件负责同一件事
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { updateLuoguUser } from './plugins/luogu-user.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const blogRoot = path.resolve(__dirname, '..')

await updateLuoguUser({ blogRoot })
