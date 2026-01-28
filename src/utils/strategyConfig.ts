// 定义策略类型配置数组
export const STRATEGY_TYPE_CONFIGS = [
  {
    type: 'backflow_preventer',
    name: '防逆流',
    routerName: 'BackflowPrevention',
  },
  {
    type: 'overload_control',
    name: '防过容',
    routerName: 'LoadControl',
  },
  {
    type: 'plan_curve',
    name: '计划曲线',
    routerName: 'PlannedCurve',
  },
]

// 根据type获取策略配置
export const getConfigByType = (type: string) => {
  return STRATEGY_TYPE_CONFIGS.find((config) => config.type === type)
}
