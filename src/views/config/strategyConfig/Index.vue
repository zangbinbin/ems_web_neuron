<template>
  <emqx-card v-emqx-loading="isListLoading">
    <emqx-row v-if="pluginList.length > 0">
      <emqx-col :span="4" class="mb10">
        <div class="tabs-wrapper">
          <div class="tabs-left" id="tabsLeft">
            <div
              v-for="tab in pluginList"
              :key="tab.name"
              class="tab-item"
              :class="{ active: activeTab === tab.name }"
              @click="switchTab(tab)"
            >
              <span v-if="tab.node_description && tab.node_description != ''" class="align-right">
                {{ tab.name }}（{{ tab.node_description }}）
              </span>
              <span v-else>{{ tab.name }}</span>
            </div>
          </div>
        </div>
      </emqx-col>
      <emqx-col :span="20" class="mb10">
        <emqx-row :gutter="24">
          <!-- 策略卡片 -->
          <emqx-col :span="12" class="mb10" v-for="(item, index) in strategyList" :key="index">
            <div class="node-card setup-item-card">
              <emqx-row>
                <emqx-col :span="20" class="align-center">
                  <span style="font-size: 20px; font-weight: 900">{{ getConfigByType(item.strategy_name).name }}</span>
                </emqx-col>
                <emqx-col :span="4">
                  <img
                    :src="require(`../../../assets/images/${item.icon}.png`)"
                    alt="neuron-logo"
                    width="70"
                    height="70"
                  />
                </emqx-col>
                <emqx-col :span="24" class="mb10">
                  <span>
                    {{ item.description }}
                  </span>
                </emqx-col>
                <emqx-col :span="20" class="mb10">
                  <div class="node-item-info-row common-flex">
                    <div class="common-flex">
                      <label>{{ $t('config.workStatus') }}</label>
                      <div>
                        <svg class="iconfont icon-svg" aria-hidden="true">
                          <use :xlink:href="item.open ? '#iconrunning' : '#iconstopped'" />
                        </svg>
                        <span>{{ item.open ? '启用' : '停用' }}</span>
                      </div>
                    </div>
                    <div class="common-flex">
                      <emqx-switch v-model="item.open" @click="editStatus(item)" />
                    </div>
                  </div>
                </emqx-col>
                <emqx-col :span="4" style="text-align: center">
                  <el-link type="primary" href="javascript:;" style="font-size: 16px" @click="editInfo(item)">
                    编辑
                  </el-link>
                </emqx-col>
              </emqx-row>
            </div>
          </emqx-col>
        </emqx-row>
      </emqx-col>
    </emqx-row>
    <emqx-row v-else>
      <emqx-col :span="24" class="mb10">
        <emqx-empty class="empty" description="请先在应用管理中添加站点应用" />
      </emqx-col>
    </emqx-row>
  </emqx-card>
</template>

<script lang="ts" setup>
import { ref, computed, nextTick, defineAsyncComponent, watch } from 'vue'
import { ElLink } from 'element-plus'
import { queryNorthDriverList } from '@/api/config'
import { queryList, updateInfo } from '@/api/strategyConfig'
import { useRouter } from 'vue-router'
import { getConfigByType } from '@/utils/strategyConfig'
import { EmqxMessage } from '@emqx/emqx-ui'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()
const isListLoading = ref(false)
const activeTab = ref('')
const plannedCurveStatus = ref(true)
const backflowPreventionStatus = ref(true)
const loadControlStatus = ref(true)
const pluginList = ref([] as any)
const pluginInfo = ref({} as any)
const strategyList = ref([])

// 查询站点列表
const queryPluginList = async () => {
  const listArray = await Promise.all([await queryNorthDriverList({ plugin: 'primary' })])
  pluginList.value = listArray.flat()
  if (pluginList.value && pluginList.value.length > 0) {
    activeTab.value = pluginList.value[0].name
    pluginInfo.value = pluginList.value[0]
    queryStategyInfo()
  }
}

// 查询策略信息
const queryStategyInfo = async () => {
  isListLoading.value = true
  const result = await queryList({ node_name: activeTab.value })
  if (result.data.strategy_switch && result.data.strategy_switch.length > 0) {
    strategyList.value = result.data.strategy_switch
    strategyList.value.forEach((item: any) => {
      item.open = item.open === 1
    })
  }
  isListLoading.value = false
}

// 切换站点
const switchTab = async (tab: any) => {
  activeTab.value = tab.name
  pluginInfo.value = tab
  queryStategyInfo()
}

// 编辑策略状态
const editStatus = async (item: any) => {
  isListLoading.value = true
  try {
    await updateInfo({ node_name: activeTab.value, strategy_name: item.strategy_name, open: item.open ? 1 : 0 })
    EmqxMessage.success(t('common.operateSuccessfully'))
  } catch (error) {
    return Promise.reject()
  } finally {
    isListLoading.value = false
    queryStategyInfo()
  }
}

// 编辑策略信息
const editInfo = (item: any) => {
  // 赋值站点名称及描述
  item.siteName = pluginInfo.value.name
  item.siteDescription = pluginInfo.value.node_description
  const config = getConfigByType(item.strategy_name)
  if (config && config.routerName) {
    router.push({ name: config.routerName, query: item })
  } else {
    EmqxMessage.error('该策略暂无编辑页面')
  }
}

queryPluginList()
</script>

<style lang="scss" scoped>
.tabs-wrapper {
  display: flex;
  min-height: 400px;
  height: 100%;
}

.tabs-left {
  width: 95%;
  // background: #f5f7fa;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}

.tab-item {
  padding: 16px 20px;
  cursor: pointer;
  font-size: 14px;
  color: #606266;
  transition: all 0.3s;
  position: relative;
  user-select: none;
  // border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.tab-item:last-child {
  border-bottom: none;
}

.tab-item:hover {
  color: #409eff;
  background: rgba(64, 158, 255, 0.05);
}

.tab-item.active {
  color: #409eff;
  background: white;
  font-weight: 500;
  box-shadow: -2px 0 0 #409eff inset;
}

.tab-item i {
  margin-right: 8px;
  font-size: 16px;
}

.align-right {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .tabs-wrapper {
    flex-direction: column;
  }

  .tabs-left {
    width: 100%;
    flex-direction: row;
    overflow-x: auto;
    border-right: none;
    border-bottom: 1px solid #e4e7ed;
  }

  .tab-item {
    flex: 1;
    min-width: 120px;
    justify-content: center;
    border-bottom: none;
    border-right: 1px solid #e4e7ed;
  }

  .tab-item.active {
    box-shadow: 0 2px 0 #409eff inset;
  }
}

.setup-item-card {
  background-color: #f3f3ff;
  padding: 20px;
  height: 100%;
}

.mb10 {
  margin-bottom: 20px;
}

.align-center {
  display: flex;
  align-items: center;
}
</style>
