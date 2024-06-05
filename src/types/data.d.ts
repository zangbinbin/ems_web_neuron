export interface TagDataInMonitoring {
  value: any
  error: number
  name?: null | string
}

export interface WriteData {
  node: string
  group: string
  tag: string
  value: string | number
}

export interface TagDataInFaults {
  value: any
  error: number
  name?: null | string
}

export interface TagDataInHistoryData {
  value: any
  error: number
  name?: null | string
}