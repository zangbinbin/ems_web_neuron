export const driverNameList = [
  { label: 'PCS', value: 'PCS' },
  { label: 'BMS', value: 'BMS' },
  { label: '液冷系统(FC)', value: 'FC' },
  { label: '消防系统(FCS)', value: 'FCS' },
  { label: '温湿度变送器(WS)', value: 'WS' },
  { label: '水浸传感器(SJ)', value: 'SJ' },
  { label: '运行指示灯(HG2)', value: 'HG2' },
  { label: '故障指示灯(HR1)', value: 'HR1' },
  { label: '急停断路器开关(SB)', value: 'SB' },
  { label: '消防喷洒信号(XF)', value: 'XF' },
  { label: '消防预警信号(KA)', value: 'KA' },
  { label: '浪涌遥信信号(SPD)', value: 'SPD' },
  { label: '总开关分合闸信号(QF)', value: 'QF' },
  { label: '计量表(EM)', value: 'EM' },
  { label: '策略表(DM)', value: 'DM' },
  { label: 'DIDO设备(DIDO)', value: 'DIDO' },
  { label: '温湿水浸设备(WSSJ)', value: 'WSSJ' },
  { label: '除湿装置(CSH)', value: 'CSH' },
]

export const convertNodeName = (node: string) => {
  const index = driverNameList.findIndex((item: any) => {
    return item.value === node
  })
  if (index > -1) {
    return driverNameList[index].label
  }

  return node
}
