<template>
  <div class="flex flex-1 items-center gap-1 truncate">
    <template v-if="proxyGroup.now">
      <Component
        class="h-4 w-4 shrink-0 outline-none"
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
            class="text-base-content/45 h-3.5 w-3.5 shrink-0"
          />
          <ProxyName
            v-if="item.kind === 'group'"
            :name="item.name"
            class="text-base-content/80 hover:bg-base-300 hover:-mx-1 min-w-0 hover:rounded-lg hover:px-1 hover:shadow text-xs md:text-sm"
            @click="handlerClickChainItem($event, item)"
          />
          <ProxyName
            v-else-if="item.kind === 'node'"
            :name="item.name"
            class="text-base-content/70 min-w-0 text-xs md:text-sm"
          />
          <button
            v-else
            class="text-base-content/55 hover:bg-base-300 rounded px-1 text-xs"
            @click="handlerClickExpandChain"
          >
            ...
          </button>
        </template>
      </div>
      <button
        v-if="deepestGroupName"
        class="hover:bg-base-300 -mr-1 rounded-md p-0.5"
        @click="handlerClickExpandChain"
      >
        <ChevronDownIcon class="text-base-content/60 h-4 w-4" />
      </button>
    </template>
    <template v-else-if="proxyGroup.type.toLowerCase() === PROXY_TYPE.LoadBalance">
      <CheckCircleIcon class="h-4 w-4 shrink-0" />
      <span class="text-base-content/80 text-xs md:text-sm">
        {{ $t('loadBalance') }}
      </span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { PROXY_TYPE } from '@/constant'
import { useTooltip } from '@/helper/tooltip'
import { scrollToGroup } from '@/helper/utils'
import { getProxyGroupChains, proxyGroupList, proxyMap } from '@/store/proxies'
import {
  ArrowRightCircleIcon,
  CheckCircleIcon,
  ChevronDownIcon,
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

const emit = defineEmits<{
  'chain-click': [groupName: string]
}>()

const props = defineProps<{
  name: string
  mobile?: boolean
  chainClickMode?: 'scroll' | 'strategy-chain'
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

const selectedChain = computed(() => {
  const groupChain = getProxyGroupChains(props.name)
  const chain = groupChain.length > 1 ? groupChain.slice(1) : []
  const deepestGroupName = groupChain[groupChain.length - 1] ?? props.name
  const selectedName = proxyMap.value[deepestGroupName]?.now

  if (selectedName && !proxyGroupList.value.includes(selectedName)) {
    chain.push(selectedName)
  }

  return chain
})

const displayChain = computed<ChainItem[]>(() => {
  if (selectedChain.value.length <= 3) {
    return selectedChain.value.map((name) => ({
      name,
      kind: proxyGroupList.value.includes(name) ? 'group' : 'node',
    }))
  }

  return [
    {
      name: selectedChain.value[0],
      kind: proxyGroupList.value.includes(selectedChain.value[0]) ? 'group' : 'node',
    },
    {
      name: '...',
      kind: 'ellipsis',
    },
    {
      name: selectedChain.value[selectedChain.value.length - 1],
      kind: proxyGroupList.value.includes(selectedChain.value[selectedChain.value.length - 1])
        ? 'group'
        : 'node',
    },
  ]
})

const deepestGroupName = computed(() => {
  const groupChain = getProxyGroupChains(props.name)
  return groupChain.length > 1 ? groupChain[groupChain.length - 1] : ''
})
const chainTitle = computed(() => selectedChain.value.join(' > '))

const handlerClickChainItem = (e: Event, item: ChainItem) => {
  if (item.kind === 'group') {
    e.stopPropagation()

    if (props.chainClickMode === 'strategy-chain') {
      emit('chain-click', item.name)
      return
    }

    scrollToGroup(item.name)
  }
}

const handlerClickExpandChain = (e: Event) => {
  e.stopPropagation()

  if (!deepestGroupName.value) {
    return
  }

  if (props.chainClickMode === 'strategy-chain') {
    emit('chain-click', deepestGroupName.value)
    return
  }

  scrollToGroup(deepestGroupName.value)
}
</script>
