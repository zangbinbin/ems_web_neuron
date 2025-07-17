import * as XLSX from 'xlsx'

export const exportExcelData = (content: Array<any>, fileName: string) => {
  return new Promise((resolve, reject) => {
    try {
      // 1. 创建工作簿
      const workbook = XLSX.utils.book_new()

      // 2. 遍历数据，生成多个 Sheet
      content.forEach((groupData, index) => {
        const { sheetName = `Sheet${index + 1}`, data, merges = [] } = groupData

        // 2.1 将数据转换为 Worksheet
        const worksheet = XLSX.utils.json_to_sheet(data)

        // 2.2 设置合并单元格（可选）
        if (merges.length > 0) {
          worksheet['!merges'] = merges.map((merge: any) => ({
            s: { r: merge.startRow, c: merge.startCol }, // 起始单元格
            e: { r: merge.endRow, c: merge.endCol }, // 结束单元格
          }))
        }

        // 2.3 将 Worksheet 添加到 Workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
      })

      // 3. 导出 Excel 文件
      XLSX.writeFile(workbook, `${fileName}.xlsx`)
      resolve(true)
    } catch (error) {
      reject(error)
    }
  })
}
