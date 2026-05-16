<template>
  <div
    ref="sectionRef"
    class="mt-2.5"
  >
    <button
      class="btn btn-sm min-w-24 gap-1.5"
      :class="[
        isExpanded && canOpenStrategyChain ? 'btn-neutral' : 'btn-outline',
        !canOpenStrategyChain && 'text-base-content/50 border-base-300',
      ]"
      :disabled="!canOpenStrategyChain"
      @click="toggleStrategyChain"
    >
      <span>{{ buttonLabel }}</span>
      <ChevronDownIcon
        class="h-4 w-4 transition-transform duration-200"
        :class="isExpanded && 'rotate-180'"
      />
    </button>

    <div
      v-if="isExpanded && canOpenStrategyChain"
      class="border-primary/45 bg-base-100 mt-2 overflow-hidden rounded-lg border shadow-sm"
    >
      <div class="bg-base-100/95 border-base-300/60 sticky top-0 z-10 border-b px-3 py-2 backdrop-blur">
        <div class="flex min-w-0 flex-wrap items-center gap-2">
          <button
            class="btn btn-xs"
            :disabled="currentPathIndex <= 0"
            @click="goParent"
          >
            {{ $t('backToParent') }}
          </button>
          <button
            class="btn btn-xs"
            :disabled="currentPathIndex <= 0"
            @click="goRoot"
          >
            {{ $t('backToRoot') }}
          </button>
          <div class="flex-1" />
        </div>

        <div
          ref="chainRef"
          class="text-base-content/70 mt-2 flex min-w-0 flex-wrap items-center gap-1 text-xs"
        >
          <template
            v-for="(name, index) in fullPath"
            :key="`${name}-${index}`"
          >
            <button
              class="rounded px-2 py-1"
              :class="
                index === currentPathIndex
                  ? 'bg-primary text-primary-content font-medium'
                  : 'bg-base-200/70 hover:bg-base-300 cursor-pointer'
              "
              @click="currentGroupName = name"
            >
              {{ name }}
            </button>
            <span
              v-if="index < fullPath.length - 1"
              class="text-base-content/35"
            >
              &gt;
            </span>
          </template>
        </div>
      </div>

      <div class="border-primary/35 border-l-4 px-3 py-3">
        <div class="mb-3 flex min-w-0 items-center gap-2">
          <span class="text-base-content/55 text-xs">{{ $t('currentProxyGroup') }}</span>
          <span class="truncate text-sm font-semibold">{{ currentGroupName }}</span>
          <span class="text-base-content/45 text-xs">{{ currentGroup?.type }}</span>
        </div>

        <section
          v-if="childStrategyGroups.length"
          class="mb-4"
        >
          <div class="text-base-content/60 mb-2 text-xs font-medium">
            {{ $t('childProxyGroups') }}
          </div>
          <div class="grid min-w-0 gap-2 md:grid-cols-2">
            <button
              v-for="name in childStrategyGroups"
              :key="name"
              class="border-base-300/70 bg-base-200 hover:bg-base-300 flex min-w-0 items-center gap-2 rounded-md border px-3 py-2 text-left transition-colors"
              :class="name === currentGroup?.now && 'ring-primary/70 ring-2 ring-offset-1 ring-offset-base-100'"
              @click="enterChildStrategyGroup(name)"
            >
              <span class="min-w-0 flex-1 truncate text-sm font-medium">{{ name }}</span>
              <span class="text-base-content/45 shrink-0 text-xs">{{ proxyMap[name]?.type }}</span>
              <ChevronRightIcon class="text-base-content/55 h-4 w-4 shrink-0" />
            </button>
          </div>
        </section>

        <section>
          <div class="text-base-content/60 mb-2 text-xs font-medium">
            {{ $t('proxyNodes') }}
          </div>
          <ProxyNodeGrid v-if="nodeProxies.length">
            <ProxyNodeCard
              v-for="node in nodeProxies"
              :key="node"
              :name="node"
              :group-name="currentGroupName"
              :active="node === currentGroup?.now"
              :auto-scroll-on-active="false"
              @click.stop="handlerProxySelect(currentGroupName, node)"
            />
          </ProxyNodeGrid>
          <div
            v-else
            class="text-base-content/55 bg-base-200/45 rounded-md px-3 py-2 text-sm"
          >
            {{ $t('noData') }}
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRenderProxyList } from '@/composables/renderProxies'
import { getChildProxyGroupNames, getDescendantProxyGroupNames } from '@/composables/proxyGroups'
import { findScrollableParent } from '@/helper/utils'
import { handlerProxySelect, proxyMap } from '@/store/proxies'
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ProxyNodeCard from './ProxyNodeCard.vue'
import ProxyNodeGrid from './ProxyNodeGrid.vue'

const props = defineProps<{
  groupName: string
}>()

const { t } = useI18n()
const sectionRef = ref<HTMLElement>()
const chainRef = ref<HTMLElement>()
const isExpanded = ref(false)
const fullPath = ref<string[]>([props.groupName])
const currentGroupName = ref(props.groupName)

const currentGroup = computed(() => proxyMap.value[currentGroupName.value])
const currentPathIndex = computed(() => fullPath.value.indexOf(currentGroupName.value))
const allProxies = computed(() => currentGroup.value?.all ?? [])
const { renderProxies } = useRenderProxyList(allProxies, currentGroupName.value)
const childStrategyGroups = computed(() => getChildProxyGroupNames(currentGroupName.value))
const nodeProxies = computed(() =>
  renderProxies.value.filter((name) => !childStrategyGroups.value.includes(name)),
)
const strategyChainGroupCount = computed(() => getDescendantProxyGroupNames(props.groupName).length)
const canOpenStrategyChain = computed(() => strategyChainGroupCount.value > 0)

const buttonLabel = computed(() => {
  if (!canOpenStrategyChain.value) {
    return t('noStrategyChainGroup')
  }

  return isExpanded.value
    ? t('collapseStrategyChain')
    : `${t('strategyChain')} ${strategyChainGroupCount.value}`
})

const getNextGroupName = (groupName: string) => {
  const group = proxyMap.value[groupName]
  const children = getChildProxyGroupNames(groupName)

  if (group?.now && children.includes(group.now)) {
    return group.now
  }

  return children[0] ?? ''
}

const buildDeepestPath = () => {
  const nextPath = [props.groupName]
  const visited = new Set(nextPath)
  let currentName = props.groupName

  while (true) {
    const nextName = getNextGroupName(currentName)

    if (!nextName || visited.has(nextName)) {
      break
    }

    nextPath.push(nextName)
    visited.add(nextName)
    currentName = nextName
  }

  return nextPath
}

const setFullPath = (nextPath: string[], currentName?: string) => {
  fullPath.value = nextPath.length ? nextPath : [props.groupName]
  currentGroupName.value = currentName ?? fullPath.value[fullPath.value.length - 1] ?? props.groupName
}

const forceScrollIntoCenter = (el: HTMLElement) => {
  const scrollableParent = findScrollableParent(el)

  if (!scrollableParent) {
    return
  }

  const parentRect = scrollableParent.getBoundingClientRect()
  const elRect = el.getBoundingClientRect()
  const offset = elRect.top - parentRect.top + scrollableParent.scrollTop
  const centerOffset = offset - scrollableParent.clientHeight / 2 + el.clientHeight / 2

  scrollableParent.scrollTo({
    top: centerOffset,
    behavior: 'smooth',
  })
}

const scrollToSection = async () => {
  await nextTick()
  await nextTick()

  const scrollTarget = chainRef.value ?? sectionRef.value

  if (scrollTarget) {
    forceScrollIntoCenter(scrollTarget)
  }
}

const toggleStrategyChain = async () => {
  if (!canOpenStrategyChain.value) {
    isExpanded.value = false
    return
  }

  isExpanded.value = !isExpanded.value

  if (isExpanded.value) {
    setFullPath(buildDeepestPath())
    await scrollToSection()
  }
}

const enterChildStrategyGroup = async (name: string) => {
  await handlerProxySelect(currentGroupName.value, name)
  setFullPath(buildDeepestPath())
  await scrollToSection()
}

const goParent = () => {
  if (currentPathIndex.value <= 0) {
    return
  }

  currentGroupName.value = fullPath.value[currentPathIndex.value - 1] ?? props.groupName
}

const goRoot = () => {
  currentGroupName.value = props.groupName
}

const openToChildStrategyGroup = async (name: string, options?: { selectParent?: boolean }) => {
  if (!getChildProxyGroupNames(props.groupName).includes(name)) {
    return false
  }

  if (options?.selectParent !== false) {
    await handlerProxySelect(props.groupName, name)
  }

  setFullPath(buildDeepestPath())
  isExpanded.value = true
  await scrollToSection()

  return true
}

const openToStrategyGroupInPath = async (name: string) => {
  const nextPath = buildDeepestPath()
  const targetIndex = nextPath.indexOf(name)

  if (targetIndex <= 0) {
    return false
  }

  setFullPath(nextPath, name)
  isExpanded.value = true
  await scrollToSection()

  return true
}

watch(
  () => props.groupName,
  (groupName) => {
    fullPath.value = [groupName]
    currentGroupName.value = groupName
    isExpanded.value = false
  },
)

watch(canOpenStrategyChain, (value) => {
  if (!value) {
    isExpanded.value = false
  }
})

defineExpose({
  openToChildStrategyGroup,
  openToStrategyGroupInPath,
})
</script>
