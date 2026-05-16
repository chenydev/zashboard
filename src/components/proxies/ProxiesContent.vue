<script setup lang="ts">
import { useCalculateMaxProxies } from '@/composables/proxiesScroll'
import { handlerProxySelect } from '@/store/proxies'
import { computed } from 'vue'
import ProxyNodeCard from './ProxyNodeCard.vue'
import ProxyNodeGrid from './ProxyNodeGrid.vue'

const emit = defineEmits<{
  select: [nodeName: string]
}>()

const props = defineProps<{
  name: string
  now?: string
  renderProxies: string[]
  highlightedName?: string
}>()

const { maxProxies } = useCalculateMaxProxies(
  props.renderProxies.length,
  props.renderProxies.indexOf(props.now ?? ''),
)
const proxies = computed(() => props.renderProxies.slice(0, maxProxies.value))

const selectProxy = (nodeName: string) => {
  emit('select', nodeName)
  handlerProxySelect(props.name, nodeName)
}
</script>

<template>
  <ProxyNodeGrid>
    <ProxyNodeCard
      v-for="node in proxies"
      :key="node"
      :name="node"
      :group-name="name"
      :active="node === now"
      :highlighted="node === highlightedName"
      @click.stop="selectProxy(node)"
    />
  </ProxyNodeGrid>
</template>
