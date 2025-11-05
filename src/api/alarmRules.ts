import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import http from '@/utils/http'

export const queryAlarmRluleList = (params: any): Promise<AxiosResponse<any>> => {
  return http.get('/abnormal_setting', { params })
}

export const addAlarmRlule = (alarmRuleData: any) => {
  return http.post('/abnormal_setting', alarmRuleData, {
    _compatibleErrorCode: true,
    name: 'addAlarmRlule',
  } as AxiosRequestConfig)
}

export const updateAlarmRlule = (data: {
  device_name: string
  group_name: string
  tag_name: string
  processing_method: number
  abnormal_value: number
  fault_level: number
  operator: number
  gap_value: number
  description: string
}) => {
  return http.put('/abnormal_setting', data)
}

export const deleteAlarmRlule = (alarmRuleInfo: { device_name: string; group_name: string; tag_name: string }) => {
  return http.delete('/abnormal_setting', { data: alarmRuleInfo })
}
