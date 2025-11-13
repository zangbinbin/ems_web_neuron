<template>
  <emqx-card v-emqx-loading="isListLoading">
    <emqx-row>
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
                  <span style="font-size: 20px; font-weight: 900">{{ item.name }}</span>
                </emqx-col>
                <emqx-col :span="4">
                  <img
                    :src="require(`../../../assets/images/${item.iconName}.png`)"
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
                          <use :xlink:href="item.status ? '#iconrunning' : '#iconstopped'" />
                        </svg>
                        <span>{{ item.status ? '启用' : '停用' }}</span>
                      </div>
                    </div>
                    <div class="common-flex">
                      <emqx-switch v-model="item.status" @click="editStatus(item)" />
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
  </emqx-card>
</template>

<script lang="ts" setup>
import { ref, computed, nextTick, defineAsyncComponent, watch } from 'vue'
import { ElLink } from 'element-plus'
import { queryNorthDriverList } from '@/api/config'
import { useRouter } from 'vue-router'
const router = useRouter()
const isListLoading = ref(false)
const activeTab = ref('')
const plannedCurveStatus = ref(true)
const backflowPreventionStatus = ref(true)
const loadControlStatus = ref(true)
const pluginList = ref([] as any)
const pluginInfo = ref({} as any)
const strategyList = ref([
  {
    id: 1,
    name: '计划曲线',
    type: 'plannedCurve',
    description:
      '系统根据预设的计划曲线，智能调整光伏发电和储能系统的出力。通过计划曲线策略，系统可以根据实际需求提前规划电力供应，提高能源利用效率。',
    status: true,
    iconName: '1',
  },
  {
    id: 2,
    name: '防逆流',
    type: 'backflowPrevention',
    description: '放电过程中，EMS通过监测并网点功率自动调整放电功率让其保持小于负荷功率避免PCS接入点发生逆流。',
    status: false,
    iconName: '3',
  },
  {
    id: 3,
    name: '需量控制',
    type: 'loadControl',
    description:
      '需量控制是监测电网用电功率与需量功率实时对比，通过储能输出减少从电网购电以消除需量电费的计费,降低峰值时的电费支出。',
    status: true,
    iconName: '2',
  },
])

// 计算属性确保有数据时才设置默认值
const defaultActiveTab = computed(() => {
  if (pluginList.value.length > 0) {
    pluginInfo.value = pluginList.value[0]
    return pluginList.value[0].name
  } else {
    return ''
  }
})

// 监听 pluginList 变化设置初始值
watch(
  pluginList,
  (newList) => {
    if (newList.length > 0 && !activeTab.value) {
      activeTab.value = newList[0].name
      pluginInfo.value = newList[0]
    }
  },
  { immediate: true },
)

// 查询站点列表
const queryPluginList = async () => {
  const listArray = await Promise.all([await queryNorthDriverList({ plugin: 'primary' })])
  pluginList.value = listArray.flat()
}

// 切换站点
const switchTab = async (tab: any) => {
  activeTab.value = tab.name
  pluginInfo.value = tab
  isListLoading.value = true
  setInterval(() => {
    isListLoading.value = false
  }, 500)
}

// 编辑策略状态
const editStatus = (item: any) => {
  console.log('编辑' + item.name + '状态')
}

// 编辑策略信息
const editInfo = (item: any) => {
  // 赋值站点名称及描述
  item.siteName = pluginInfo.value.name
  item.siteDescription = pluginInfo.value.node_description
  switch (item.type) {
    case 'plannedCurve':
      router.push({ name: 'PlannedCurve', query: item })
      break
    case 'backflowPrevention':
      router.push({ name: 'BackflowPrevention', query: item })
      break
    case 'loadControl':
      router.push({ name: 'LoadControl', query: item })
      break
    default:
      console.log('编辑未知策略信息')
      break
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
