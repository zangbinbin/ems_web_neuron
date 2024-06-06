import { getHistoryData } from '@/api/data'
import type { TagDataInHistoryData } from '@/types/data'
import { paginate, listOrderByKey, spliceKeywords } from '@/utils/utils'
import type { Ref } from 'vue'
import { computed, onUnmounted, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import { debounce, cloneDeep } from 'lodash'
import { EmqxMessage } from '@emqx/emqx-ui'

export interface TagDataInTable extends TagDataInHistoryData {
  id: number
  driver_name: string
  group_name: string
  tag_name: string
  value: string
  description: string
  created_time: string
  error: number
}

export default () => {
  const { t } = useI18n()
  const store = useStore()

  const query = ref({
    time: [] as any,
  })

  const defaultTime = [
    new Date(2000, 1, 1, 0, 0, 0),
    new Date(2000, 2, 1, 23, 59, 59),
  ] // '00:00:00', '23:59:59'

  const keywordSearch = ref('')

  const sortBy = ref({
    prop: '',
    order: '',
  })

  const pageController = ref({
    num: 1,
    size: 100,
    total: 0,
  })
  const totalData: Ref<Array<TagDataInTable>> = ref([])
  const totalDataBackup: Ref<Array<TagDataInTable>> = ref([])


  const tableEmptyText = computed(() =>
    pageController.value.total && pageController.value.total > 0 ? t('data.selectGroupTip') : t('common.emptyData'),
  )

  const tableData = computed(() => {
    return paginate(totalData.value, pageController.value.size, pageController.value.num)
  })

  const sortDataByKey = (data: { prop: string | null; order: string | null }) => {
    const { prop, order } = data

    if (order && prop) {
      const sortByOrder = order.includes('asc') ? 'asc' : 'desc'
      sortBy.value.order = sortByOrder
      sortBy.value.prop = prop
      totalData.value = listOrderByKey(totalData.value, prop, sortByOrder)
    } else {
      sortBy.value = {
        order: '',
        prop: '',
      }
      totalData.value = cloneDeep(totalDataBackup.value)
    }
  }

  const getTableData = async () => {
    if (!query.value.time || !query.value.time[0] || !query.value.time[1]) {
      const now = new Date();
      const endDate = now.toISOString().slice(0, 19); // 包括时分秒的当前日期
      const startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate(), 23, 59, 59).toISOString().slice(0, 19); // 当前日期加一个月，设置为23:59:59
      query.value.time = [startDate, endDate];
    }
    try { 

      const { data } = await getHistoryData(query.value.time[0], query.value.time[1])      

      totalData.value = (data.history_data || []).map((item: any) => {
        const ret =  { ...item}
        return ret
      })

      pageController.value.total = data.history_data.length

      totalDataBackup.value = cloneDeep(totalData.value)
      sortDataByKey(sortBy.value)

    } catch (error: any) {
      EmqxMessage.error(t('common.jsonFormatError'))   
    }
  }

  const initPageController = () => {
    pageController.value.num = 1
    pageController.value.total = 0
  }


  // const resetKeywordSearch = () => {
  //   keywordSearch.value = ''
  // }

  const handleSizeChange = (size: number) => {
    pageController.value.size = size
    pageController.value.num = 1
  }

  onMounted(async () => {
    initPageController();
    getTableData();
  })

  onUnmounted(() => {

  })

  return {
    query,
    defaultTime,
    keywordSearch,
    pageController,
    tableData,

    tableEmptyText,

    getTableData,
    handleSizeChange,
    sortDataByKey,
  }
}
