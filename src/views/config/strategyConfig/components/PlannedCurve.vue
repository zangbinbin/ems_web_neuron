<template>
  <emqx-card class="group" v-emqx-loading="isListLoading">
    <!-- 头部内容 -->
    <!-- <h3 class="card-title">计划曲线</h3> -->
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

    <!-- 计划曲线类型切换 -->
    <emqx-row>
      <emqx-col :span="24">
        <el-radio-group v-model="type" size="medium" @change="typeChange">
          <el-radio-button label="general">
            <span>{{ $t('common.general') }}</span>
          </el-radio-button>
          <el-radio-button label="specificDay">
            <span>{{ $t('common.specificDay') }}</span>
          </el-radio-button>
          <el-radio-button label="dateRange">
            <span>{{ $t('common.dateRange') }}</span>
          </el-radio-button>
        </el-radio-group>
      </emqx-col>
    </emqx-row>

    <!-- 计划曲线表格 -->
    <el-row>
      <el-col :span="24">
        <br />
        <emqx-table :data="formDataList" :empty-text="$t('common.emptyData')" :row-class-name="'table-row-click'">
          <emqx-table-column :label="$t('common.dateRange')" prop="dateRange" v-if="type == 'dateRange'" width="280px">
            <template #default="{ row }">
              <el-date-picker
                style="width: 250px"
                v-model="row.dateRange"
                size="mini"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                range-separator="-"
                :start-placeholder="$t('common.startDate')"
                :end-placeholder="$t('common.endDate')"
                type="daterange"
              />
            </template>
          </emqx-table-column>
          <emqx-table-column :label="$t('common.date')" prop="month_day" v-if="type == 'specificDay'">
            <template #default="{ row }">
              <el-date-picker
                style="width: 150px"
                v-model="row.month_day"
                size="mini"
                :placeholder="$t('common.date')"
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </template>
          </emqx-table-column>
          <emqx-table-column :label="$t('admin.timeRange')" prop="timeRange" width="280px">
            <template #default="{ row }">
              <el-time-picker
                style="width: 250px"
                v-model="row.timeRange"
                is-range
                size="mini"
                format="HH:mm"
                value-format="HH:mm"
                arrow-control
                range-separator="-"
                :start-placeholder="$t('common.startTime')"
                :end-placeholder="$t('common.endTime')"
              />
            </template>
          </emqx-table-column>
          <!-- <emqx-table-column
            :label="$t('common.startTime')"
            prop="start_time"
            v-if="type == 'specificDay' || type == 'general'"
            width="250px"
          >
            <template #default="{ row }">
              <el-time-picker
                size="mini"
                v-model="row.start_time"
                format="HH:mm"
                value-format="HH:mm"
                :placeholder="$t('common.time')"
              >
              </el-time-picker>
            </template>
          </emqx-table-column> -->
          <!-- <emqx-table-column
            :label="$t('common.endTime')"
            prop="end_time"
            v-if="type == 'specificDay' || type == 'general'"
            width="250px"
          >
            <template #default="{ row }">
              <el-time-picker
                size="mini"
                v-model="row.end_time"
                format="HH:mm"
                value-format="HH:mm"
                :placeholder="$t('common.time')"
              >
              </el-time-picker>
            </template>
          </emqx-table-column> -->
          <emqx-table-column :label="$t('common.chargeDischarge')" prop="charge_discharge">
            <template #default="{ row }">
              <emqx-radio-group v-model="row.charge_discharge">
                <emqx-radio
label="1"
                  >{{ $t('config.charge') }}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</emqx-radio
                >
                <emqx-radio label="-1">{{ $t('config.discharge') }}</emqx-radio>
              </emqx-radio-group>
            </template>
          </emqx-table-column>
          <emqx-table-column :label="$t('common.powerValue')" prop="power">
            <template #default="{ row }">
              <emqx-input type="number" size="mini" v-model.number="row.power"></emqx-input>
            </template>
          </emqx-table-column>
          <emqx-table-column align="left" :label="$t('common.oper')" width="120px">
            <template #default="{ index }">
              <emqx-button type="danger" size="mini" @click="deleteItem(index)">
                {{ $t('common.delete') }}
              </emqx-button>
            </template>
          </emqx-table-column>
        </emqx-table>
        <br />
        <emqx-button size="small" @click="addItem">
          <i class="iconfont iconcreate" />
          <span>{{ $t('common.add') }}</span>
        </emqx-button>
      </el-col>
    </el-row>

    <!-- 底部按钮 -->
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
import { cloneDeep } from 'lodash'
import { ElRadioGroup, ElRadioButton, ElTimePicker, ElDatePicker } from 'element-plus'
import { queryList, updateTYInfo, updateTDRInfo, updateRQFWInfo } from '@/api/plannedCurve'
import { MessageBoxConfirm } from '@/utils/element'
import { useI18n } from 'vue-i18n'
import { EmqxMessage } from '@emqx/emqx-ui'

const { t } = useI18n()
const isListLoading = ref(false)
const route = useRoute()
const router = useRouter()
// 路由传递参数
const siteInfo = computed(() => route.query)
const type = ref('general')

// 默认计划曲线表单对象
// 通用：开始时间、结束时间、充放电、功率值
// 特定日：月日、开始时间、结束时间、充放电、功率值
// 日期范围：日期范围、时间范围、充放电、功率值
const defaultForm = ref({
  id: '',
  dateRange: [],
  timeRange: [],
  month_day: '',
  start_time: '', // 通用计划曲线案例："09:00" ，特定日计划曲线案例：1762358400
  end_time: '', // 通用计划曲线案例："10:00" ，特定日计划曲线案例：1762362000
  charge_discharge: 1,
  power: 0,
  node_name: siteInfo.value.siteName,
  start_date: '', // 日期范围计划曲线专用字段
  end_date: '', // 日期范围计划曲线专用字段
})

// 计划曲线列表数据
const formDataList = ref([cloneDeep(defaultForm.value)] as any)

// 获取数据
const doGetData = async () => {
  if (!siteInfo.value.siteName) {
    router.push({ name: 'StrategyConfig' })
  }
  isListLoading.value = true
  let planType = 0
  if (type.value === 'general') {
    // 通用计划曲线
    planType = 0
  } else if (type.value === 'specificDay') {
    // 特定日计划曲线
    planType = 1
  } else {
    // 日期范围计划曲线
    planType = 2
  }

  try {
    const result = await queryList({ node_name: siteInfo.value.siteName, plan_type: planType })
    if (result.data.plan_curve.length > 0) {
      formDataList.value = result.data.plan_curve
      // 通用计划曲线专用字段处理
      if (planType === 0) {
        formDataList.value.forEach((item: any) => {
          if (item.start_time && item.end_time) {
            item.timeRange = [item.start_time, item.end_time === '00:00' ? '23:59' : item.end_time]
          }
        })
      }

      // 特定日计划曲线专用字段处理
      if (planType === 1) {
        formDataList.value.forEach((item: any) => {
          if (item.start_time) {
            const date = new Date(item.start_time * 1000)
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            const hours = String(date.getHours()).padStart(2, '0')
            const minutes = String(date.getMinutes()).padStart(2, '0')
            item.month_day = `${year}-${month}-${day}`
            item.start_time = `${hours}:${minutes}`
          }
          if (item.end_time) {
            const date = new Date(item.end_time * 1000)
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            const hours = String(date.getHours()).padStart(2, '0')
            const minutes = String(date.getMinutes()).padStart(2, '0')
            item.month_day = `${year}-${month}-${day}`
            item.end_time = `${hours}:${minutes}`
          }
          if (item.start_time && item.end_time) {
            item.timeRange = [item.start_time, item.end_time === '00:00' ? '23:59' : item.end_time]
          }
        })
      }

      // 日期范围计划曲线专用字段处理
      if (planType === 2) {
        formDataList.value.forEach((item: any) => {
          if (item.start_date && item.end_date) {
            item.dateRange = [item.start_date, item.end_date]
          }
          if (item.start_time && item.end_time) {
            item.timeRange = [item.start_time, item.end_time === '00:00' ? '23:59' : item.end_time]
          }
        })
      }
    } else {
      formDataList.value = [cloneDeep(defaultForm.value)]
    }
  } catch (error: any) {
    return Promise.reject()
  } finally {
    isListLoading.value = false
  }
}

// 切换计划曲线类型
const typeChange = () => {
  doGetData()
}

// 添加计划曲线数据项
const addItem = () => {
  formDataList.value.push(cloneDeep(defaultForm.value))
}

// 删除计划曲线数据项
const deleteItem = (index: number) => {
  formDataList.value.splice(index, 1)
  formDataList.value = cloneDeep(formDataList.value)
}

// 取消操作
const cancel = () => {
  router.back()
}

// 重置表单数据
const reset = () => {
  formDataList.value = [cloneDeep(defaultForm.value)]
}

// 提交表单数据
const submit = async () => {
  if (type.value === 'general') {
    // 通用计划曲线
    await MessageBoxConfirm('确定保存通用计划曲线信息吗？')
    // 处理时间范围
    formDataList.value.forEach((item: any) => {
      if (item.timeRange && item.timeRange.length > 0) {
        const [start, end] = item.timeRange
        item.start_time = start
        // 23:59 转 00:00
        item.end_time = end === '23:59' ? '00:00' : end
      }
    })
    await updateTYInfo({ node_name: siteInfo.value.siteName, records: formDataList.value })
  } else if (type.value === 'specificDay') {
    // 特定日计划曲线
    await MessageBoxConfirm('确定保存特定日计划曲线信息吗？')
    // 处理特定日计划曲线时间戳
    const dataInfo = cloneDeep(formDataList.value)
    dataInfo.forEach((item: any) => {
      if (item.timeRange && item.timeRange.length > 0) {
        const [start, end] = item.timeRange
        item.start_time = start
        // 23:59 转 00:00
        item.end_time = end === '23:59' ? '00:00' : end
      }
      // 合并开始时间
      if (item.month_day && item.month_day !== '' && item.start_time && item.start_time !== '') {
        const date = new Date(`${item.month_day}T${item.start_time}`)
        item.start_time = Math.floor(date.getTime() / 1000)
      }
      // 合并结束时间
      if (item.month_day && item.month_day !== '' && item.end_time && item.end_time !== '') {
        const date = new Date(`${item.month_day}T${item.end_time}`)
        item.end_time = Math.floor(date.getTime() / 1000)
      }
    })
    await updateTDRInfo({ node_name: siteInfo.value.siteName, records: dataInfo })
  } else {
    // 日期范围计划曲线
    await MessageBoxConfirm('确定保存日期范围计划曲线信息吗？')
    // 处理日期范围
    formDataList.value.forEach((item: any) => {
      if (item.dateRange && item.dateRange.length > 0) {
        const [start, end] = item.dateRange
        item.start_date = start
        item.end_date = end
      }
      if (item.timeRange && item.timeRange.length > 0) {
        const [start, end] = item.timeRange
        item.start_time = start
        // 23:59 转 00:00
        item.end_time = end === '23:59' ? '00:00' : end
      }
    })
    await updateRQFWInfo({ node_name: siteInfo.value.siteName, records: formDataList.value })
  }
  EmqxMessage.success(t('common.operateSuccessfully'))
  cancel()
}

doGetData()
</script>

<style lang="scss" scoped>
:deep(label) {
  margin-right: 0px;
}
.node-config-ft {
  text-align: center;
  .emqx-button {
    width: 130px;
  }
}
</style>
