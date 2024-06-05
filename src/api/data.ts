import type { TagDataInMonitoring, TagDataInFaults, WriteData} from '@/types/data'
import http from '@/utils/http'
import type { AxiosResponse } from 'axios'

export const getMonitoringData = (
  nodeName: string,
  groupName: string,
): Promise<AxiosResponse<{ tags: Array<TagDataInMonitoring> }>> => {
  return http.post('/read', {
    node: nodeName,
    group: groupName,
  })
}

export const writeData = (data: WriteData) => {
  return http.post('/write', data)
}

export const getFaultsData = (
  // device: string,
  // group: string,
  start_time: string,
  end_time: string,
  // state: string,
  // tag: string,
): Promise<AxiosResponse<{ faults: Array<TagDataInFaults> }>> => {
  return http.get('/read/faults', {
    params: {
      // device: device,
      // group: group,
      start_time: start_time,
      end_time: end_time,
      // state: state,
      // tag: tag,
    }
  })
}

export const getHistoryData = (
  start_time: string,
  end_time: string,
): Promise<AxiosResponse<{ faults: Array<TagDataInFaults> }>> => {
  return http.get('/read/history_data', {
    params: {
      start_time: start_time,
      end_time: end_time,
    }
  })
}