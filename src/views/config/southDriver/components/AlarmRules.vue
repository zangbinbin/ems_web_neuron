<template>
  <emqx-card class="group" v-emqx-loading="isListLoading">
    <!-- 头部内容 -->
    <h3 class="card-title">{{ $t('config.alarmRules') }}</h3>
    <div class="card-bar-under-title common-flex">
      <!-- 头部左侧内容 -->
      <div class="bar-left common-flex">
        <p class="driver-name">
          <label>{{ $t('config.deviceName') }}</label>
          <span>{{ node.node_description ? node.node_description : node.name }}</span>
        </p>
      </div>
      <!-- 头部右侧内容 -->
      <div class="btns common-flex">
        <div class="btn-group">
          <!-- 点位名称查询条件 -->
          <KeywordSerachInput
            v-model="pointName"
            class="search-input"
            :placeholder="$t('common.pointNameSearchPlaceholder')"
            @input="dbGetAlarmRules"
            @clear="dbGetAlarmRules"
            @enter="dbGetAlarmRules"
          />
          <!-- 清空按钮 -->
          <emqx-button size="small" type="warning" @click="clearQuery">{{ $t('common.clear') }}</emqx-button>
          <!-- 创建按钮 -->
          <emqx-button size="small" type="primary" @click="addAlarmRules()">
            {{ $t('common.create') }}
          </emqx-button>

          <emqx-dropdown :hide-timeout="512" popper-class="btn-download-temp-popper">
            <!-- 导入按钮 -->
            <emqx-upload
              class="uploader-tag"
              :before-upload="importAlarmRules"
              :show-file-list="false"
              action="placeholder"
            >
              <emqx-button size="small">
                <i class="iconfont icon-import icondownload"></i>
                <span>{{ $t('common.import') }}</span>
              </emqx-button>
            </emqx-upload>
            <!-- 下载模板按钮 -->
            <template #dropdown>
              <emqx-dropdown-menu>
                <emqx-button plain class="btn-download-temp" @click="downloadTemplate">
                  <span>{{ $t('config.downloadTemplate') }}</span>
                </emqx-button>
              </emqx-dropdown-menu>
            </template>
          </emqx-dropdown>

          <!-- 导出按钮 -->
          <emqx-button
            size="small"
            class="export-tags--btn"
            :disabled="!alarmRules.length"
            :loading="isExporting"
            @click="exportAlarmRules"
          >
            <i class="iconfont icon-import iconsubmit"></i>
            <span>{{ $t('common.export') }}</span>
          </emqx-button>
        </div>
      </div>
    </div>

    <!-- 数据列表 -->
    <emqx-table :data="alarmRules" :empty-text="$t('common.emptyData')" :row-class-name="'table-row-click'">
      <emqx-table-column :width="28">
        <template #header>
          <emqx-checkbox v-model="allChecked" />
        </template>
        <template #default="{ row }">
          <emqx-checkbox v-model="row.checked" @click.stop="() => {}" />
        </template>
      </emqx-table-column>
      <emqx-table-column :label="$t('common.groupName')" prop="group_name" width="100px" />
      <emqx-table-column :label="$t('common.tagName')" prop="tag_name" />
      <emqx-table-column :label="$t('common.operator')" prop="operator">
        <template #default="{ row }">
          {{ getDictName(row.operator, alarmRuleDialog.operatorList) }}
        </template>
      </emqx-table-column>
      <emqx-table-column :label="$t('common.abnormalValue')" prop="abnormal_value" width="100px" />
      <emqx-table-column :label="$t('common.gapValue')" prop="gap_value" width="100px" />
      <emqx-table-column :label="$t('common.processingMethod')" prop="processing_method">
        <template #default="{ row }">
          {{ getDictName(row.processing_method, alarmRuleDialog.processingMethodList) }}
        </template>
      </emqx-table-column>
      <emqx-table-column :label="$t('common.faultLevel')" prop="fault_level" width="100px">
        <template #default="{ row }">
          {{ getDictName(row.fault_level, alarmRuleDialog.faultLevelList) }}
        </template>
      </emqx-table-column>
      <emqx-table-column :label="$t('common.description')" prop="description" />
      <emqx-table-column align="left" :label="$t('common.oper')" width="120px">
        <template #default="{ row }">
          <AComWithDesc :content="$t('common.edit')">
            <i class="el-icon-edit-outline" @click="editAlarmRule(row)" />
          </AComWithDesc>
          <AComWithDesc :content="$t('common.delete')">
            <i class="iconfont icondelete" @click="delAlarmRule(row)" />
          </AComWithDesc>
        </template>
      </emqx-table-column>
    </emqx-table>
    <emqx-pagination
      v-if="pageController.total > 10"
      layout="total, sizes, prev, pager, next, jumper"
      v-model:current-page="pageController.num"
      :page-sizes="[10, 20, 30, 40, 50]"
      :total="pageController.total"
      :page-size="pageController.size"
      @size-change="handleSizeChange"
      @current-change="dbGetAlarmRules"
    />
  </emqx-card>

  <AlarmRuleDialog ref="alarmRuleDialog" :deviceName="node.name" @submitted="dbGetAlarmRules"></AlarmRuleDialog>
</template>

<script lang="ts" setup>
import { ref, computed, nextTick, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { MessageBoxConfirm } from '@/utils/element'
import ViewHeaderBar from '@/components/ViewHeaderBar.vue'
import AComWithDesc from '@/components/AComWithDesc.vue'
import KeywordSerachInput from '@/components/KeywordSearchInput.vue'
import useExportAlarmRule from '@/composables/config/useExportAlarmRule'
import { useDownload } from '@/composables/useDownload'
import useTableFileReader from '@/composables/useTableFileReader'
import http from '@/utils/http'
import { EmqxMessage } from '@emqx/emqx-ui'
import { queryAlarmRluleList, addAlarmRlule, updateAlarmRlule, deleteAlarmRlule } from '@/api/alarmRules'
import { forEach } from 'lodash'
import { useRouter } from 'vue-router'

const AlarmRuleDialog = defineAsyncComponent(() => import('@/views/config/southDriver/components/AlarmRuleDialog.vue'))
const { downloadFile } = useDownload()
const { fileReader } = useTableFileReader()
const route = useRoute()
const { t } = useI18n()
const { isExporting, exportTable } = useExportAlarmRule()
const router = useRouter()
// 路由传递参数
const node = computed(() => route.query)
// 是否正在加载列表数据
const isListLoading = ref(false)
// 点位名称查询条件
const pointName = ref('')
// 显示对话框
const showDialog = ref(false)
const alarmRuleDialog = ref<{
  initForm: (alarmRuleInfo: any) => void
  groupList: any[]
  operatorList: any[]
  processingMethodList: any[]
  faultLevelList: any[]
}>()
// 分页控制器数据
const pageController = ref({
  num: 1,
  size: 10,
  total: 0,
})
// 报警规则列表数据
const alarmRules = ref([] as any)

// 查询报警规则列表
const dbGetAlarmRules = async () => {
  if (!node.value.name) {
    router.push({ name: 'SouthDriver' })
  }
  const parms: any = {
    page: pageController.value.num,
    page_size: pageController.value.size,
    device_name: node.value.name,
  }
  if (pointName.value && pointName.value !== '') {
    parms.tag_name = pointName.value
  }
  const result = await queryAlarmRluleList(parms)
  alarmRules.value = result.data.abnormal_setting
  pageController.value.total = result.data.total_num
}

// 清除查询条件并刷新列表数据
const clearQuery = () => {
  pointName.value = ''
  dbGetAlarmRules()
}

// 添加报警规则
const addAlarmRules = () => {
  alarmRuleDialog.value?.initForm({})
}

// 导入报警规则模板数据并解析为列表数据
const importAlarmRules = async (file: File) => {
  const data = await fileReader(file)
  const importList = ((data[0] && data[0].sheet) || []) as Array<any>
  if (!importList.length) {
    EmqxMessage.warning(t('config.validTableError'))
    return false
  }

  try {
    // 使用 Promise.all 替代循环内的 await
    await Promise.all(
      importList.map(async (item) => {
        // 代入设备名称
        item.device_name = node.value.name
        // 转化运算符
        item.operator = getDictValue(item.operator, alarmRuleDialog.value?.operatorList)
        // 转化处理方式
        item.processing_method = getDictValue(item.processing_method, alarmRuleDialog.value?.processingMethodList)
        // 转化故障等级
        item.fault_level = getDictValue(item.fault_level, alarmRuleDialog.value?.faultLevelList)
        // 保存信息
        await addAlarmRlule(item)
      }),
    )
    dbGetAlarmRules()
  } catch (error) {
    // 错误处理
    EmqxMessage.warning('导入出现错误！')
  }
}

// 下载导入模板
const downloadTemplate = async () => {
  const fileName = 'alarm_rule_template.xlsx'
  try {
    const { pathname } = window.location
    const fileURL = `${pathname.slice(-1) === '/' ? pathname.slice(0, -1) : pathname}/template/${fileName}`
    const { data } = await http.get(fileURL, { responseType: 'blob', baseURL: '' })
    downloadFile({ 'content-type': 'application/octet-stream', 'content-disposition': `filename=${fileName}` }, data)
  } catch (error) {
    console.error(error)
  }
}

// 导出报警规则列表数据到文件
const exportAlarmRules = () => {
  const exportList = alarmRules.value.filter((item: any) => item.checked)
  if (!exportList.length) {
    EmqxMessage.warning('请先选择需要导出的数据！')
    return false
  }
  exportTable(exportList, `${node.value.name}报警规则`)
}

// 编辑报警规则
const editAlarmRule = (row: any) => {
  alarmRuleDialog.value?.initForm(row)
}

// 删除报警规则
const delAlarmRule = async (row: any) => {
  await MessageBoxConfirm(t('common.confirmDelete'))
  await deleteAlarmRlule({ device_name: row.device_name, group_name: row.group_name, tag_name: row.tag_name })
  dbGetAlarmRules()
}

// 分页大小改变时触发的事件处理函数
const handleSizeChange = (size: number) => {
  pageController.value.size = size
  pageController.value.num = 1
  dbGetAlarmRules()
}

// 字典转化(值转文本)
const getDictName = (node: any, dictList: any[]) => {
  const index = dictList.findIndex((item: any) => {
    return item.value === node
  })
  if (index > -1) {
    return dictList[index].key
  }

  return node
}

// 字典转化(文本转值)
const getDictValue = (node: any, dictList?: any[]) => {
  if (!dictList) return node
  const index = dictList.findIndex((item: any) => {
    return item.key === node
  })
  if (index > -1) {
    return dictList[index].value
  }

  return node
}

const allChecked = computed({
  get() {
    if (alarmRules.value.length === 0) {
      return false
    }
    return alarmRules.value.every(({ checked }: any) => checked)
  },
  set(val: boolean) {
    alarmRules.value.forEach((item: any) => {
      item.checked = val
    })
  },
})

dbGetAlarmRules()
</script>

<style lang="scss" scoped>
.driver-name {
  margin-right: 22px;
}

.btn-group {
  &:not(:last-child) {
    margin-right: 32px;
  }
}

.uploader-tag,
.export-tags--btn {
  display: inline-block;
  margin-left: 10px;
}

.search-input {
  margin-right: 10px;
}

.btn-download-temp-popper .el-dropdown-menu {
  padding: 0;
}
.btn-download-temp {
  font-weight: normal;
  border: none;
}
</style>
