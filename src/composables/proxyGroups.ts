import { proxyGroupList, proxyMap } from '@/assembly/proxies'
import { ref } from 'vue'

// 取某组直接包含的子策略组(成员中是组的)。
export const getChildProxyGroupNames = (name: string, groupSet = new Set(proxyGroupList.value)) => {
  const proxyGroup = proxyMap.value[name]

  if (!proxyGroup?.all?.length) {
    return []
  }

  return proxyGroup.all.filter((member) => groupSet.has(member))
}

// 取某组所有后代策略组(递归,去环)。
export const getDescendantProxyGroupNames = (name: string) => {
  const descendants: string[] = []
  const visited = new Set<string>()

  const walk = (groupName: string) => {
    if (visited.has(groupName)) {
      return
    }

    visited.add(groupName)

    getChildProxyGroupNames(groupName).forEach((childName) => {
      descendants.push(childName)
      walk(childName)
    })
  }

  walk(name)

  return descendants
}

// 结构上是否存在子策略组(决定卡片是否显示展开链按钮)。
export const hasStrategyChain = (groupName: string) => getChildProxyGroupNames(groupName).length > 0

// ---------- 策略链模态(页面级单实例)----------
// 链式穿透用模态钻取,避免内联面板与卡片列表抢滚动。
// strategyChainTarget 非空即打开;strategyChainFocus 指定首焦层(默认最深选中层)。
export const strategyChainTarget = ref('')
export const strategyChainFocus = ref('')

export const openStrategyChain = (groupName: string, focusGroup = '') => {
  strategyChainFocus.value = focusGroup
  strategyChainTarget.value = groupName
}

export const closeStrategyChain = () => {
  strategyChainTarget.value = ''
  strategyChainFocus.value = ''
}
