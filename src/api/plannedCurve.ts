import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import http from '@/utils/http'

export const queryList = (params: any): Promise<AxiosResponse<any>> => {
  // params: {node_name:'',plan_type:0}
  // node_name: 站点名称
  // plan_type: 0-通用计划曲线，1-特定日计划曲线，2-日期范围计划曲线
  return http.get('/plan_curve', { params })
}

// 更新通用计划曲线
export const updateTYInfo = (data: any) => {
  return http.put('/plan_curve/common', data)
}

// 更新特定日计划曲线
export const updateTDRInfo = (data: any) => {
  return http.put('/plan_curve/assign', data)
}

// 更新日期范围计划曲线
export const updateRQFWInfo = (data: any) => {
  return http.put('/plan_curve/date_range', data)
}
