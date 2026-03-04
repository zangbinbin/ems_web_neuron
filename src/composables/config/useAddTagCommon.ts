import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { EmqxMessage } from '@emqx/emqx-ui'
import type { TagFormItem, TagForm, TagData } from '@/types/config'
import { TagType, TagAttributeType, TagQueueType } from '@/types/enums'
import { dataType, createRandomString } from '@/utils/utils'
import useWriteDataCheckNParse from '@/composables/data/useWriteDataCheckNParse'

export const useTagTypeSelect = () => {
  const tagTypeOptList = Object.keys(TagType)
    .filter((key) => typeof TagType[key as keyof typeof TagType] === 'string')
    .map((key) => ({
      value: Number(key),
      label: TagType[key as keyof typeof TagType],
    }))
  const findLabelByValue = (val: number) => tagTypeOptList.find(({ value }) => val === value)?.label || ''

  const findValueByLabel = (lab: TagType) => tagTypeOptList.find(({ label }) => label === lab)?.value || undefined

  return {
    tagTypeOptList,
    findLabelByValue,
    findValueByLabel,
  }
}

export const useTagAttributeTypeSelect = () => {
  const tagAttributeTypeOptList = Object.keys(TagAttributeType)
    .filter((key) => typeof TagAttributeType[key as keyof typeof TagAttributeType] === 'string')
    .map((key) => ({
      value: Number(key),
      label: TagAttributeType[key as keyof typeof TagAttributeType],
    }))

  /** Tag `attribute` possible value
   *  Options: 1, 2, 4, 8
   *  key-value: 'value' is selected values; 'key' is the cumulative of values;
   *  For example, 6: [2, 4], means that the the currently selected values are 2, 4, then the `key` is the sum of 2 and 4, i.e. 6.
   */
  const tagAttrValueMap = {
    1: [1],
    2: [2],
    3: [1, 2],
    4: [4],
    5: [1, 4],
    6: [2, 4],
    7: [1, 2, 4],
    8: [8],
    9: [1, 8],
    10: [2, 8],
    11: [1, 2, 8],
    12: [4, 8],
    13: [1, 4, 8],
    14: [2, 4, 8],
    15: [1, 2, 4, 8],
    17: [1, 16],
    18: [2, 16],
    19: [1, 2, 16],
    20: [4, 16],
    21: [1, 4, 16],
    22: [2, 4, 16],
    23: [1, 2, 4, 16],
    24: [8, 16],
    25: [1, 8, 16],
    26: [2, 8, 16],
    27: [1, 2, 8, 16],
    28: [4, 8, 16],
    29: [1, 4, 8, 16],
    30: [2, 4, 8, 16],
    31: [1, 2, 4, 8, 16],
    32: [32],
    33: [1, 32],
    34: [2, 32],
    35: [1, 2, 32],
    36: [4, 32],
    37: [1, 4, 32],
    38: [2, 4, 32],
    39: [1, 2, 4, 32],
    40: [8, 32],
    41: [1, 8, 32],
    42: [2, 8, 32],
    43: [1, 2, 8, 32],
    44: [4, 8, 32],
    45: [1, 4, 8, 32],
    46: [2, 4, 8, 32],
    47: [1, 2, 4, 8, 32],
    48: [16, 32],
    49: [1, 16, 32],
    50: [2, 16, 32],
    51: [1, 2, 16, 32],
    52: [4, 16, 32],
    53: [1, 4, 16, 32],
    54: [2, 4, 16, 32],
    55: [1, 2, 4, 16, 32],
    56: [8, 16, 32],
    57: [1, 8, 16, 32],
    58: [2, 8, 16, 32],
    59: [1, 2, 8, 16, 32],
    60: [4, 8, 16, 32],
    61: [1, 4, 8, 16, 32],
    62: [2, 4, 8, 16, 32],
    63: [1, 2, 4, 8, 16, 32],
    75: [1, 2, 8, 64],
    79: [1, 2, 4, 8, 64],
    91: [1, 2, 8, 16, 64],
    107: [1, 2, 8, 32, 64],
    95: [1, 2, 4, 8, 16, 64],
    111: [1, 2, 4, 8, 32, 64],
    123: [1, 2, 8, 16, 32, 64],
    127: [1, 2, 4, 8, 16, 32, 64],
  }

  const findLabelByValue = (val: number) => tagAttributeTypeOptList.find(({ value }) => val === value)?.label || ''
  const findValueByLabel = (lab: any) => tagAttributeTypeOptList.find(({ label }) => label === lab)?.value || undefined

  const getAttrStrByValue = (val: number, filler = ', ') => {
    const key = Number(Object.keys(tagAttrValueMap).find((total) => Number(total) === val))
    const valueArr = tagAttrValueMap[key as keyof typeof tagAttrValueMap]
    return valueArr.map((value) => findLabelByValue(value)).join(filler)
  }

  // "Write Subscribe" to 5
  const getTotalValueByStr = (str: string, separator: string): number | undefined => {
    try {
      if (!str) {
        return undefined
      }
      const labelArr = str.split(separator)
      let ret = 0
      let currentValue: number | undefined = 0
      for (const label of labelArr) {
        currentValue = findValueByLabel(label)
        if (!currentValue) {
          return undefined
        }
        ret += currentValue
      }
      return ret
    } catch (error) {
      return undefined
    }
  }

  // attr values is include the attr value
  const isAttrsIncludeTheValue = (value: number | undefined, attr: number) => {
    if (!value || !attr) return false

    const key = Object.keys(tagAttrValueMap).find((total) => {
      return Number(total) === value
    })
    const attrValues = tagAttrValueMap[Number(key) as keyof typeof tagAttrValueMap]

    return attrValues?.includes(attr)
  }

  return {
    tagAttributeTypeOptList,
    tagAttrValueMap,
    getAttrStrByValue,
    findLabelByValue,
    getTotalValueByStr,
    isAttrsIncludeTheValue,
  }
}

export const useTagQueueTypeSelect = () => {
  const tagQueueTypeOptList = Object.keys(TagQueueType)
    .filter((key) => typeof TagQueueType[key as keyof typeof TagQueueType] === 'string')
    .map((key) => ({
      value: Number(key),
      label: TagQueueType[key as keyof typeof TagQueueType],
    }))

  const tagQueueValueMap: Record<number, number[]> = {
    0: [],
    1: [1], // Alarm
    2: [2], // Strategy
    3: [1, 2], // Alarm + Strategy
    4: [4], // Corectl
    5: [1, 4], // Alarm + Corectl
    6: [2, 4], // Strategy + Corectl
    7: [1, 2, 4], // Alarm + Strategy + Corectl
  }

  const findLabelByValue = (val: number) => tagQueueTypeOptList.find(({ value }) => val === value)?.label || ''
  const findValueByLabel = (lab: any) => tagQueueTypeOptList.find(({ label }) => label === lab)?.value || null

  const getQueueStrByValue = (val: number, filler = ', ') => {
    const key = Number(Object.keys(tagQueueValueMap).find((total) => Number(total) === val))
    const valueArr: number[] = tagQueueValueMap[key as keyof typeof tagQueueValueMap]
    return valueArr.map((value) => findLabelByValue(value)).join(filler)
  }

  const getTotalQueueByStr = (str: string, separator: string): number | null => {
    try {
      if (!str) {
        return null
      }
      const labelArr = str.split(separator)
      let ret = 0
      let currentValue: number | null
      for (const label of labelArr) {
        currentValue = findValueByLabel(label)
        if (!currentValue) {
          return null
        }
        ret += currentValue
      }
      return ret
    } catch (error) {
      return null
    }
  }

  const isQueuesIncludeTheValue = (value: number | undefined, queue: number) => {
    if (!value || !queue) return false

    const key = Object.keys(tagQueueValueMap).find((total) => {
      return Number(total) === value
    })
    const queueValues: number[] = tagQueueValueMap[Number(key) as keyof typeof tagQueueValueMap]

    return queueValues?.includes(queue)
  }

  return {
    tagQueueTypeOptList,
    tagQueueValueMap,
    getQueueStrByValue,
    findLabelByValue,
    getTotalQueueByStr,
    isQueuesIncludeTheValue,
  }
}

export const useTagPrecision = () => {
  const isShowPrecisionField = computed(() => (type: number | null) => {
    if (type === null || type === undefined) return false

    const whiteList = [9, 10] // FLOAT | DOUBLE
    const res: boolean = whiteList.includes(type)
    return res
  })

  const tagPrecisionValue = computed(() => (type: number, value: number) => {
    if (!isShowPrecisionField.value(type)) {
      return '-'
    }
    return !value ? '-' : value
  })

  return {
    isShowPrecisionField,
    tagPrecisionValue,
  }
}

export const useTagDecimal = () => {
  const tagDecimalValue = computed(() => (value: number) => {
    if (!value) {
      return '-'
    }
    return value
  })

  return {
    tagDecimalValue,
  }
}
export const createTagForm = () => {
  const createRawTagForm = (): TagFormItem => ({
    name: '',
    address: '',
    attribute: undefined,
    queue: null,
    type: null,
    // for the key when use v-for
    id: createRandomString(6),
    decimal: undefined,
    offset: undefined,
    description: '',
    valueRange: '',
    read_script: '',
    write_script: '',
    forward_script: '',
    threshold: undefined,
    precision: undefined,
    value: undefined,
  })

  return {
    createRawTagForm,
  }
}

export const useHandleTagValue = () => {
  const { parseWriteData } = useWriteDataCheckNParse()

  const handleTagValue = (tag: TagForm | TagData) => {
    const { type, value } = tag

    if (value !== undefined && value !== null) {
      /** let it go, when the tags value use hexadecimal, , and sync useAddTag.ts
       * const newValue = isUseHexadecimal.value ? await transToDecimal({ ...tagData, value } as TagDataInTable): value
       */
      tag.value = parseWriteData(Number(type), String(value))
    }
    return tag
  }

  return {
    handleTagValue,
  }
}

export default () => {
  const route = useRoute()
  const { t } = useI18n()

  const { handleTagValue } = useHandleTagValue()
  const groupName = computed(() => route.params.group as string)

  const sliceTagList = (list: TagFormItem[], errIndex: number) => {
    const newList = list.slice(errIndex)
    return newList
  }

  const handleValidTagFormError = (error: any) => {
    let errorRows: string[] = []

    const errorData = error || {}
    if (dataType(errorData) === 'object') {
      const keys = Object.keys(errorData)
      keys.forEach((field: string) => {
        const fieldSplit = field.split('.')
        if (
          fieldSplit &&
          fieldSplit[1] &&
          dataType(Number(fieldSplit[1])) === 'number' &&
          !errorRows.includes(fieldSplit[1])
        ) {
          errorRows.push(fieldSplit[1])
        }
      })
    }

    errorRows = errorRows.sort()
    const errorRow = errorRows[0]
    if (errorRow) {
      EmqxMessage.error(t('config.tableRowDataError', { rowNum: Number(errorRow) + 1 }))
    }
  }

  const parseTagData = async (tagList: TagFormItem[]): Promise<TagForm[]> => {
    const tags: TagForm[] = tagList.map(({ id, ...tagData }) => {
      const data = handleTagValue(tagData)
      return data
    })
    return tags
  }

  return {
    groupName,
    sliceTagList,
    parseTagData,
    handleValidTagFormError,
  }
}
