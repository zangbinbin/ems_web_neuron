<template>
  <el-dialog
    v-model="showDialog"
    width="40%"
    custom-class="common-dialog"
    :title="$t('config.editTag')"
    :z-index="2000"
  >
    <emqx-form ref="formCom" :model="alarmRuleForm" :rules="formRules">
      <emqx-form-item prop="device_name" :label="$t('config.deviceName')" required>
        <emqx-input type="input" v-model.trim="alarmRuleForm.device_name" disabled />
      </emqx-form-item>
      <emqx-form-item prop="group_name" :label="$t('common.groupName')" required>
        <emqx-select v-model="alarmRuleForm.group_name">
          <emqx-option v-for="item in groupList" :key="item.value" :value="item.value" :label="item.key" />
        </emqx-select>
      </emqx-form-item>
      <emqx-form-item prop="tag_name" :label="$t('common.tagName')" required>
        <emqx-input type="input" v-model.trim="alarmRuleForm.tag_name" />
      </emqx-form-item>
      <emqx-form-item prop="operator" :label="$t('common.operator')" required>
        <emqx-select v-model="alarmRuleForm.operator">
          <emqx-option v-for="item in operatorList" :key="item.value" :value="item.value" :label="item.key" />
        </emqx-select>
      </emqx-form-item>
      <emqx-form-item prop="abnormal_value" :label="$t('common.abnormalValue')" required>
        <emqx-input type="input" v-model.trim="alarmRuleForm.abnormal_value" />
      </emqx-form-item>
      <emqx-form-item prop="gap_value" :label="$t('common.gapValue')" required>
        <emqx-input type="input" v-model.trim="alarmRuleForm.gap_value" />
      </emqx-form-item>
      <emqx-form-item prop="processing_method" :label="$t('common.processingMethod')" required>
        <emqx-select v-model="alarmRuleForm.processing_method">
          <emqx-option v-for="item in processingMethodList" :key="item.value" :value="item.value" :label="item.key" />
        </emqx-select>
      </emqx-form-item>
      <emqx-form-item prop="fault_level" :label="$t('common.faultLevel')" required>
        <emqx-select v-model="alarmRuleForm.fault_level">
          <emqx-option v-for="item in faultLevelList" :key="item.value" :value="item.value" :label="item.key" />
        </emqx-select>
      </emqx-form-item>
      <emqx-form-item prop="description" :label="$t('common.description')">
        <emqx-input type="textarea" v-model.trim="alarmRuleForm.description" />
      </emqx-form-item>
    </emqx-form>
    <template #footer>
      <span class="dialog-footer">
        <emqx-button type="primary" size="small" @click="submit" :loading="isSubmitting">{{
          $t('common.submit')
        }}</emqx-button>
        <emqx-button size="small" @click="showDialog = false">{{ $t('common.cancel') }}</emqx-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, watch, defineEmits, defineProps, nextTick, defineExpose } from 'vue'
import { EmqxMessage } from '@emqx/emqx-ui'
import { useI18n } from 'vue-i18n'
import { ElDialog } from 'element-plus'
import { addAlarmRlule, updateAlarmRlule } from '@/api/alarmRules'

const { t } = useI18n()
const props = defineProps({
  deviceName: { type: String, default: '' },
})

const showDialog = ref(false)

const groupList = ref([
  { key: 'YC', value: 'YC' },
  { key: 'YX', value: 'YX' },
])

const operatorList = ref([
  { key: '大于（>）', value: 1 },
  { key: '大于等于（>=）', value: 2 },
  { key: '等于（=）', value: 3 },
  { key: '小于（<）', value: 4 },
  { key: '小于等于（<=）', value: 5 },
])

const processingMethodList = ref([
  { key: '待机', value: 1 },
  { key: '待机&打开故障灯', value: 2 },
  { key: '停机', value: 3 },
  { key: '停机&打开故障灯', value: 4 },
  { key: '禁止充电', value: 5 },
  { key: '禁止放电', value: 6 },
  { key: '降功率（*0.5）', value: 7 },
  { key: '脱扣&停机&打开故障灯', value: 8 },
])

const faultLevelList = ref([
  { key: '一级', value: 1 },
  { key: '二级', value: 2 },
  { key: '三级', value: 3 },
])

const defaultForm = ref({
  device_name: props.deviceName || '', // 设备标识
  group_name: '', // 分组名称
  tag_name: '', // 点位名称
  processing_method: '', // 处理方式，1待机、2待机&打开故障灯、3停机、4停机&打开故障灯、5禁止充电、6禁止放电、7降功率（*0.5）、8脱扣&停机&打开故障灯
  abnormal_value: '', // 异常值
  fault_level: '', // 故障等级，1一级，2二级，3三级
  operator: '', // 运算符 ，1大于（>）、2大于等于（>=）、3等于（=）、4小于（<）、5小于等于（<=）
  gap_value: 0, // 回差值 默认值0
  description: '', // 描述
  updated_time: '',
} as any)

const alarmRuleForm = ref({} as any)

const formRules = computed(() => {
  return {
    device_name: [{ required: true, message: '设备名称不能为空' }],
    group_name: [{ required: true, message: '分组名不能为空' }],
    tag_name: [{ required: true, message: '点位名称不能为空' }],
    processing_method: [{ required: true, message: '处理方法不能为空' }],
    abnormal_value: [{ required: true, message: '异常值不能为空' }],
    fault_level: [{ required: true, message: '故障等级不能为空' }],
    operator: [{ required: true, message: '操作符不能为空' }],
    gap_value: [{ required: true, message: '回差值不能为空' }],
  }
})
const formCom = ref()
const emit = defineEmits(['update:modelValue', 'submitted'])
const isSubmitting = ref(false)

const initForm = async (alarmRuleInfo: any) => {
  showDialog.value = true
  alarmRuleForm.value = {}
  await nextTick()
  formCom.value.form.clearValidate()
  formCom.value.resetField()
  if (alarmRuleInfo && Object.keys(alarmRuleInfo).length > 0) {
    // 修改
    alarmRuleForm.value = { ...alarmRuleInfo }
  } else {
    // 新增
    alarmRuleForm.value = { ...defaultForm.value }
  }
}

const submit = async () => {
  try {
    await formCom.value.validate()
    isSubmitting.value = true
    if (alarmRuleForm.value.id) {
      await updateAlarmRlule(alarmRuleForm.value)
    } else {
      await addAlarmRlule(alarmRuleForm.value)
    }
    EmqxMessage.success(t('common.createSuccess'))
    showDialog.value = false
    emit('submitted')
  } catch (error) {
    return Promise.reject()
  } finally {
    isSubmitting.value = false
  }
}

// 暴露方法给父组件
defineExpose({
  initForm,
  groupList,
  operatorList,
  processingMethodList,
  faultLevelList,
})
</script>
