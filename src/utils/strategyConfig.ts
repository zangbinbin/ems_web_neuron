// 定义设备类型配置数组
export const STRATEGY_TYPE_CONFIGS = [
  {
    type: 'backflow_preventer',
    name: '防逆流',
    routerName: 'BackflowPrevention'
  },
  {
    type: 'demand_control',
    name: '需量控制',
    routerName: 'BackflowPrevention'
  },
  {
    type: 'plan_curve',
    name: '计划曲线',
    routerName: 'PlannedCurve'
  }
]

// 根据type获取策略配置
export const getConfigByType = (type:string) => {
  return STRATEGY_TYPE_CONFIGS.find(config => config.type === type)
}