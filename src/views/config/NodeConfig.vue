<template>
  <div class="node-config" v-emqx-loading="isLoading">
    <emqx-card shadow="none" class="node-config-bd">
      <h3 class="card-title">{{ cardTitle }}</h3>
      <div class="bar-left common-flex">
        <p class="driver-name">
          <label>{{ labelForNodeName }}</label>
          <span>{{ node }}</span>
        </p>
      </div>
      <!-- Policy configuration that requires tab classification -->
      <div v-if="pluginName === 'primary'">
        <!-- Tab Nav -->
        <div class="tab-nav">
          <div @click="changeTab(99)" :class="{ active: currentIndex === 99 }" style="border-radius: 5px 0px 0px 5px">
            {{ $t('config.tabOther') }}
          </div>
          <div @click="changeTab(1)" :class="{ active: currentIndex === 1 }" style="border-radius: 0px 5px 5px 0px">
            {{ $t('config.tabCore') }}
          </div>
          <!-- <div @click="changeTab(5)" :class="{ active: currentIndex === 5 }">
            {{ $t('config.tabPeakShaveValleyFill') }}
          </div> -->
          <div @click="changeTab(6)" :class="{ active: currentIndex === 6 }">
            {{ $t('config.tabPeakShaveValleyFillMS') }}
          </div>
          <div @click="changeTab(7)" :class="{ active: currentIndex === 7 }">
            {{ $t('config.lightStoragePriority') }}
          </div>
          <!-- <div @click="changeTab(9)" :class="{ active: currentIndex === 9 }">{{ $t('config.tabDemandManage') }}</div> -->
          <!-- <div @click="changeTab(10)" :class="{ active: currentIndex === 10 }">
            {{ $t('config.tabBackFlowPrevente') }}
          </div> -->
          <!-- <div @click="changeTab(44)" :class="{ active: currentIndex === 44 }">{{ $t('config.tabEconomyWork') }}</div>
          <div @click="changeTab(45)" :class="{ active: currentIndex === 45 }">
            {{ $t('config.tabGridConnectOff') }}
          </div> -->
          <!-- <div @click="changeTab(50)" :class="{ active: currentIndex === 50 }">{{ $t('config.tabAbnormalList') }}</div> -->
          <div @click="changeTab(55)" :class="{ active: currentIndex === 55 }">
            {{ $t('config.tabDataStorageList') }}
          </div>
          <div @click="changeTab(70)" :class="{ active: currentIndex === 70 }">{{ $t('config.tabPoint') }}</div>
          <div @click="changeTab(80)" :class="{ active: currentIndex === 80 }">{{ $t('config.tabConnection') }}</div>
        </div>
        <!-- Tab Content -->
        <div>
          <div v-show="currentIndex === 1">
            <emqx-form ref="formCom" :model="configForm">
              <template v-for="field in fieldList" :key="field.key">
                <emqx-row v-if="field.info.tab === 1">
                  <NodeConfigParamItem
                    :ref="setParamRef"
                    v-if="shouldFieldShow(field, configForm)"
                    v-model="configForm[field.key]"
                    :param-key="field.key"
                    :param-info="field.info"
                    :default-data="defaultConfigData"
                    @validateFileds="validateFileds"
                  />
                </emqx-row>
              </template>
            </emqx-form>
          </div>
          <div v-show="currentIndex === 5">
            <emqx-form ref="formCom" :model="configForm">
              <template v-for="field in fieldList" :key="field.key">
                <emqx-row v-if="field.info.tab === 5">
                  <NodeConfigParamItem
                    :ref="setParamRef"
                    v-if="shouldFieldShow(field, configForm)"
                    v-model="configForm[field.key]"
                    :param-key="field.key"
                    :param-info="field.info"
                    :default-data="defaultConfigData"
                    @validateFileds="validateFileds"
                  />
                </emqx-row>
              </template>
            </emqx-form>
          </div>
          <div v-show="currentIndex === 6">
            <emqx-form ref="formCom" :model="configForm">
              <template v-for="field in fieldList" :key="field.key">
                <emqx-row v-if="field.info.tab === 6">
                  <NodeConfigParamItem
                    :ref="setParamRef"
                    v-if="shouldFieldShow(field, configForm)"
                    v-model="configForm[field.key]"
                    :param-key="field.key"
                    :param-info="field.info"
                    :default-data="defaultConfigData"
                    @validateFileds="validateFileds"
                  />
                </emqx-row>
              </template>
            </emqx-form>
          </div>
          <div v-show="currentIndex === 7">
            <emqx-form ref="formCom" :model="configForm">
              <template v-for="field in fieldList" :key="field.key">
                <emqx-row v-if="field.info.tab === 7">
                  <NodeConfigParamItem
                    :ref="setParamRef"
                    v-if="shouldFieldShow(field, configForm)"
                    v-model="configForm[field.key]"
                    :param-key="field.key"
                    :param-info="field.info"
                    :default-data="defaultConfigData"
                    @validateFileds="validateFileds"
                  />
                </emqx-row>
              </template>
            </emqx-form>
          </div>
          <div v-show="currentIndex === 9">
            <emqx-form ref="formCom" :model="configForm">
              <template v-for="field in fieldList" :key="field.key">
                <emqx-row v-if="field.info.tab === 9">
                  <NodeConfigParamItem
                    :ref="setParamRef"
                    v-if="shouldFieldShow(field, configForm)"
                    v-model="configForm[field.key]"
                    :param-key="field.key"
                    :param-info="field.info"
                    :default-data="defaultConfigData"
                    @validateFileds="validateFileds"
                  />
                </emqx-row>
              </template>
            </emqx-form>
          </div>
          <div v-show="currentIndex === 10">
            <emqx-form ref="formCom" :model="configForm">
              <template v-for="field in fieldList" :key="field.key">
                <emqx-row v-if="field.info.tab === 10">
                  <NodeConfigParamItem
                    :ref="setParamRef"
                    v-if="shouldFieldShow(field, configForm)"
                    v-model="configForm[field.key]"
                    :param-key="field.key"
                    :param-info="field.info"
                    :default-data="defaultConfigData"
                    @validateFileds="validateFileds"
                  />
                </emqx-row>
              </template>
            </emqx-form>
          </div>
          <div v-show="currentIndex === 44">
            <emqx-form ref="formCom" :model="configForm">
              <template v-for="field in fieldList" :key="field.key">
                <emqx-row v-if="field.info.tab === 44">
                  <NodeConfigParamItem
                    :ref="setParamRef"
                    v-if="shouldFieldShow(field, configForm)"
                    v-model="configForm[field.key]"
                    :param-key="field.key"
                    :param-info="field.info"
                    :default-data="defaultConfigData"
                    @validateFileds="validateFileds"
                  />
                </emqx-row>
              </template>
            </emqx-form>
          </div>
          <div v-show="currentIndex === 45">
            <emqx-form ref="formCom" :model="configForm">
              <template v-for="field in fieldList" :key="field.key">
                <emqx-row v-if="field.info.tab === 45">
                  <NodeConfigParamItem
                    :ref="setParamRef"
                    v-if="shouldFieldShow(field, configForm)"
                    v-model="configForm[field.key]"
                    :param-key="field.key"
                    :param-info="field.info"
                    :default-data="defaultConfigData"
                    @validateFileds="validateFileds"
                  />
                </emqx-row>
              </template>
            </emqx-form>
          </div>
          <div v-show="currentIndex === 50">
            <emqx-form ref="formCom" :model="configForm">
              <template v-for="field in fieldList" :key="field.key">
                <emqx-row v-if="field.info.tab === 50">
                  <NodeConfigParamItem
                    :ref="setParamRef"
                    v-if="shouldFieldShow(field, configForm)"
                    v-model="configForm[field.key]"
                    :param-key="field.key"
                    :param-info="field.info"
                    :default-data="defaultConfigData"
                    @validateFileds="validateFileds"
                  />
                </emqx-row>
              </template>
            </emqx-form>
          </div>
          <div v-show="currentIndex === 55">
            <emqx-form ref="formCom" :model="configForm">
              <template v-for="field in fieldList" :key="field.key">
                <emqx-row v-if="field.info.tab === 55">
                  <NodeConfigParamItem
                    :ref="setParamRef"
                    v-if="shouldFieldShow(field, configForm)"
                    v-model="configForm[field.key]"
                    :param-key="field.key"
                    :param-info="field.info"
                    :default-data="defaultConfigData"
                    @validateFileds="validateFileds"
                  />
                </emqx-row>
              </template>
            </emqx-form>
          </div>
          <div v-show="currentIndex === 70">
            <emqx-form ref="formCom" :model="configForm">
              <template v-for="field in fieldList" :key="field.key">
                <emqx-row v-if="field.info.tab === 70">
                  <NodeConfigParamItem
                    :ref="setParamRef"
                    v-if="shouldFieldShow(field, configForm)"
                    v-model="configForm[field.key]"
                    :param-key="field.key"
                    :param-info="field.info"
                    :default-data="defaultConfigData"
                    @validateFileds="validateFileds"
                  />
                </emqx-row>
              </template>
            </emqx-form>
          </div>
          <div v-show="currentIndex === 80">
            <emqx-form ref="formCom" :model="configForm">
              <template v-for="field in fieldList" :key="field.key">
                <emqx-row v-if="field.info.tab === 80">
                  <NodeConfigParamItem
                    :ref="setParamRef"
                    v-if="shouldFieldShow(field, configForm)"
                    v-model="configForm[field.key]"
                    :param-key="field.key"
                    :param-info="field.info"
                    :default-data="defaultConfigData"
                    @validateFileds="validateFileds"
                  />
                </emqx-row>
              </template>
            </emqx-form>
          </div>
          <div v-show="currentIndex === 99">
            <emqx-form ref="formCom" :model="configForm">
              <template v-for="field in fieldList" :key="field.key">
                <emqx-row v-if="field.info.tab === null || field.info.tab === undefined || field.info.tab === 99">
                  <NodeConfigParamItem
                    :ref="setParamRef"
                    v-if="shouldFieldShow(field, configForm)"
                    v-model="configForm[field.key]"
                    :param-key="field.key"
                    :param-info="field.info"
                    :default-data="defaultConfigData"
                    @validateFileds="validateFileds"
                  />
                </emqx-row>
              </template>
            </emqx-form>
          </div>
        </div>
      </div>
      <!-- Policy configuration that does not require tab classification -->
      <div v-else>
        <emqx-form ref="formCom" :model="configForm">
          <template v-for="field in fieldList" :key="field.key">
            <emqx-row>
              <NodeConfigParamItem
                :ref="setParamRef"
                v-if="shouldFieldShow(field, configForm)"
                v-model="configForm[field.key]"
                :param-key="field.key"
                :param-info="field.info"
                :default-data="defaultConfigData"
                @validateFileds="validateFileds"
              />
            </emqx-row>
          </template>
        </emqx-form>
      </div>
      <template v-if="!isLoading && fieldList.length === 0">
        <div class="empty-placeholder">
          <emqx-empty :description="$t('config.noConfigInfoDesc')" />
          <emqx-button @click="cancel" size="small">{{ $t('common.back') }}</emqx-button>
        </div>
      </template>
    </emqx-card>
    <emqx-card v-if="!isLoading && fieldList.length > 0" shadow="none" class="node-config-ft">
      <emqx-button type="primary" :loading="isSubmitting" @click="submit">{{ $t('common.submit') }}</emqx-button>
      <emqx-button @click="cancel">{{ $t('common.cancel') }}</emqx-button>
      <emqx-button @click.stop="reset">{{ $t('common.reset') }}</emqx-button>
    </emqx-card>
  </div>
</template>

<script lang="ts" setup>
import type { PropType } from 'vue'
import { computed, defineProps, ref } from 'vue'
import useNodeConfig from '@/composables/config/useNodeConfig'
import { DriverDirection } from '@/types/enums'
import NodeConfigParamItem from './components/NodeConfigParamItem.vue'
import { useI18n } from 'vue-i18n'
import useNodeConfigParamCommon from '@/composables/config/useNodeConfigParamCommon'

const props = defineProps({
  direction: {
    type: Number as PropType<DriverDirection>,
    required: true,
  },
})

const { t } = useI18n()
const cardTitle = computed(() =>
  t(props.direction === DriverDirection.North ? 'config.appConfig' : 'config.deviceConfig'),
)
const labelForNodeName = computed(() =>
  t(props.direction === DriverDirection.North ? 'config.appName' : 'config.deviceName'),
)
const { shouldFieldShow } = useNodeConfigParamCommon()
const {
  node,
  pluginName,
  configForm,
  defaultConfigData,
  fieldList,
  isLoading,
  formCom,
  setParamRef,
  isSubmitting,
  submit,
  cancel,
  reset,
  validateFileds,
} = useNodeConfig(props)
const currentIndex = ref(1)
const changeTab = (index: number) => {
  // 切换当前选中的Tab
  currentIndex.value = index
}
</script>

<style lang="scss">
.node-config {
  .node-config-ft {
    text-align: center;
    .emqx-button {
      width: 130px;
    }
  }
  .node-config-bd {
    margin-bottom: 24px;
    min-height: 200px;
  }
  .emqx-row {
    padding-top: 16px;
  }
  .emqx-row:empty {
    padding-top: 0; /* 当没有子标签时，将向上间距设置为 0 */
  }
  .el-radio-group {
    width: 100%;
  }
  .empty-placeholder {
    padding-bottom: 60px;
    text-align: center;
  }
  .tab-nav {
    display: flex;
    margin-bottom: 10px;
    margin-top: 10px;
    overflow-x: auto;
  }
  .tab-nav > div {
    min-width: 130px;
    max-width: 150px;
    text-align: center;
    padding: 12px;
    cursor: pointer;
    border: 0.2px solid #ccc;
    border-bottom: none;
    background-color: #f0f0f0;
  }
  .tab-nav > div.active {
    background-color: #46affe;
    border-color: #46affe;
    color: #ffffff;
    font-size: 17px;
  }
}
</style>
