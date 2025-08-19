<template>
  <emqx-card class="auditLog">
    <h3 class="card-title">{{ $t('admin.auditLog') }}</h3>
    <div class="card-bar-under-title common-flex">
      <div>
        <div class="filter-item">
          <label>{{ $t('admin.timeRange') }}</label>
          <el-date-picker
            class="filter-date-picker"
            v-model="timeRange"
            type="datetimerange"
            @change="refreshData"
            :clearable="false"
          />
        </div>
      </div>
      <emqx-button type="primary" @click="getAuditLogs">{{ $t('common.submit') }}</emqx-button>
    </div>
    <div class="table-container">
      <emqx-table :data="tableData" :empty-text="$t('common.emptyData')">
        <emqx-table-column label="Id" prop="id"></emqx-table-column>
        <emqx-table-column :label="$t('admin.module')" prop="module"></emqx-table-column>
        <emqx-table-column :label="$t('admin.message')" prop="message"></emqx-table-column>
        <emqx-table-column :label="$t('admin.function')" prop="function"></emqx-table-column>
        <emqx-table-column :label="$t('admin.line')" prop="line"></emqx-table-column>
        <emqx-table-column :label="$t('admin.file')" prop="file"></emqx-table-column>
        <emqx-table-column :label="$t('admin.createdTime')" prop="created_time"></emqx-table-column>
      </emqx-table>
    </div>
    <emqx-pagination
      hide-on-single-page
      layout="total, sizes, prev, pager, next, jumper"
      v-model:current-page="pageController.num"
      :page-sizes="[50, 100, 500]"
      :page-count="pageController.totalPageNum"
      :page-size="pageController.size"
      :total="pageController.total"
      @current-change="getAuditLogs"
      @size-change="handleSizeChange"
    />
  </emqx-card>
</template>

<script setup lang="ts">
import useAuditLog from '@/composables/admin/useAuditLog'
import { ElDatePicker } from 'element-plus'

const { timeRange, tableData, pageController, getAuditLogs, refreshData, handleSizeChange } = useAuditLog()
</script>

<style lang="scss">
.auditLog {
  .filter-item {
    display: inline-block;
    margin-right: 16px;
  }
  .filter-date-picker,
  .filter-select {
    display: inline-block;
    line-height: 1;
  }
  .filter-date-picker {
    width: 360px;
  }
  .filter-select {
    width: 220px;
  }
  .table-container {
    margin-bottom: 24px;
  }
}
</style>
