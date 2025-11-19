import type { RouteRecordRaw } from 'vue-router'
import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'
import { DriverDirection } from '@/types/enums'
// import { propsToAttrMap } from '@vue/shared'

export const LOGIN_ROUTE_NAME = 'Login'
export const CHANGE_PW_ROUTE_NAME = 'ChangePassword'
/**
 * hiddenBreadcrumb: current page is hidde breadcrumb; defualt: false,i show breadcrumb
 * default page of the route doesnot need to set the 'title', default page route title is the title of parent route
 */
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    redirect: '/configuration/south-driver',
  },
  /* Overview */
  {
    path: '/overview',
    name: 'Overview',
    meta: { title: 'common.overview' },
    component: Home,
    children: [
      {
        path: '/overview',
        name: 'Overview',
        meta: { requireAuth: true },
        component: () => import('@/views/overview/Index.vue'),
      },
    ],
  },
  /* WiringDiagram */
  {
    path: '/wiringDiagram',
    name: 'WiringDiagram',
    meta: { hiddenBreadcrumb: true },
    component: Home,
    children: [
      {
        path: '/wiringDiagram',
        name: 'WiringDiagram',
        meta: { requireAuth: true },
        component: () => import('@/views/home/Index.vue'),
      },
    ],
  },
  /* MONITORING */
  {
    path: '/monitoring',
    name: 'Monitoring',
    meta: { title: 'data.monitoring' },
    component: Home,
    children: [
      {
        path: 'data',
        name: 'DataMonitoring',
        component: () => import('@/views/monitoring/DataMonitoring.vue'),
        meta: { hiddenBreadcrumb: true },
      },
      {
        path: 'faults',
        name: 'Faults',
        component: () => import('@/views/monitoring/Faults.vue'),
        meta: { hiddenBreadcrumb: true },
      },
      {
        path: 'history_data',
        name: 'HistoryData',
        component: () => import('@/views/monitoring/HistoryData.vue'),
        meta: { hiddenBreadcrumb: true },
      },
    ],
  },
  /* CONFIG- NorthAPP */
  {
    path: '/configuration/north-driver',
    name: 'NorthAPP',
    meta: { title: 'config.northAppSetup' },
    component: Home,
    children: [
      {
        path: '',
        name: 'NorthDriver',
        component: () => import('@/views/config/northDriver/Index.vue'),
        meta: { hiddenBreadcrumb: true },
      },
      {
        path: ':node/:plugin',
        name: 'NorthDriverGroup',
        component: () => import('@/views/config/northDriver/Group.vue'),
        meta: { title: 'config.groupList' },
      },
      {
        path: 'config/:node',
        name: 'NorthDriverConfig',
        component: () => import('@/views/config/NodeConfig.vue'),
        props: {
          direction: DriverDirection.North,
        },
        meta: { title: 'config.appConfig' },
      },
    ],
  },
  /* 策略管理 */
  {
    path: '/configuration/strategy-config',
    name: 'StrategyManagement',
    meta: { title: 'config.strategyConfig' },
    component: Home,
    children: [
      {
        path: '',
        name: 'StrategyConfig',
        component: () => import('@/views/config/strategyConfig/Index.vue'),
        meta: { hiddenBreadcrumb: true },
      },
      {
        path: 'components/PlannedCurve',
        name: 'PlannedCurve',
        component: () => import('@/views/config/strategyConfig/components/PlannedCurve.vue'),
        meta: { title: 'config.planCurveConfig', hiddenBreadcrumb: false },
      },
      {
        path: 'components/BackflowPrevention',
        name: 'BackflowPrevention',
        component: () => import('@/views/config/strategyConfig/components/BackflowPrevention.vue'),
        meta: { title: 'config.backflowPreventerConfig', hiddenBreadcrumb: false },
      },
      {
        path: 'components/LoadControl',
        name: 'LoadControl',
        component: () => import('@/views/config/strategyConfig/components/LoadControl.vue'),
        meta: { title: 'config.overloadControlConfig', hiddenBreadcrumb: false },
      },
    ],
  },
  /* CONFIG- SouthDevice */
  {
    path: '/configuration/south-driver',
    name: 'SouthDevice',
    meta: { title: 'config.southDeviceManagement' },
    component: Home,
    children: [
      {
        path: '',
        name: 'SouthDriver',
        component: () => import('@/views/config/southDriver/Index.vue'),
        meta: { hiddenBreadcrumb: true },
      },
      {
        path: 'config/:node',
        name: 'SouthDriverConfig',
        component: () => import('@/views/config/NodeConfig.vue'),
        props: {
          direction: DriverDirection.South,
        },
        meta: { title: 'config.deviceConfig' },
      },
      {
        path: 'components/AlarmRules',
        // path: '',
        name: 'AlarmRules',
        component: () => import('@/views/config/southDriver/components/AlarmRules.vue'),
        props: {
          direction: DriverDirection.South,
        },
        meta: { title: 'config.alarmRules', hiddenBreadcrumb: false },
      },
      {
        path: ':node/:plugin',
        name: 'SouthDriverGroupG',
        component: () => import('@/components/LayoutContent.vue'),
        meta: { title: 'config.groupList' },
        children: [
          {
            path: '',
            name: 'SouthDriverGroup',
            component: () => import('@/views/config/southDriver/Group.vue'),
          },
          {
            path: ':group',
            name: 'SouthGroupTags',
            meta: { title: 'config.tagList' },
            component: () => import('@/components/LayoutContent.vue'),
            children: [
              {
                path: '',
                name: 'SouthDriverGroupTag',
                component: () => import('@/views/config/southDriver/Tag.vue'),
              },
              {
                path: 'add',
                name: 'SouthDriverGroupAddTag',
                component: () => import('@/views/config/southDriver/AddTag.vue'),
                meta: { title: 'config.addTags' },
              },
            ],
          },
        ],
      },
    ],
  },
  /** Template */
  {
    path: '/configuration/template',
    name: 'Template',
    meta: { title: 'config.templateManagement' },
    component: Home,
    children: [
      {
        path: '',
        name: 'Template',
        component: () => import('@/views/config/template/Index.vue'),
        meta: { hiddenBreadcrumb: true },
      },
      {
        path: ':template/:plugin',
        name: 'TemplateGroupG',
        component: () => import('@/components/LayoutContent.vue'),
        meta: { title: 'config.groupList' },
        children: [
          {
            path: '',
            name: 'TemplateGroup',
            component: () => import('@/views/config/template/Group.vue'),
          },
          {
            path: ':group',
            name: 'TemplateTags',
            meta: { title: 'config.tagList' },
            component: () => import('@/components/LayoutContent.vue'),
            children: [
              {
                path: '',
                name: 'TemplateGroupTag',
                component: () => import('@/views/config/template/Tag.vue'),
              },
              {
                path: 'add',
                name: 'TemplateGroupAddTag',
                component: () => import('@/views/config/template/AddTag.vue'),
                meta: { title: 'config.addTags' },
              },
            ],
          },
        ],
      },
    ],
  },
  /** Plugin */
  {
    path: '/configuration/plugin',
    name: 'Plugin',
    meta: { title: 'config.plugin' },
    component: Home,
    children: [
      {
        path: '',
        name: 'Plugin',
        component: () => import('@/views/config/plugin/Index.vue'),
        meta: { hiddenBreadcrumb: true },
      },
    ],
  },
  /** ADMIN */
  {
    path: '/admin',
    name: 'Admin',
    component: Home,
    children: [
      // {
      //   path: 'account-settings',
      //   name: 'AccountSettings',
      //   meta: { title: 'common.accountSettings', requireAuth: true, hiddenBreadcrumb: true },
      //   component: () => import('@/views/admin/AccountSetting.vue'),
      // },
      {
        path: 'change-password',
        name: CHANGE_PW_ROUTE_NAME,
        meta: { title: 'admin.changePassword', requireAuth: true, hiddenBreadcrumb: true },
        component: () => import('@/views/admin/Password.vue'),
      },
      // {
      //   path: 'log',
      //   name: 'AdminLog',
      //   meta: { title: 'admin.log', requireAuth: true, hiddenBreadcrumb: true },
      //   component: () => import('@/views/admin/Log.vue'),
      // },
      {
        path: 'auditlog',
        name: 'AuditLog',
        meta: { title: 'admin.auditLog', requireAuth: true, hiddenBreadcrumb: true },
        component: () => import('@/views/admin/AuditLog.vue'),
      },
    ],
  },

  /* License */
  {
    path: '/license',
    name: 'LicensePage',
    meta: { title: 'admin.license' },
    component: Home,
    children: [
      {
        path: '/license',
        name: 'License',
        meta: { requireAuth: true },
        component: () => import('@/views/about/License.vue'),
      },
    ],
  },

  /* About */
  {
    path: '/about',
    name: 'AboutPage',
    meta: { title: 'common.about' },
    component: Home,
    children: [
      {
        path: '',
        name: 'About',
        meta: { requireAuth: true },
        component: () => import('@/views/about/About.vue'),
      },
    ],
  },

  {
    path: '/login',
    name: LOGIN_ROUTE_NAME,
    component: Login,
    meta: { hiddenBreadcrumb: true },
  },
]

export default routes
