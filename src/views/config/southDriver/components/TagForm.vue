<template>
  <emqx-form ref="formCom" :model="form" :rules="rules" @submit.prevent>
    <emqx-row :gutter="28">
      <emqx-col :span="12">
        <emqx-form-item :label="$t('common.name')" prop="name" required>
          <emqx-input v-model.trim="form.name" :disabled="edit" />
        </emqx-form-item>
      </emqx-col>
      <emqx-col :span="12">
        <emqx-form-item :label="$t('common.attribute')" prop="attribute" required>
          <template #label>
            <span>{{ $t('common.attribute') }}</span>
            <AComWithDesc :content="$t('config.staticNotSupportBytes')">
              <i class="el-icon-info icon-label" />
            </AComWithDesc>
          </template>
          <TagAttributeSelect v-model="form.attribute" @change="changeAttribute" />
        </emqx-form-item>
      </emqx-col>
      <emqx-col :span="12">
        <emqx-form-item :label="$t('common.type')" prop="type" required>
          <emqx-select v-model="form.type" :placeholder="$t('common.pleaseSelect')" @change="changeType">
            <emqx-option
              v-for="item in tagTypeOptListAfterFilter"
              :key="item.value"
              :value="item.value"
              :label="item.label"
              :disabled="item.value === TagType.BYTES && isAttrsIncludeStatic(form.attribute)"
            />
          </emqx-select>
        </emqx-form-item>
      </emqx-col>
      <emqx-col :span="12">
        <emqx-form-item
          :label="$t('config.address')"
          prop="address"
          :rules="[
            { required: !isAttrsIncludeStatic(form.attribute), message: $t('config.tagAddressRequired') },
            ...rules.address,
          ]"
        >
          <emqx-input v-model.trim="form.address" />
        </emqx-form-item>
      </emqx-col>
      <emqx-col :span="12">
        <emqx-form-item :label="$t('config.point')" prop="point">
          <emqx-input v-model.trim="form.point" />
        </emqx-form-item>
      </emqx-col>
      <emqx-col v-if="isAttrsIncludeStatic(form.attribute)" :span="12">
        <emqx-form-item
          :label="$t('config.tagValue')"
          prop="value"
          :rules="[
            ...rules.value,
            {
              required: isAttrsIncludeStatic(form.attribute),
              message: $t('config.tagValueRequired'),
            },
          ]"
        >
          <emqx-input v-model.trim="form.value" />
        </emqx-form-item>
      </emqx-col>

      <emqx-col v-if="isShowPrecisionField(form.type) && !isAttrsIncludeStatic(form.attribute)" :span="12">
        <emqx-form-item :label="$t('config.precision')" prop="precision">
          <emqx-input-number v-model="form.precision" :min="0" :max="17" controls-position="right" />
        </emqx-form-item>
      </emqx-col>

      <emqx-col v-if="!isAttrsIncludeStatic(form.attribute)" :span="12">
        <emqx-form-item :label="$t('config.decimal')" prop="decimal">
          <!--  @blur="changeDecimal" -->
          <emqx-input-number v-model="form.decimal" :step="0.1" controls-position="right" />
        </emqx-form-item>
      </emqx-col>

      <emqx-col v-if="!isAttrsIncludeStatic(form.attribute)" :span="12">
        <emqx-form-item :label="$t('config.offset')" prop="offset">
          <!--  @blur="changeDecimal" -->
          <emqx-input-number v-model="form.offset" :step="1" controls-position="right" />
        </emqx-form-item>
      </emqx-col>
      <emqx-col :span="12">
        <emqx-form-item :label="$t('config.valueRange')">
          <emqx-input v-model="form.valueRange" />
        </emqx-form-item>
      </emqx-col>
      <emqx-col v-if="isAttrsIncludeComposite(form.attribute)" :span="12">
        <emqx-form-item :label="$t('config.read_script')">
          <div style="display: flex; gap: 8px">
            <emqx-input v-model="form.read_script" type="textarea" style="flex: 1" />
            <emqx-button type="primary" size="small" @click="testReadScript" :loading="loading.readScript">
              {{ $t('common.testScript') }}
            </emqx-button>
          </div>
        </emqx-form-item>
      </emqx-col>
      <emqx-col v-if="isAttrsIncludeComposite(form.attribute)" :span="12">
        <emqx-form-item :label="$t('config.write_script')">
          <div style="display: flex; gap: 8px">
            <emqx-input v-model="form.write_script" type="textarea" style="flex: 1" />
            <emqx-button type="primary" size="small" @click="testWriteScript" :loading="loading.writeScript">
              {{ $t('common.testScript') }}
            </emqx-button>
          </div>
        </emqx-form-item>
      </emqx-col>
      <emqx-col v-if="isAttrsIncludeForward(form.attribute)" :span="12">
        <emqx-form-item :label="$t('config.forward_script')">
          <div style="display: flex; gap: 8px">
            <emqx-input v-model="form.forward_script" type="textarea" style="flex: 1" />
            <emqx-button type="primary" size="small" @click="testForwardScript" :loading="loading.forwardScript">
              {{ $t('common.testScript') }}
            </emqx-button>
          </div>
        </emqx-form-item>
      </emqx-col>
      <emqx-col :span="12">
        <emqx-form-item :label="$t('config.threshold')" prop="threshold">
          <!--  @blur="changeDecimal" -->
          <emqx-input-number v-model="form.threshold" :step="1" controls-position="right" />
        </emqx-form-item>
      </emqx-col>
      <emqx-col v-if="isAttrsIncludeMonitor(form.attribute)" :span="12">
        <emqx-form-item :label="$t('common.queue')" prop="queue" required>
          <template #label>
            <span>{{ $t('common.queue') }}</span>
          </template>
          <TagQueueSelect v-model="form.queue" />
        </emqx-form-item>
      </emqx-col>
      <emqx-col :span="12">
        <emqx-form-item :label="$t('config.desc')">
          <emqx-input v-model="form.description" />
        </emqx-form-item>
      </emqx-col>
    </emqx-row>
  </emqx-form>
</template>

<script lang="ts" setup>
import type { PropType, WritableComputedRef } from 'vue'
import { defineExpose, computed, defineProps, defineEmits, nextTick, ref } from 'vue'
import { useTagPrecision } from '@/composables/config/useAddTagCommon'
import TagAttributeSelect from './TagAttributeSelect.vue'
import TagQueueSelect from './TagQueueSelect.vue'
import type { PluginInfo, TagForm } from '@/types/config'
import useTagForm from '@/composables/config/useTagForm'
import { TagType } from '@/types/enums'
import AComWithDesc from '@/components/AComWithDesc.vue'
import { ElMessage } from 'element-plus'
import { testCompositeScript, testForwardScript as apiTestForwardScript } from '@/api/config'

const props = defineProps({
  data: {
    type: Object as PropType<TagForm>,
    required: true,
  },
  nodePluginInfo: {
    type: Object as PropType<PluginInfo>,
  },
  edit: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['update:modelValue'])

const {
  formCom,
  isAttrsIncludeStatic,
  isAttrsIncludeMonitor,
  isAttrsIncludeComposite,
  isAttrsIncludeForward,
  tagTypeOptListAfterFilter,
  rules,
  validate,
  resetFields,
} = useTagForm(props)
const { isShowPrecisionField } = useTagPrecision()

const form: WritableComputedRef<TagForm> = computed({
  get() {
    return props.data
  },
  set(val) {
    emit('update:modelValue', val)
  },
})

const isBYTESType = computed(() => form.value.type === TagType.BYTES)

const loading = ref({
  readScript: false,
  writeScript: false,
  forwardScript: false,
})

const changeAttribute = () => {
  const isStaticAttr = isAttrsIncludeStatic.value(form.value.attribute)

  if (!isStaticAttr) {
    form.value.value = undefined
  } else {
    form.value.precision = undefined
    form.value.decimal = null
    form.value.offset = null
    if (isBYTESType.value) {
      form.value.type = null
    }
  }
  // validate  'address'
  nextTick(() => {
    formCom.value.form.validateField('address')
  })
}

const testReadScript = async () => {
  const script = form.value.read_script || ''
  if (!script) {
    ElMessage.warning('脚本内容不能为空')
    return
  }

  if (!form.value.name) {
    ElMessage.warning('标签名称不能为空')
    return
  }

  loading.value.readScript = true

  try {
    const response = await testCompositeScript({
      script,
      tag_name: form.value.name,
      value: {
        type: 5,
        value: 1,
      },
    })

    console.log('API响应:', response)

    if (response.data.error === 0) {
      ElMessage.success(`测试成功: ${response.data.result}`)
    } else {
      ElMessage.error(`脚本错误: ${response.data.error_msg || response.data.result}`)
    }
  } catch (error: any) {
    console.log('API错误:', error)
    if (error.data?.error) {
      ElMessage.error(`脚本错误: ${error.data.error_msg || '未知错误'}`)
    } else {
      ElMessage.error('测试失败')
    }
    console.error('测试失败:', error)
  } finally {
    loading.value.readScript = false
  }
}

const testWriteScript = async () => {
  const script = form.value.write_script || ''
  if (!script) {
    ElMessage.warning('脚本内容不能为空')
    return
  }

  if (!form.value.name) {
    ElMessage.warning('标签名称不能为空')
    return
  }

  loading.value.writeScript = true

  try {
    const response = await testCompositeScript({
      script,
      tag_name: form.value.name,
      value: {
        type: 5,
        value: 1,
      },
    })

    if (response.data.error === 0) {
      ElMessage.success(`测试成功: ${response.data.result}`)
    } else {
      ElMessage.error(`脚本错误: ${response.data.error_msg || response.data.result}`)
    }
  } catch (error: any) {
    if (error.data?.error) {
      ElMessage.error(`脚本错误: ${error.data.error_msg || '未知错误'}`)
    } else {
      ElMessage.error('测试失败')
    }
    console.error('测试失败:', error)
  } finally {
    loading.value.writeScript = false
  }
}

const testForwardScript = async () => {
  const script = form.value.forward_script || ''
  if (!script) {
    ElMessage.warning('脚本内容不能为空')
    return
  }

  if (!form.value.name) {
    ElMessage.warning('标签名称不能为空')
    return
  }

  loading.value.forwardScript = true

  try {
    const response = await apiTestForwardScript({
      script,
      tag_name: form.value.name,
      value: {
        type: 5,
        value: 1,
      },
    })

    ElMessage.success(`测试成功: ${response.data.result}`)
  } catch (error: any) {
    if (error.data?.error) {
      ElMessage.error(`脚本错误: ${error.data.error_msg || '未知错误'}`)
    } else {
      ElMessage.error('测试失败')
    }
    console.error('测试失败:', error)
  } finally {
    loading.value.forwardScript = false
  }
}

// validate address when change tag `type`
const changeType = () => {
  const validateFields = [`address`]
  if (form.value.value) {
    validateFields.push(`value`)
  }

  formCom.value.form.validateField(validateFields)
}

// used when 'vaule' is related width decimal
// validate address when change tag `Decimal`
// const changeDecimal = () => {
//   formCom.value.form.validateField('value')
// }

defineExpose({
  validate,
  resetFields,
})
</script>

<style lang="scss" scoped>
:deep(.el-form-item__label) {
  float: none;
}
.icon-label {
  padding-left: 4px;
  color: #999;
}
</style>
