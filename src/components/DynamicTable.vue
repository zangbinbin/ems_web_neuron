<template>
  <el-form ref="dynamicTableRef" :model="formData">
    <el-table :data="formData.list" style="width: 100%" stripe>
      <template v-for="(field, index) in allFields" :key="index">
        <el-table-column :min-width="getTableItemWidth(field)">
          <!-- header -->
          <template #header>
            <span>{{ showLabel(field) }}</span>
            <el-popover
              v-if="field.description"
              placement="top-start"
              :width="300"
              trigger="hover"
              :content="i18nContent(field, 'description')"
            >
              <template #reference>
                <i class="iconfont iconalarm" />
              </template>
            </el-popover>
          </template>

          <!-- content -->
          <template #default="{ row, $index }">
            <el-form-item
              v-if="isShowField(field, row, $index)"
              :prop="`list.${$index}.${fieldName(field.name)}`"
              :rules="getRules(field)"
            >
              <!-- Float -->
              <emqx-input
                v-if="field.type === TypeOfPluginParam.Float"
                v-model.trim="row[fieldName(field.name)]"
                @change="handleChange"
              />

              <!-- Number -->
              <emqx-input
                v-if="field.type === TypeOfPluginParam.Int"
                v-model.number="row[fieldName(field.name)]"
                type="number"
                @change="handleChange"
              />

              <!-- String -->
              <emqx-input
                v-else-if="field.type === TypeOfPluginParam.String"
                v-model.trim="row[fieldName(field.name)]"
                @change="handleChange"
              />

              <!-- TimeSelect -->
              <el-time-picker
                style="width: 130px"
                v-else-if="field.type === TypeOfPluginParam.TimeSelect"
                v-model="row[fieldTimeRangeName(field.name)]"
                format="HH时:mm分"
                value-format="HH:mm"
                :placeholder="$t('common.time')"
              >
              </el-time-picker>

              <!-- TimeRange -->
              <el-time-picker
                v-else-if="field.type === TypeOfPluginParam.TimeRange"
                v-model="row[fieldTimeRangeName(field.name)]"
                is-range
                size="small"
                format="HH时:mm分"
                value-format="HH:mm"
                arrow-control
                range-separator="-"
                :start-placeholder="$t('common.startTime')"
                :end-placeholder="$t('common.endTime')"
                @change="handleChange"
              />

              <!-- MonthDayRange -->
              <el-date-picker
                v-else-if="field.type === TypeOfPluginParam.MonthDayRange"
                v-model="row[fieldName(field.name)]"
                size="small"
                value-format="MM:DD"
                range-separator="-"
                format="MM:DD"
                :start-placeholder="$t('common.startDate')"
                :end-placeholder="$t('common.endDate')"
                type="daterange"
                @change="handleChange"
              />

              <!-- Boolean -->
              <emqx-radio-group
                v-else-if="field.type === TypeOfPluginParam.Boolean"
                v-model="row[fieldName(field.name)]"
                @change="handleChange"
              >
                <emqx-radio :label="true">True</emqx-radio>
                <emqx-radio :label="false">False</emqx-radio>
              </emqx-radio-group>

              <!-- Boolint -->
              <emqx-radio-group
                v-else-if="field.type === TypeOfPluginParam.Boolint"
                v-model="row[fieldName(field.name)]"
                @change="handleChange"
              >
                <emqx-radio :label="1">True</emqx-radio>
                <emqx-radio :label="0">False</emqx-radio>
              </emqx-radio-group>

              <!-- Map -->
              <template v-else-if="field.type === TypeOfPluginParam.Map">
                <emqx-radio-group
                  v-if="field.valid.map.length < 3"
                  v-model="row[fieldName(field.name)]"
                  @change="handleChange"
                >
                  <emqx-radio v-for="{ key, value } in field.valid.map" :key="value" :label="value">
                    {{ upperFirstLetter(key) }}
                  </emqx-radio>
                </emqx-radio-group>
                <emqx-select
                  v-else
                  v-model="row[fieldName(field.name)]"
                  @change="handleChange"
                  :placeholder="$t('common.pleaseSelect')"
                >
                  <emqx-option
                    v-for="{ key, value } in field.valid.map"
                    :key="value"
                    :value="value"
                    :label="upperFirstLetter(key)"
                  />
                </emqx-select>
              </template>
            </el-form-item>
            <el-form-item v-else>
              <span>-</span>
            </el-form-item>
          </template>
        </el-table-column>
      </template>
      <el-table-column :label="$t('common.oper')" fixed="right" min-width="100">
        <template #default="{ $index }">
          <emqx-button
            type="danger"
            size="mini"
            :disabled="range.min && $index < range.min && formData.list.length === range.min"
            @click="deleteItem($index)"
          >
            {{ $t('common.delete') }}
          </emqx-button>
        </template>
      </el-table-column>
    </el-table>
    <emqx-button
      class="btn-add"
      size="small"
      :disabled="range.max && formData.list.length >= range.max"
      @click="addItem"
    >
      <i class="iconfont iconcreate" />
      <span>{{ $t('common.add') }}</span>
    </emqx-button>
  </el-form>
</template>

<script lang="ts" setup>
import { cloneDeep } from 'lodash'
import { watchEffect, ref, defineProps, defineEmits, computed, defineExpose } from 'vue'
import type { PropType } from 'vue'
import { ElForm, ElTable, ElFormItem, ElTableColumn, ElPopover, ElTimePicker, ElDatePicker } from 'element-plus'
import type { ParamInfo } from '@/types/config'
import { TypeOfPluginParam } from '@/types/enums'
import useLang from '@/composables/useLang'
import useNodeConfigParamCommon from '@/composables/config/useNodeConfigParamCommon'
import useNodeConfigParamItem from '@/composables/config/useNodeConfigParamItem'
import { dataType } from '@/utils/utils'

const props = defineProps({
  modelValue: { type: Array as PropType<Record<string, any>[]>, default: () => [] },
  fields: { type: [Array, Object], default: () => [], requied: true },
  range: {
    type: Object as PropType<{ min: number | undefined | null; max: number | undefined | null }>,
    default: () => {
      return { min: null, max: null }
    },
    requied: true,
  },
})
const emits = defineEmits(['update:modelValue', 'validateFileds'])

const { i18nContent } = useLang()
const { shouldFieldShow, initParamDefaultValueByType, upperFirstLetter, showLabel } = useNodeConfigParamCommon()

const dynamicTableRef = ref()

const allFields = computed(() => {
  const fieldType = dataType(props.fields)
  let list = props.fields || []
  if (fieldType === 'object') {
    list = Object.values(props.fields)
  }
  return list
})

// filed name
const fieldName = computed(() => (name: string) => {
  return name.toLocaleLowerCase().replaceAll(' ', '_')
})

// filed time range name
const fieldTimeRangeName = computed(() => (name: string) => {
  return name.toLocaleLowerCase().replaceAll(' ', '')
})

interface FormInfo {
  list: Array<any>
}
const formData = computed({
  get: () => {
    const list = initData(props.modelValue)
    return { list }
  },
  set: (val: FormInfo) => {
    emits('update:modelValue', val.list)
  },
})

// If the fields doesn't includes the key in a row or a value in a row is undefined | null , set its the default value by type of key
const initDefaultValue = (rowData: Record<string, any>) => {
  const newRowData = rowData

  const rowDataKeys = Object.keys(newRowData)
  allFields.value.forEach((field: ParamInfo) => {
    const { name, type } = field
    const key = fieldName.value(name)
    const isExistKey = rowDataKeys.includes(key)
    const isEmptyValue = ['undefined', 'null'].includes(String(dataType(newRowData[key])))
    if (!isExistKey || isEmptyValue) {
      newRowData[key] = initParamDefaultValueByType(type)
    }
  })

  return newRowData
}
const initData = (data: Array<Record<string, any>>) => {
  let list
  if (!Array.isArray(data)) {
    let parsedData = data.toString()
    while (typeof parsedData === 'string') {
      parsedData = JSON.parse(parsedData)
    }
    if (!Array.isArray(parsedData)) {
      return []
    }
    list = parsedData
  } else {
    list = data
  }

  const newList = list.map((item: Record<string, any>) => {
    const newItem = initDefaultValue(item)
    return newItem
  })
  return newList
}

const isShowField = (field: ParamInfo, rowData: Record<string, any>, $index: number) => {
  const key = fieldName.value(field.name)
  const res = shouldFieldShow({ key, info: field }, rowData)
  // reset the field value, if doesn't show the field, void data legacy
  if (!res) {
    formData.value.list[$index][key] = null
  }
  return res
}
const newItem = computed(() => {
  const newItemData: Record<string, any> = {}
  allFields.value.forEach((item: ParamInfo) => {
    const { name, default: defaultVal } = item

    const newName = fieldName.value(name)
    newItemData[newName] = dataType(defaultVal) === 'undefined' ? null : defaultVal
  })
  return newItemData
})

const addItem = () => {
  const item = cloneDeep(newItem.value)
  const { list } = formData.value
  list.push(item)
  formData.value = {
    list,
  }

  emits('validateFileds')
}
const deleteItem = (index: number) => {
  formData.value.list.splice(index, 1)
  formData.value = cloneDeep(formData.value)
  emits('validateFileds')
}

const getRules = (field: ParamInfo) => {
  const key = fieldName.value(field.name)
  const { rules } = useNodeConfigParamItem({
    paramKey: key,
    paramInfo: field,
  })
  return rules.value
}

const validate = async () => {
  try {
    await dynamicTableRef.value.validate()
    return Promise.resolve(true)
  } catch (error) {
    return Promise.reject(error)
  }
}

const getTableItemWidth = (field: ParamInfo) => {
  let width = field.name.toLocaleLowerCase().replaceAll(' ', '_').length > 10 ? 170 : 110
  width = field.type === TypeOfPluginParam.TimeRange || field.type === TypeOfPluginParam.MonthDayRange ? 350 : width
  return width
}

// 添加深度监听
// watch(
//   () => formData.value,
//   (newVal: FormInfo) => {
//     emits('update:modelValue', newVal.list)
//   },
//   {
//     deep: true,
//     immediate: true
//   }
// )
// watchEffect(() => {
//   emits('update:modelValue', formData.value.list);
// });
const handleChange = () => {
  emits('update:modelValue', formData.value.list)
}
defineExpose({
  validate,
})
</script>

<style lang="scss" scoped>
.btn-add {
  margin-top: 16px;
}
</style>
