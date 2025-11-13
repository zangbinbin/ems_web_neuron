import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import http from '@/utils/http'

export const queryList = (params: any): Promise<AxiosResponse<any>> => {
  return http.get('/chargepower_setting', { params })
}

export const addInfo = (data: any) => {
  return http.post('/chargepower_setting', data, {
    _compatibleErrorCode: true,
    name: 'addAlarmRlule',
  } as AxiosRequestConfig)
}

export const updateInfo = (data:any) => {
  return http.put('/chargepower_setting', data)
}

export const deleteInfo = (data:any) => {
  return http.delete('/chargepower_setting', { data: data })
}
