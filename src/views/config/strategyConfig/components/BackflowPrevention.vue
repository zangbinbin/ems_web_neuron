<template>
  <emqx-card class="group" v-emqx-loading="isListLoading">
    <!-- 头部内容 -->
    <!-- <h3 class="card-title">防逆流</h3> -->
    <div class="card-bar-under-title common-flex">
      <!-- 头部左侧内容 -->
      <div class="bar-left common-flex">
        <p class="driver-name">
          <label>{{ $t('common.currentSite') }}</label>
          <span v-if="params.siteDescription && params.siteDescription != ''">
            {{ params.siteName }}（{{ params.siteDescription }}）
          </span>
          <span v-else>{{ params.siteName }}</span>
        </p>
      </div>
      <!-- 头部右侧内容 -->
      <div class="btns common-flex">
        <div class="btn-group"></div>
      </div>
    </div>

    <emqx-row>
      <emqx-col :span="12">
        <emqx-form ref="formCom" :model="formData" :rules="formRules">
          <emqx-form-item prop="threshold_value_discharge" label="$t('common.thresholdValueDischarge')" required>
            <emqx-input type="number" v-model.number="formData.threshold_value_discharge" />
          </emqx-form-item>
          <emqx-form-item prop="limited_value_discharge" label="$t('common.limitedValueDischarge')" required>
            <emqx-input type="number" v-model.number="formData.limited_value_discharge" />
          </emqx-form-item>
          <emqx-form-item prop="forbidden_value_discharge" label="$t('common.forbiddenValueDischarge')" required>
            <emqx-input type="number" v-model.number="formData.forbidden_value_discharge" />
          </emqx-form-item>
          <emqx-form-item prop="discharge_adjust_step_value" label="$t('common.dischargeAdjustStepValue')" required>
            <emqx-input type="number" v-model.number="formData.discharge_adjust_step_value" />
          </emqx-form-item>
        </emqx-form>
      </emqx-col>
    </emqx-row>

    <div class="node-config-ft">
      <emqx-button type="primary" :loading="isListLoading" @click="submit">{{ $t('common.submit') }}</emqx-button>
      <emqx-button @click="cancel">{{ $t('common.cancel') }}</emqx-button>
      <emqx-button @click.stop="reset">{{ $t('common.reset') }}</emqx-button>
    </div>
  </emqx-card>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { EmqxMessage } from '@emqx/emqx-ui'
import { useI18n } from 'vue-i18n'
import { queryList, addInfo, updateInfo, deleteInfo } from '@/api/backflowPrevention'

const { t } = useI18n()
const isListLoading = ref(false)
const route = useRoute()
const router = useRouter()
// 路由传递参数
const params = computed(() => route.query)
const formCom = ref()

const formData = ref({
  threshold_value_discharge: 0,
  limited_value_discharge: 0,
  forbidden_value_discharge: 0,
  discharge_adjust_step_value: 0,
  prevent_electrical_energy_is_open: 0, // 开关：默认关闭
  node_name: params.value.siteName || '', // 站点名称
} as any)
const formRules = computed(() => {
  return {
    threshold_value_discharge: [{ required: true, message: t('common.thresholdValueDischargeTip') }],
    limited_value_discharge: [{ required: true, message: t('common.limitedValueDischargeTip') }],
    forbidden_value_discharge: [{ required: true, message: t('common.forbiddenValueDischargeTip') }],
    discharge_adjust_step_value: [{ required: true, message: t('common.dischargeAdjustStepValueTip') }],
  }
})

// 获取数据
const doGetData = async () => {
  if (!params.value.siteName) {
    router.push({ name: 'StrategyConfig' })
  }
  isListLoading.value = true
  try {
    console.log('防逆流配置：', params.value)
    const result = await queryList({ node_name: params.value.siteName })
    formData.value = result.data
  } catch (error: any) {
    return Promise.reject()
  } finally {
    isListLoading.value = false
  }
}

const submit = async () => {
  try {
    await formCom.value.validate()
    isListLoading.value = true
    formData.value.node_name = params.value.siteName // 站点名称
    formData.value.prevent_electrical_energy_is_open = 0 // 开关：默认关闭

    await addInfo(formData.value)
    EmqxMessage.success(t('common.operateSuccessfully'))
    cancel()
  } catch (error) {
    return Promise.reject()
  } finally {
    isListLoading.value = false
  }
}

// 重置表单数据
const reset = () => {
  formCom.value.form.clearValidate()
  formCom.value.resetField()
}

// 取消并返回上级页面
const cancel = () => {
  router.back()
}

doGetData()
</script>

<style lang="scss" scoped>
.node-config-ft {
  text-align: center;
  .emqx-button {
    width: 130px;
  }
}
</style>
