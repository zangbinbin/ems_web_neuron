import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import http from '@/utils/http'

export const queryList = (params: any): Promise<AxiosResponse<any>> => {
  return http.get('/pervent_setting', { params })
}

export const addInfo = (data: any) => {
  return http.post('/pervent_setting', data, {
    _compatibleErrorCode: true,
    name: 'addAlarmRlule',
  } as AxiosRequestConfig)
}

export const updateInfo = (data:any) => {
  return http.put('/pervent_setting', data)
}

export const deleteInfo = (data:any) => {
  return http.delete('/pervent_setting', { data: data })
}
