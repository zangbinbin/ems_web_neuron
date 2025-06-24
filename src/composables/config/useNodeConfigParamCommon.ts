import i18n from '@/i18n/index'
import type { ParamInfo } from '@/types/config'
import { dataType } from '@/utils/utils'
import { TypeOfPluginParam, SchameBase } from '@/types/enums'
import useLang from '@/composables/useLang'
import { HEXADECIMAL_PREFIX } from '@/utils/constants'
import { HEXADECIMAL_REGEX, LOWERCASE_INITIAL_REGEX } from '@/utils/regexps'
import { transIntHexToDecimalNum, transPositiveIntegerToHex } from '@/composables/data/convert'

export default () => {
  const { i18nContent } = useLang()

  interface Field {
    key: string
    info: ParamInfo
  }
  const shouldFieldShow = (fieldData: Field, formData: Record<string, any>) => {
    const { key } = fieldData

    const whiteList = ['tag_regex', 'group_interval']
    if (whiteList.includes(key)) return false

    if (!fieldData?.info?.condition) {
      if (!fieldData?.info?.condition_arr) {
        return true
      }
      let res = true
      const condition_list = fieldData.info.condition_arr
      condition_list.forEach((item: any) => {
        const { field, regex, value, values = [], operator } = item
        const fieldValue = formData[field]

        let res_once = true

        if (regex) {
          const regexExpression = new RegExp(regex)
          res_once = regexExpression.test(fieldValue)
        } else {
          const emptyEnums = ['undefined', 'null']

          // 判断 value 和 values 是否为空值
          const isValueEmpty = emptyEnums.includes(String(value))
          const isValuesEmpty = emptyEnums.includes(String(values))

          if (!isValueEmpty) {
            res_once = fieldValue === value
          } else if (!isValuesEmpty && Array.isArray(values)) {
            res_once = values.includes(fieldValue)
          }

          if (operator === '||') {
            res = res || res_once
          } else if (operator === '&&') {
            res = res && res_once
          } else {
            res = res && res_once
          }
        }
      })
      return res
    }

    const { field, regex, value, values = [] } = fieldData.info.condition
    const fieldValue = formData[field]

    if (regex) {
      const regexExpression = new RegExp(regex)
      return regexExpression.test(fieldValue)
    }

    let res = true
    const emptyEnums = ['undefined', 'null']
    const emptyValue = emptyEnums.includes(String(dataType(value)))
    const emptyValues = emptyEnums.includes(String(dataType(values)))
    if (!emptyValue) {
      res = fieldValue === value
    } else if (!emptyValues) {
      res = values.includes(fieldValue)
    }

    return res
  }

  const initParamDefaultValueByType = (type: TypeOfPluginParam) => {
    const initValueMap = {
      [TypeOfPluginParam.Float]: null,
      [TypeOfPluginParam.Int]: null,
      [TypeOfPluginParam.String]: '',
      [TypeOfPluginParam.Boolean]: null,
      [TypeOfPluginParam.Boolint]: null,
      [TypeOfPluginParam.Enum]: '',
      [TypeOfPluginParam.Map]: '',
      [TypeOfPluginParam.Array]: [],
      [TypeOfPluginParam.File]: '',
      [TypeOfPluginParam.TimeRange]: '',
      [TypeOfPluginParam.MonthDayRange]: '',
      [TypeOfPluginParam.TimeSelect]: '',
      [TypeOfPluginParam.NameMap]: '',
    }
    return initValueMap[type] === undefined ? '' : initValueMap[type]
  }

  const upperFirstLetter = (str: string) => {
    if (str.startsWith('$') && str.indexOf('.')) {
      return i18n.global.t(str.split('$')[1])
    }
    if (LOWERCASE_INITIAL_REGEX.test(str)) {
      return str.slice(0, 1).toUpperCase() + str.slice(1)
    }
    return str
  }

  const showLabel = (field: ParamInfo) => {
    const label = i18nContent(field, 'name')
    return upperFirstLetter(label)
  }

  const isFloatValue = (param: ParamInfo) => {
    return param.type === TypeOfPluginParam.Float
  }

  const isParamHexadecimalBase = (param: ParamInfo) => {
    return param.type === TypeOfPluginParam.Int && param?.base === SchameBase.hexadecimal
  }

  const isArrayValue = (param: ParamInfo) => {
    return param.type === TypeOfPluginParam.Array
  }

  const checkHexadecimalValue = (value: string | number) => {
    if (value === undefined || value === null) return false

    const str = value.toString().replace(/\s/g, '')
    const trueVlue =
      str.slice(0, HEXADECIMAL_PREFIX.length).toLowerCase() === HEXADECIMAL_PREFIX ? str : HEXADECIMAL_PREFIX + str
    const isHexadecimalValue = HEXADECIMAL_REGEX.test(trueVlue)
    return isHexadecimalValue
  }

  const transToHexadecimal = (value: string) => {
    return `${HEXADECIMAL_PREFIX}${transPositiveIntegerToHex(value)}`
  }

  // transe to Decimal
  const transToDecimal = (value: string) => {
    const str =
      value.slice(0, HEXADECIMAL_PREFIX.length).toLowerCase() === HEXADECIMAL_PREFIX
        ? value
        : HEXADECIMAL_PREFIX + value

    if (!checkHexadecimalValue(str)) return value

    const hexStr = str.slice(HEXADECIMAL_PREFIX.length)
    return transIntHexToDecimalNum(hexStr)
  }

  return {
    shouldFieldShow,
    initParamDefaultValueByType,
    upperFirstLetter,
    showLabel,

    checkHexadecimalValue,
    isFloatValue,
    isParamHexadecimalBase,
    isArrayValue,
    transToDecimal,
    transToHexadecimal,
  }
}
