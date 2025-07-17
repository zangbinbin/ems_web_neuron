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

  interface DeviceMapValue {
    firstIndex: number
    count: number
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

  // when a filed is added to tag（refer to the `createRawTagForm` in useAddTag.ts）, sync here.
  const genExcelSheets = (data: OriginalItem[]) => {
    // 处理excel数据格式
    // 按group分组,划分sheet页
    const grouped = data.reduce<Record<string, OriginalItem[]>>((acc, item) => {
      if (!acc[item.group]) {
        acc[item.group] = []
      }
      acc[item.group].push(item)
      return acc
    }, {})

    // 按照deviceName处理单元格合并
    return Object.entries(grouped).map(([group, items]) => {
      // 按deviceName排序
      items.sort((a, b) => a.deviceName.localeCompare(b.deviceName))

      // 计算合并区域
      const merges: ProcessedSheet['merges'] = []
      const deviceMap: Record<string, DeviceMapValue> = {}

      items.forEach((item, index) => {
        if (!deviceMap[item.deviceName]) {
          deviceMap[item.deviceName] = {
            firstIndex: index + 1,
            count: 1,
          }
        } else {
          deviceMap[item.deviceName].count += 1
        }
      })
      // 处理单元格合并
      Object.values(deviceMap).forEach((device) => {
        if (device.count > 1) {
          merges.push({
            startRow: device.firstIndex,
            startCol: 0,
            endRow: device.firstIndex + device.count - 1,
            endCol: 0,
          })
        }
      })
      // 返回excel数据
      return {
        sheetName: group,
        data: items.map((item) => ({
          deviceName: item.deviceName,
          group: item.group,
          name: item.name,
          address: item.address,
          point: item.point,
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
