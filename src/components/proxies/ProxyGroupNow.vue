<template>
  <div class="flex flex-1 items-center gap-1 truncate">
    <template v-if="proxyGroup.now">
      <Component
        class="text-base-content/40 h-3.5 w-3.5 shrink-0 outline-none"
        :is="isFixed ? LockClosedIcon : ArrowRightCircleIcon"
        @mouseenter="tipForFixed"
      />
      <div
        class="flex min-w-0 flex-1 items-center gap-1 truncate"
        :title="chainTitle"
      >
        <template
          v-for="(item, index) in displayChain"
          :key="`${item.name}-${index}`"
        >
          <ChevronRightIcon
            v-if="index > 0"
            class="text-base-content/40 h-3 w-3 shrink-0"
          />
          <ProxyName
            v-if="item.kind === 'group'"
            :name="item.name"
            class="text-base-content hover:bg-base-300 min-w-0 text-xs font-medium hover:-mx-1 hover:rounded-lg hover:px-1 hover:shadow md:text-sm"
            @click="handlerClickChainGroup($event, item.name)"
          />
          <ProxyName
            v-else-if="item.kind === 'node'"
            :name="item.name"
            class="text-base-content/70 min-w-0 text-xs font-medium md:text-sm"
          />
          <button
            v-else
            class="text-base-content/55 hover:bg-base-300 rounded px-1 text-xs"
            @click.stop="handlerClickExpand"
          >
            ...
          </button>
        </template>
      </div>
      <button
        v-if="canOpenChain"
        class="hover:bg-base-300 -mr-1 shrink-0 rounded-md p-0.5"
        :title="$t('strategyChain')"
        @click.stop="handlerClickExpand"
      >
        <ArrowsPointingOutIcon class="text-base-content/55 h-3.5 w-3.5" />
      </button>
    </template>
    <template v-else-if="proxyGroup.type.toLowerCase() === PROXY_TYPE.LoadBalance">
      <CheckCircleIcon class="text-base-content/40 h-3.5 w-3.5 shrink-0" />
      <span class="text-base-content text-xs font-medium md:text-sm">
        {{ $t('loadBalance') }}
      </span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { getProxyGroupChains, proxyGroupList, proxyMap } from '@/assembly/proxies'
import { hasStrategyChain, openStrategyChain } from '@/composables/proxyGroups'
import { PROXY_TYPE } from '@/constant'
import { useTooltip } from '@/helper/tooltip'
import { displayFinalOutbound } from '@/store/settings'
import {
  ArrowRightCircleIcon,
  ArrowsPointingOutIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  LockClosedIcon,
} from '@heroicons/vue/24/outline'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ProxyName from './ProxyName.vue'

type ChainItem = {
  name: string
  kind: 'group' | 'node' | 'ellipsis'
}

const props = defineProps<{
  name: string
  mobile?: boolean
}>()
const proxyGroup = computed(() => proxyMap.value[props.name])
const { showTip } = useTooltip()
const { t } = useI18n()

const isFixed = computed(() => {
  return proxyGroup.value.fixed === proxyGroup.value.now
})

const tipForFixed = (e: Event) => {
  if (!isFixed.value) {
    return
  }

  showTip(e, t('tipForFixed', { type: proxyGroup.value.type }), {
    delay: [500, 0],
  })
}

// 结构上是否存在子策略组(决定是否显示展开按钮),与当前是否选中无关。
const canOpenChain = computed(() => hasStrategyChain(props.name))

// 当前已选链路名称序列:子组链 + 末端节点(末端受 displayFinalOutbound 控制)。
const chainNames = computed(() => {
  const groupChain = getProxyGroupChains(props.name)
  const groups = groupChain.slice(1)
  const deepest = groupChain[groupChain.length - 1] ?? props.name
  const terminal = proxyMap.value[deepest]?.now
  const terminalNode = terminal && !proxyGroupList.value.includes(terminal) ? terminal : ''

  // 直接选中节点(无子组链):仅显示该节点。
  if (!groups.length) {
    return terminalNode ? [terminalNode] : proxyGroup.value.now ? [proxyGroup.value.now] : []
  }

  const names = [...groups]
  if (terminalNode && displayFinalOutbound.value) {
    names.push(terminalNode)
  }
  return names
})

const toItem = (name: string): ChainItem => ({
  name,
  kind: proxyGroupList.value.includes(name) ? 'group' : 'node',
})

// 长链压缩:首项 + 省略号 + 末项,完整链路见 title。
const displayChain = computed<ChainItem[]>(() => {
  const names = chainNames.value

  if (names.length <= 3) {
    return names.map(toItem)
  }

  return [toItem(names[0]), { name: '...', kind: 'ellipsis' }, toItem(names[names.length - 1])]
})

const chainTitle = computed(() => chainNames.value.join(' > '))

const handlerClickChainGroup = (e: Event, name: string) => {
  e.stopPropagation()
  openStrategyChain(props.name, name)
}

const handlerClickExpand = (e: Event) => {
  e.stopPropagation()
  openStrategyChain(props.name)
}
</script>
