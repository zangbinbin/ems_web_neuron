import type { Ref, WritableComputedRef } from 'vue'
import { computed, ref } from 'vue'
import { queryAuditLog } from '@/api/admin'
import { EmqxMessage } from '@emqx/emqx-ui'
import { useI18n } from 'vue-i18n'
import dateformat from 'dateformat'

export default () => {
  const startTime: Ref<number | undefined> = ref(new Date(Date.now() - 1000 * 60 * 60 * 24).getTime())
  const endTime: Ref<number | undefined> = ref(new Date().getTime())
  const tableData: Ref<Array<string>> = ref([])

  const pageController = ref({
    num: 1,
    size: 100,
    totalPageNum: 0,
    total: 0,
  })

  const { t } = useI18n()

  const getTimestampFromStr = (str: string | undefined) => {
    if (!str) {
      return undefined
    }
    return new Date(str).getTime()
  }

  const timeRange: WritableComputedRef<[string | undefined, string | undefined]> = computed({
    get() {
      return [
        startTime.value ? new Date(startTime.value).toString() : undefined,
        endTime.value ? new Date(endTime.value).toString() : undefined,
      ]
    },
    set([start, end]) {
      startTime.value = getTimestampFromStr(start)
      endTime.value = getTimestampFromStr(end)
    },
  })

  const getAuditLogs = async () => {
    if (!startTime.value || !endTime.value) {
      EmqxMessage.error(t('admin.timeRangeRequired'))
      return
    }
    const { size, num } = pageController.value
    const data: {
      start_time: number
      end_time: number
      page: number
      page_size: number
    } = {
      start_time: dateformat(startTime.value, 'yyyy-mm-dd HH:MM:ss'),
      end_time: dateformat(endTime.value, 'yyyy-mm-dd HH:MM:ss'),
      page: num == null ? 1 : num,
      page_size: size,
    }
    tableData.value = []
    const { data: ret } = await queryAuditLog(data)
    tableData.value = ret.audit_log
    pageController.value.totalPageNum = Math.ceil(Number(ret.total_num) / size)
    pageController.value.total = ret.total_num
  }

  const handleSizeChange = (size: number) => {
    pageController.value = {
      size,
      num: 1,
      totalPageNum: 1,
      total: 0,
    }
    getAuditLogs()
  }

  const refreshData = () => {
    const { size } = pageController.value
    pageController.value = {
      size,
      num: 1,
      totalPageNum: 1,
      total: 0,
    }
    getAuditLogs()
  }

  getAuditLogs()

  return {
    timeRange,
    pageController,
    tableData,
    getAuditLogs,
    refreshData,
    handleSizeChange,
  }
}
