<script setup>
import { computed } from 'vue'
import { SORT_OPTIONS } from '../filters.js'

// 首页筛选控件：关键词 / 平台 / 排序 / 已选条件。
// 标签和难度分别在侧栏的「算法标签」「难度分布」卡片里点选。
const props = defineProps({
  modelValue: { type: Object, required: true },
  categories: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue'])

const filters = computed(() => props.modelValue)

function patch(part) {
  emit('update:modelValue', { ...props.modelValue, ...part })
}

const activeChips = computed(() => {
  const out = []
  if (filters.value.q) out.push({ kind: 'q', label: `关键词：${filters.value.q}` })
  if (filters.value.cat) out.push({ kind: 'cat', label: `平台：${filters.value.cat}` })
  for (const tag of filters.value.tags) out.push({ kind: 'tag', value: tag, label: `标签：${tag}` })
  for (const diff of filters.value.diffs) out.push({ kind: 'diff', value: diff, label: `难度：${diff}` })
  return out
})

function removeChip(chip) {
  if (chip.kind === 'q') patch({ q: '' })
  else if (chip.kind === 'cat') patch({ cat: '' })
  else if (chip.kind === 'tag') patch({ tags: filters.value.tags.filter((t) => t !== chip.value) })
  else patch({ diffs: filters.value.diffs.filter((d) => d !== chip.value) })
}

function clearAll() {
  emit('update:modelValue', {
    q: '',
    cat: '',
    tags: [],
    diffs: [],
    sort: filters.value.sort,
  })
}
</script>

<template>
  <section class="sf-card">
    <div class="sf-row">
      <input
        class="sf-input"
        type="search"
        placeholder="搜索题号 / 标题 / 标签"
        :value="filters.q"
        @input="patch({ q: $event.target.value })"
      />
      <select
        class="sf-select"
        :value="filters.cat"
        @change="patch({ cat: $event.target.value })"
      >
        <option value="">全部平台</option>
        <option v-for="c in categories" :key="c.name" :value="c.name">
          {{ c.name }}（{{ c.count }}）
        </option>
      </select>
      <select
        class="sf-select"
        :value="filters.sort"
        @change="patch({ sort: $event.target.value })"
      >
        <option v-for="option in SORT_OPTIONS" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </div>

    <div v-if="activeChips.length" class="sf-active">
      <span class="sf-active-label">已选条件</span>
      <button
        v-for="(chip, i) in activeChips"
        :key="chip.kind + '-' + (chip.value || i)"
        class="sf-chip"
        @click="removeChip(chip)"
      >
        <span>{{ chip.label }}</span>
        <span class="sf-chip-x">×</span>
      </button>
      <button class="sf-clear" @click="clearAll">清空</button>
    </div>
  </section>
</template>

<style scoped>
.sf-card {
  background: #fff;
  border: 1px solid var(--lg-card-border, #e3e8ef);
  border-radius: 4px;
  padding: 14px 20px;
  margin-bottom: 20px;
}

.sf-row {
  display: flex;
  gap: 10px;
}

.sf-input {
  flex: 1;
  min-width: 0;
  padding: 7px 12px;
  font-size: 14px;
  color: #2d3436;
  background: #fff;
  border: 1px solid #e3e8ef;
  border-radius: 4px;
  outline: none;
  transition: border-color 0.15s;
}

.sf-input:focus {
  border-color: #3498db;
}

.sf-input::placeholder {
  color: #a0aab6;
}

.sf-select {
  flex-shrink: 0;
  max-width: 200px;
  padding: 7px 10px;
  font-size: 14px;
  color: #4a5664;
  background: #fff;
  border: 1px solid #e3e8ef;
  border-radius: 4px;
  outline: none;
  cursor: pointer;
}

.sf-select:focus {
  border-color: #3498db;
}

.sf-active {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #eef1f6;
}

.sf-active-label {
  font-size: 12px;
  color: #a0aab6;
}

.sf-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 8px;
  font-size: 12px;
  color: #3498db;
  background: #eaf3fb;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

.sf-chip:hover {
  background: #dcebf8;
}

.sf-chip-x {
  font-size: 13px;
  line-height: 1;
}

.sf-clear {
  margin-left: auto;
  padding: 2px 10px;
  font-size: 12px;
  color: #4a5664;
  background: #f2f4f8;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

.sf-clear:hover {
  color: #3498db;
  background: #eaf3fb;
}

@media (max-width: 720px) {
  .sf-row {
    flex-wrap: wrap;
  }

  .sf-input {
    flex: 1 1 100%;
  }

  .sf-select {
    flex: 1 1 40%;
    max-width: none;
  }
}
</style>
