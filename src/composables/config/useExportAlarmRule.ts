import { ref } from 'vue'
import { EmqxMessage } from '@emqx/emqx-ui'
import { useI18n } from 'vue-i18n'
import { exportExcelData } from '@/utils/utils'

export default () => {
  const { t } = useI18n()

  const isExporting = ref(false)

  // when a filed is added to tag（refer to the `createRawTagForm` in useAddTag.ts）, sync here.
  const genExcelSheets = (tagList: []) => {
    const cols = [
      'group_name',
      'tag_name',
      'operator',
      'abnormal_value',
      'gap_value',
      'processing_method',
      'fault_level',
      'description',
    ]
    const sheets: Array<any> = [cols]
    tagList.forEach((obj) => {
      const { group_name, tag_name, operator, abnormal_value, gap_value, processing_method, fault_level, description } =
        obj
      const content = []
      content.push([
        group_name,
        tag_name,
        operator,
        abnormal_value,
        gap_value,
        processing_method,
        fault_level,
        description,
      ])
      sheets.push(...content)
    })
    return sheets
  }

  // const exportTable = async (tagList: Array<TagData>, groupName: string, nodeName: string) => {
  const exportTable = async (tagList: [], fileName: string) => {
    if (tagList.length === 0) {
      EmqxMessage.warning(t('common.emptyData'))
      return
    }
    isExporting.value = true
    const data = genExcelSheets(tagList)
    console.log(data)
    try {
      await exportExcelData(data, `${fileName}`)
    } catch (error: any) {
      EmqxMessage.error(error.toString())
    } finally {
      isExporting.value = false
    }
  }

  return {
    exportTable,
    isExporting,
  }
}
