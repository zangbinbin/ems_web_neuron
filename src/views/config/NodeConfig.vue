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
      <div v-if="isNeedConfigType">
        <!-- Tab Nav -->
        <div class="tab-nav">
          <div @click="changeTab(0)" :class="{ active: currentIndex === 0 }" style="border-radius: 5px 0px 0px 5px">
            $t('config.tabPolicy')
          </div>
          <div @click="changeTab(1)" :class="{ active: currentIndex === 1 }">$t('config.tabPoint')</div>
          <div @click="changeTab(2)" :class="{ active: currentIndex === 2 }">$t('config.tabConnection')</div>
          <div @click="changeTab(3)" :class="{ active: currentIndex === 3 }" style="border-radius: 0px 5px 5px 0px">
            $t('config.tabOther')
          </div>
        </div>
        <!-- Tab Content -->
        <div>
          <div v-show="currentIndex === 0">
            <emqx-form ref="formCom" :model="configForm">
              <template v-for="field in fieldList" :key="field.key">
                <emqx-row v-if="field.info.tab === 0">
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
          <div v-show="currentIndex === 2">
            <emqx-form ref="formCom" :model="configForm">
              <template v-for="field in fieldList" :key="field.key">
                <emqx-row v-if="field.info.tab === 2">
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
          <div v-show="currentIndex === 3">
            <emqx-form ref="formCom" :model="configForm">
              <template v-for="field in fieldList" :key="field.key">
                <emqx-row v-if="!field.info.tab">
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
      <div v-if="!isNeedConfigType">
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
// add plugin-config style
const isNeedConfigType = computed(
  () =>
    node.value &&
    (node.value.toLocaleLowerCase() === 'grid_connect_off' ||
      node.value.toLocaleLowerCase() === 'economy_work' ||
      node.value.toLocaleLowerCase() === 'strategy_demo' ||
      node.value.toLocaleLowerCase() === 'primary'),
)
const currentIndex = ref(0)
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
  }
  .tab-nav > div {
    min-width: 100px;
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
