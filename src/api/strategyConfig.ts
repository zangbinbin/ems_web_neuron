import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import http from '@/utils/http'

export const queryList = (params: any): Promise<AxiosResponse<any>> => {
  return http.get('/strategy_switch', { params })
}

export const updateInfo = (data: any) => {
  return http.put('/strategy_switch', data)
}
