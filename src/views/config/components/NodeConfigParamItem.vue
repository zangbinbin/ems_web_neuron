<template>
  <emqx-col :span="paramInfo.type === TypeOfPluginParam.Array ? 24 : 12">
    <emqx-form-item class="node-config-param-item" :rules="rules" :prop="paramKey" :required="isFieldRequired">
      <template #label>
        <span>{{ showLabel(paramInfo) }}</span>
        <el-popover
          v-if="paramInfo.description"
          placement="top-start"
          :width="300"
          trigger="hover"
          :content="i18nContent(paramInfo, 'description')"
        >
          <template #reference>
            <i class="iconfont iconalarm" />
          </template>
        </el-popover>
      </template>

      <!-- Number -->
      <span v-if="paramInfo.type === TypeOfPluginParam.Int">
        <emqx-input
          v-if="!isParamHexadecimalBase(paramInfo)"
          v-model.number="inputValue"
          :placeholder="String(defaultData[paramKey] || '')"
        />
        <emqx-input v-else v-model="inputValue" :placeholder="String(defaultData[paramKey])" />
      </span>

      <!-- Float -->
      <emqx-input
        v-else-if="paramInfo.type === TypeOfPluginParam.Float"
        oninput="value=value .replace(/[^0-9.]/g, '').replace(/\.{2,}/g, '.').replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3')"
        @blur="limitInput"
        v-model="inputValue"
        :placeholder="String(defaultData[paramKey] || '')"
      />

      <!-- String -->
      <emqx-input
        v-else-if="paramInfo.type === TypeOfPluginParam.String"
        v-model.trim="inputValue"
        :placeholder="String(defaultData[paramKey])"
      />
      <!-- Boolean -->
      <emqx-radio-group v-else-if="paramInfo.type === TypeOfPluginParam.Boolean" v-model="inputValue">
        <emqx-radio :label="true">True</emqx-radio>
        <emqx-radio :label="false">False</emqx-radio>
      </emqx-radio-group>
      <!-- File -->
      <div class="file-param" v-else-if="paramInfo.type === TypeOfPluginParam.File">
        <emqx-upload action="" class="file-upload" :show-file-list="false" :before-upload="handleUpload">
          <emqx-button size="mini">{{ t('common.uploadFile') }}</emqx-button>
        </emqx-upload>
        <emqx-button v-if="inputValue" size="mini" @click="clearFile" type="text">
          {{ t('config.clearUploadedFile') }}
        </emqx-button>
        <div class="file-content-preview" v-if="inputValue">
          <label>Content-MD5:</label>
          <span>{{ fileContentPreview(inputValue) }}</span>
        </div>
      </div>
      <!-- Enum -->
      <!-- <emqx-select v-else-if="paramInfo.type === TypeOfPluginParam.Enum">
        <emqx-option />
      </emqx-select>-->
      <!-- Map -->
      <template v-else-if="paramInfo.type === TypeOfPluginParam.Map">
        <emqx-radio-group v-if="paramInfo.valid.map.length < 3" v-model="inputValue">
          <emqx-radio v-for="{ key, value } in paramInfo.valid.map" :key="value" :label="value">
            {{ upperFirstLetter(key) }}
          </emqx-radio>
        </emqx-radio-group>
        <emqx-select v-else v-model="inputValue" :placeholder="$t('common.pleaseSelect')">
          <emqx-option
            v-for="{ key, value } in paramInfo.valid.map"
            :key="value"
            :value="value"
            :label="upperFirstLetter(key)"
          />
        </emqx-select>
      </template>
      <template v-else-if="paramInfo.type === TypeOfPluginParam.Array">
        <DynamicTable
          ref="arrayRef"
          v-model="inputValue"
          :fields="paramInfo.fields"
          :range="{ min: paramInfo?.valid?.min_length, max: paramInfo?.valid?.max_length }"
          @validateFileds="validateFileds"
        />
      </template>
    </emqx-form-item>
  </emqx-col>
</template>

<script lang="ts" setup>
import { ref, computed, defineEmits, defineProps, defineExpose } from 'vue'
import type { PropType } from 'vue'
import { useI18n } from 'vue-i18n'
import { fromByteArray } from 'base64-js'
import md5 from 'blueimp-md5'
import { ElPopover } from 'element-plus'
import useNodeConfigParamItem from '@/composables/config/useNodeConfigParamItem'
import useNodeConfigParamCommon from '@/composables/config/useNodeConfigParamCommon'
import useUploadFileAndRead from '@/composables/config/useUploadFileAndRead'
import useLang from '@/composables/useLang'
import type { ParamInfo } from '@/types/config'
import { FileType, TypeOfPluginParam } from '@/types/enums'
import DynamicTable from '@/components/DynamicTable.vue'

const props = defineProps({
  modelValue: {
    type: [Number, String, Boolean, Array],
  },
  paramKey: {
    type: String,
    required: true,
  },
  paramInfo: {
    type: Object as PropType<ParamInfo>,
    required: true,
  },
  defaultData: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue', 'validateFileds'])

const { t } = useI18n()
const { i18nContent } = useLang()
const { upperFirstLetter, showLabel, isParamHexadecimalBase } = useNodeConfigParamCommon()

const arrayRef = ref()

// if base is 16, show hexadecimal
const inputValue = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  },
})

const isFieldRequired = computed(() => {
  return props.paramInfo?.attribute === 'required'
})

const { rules } = useNodeConfigParamItem(props)
const { readFile } = useUploadFileAndRead()

const handleUpload = async (file: any) => {
  try {
    const content = await readFile(file, FileType.Binary)
    const afterBase64 = fromByteArray(new Uint8Array(content as ArrayBuffer))
    inputValue.value = afterBase64
  } catch (error) {
    console.error(error)
  }
  return Promise.reject()
}

const clearFile = () => {
  inputValue.value = ''
}

const fileContentPreview = md5

const validateFileds = () => {
  emit('validateFileds', [`${props.paramKey}`])
}

const validateArrayParam = async () => {
  try {
    const { validate } = arrayRef.value
    await validate()
    return Promise.resolve(true)
  } catch (error) {
    return Promise.reject(error)
  }
}

const limitInput = (e: any) => {
  let val: any = `${e.target.value}`
  // 处理只有一位小数的数字
  if (val.indexOf('.') !== -1) {
    const str = val.split('.')
    // 检查'.'左侧数据长度
    if (str[0].length > 0) {
      const arr = str[0].split('')
      const res = arr.every((item: any) => {
        return item === 0 || item === '0'
      })
      if (res) {
        if (str[1]) {
          val = `0.${str[1]}`
        } else {
          val = '0.00'
        }
      } else if (str[1]) {
        // 检查'.'右侧数据长度为1时
        if (str[1].length === 1) {
          val = `${str[0].replace(/\b(0+)/g, '')}.${str[1]}0`
        }
        // 检查'.'右侧数据长度为2时
        else {
          val = `${str[0].replace(/\b(0+)/g, '')}.${str[1]}`
        }
      } else {
        val = `${str[0].replace(/\b(0+)/g, '')}.00`
      }
    }
    // 检查'.'左侧数据长度为0时，视为异常
    else {
      val = '' // 异常时，置空，强制让用户重新输入
    }
  }
  // 处理纯整数
  else {
    const arr = val.split('')
    const res = arr.every((item: any) => {
      return item === 0 || item === '0'
    })
    if (res) {
      // 异常时，置空，强制让用户重新输入
      val = '0.00'
    } else {
      val = `${val.replace(/\b(0+)/g, '')}.00`
    }
  }
  // 给输入框换值
  inputValue.value = val
}

defineExpose({
  arrayRef,
  validateArrayParam,
})
</script>

<style lang="scss">
.node-config-param-item {
  .el-form-item__label {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    > span {
      margin-right: 8px;
    }
    > .iconfont {
      font-size: 18px;
      cursor: pointer;
    }
  }
  .el-form-item__content::before,
  .el-form-item__content::after {
    clear: both;
  }
  .file-content-preview {
    font-size: 12px;
  }
  .file-upload {
    display: inline-block;
    margin-right: 16px;
  }
}
</style>
