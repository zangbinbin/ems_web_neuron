<template>
  <emqx-card class="faults">
    <ViewHeaderBar>
      <template v-slot:right>
        <!-- <el-date-picker v-model="row[fieldName(field.name)]" size="small" value-format="MM/DD" range-separator="-"
          format="MM/DD" :start-placeholder="$t('common.startDate')" :end-placeholder="$t('common.endDate') "
          type="daterange" /> -->
        <el-date-picker v-model="query.time" type="datetimerange" size="small" value-format="YYYY-MM-DD HH:mm:ss"
          range-separator="-" :start-placeholder="$t('common.startDate')" :end-placeholder="$t('common.endDate') "
          :default-time="defaultTime" />
        <emqx-button style="margin-left: 20px;" size="small" type="primary" @click="getTableData">{{
          $t('config.query')
          }}</emqx-button>
      </template>
    </ViewHeaderBar>

    <div class="table-container">
      <emqx-table :data="tableData" :empty-text="tableEmptyText" @sort-change="sortDataByKey">
        <emqx-table-column label="Id" width="80" sortable="custom" prop="id"></emqx-table-column>
        <emqx-table-column :label="$t('config.desc')" min-width="150" prop="description" />
        <emqx-table-column :label="$t('config.driver')" width="90" sortable="custom" prop="driver_name" />
        <emqx-table-column :label="$t('config.groupName')" width="90" sortable="custom" prop="group_name" />
        <emqx-table-column :label="$t('config.tag')" min-width="150" sortable="custom" prop="tag_name" />
        <emqx-table-column :label="$t('common.abnormalValue')" min-width="100" sortable="custom" prop="abnormal_value" />
        <emqx-table-column :label="$t('common.state')" width="90" sortable="custom" prop="stateToShow" />
        <emqx-table-column :label="$t('common.createdTime')" min-width="150" sortable="custom" prop="created_time" />
        <emqx-table-column :label="$t('common.finishTime')" min-width="150" sortable="custom" prop="updated_time" />
        <!-- <emqx-table-column width="100" :label="$t('common.oper')" fixed="right">
          <template #default="{ row }">
            <emqx-button type="text" @click="writeData(row)" v-if="canWrite(row)">Write</emqx-button>
          </template>
        </emqx-table-column> -->
      </emqx-table>
    </div>
    <emqx-pagination v-if="pageController.total > 100" layout="total, sizes, prev, pager, next, jumper"
      v-model:current-page="pageController.num" :page-sizes="[100, 200, 300, 400, 500]" :total="pageController.total"
      :page-size="pageController.size" @size-change="handleSizeChange" />
  </emqx-card>
</template>

<script lang="ts" setup>
import type { Ref } from 'vue'
import { ref } from 'vue'
import { ElPopover } from 'element-plus'
import type { TagDataInTable } from '@/composables/data/useDataMonitoring'
import useDataFaults from '@/composables/data/useDataFaults'
import dateformat from 'dateformat'
import { getErrorMsg } from '@/utils/utils'
import ViewHeaderBar from '@/components/ViewHeaderBar.vue'
import KeywordSerachInput from '@/components/KeywordSearchInput.vue'
import { ElDatePicker } from 'element-plus'

const {
  query,
  defaultTime,
  keywordSearch,
  pageController,
  tableData,
  tableEmptyText,
  getTableData,
  handleSizeChange,
  sortDataByKey,
} = useDataFaults()
</script>

<style lang="scss">
.faults {
  .filter-selector {
    width: 220px;
  }
  .target-select {
    > div {
      display: inline-block;
      &:not(:last-child) {
        margin-right: 16px;
      }
    }
  }
  .table-container {
    margin-bottom: 24px;
  }
  .emqx-pagination {
    text-align: right;
  }
  .value-column-hd {
    display: flex;
    align-items: center;
  }
  .iconalarm {
    font-size: 22px;
    margin-left: 4px;
    font-weight: normal;
    cursor: pointer;
    color: var(--main-green-color);
  }
  .has-error {
    color: var(--main-red-color);
  }
}
</style>
