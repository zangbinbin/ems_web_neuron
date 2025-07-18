// -------------------------应用管理中导出点位专用处理方法-----------------------------
import { ref } from 'vue'
import { EmqxMessage } from '@emqx/emqx-ui'
import { useI18n } from 'vue-i18n'
import { exportExcelData } from '@/utils/exportPointExcel'
import { useTagTypeSelect, useTagAttributeTypeSelect } from './useAddTagCommon'
import type { TagData } from '@/types/config'
import { FILLER_IN_TAG_ATTR } from '@/utils/constants'

export default () => {
  const { t } = useI18n()
  const isExporting = ref(false)
  const { getAttrStrByValue } = useTagAttributeTypeSelect()
  const { findLabelByValue } = useTagTypeSelect()

  interface OriginalItem {
    name: string
    address?: string
    point?: string | undefined
    attribute: number | undefined
    type: number | null
    description: string
    valueRange: string
    precision?: number | undefined
    decimal?: number | null
    offset?: number | null
    value?: string | number | undefined
    deviceName: string
    group: string
  }

  interface ProcessedSheet {
    sheetName: string
    data: Array<{
      deviceName: string
      group: string
      name: string
      address?: string
      point?: string | undefined
      attribute: number | undefined
      type: number | null
      description: string
      valueRange: string
      precision?: number | undefined
      decimal?: number | null
      offset?: number | null
      value?: string | number | undefined
    }>
    merges: Array<{
      startRow: number
      startCol: number
      endRow: number
      endCol: number
    }>
  }

  const collator = new Intl.Collator(undefined, {
    numeric: true, // 启用数字识别
    sensitivity: 'base', // 忽略大小写差异
  })

  // when a filed is added to tag（refer to the `createRawTagForm` in useAddTag.ts）, sync here.
  const genExcelSheets = (data: OriginalItem[]) => {
    // 按group分组
    const grouped = data.reduce<Record<string, OriginalItem[]>>((acc, item) => {
      if (!acc[item.group]) acc[item.group] = []
      acc[item.group].push(item)
      return acc
    }, {})

    return Object.entries(grouped).map(([group, items]) => {
      // 1. 先按deviceName分组，再在每个分组内按point排序
      const deviceGroups = items.reduce<Record<string, OriginalItem[]>>((acc, item) => {
        if (!acc[item.deviceName]) acc[item.deviceName] = []
        acc[item.deviceName].push(item)
        return acc
      }, {})

      // 2. 对每个device分组内的数据按point排序
      const sortedDevices = Object.entries(deviceGroups).map(([device, items]) => {
        return items.sort((a, b) => {
          if (!a.point && !b.point) return 0
          if (!a.point) return 1
          if (!b.point) return -1
          return collator.compare(a.point, b.point)
        })
      })

      // 3. 将所有分组按第一个point值排序（保证整体有序）
      sortedDevices.sort((a, b) => {
        const aPoint = a[0]?.point || ''
        const bPoint = b[0]?.point || ''
        return collator.compare(aPoint, bPoint)
      })

      // 4. 扁平化数据并生成合并区域
      const finalData = sortedDevices.flat()
      const merges: ProcessedSheet['merges'] = []
      let mergeStart = 1 // Excel行号从1开始
      let currentDevice = finalData[0]?.deviceName

      for (let i = 1; i <= finalData.length; i++) {
        if (i === finalData.length || finalData[i].deviceName !== currentDevice) {
          if (i - mergeStart > 0) {
            merges.push({
              startRow: mergeStart,
              startCol: 0,
              endRow: i,
              endCol: 0,
            })
          }
          if (i < finalData.length) {
            currentDevice = finalData[i].deviceName
            mergeStart = i + 1
          }
        }
      }

      return {
        sheetName: group,
        data: finalData.map((item) => ({
          deviceName: item.deviceName,
          group: item.group,
          name: item.name,
          address: item.address,
          point: item.point ?? '',
          attribute: item.attribute ? getAttrStrByValue(item.attribute, FILLER_IN_TAG_ATTR) : '',
          type: item.type ? findLabelByValue(item.type) : '',
          description: item.description,
          valueRange: item.valueRange,
          precision: item.precision,
          decimal: item.decimal,
          offset: item.offset,
          value: item.value,
        })),
        merges,
      }
    })
  }

  const exportTable = async (tagList: Array<TagData>, nodeName: string) => {
    if (tagList.length === 0) {
      EmqxMessage.warning(t('common.emptyData'))
      return
    }
    isExporting.value = true

    const data = genExcelSheets(tagList as OriginalItem[])
    try {
      await exportExcelData(data, `${nodeName} tags`)
    } catch (error: any) {
      EmqxMessage.error(error.toString())
    } finally {
      isExporting.value = false
    }
  }

  return {
    exportTable,
    isExporting,
  }
}
