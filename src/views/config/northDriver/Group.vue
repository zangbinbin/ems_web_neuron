<template>
  <emqx-card class="north-driver-group" v-emqx-loading="isListLoading">
    <h3 class="card-title">{{ $t('config.groupList') }}</h3>
    <div class="card-bar-under-title common-flex">
      <div class="bar-left common-flex">
        <p class="driver-name">
          <label>{{ $t('config.appName') }}</label>
          <span>{{ node_description ? node_description : node }}</span>
          <!-- <i class="el-icon-edit icon-edit" :title="$t('common.edit')" @click="editNodeName" /> -->
        </p>
      </div>
      <div class="btns common-flex">
        <div class="btn-group">
          <emqx-button
            size="small"
            type="primary"
            :disabled="!subCheckedList.length"
            :loading="isExporting"
            @click="exportExcel"
          >
            {{ $t('config.exportExcel') }}
          </emqx-button>
          <emqx-button size="small" type="primary" @click="addSubscription">
            {{ $t('config.addSubscription') }}
          </emqx-button>
          <emqx-button size="small" type="warning" :disabled="!subscriptionList.length" @click="clearSubscription">{{
            $t('common.clear')
          }}</emqx-button>
          <emqx-button size="small" type="danger" :disabled="!subCheckedList.length" @click="batchUnsubscribeGroups">{{
            $t('common.delete')
          }}</emqx-button>
        </div>
      </div>
    </div>
    <emqx-table :data="subscriptionList" :empty-text="$t('common.emptyData')">
      <emqx-table-column :width="28">
        <template #header>
          <emqx-checkbox v-model="allChecked" />
        </template>
        <template #default="{ row }">
          <emqx-checkbox v-model="row.checked" />
        </template>
      </emqx-table-column>
      <emqx-table-column label="No" :width="60">
        <template #default="{ index }">{{ index + 1 }}</template>
      </emqx-table-column>
      <emqx-table-column :label="$t('common.node_description')" prop="node_description" />
      <emqx-table-column :label="$t('common.sign')" prop="name">
        <!-- <template #default="{ row }">{{ row.driver }}</template> -->
        <template #default="{ row }">{{ convertNodeName(row.driver) }}</template>
      </emqx-table-column>
      <emqx-table-column :label="$t('config.groupName')" prop="group"></emqx-table-column>
      <emqx-table-column v-if="isMQTTPugin" :label="$t('config.topic')" show-overflow-tooltip>
        <template #default="{ row }">{{ row?.params?.topic }}</template>
      </emqx-table-column>
      <emqx-table-column v-if="isGewuPugin" label="productKey">
        <template #default="{ row }">{{ row?.params?.productKey }}</template>
      </emqx-table-column>
      <emqx-table-column align="left" :label="$t('common.oper')" width="140px">
        <template #default="{ row }">
          <AComWithDesc v-if="isMQTTPugin || isGewuPugin" :content="$t('common.edit')">
            <i class="el-icon-edit-outline" @click.stop="showEditGroupDialog(row)" />
          </AComWithDesc>
          <AComWithDesc :content="$t('config.unsubscribe')">
            <i class="iconfont icondelete" @click="unsubscribeGroup(row)" />
          </AComWithDesc>
        </template>
      </emqx-table-column>
    </emqx-table>
  </emqx-card>
  <AddSubscriptionDialog
    v-model="showAddSubscriptionDialog"
    :current-node="node"
    @submitted="handleAddSubscriptionSubmitted"
  />

  <EditSubcriptionGroup
    v-model="editGroupForm"
    v-model:dialog-visible="showEditGroupDailog"
    :is-edit="isEditGroup"
    :is-submitting="isSubmitting"
    @submitted="updateGroup"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useSubscriptionList } from '@/composables/config/useSubscription'
import { useDriverInfo } from '@/composables/config/useDriver'
import AddSubscriptionDialog from './components/AddSubscriptionDialog.vue'
import AComWithDesc from '@/components/AComWithDesc.vue'
import EditSubcriptionGroup from './components/EditSubcriptionGroup.vue'
import { convertNodeName } from '@/utils/driverNames'
import type { GroupData } from '@/types/config'
import { queryTagList } from '@/api/config'
import useGroupCommon from '@/composables/config/useGroupCommon'
import useExportPointExcel from '@/composables/config/useExportPointExcel'

const { isMQTTPugin, isGewuPugin } = useDriverInfo()

const {
  node,
  node_description,
  subscriptionList,
  subCheckedList,
  isListLoading,
  allChecked,

  unsubscribeGroup,
  clearSubscription,
  batchUnsubscribeGroups,
  getSubscriptionList,

  isEditGroup,
  showEditGroupDailog,
  editGroupForm,
  showEditGroupDialog,
  updateGroup,
  isSubmitting,
} = useSubscriptionList()

const showAddSubscriptionDialog = ref(false)

const { getTagsByGroups } = useGroupCommon()
const { isExporting, exportTable } = useExportPointExcel()

// 导出点位excel
const exportExcel = async () => {
  // 查询点位数据
  const requesList = subCheckedList.value.map(async (group: any) => {
    const result = await queryTagList({ node: group.driver, group: group.group })
    result.forEach((item: any) => {
      item.deviceName = group.driver
    })
    return result
  })

  // 数据格式转换
  const groupCheckedList = ref(JSON.parse(JSON.stringify(subCheckedList.value))) // 深拷贝
  groupCheckedList.value.forEach((item: GroupData) => {
    item.name = item.group
  })
  // 处理导出数据
  const tags = await getTagsByGroups(requesList, groupCheckedList.value)
  // 导出excel
  exportTable(tags, node.value)
}

const addSubscription = () => {
  showAddSubscriptionDialog.value = true
}
const handleAddSubscriptionSubmitted = () => {
  // 重新加载订阅列表
  getSubscriptionList()
}
</script>

<style lang="scss">
.north-driver-group {
  .driver-name {
    margin-right: 22px;
  }
  .icon-edit {
    margin-left: 8px;
  }
  .btn-group {
    &:not(:last-child) {
      margin-right: 32px;
    }
  }
}
</style>
