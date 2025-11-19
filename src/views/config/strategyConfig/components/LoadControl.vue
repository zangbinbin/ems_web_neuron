<template>
  <emqx-card class="group" v-emqx-loading="isListLoading">
    <!-- 头部内容 -->
    <h3 class="card-title">需量控制</h3>
    <div class="card-bar-under-title common-flex">
      <!-- 头部左侧内容 -->
      <div class="bar-left common-flex">
        <p class="driver-name">
          <label>{{ $t('common.currentSite') }}</label>
          <span v-if="siteInfo.siteDescription && siteInfo.siteDescription != ''">
            {{ siteInfo.siteName }}（{{ siteInfo.siteDescription }}）
          </span>
          <span v-else>{{ siteInfo.siteName }}</span>
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
          <emqx-form-item prop="limit_value_power_capacity" label="需量管理容量限值" required>
            <emqx-input type="number" v-model.number="formData.limit_value_power_capacity" />
          </emqx-form-item>
          <emqx-form-item prop="forbidden_value_charging" label="需量管理限充禁值" required>
            <emqx-input type="number" v-model.number="formData.forbidden_value_charging" />
          </emqx-form-item>
          <emqx-form-item prop="limited_value_charging" label="需量管理限充限值" required>
            <emqx-input type="number" v-model.number="formData.limited_value_charging" />
          </emqx-form-item>
          <emqx-form-item prop="threshold_value_charging" label="需量管理限充阈值" required>
            <emqx-input type="number" v-model.number="formData.threshold_value_charging" />
          </emqx-form-item>
          <emqx-form-item prop="charge_adjust_step_value" label="功率调节步长" required>
            <emqx-input type="number" v-model.number="formData.charge_adjust_step_value" />
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
import { queryList, addInfo, updateInfo, deleteInfo } from '@/api/loadControl'

const { t } = useI18n()
const isListLoading = ref(false)
const route = useRoute()
const router = useRouter()
// 路由传递参数
const siteInfo = computed(() => route.query)

const formCom = ref()

const formData = ref({
  limit_value_power_capacity: 0,
  forbidden_value_charging: 0,
  limited_value_charging: 0,
  threshold_value_charging: 0,
  charge_adjust_step_value: 0,
  chargingpower_limit_is_open: 0, // 开关：默认关闭
  node_name: siteInfo.value.siteName || '', // 站点名称
} as any)
const formRules = computed(() => {
  return {
    limit_value_power_capacity: [{ required: true, message: '需量管理容量限值不能为空' }],
    forbidden_value_charging: [{ required: true, message: '需量管理限充禁值不能为空' }],
    limited_value_charging: [{ required: true, message: '需量管理限充限值不能为空' }],
    threshold_value_charging: [{ required: true, message: '需量管理限充阈值不能为空' }],
    charge_adjust_step_value: [{ required: true, message: '功率调节步长不能为空' }],
  }
})

// 获取数据
const doGetData = async () => {
  if (!siteInfo.value.siteName) {
    router.push({ name: 'StrategyConfig' })
  }
  isListLoading.value = true
  try {
    const result = await queryList({ node_name: siteInfo.value.siteName })
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
    formData.value.node_name = siteInfo.value.siteName // 站点名称
    formData.value.chargingpower_limit_is_open = 0 // 开关：默认关闭

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
