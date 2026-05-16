import { GLOBAL, PROXY_TAB_TYPE } from '@/constant'
import { isHiddenGroup } from '@/helper'
import { proxyGroupList, proxyMap, proxyProviederList } from '@/store/proxies'
import { manageHiddenGroup } from '@/store/settings'
import { computed } from 'vue'

export const getChildProxyGroupNames = (name: string, groupSet = new Set(proxyGroupList.value)) => {
  const proxyGroup = proxyMap.value[name]

  if (!proxyGroup?.all?.length) {
    return []
  }

  return proxyGroup.all.filter((member) => groupSet.has(member))
}

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

const referencedProxyGroupNames = computed(() => {
  const referenced = new Set<string>()
  const groupSet = new Set(proxyGroupList.value)

  proxyGroupList.value.forEach((name) => {
    getChildProxyGroupNames(name, groupSet).forEach((childName) => {
      referenced.add(childName)
    })
  })

  return referenced
})

export const policyGroupNames = computed(() =>
  proxyGroupList.value.filter((name) => !referencedProxyGroupNames.value.has(name)),
)

export const nodeGroupNames = computed(() =>
  proxyGroupList.value.filter((name) => referencedProxyGroupNames.value.has(name)),
)

const getCountableProxyGroupNames = (names: string[]) => {
  if (manageHiddenGroup.value) {
    return names
  }

  return names.filter((name) => !isHiddenGroup(name))
}

export const proxyTabsWithCounts = computed(() => [
  {
    type: PROXY_TAB_TYPE.POLICY,
    count:
      getCountableProxyGroupNames(policyGroupNames.value).length +
      getCountableProxyGroupNames(proxyMap.value[GLOBAL] ? [GLOBAL] : []).length,
  },
  {
    type: PROXY_TAB_TYPE.NODE,
    count: getCountableProxyGroupNames(nodeGroupNames.value).length,
  },
  {
    type: PROXY_TAB_TYPE.PROVIDER,
    count: proxyProviederList.value.length,
  },
])
