<template>
  <emqx-menu class="el-menu-vertical-demo side-nav" router :default-active="actvieMenu">
    <template v-for="(nav, index) in navList" :key="index">
      <!-- 无子菜单的菜单项 -->
      <emqx-menu-item
        class="nav-item"
        v-if="!nav.subMenus"
        style="padding-left: 0"
        :index="nav.to"
        v-tooltip="nav.label"
      >
        <div class="nav-item-content">
          <i class="nav-icon iconfont" :class="nav.icon"></i>
        </div>
      </emqx-menu-item>

      <!-- 有子菜单的菜单项 -->
      <emqx-submenu v-else class="nav-item" style="padding-left: 0" :index="nav.to" popper-class="submenu-popper">
        <template #title>
          <div class="nav-item-content" v-tooltip="nav.label">
            <i class="nav-icon iconfont" :class="nav.icon"></i>
          </div>
        </template>

        <!-- 子菜单列表 -->
        <div class="submenu-list">
          <emqx-menu-item
            v-for="(subMenu, subIndex) in nav.subMenus"
            :key="subIndex"
            :index="subMenu.to"
            @click="handleSubMenuClick(subMenu.to)"
          >
            {{ $t(subMenu.label) }}
          </emqx-menu-item>
        </div>
      </emqx-submenu>
    </template>
  </emqx-menu>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  name: 'SideNav',
})
</script>

<script lang="ts" setup>
const { t } = useI18n()
const navList = computed(() => {
  const navs = [
    // {
    //   to: '/wiringDiagram',
    //   label: 'common.wiringDiagram',
    //   icon: 'iconhome',
    // },
    {
      to: '/overview',
      label: 'common.home',
      icon: 'iconattributed',
    },
    {
      to: '/monitoring/data',
      label: 'data.monitoring',
      icon: 'iconstatus',
      subMenus: [
        {
          to: '/monitoring/data',
          label: 'data.dataMonitoring',
        },
        {
          to: '/monitoring/faults',
          label: 'data.faults',
        },
        {
          to: '/monitoring/history_data',
          label: 'data.dataHistory',
        },
      ],
    },
    {
      to: '/configuration',
      label: 'config.config',
      icon: 'iconconfig',
      subMenus: [
        {
          to: '/configuration/south-driver',
          label: 'config.southDeviceManagement',
        },
        {
          to: '/configuration/north-driver',
          label: 'config.northAppSetup',
        },
        {
          to: '/configuration/template',
          label: 'config.templateManagement',
        },
        {
          to: '/configuration/plugin',
          label: 'config.plugin',
        },
      ],
    },
    {
      to: '/admin',
      label: 'admin.admin',
      icon: 'iconAdministration1',
      subMenus: [
        {
          to: '/admin/change-password',
          label: 'common.changePassword',
        },
        // {
        //   to: '/admin/account-settings',
        //   label: 'common.accountSettings',
        // },
        // {
        //   to: '/admin/log',
        //   label: ('admin.log'),
        // },
      ],
    },
  ]
  return navs
})

const firstLevelRoutePathArr: Array<string> = []
const secondLevelRoutePathArr: Array<string> = []

const actvieMenu = computed(() => {
  const currentPath = useRoute().path
  let ret = secondLevelRoutePathArr.find((item) => currentPath.match(item))

  if (ret) {
    return ret
  }

  ret = firstLevelRoutePathArr.find((item) => currentPath.match(item))
  return ret || ''
})

const countRoutePath = () => {
  navList.value.forEach((menu) => {
    if (menu.subMenus) {
      menu.subMenus.forEach((item) => {
        if (item.to.match(/^\/[^/]+\/[^/]+/)) {
          secondLevelRoutePathArr.push(item.to)
        } else {
          firstLevelRoutePathArr.push(item.to)
        }
      })
    } else {
      firstLevelRoutePathArr.push(menu.to)
    }
  })
}

countRoutePath()

// 自定义指令实现悬浮提示
const vTooltip = {
  mounted(el: HTMLElement, binding: any) {
    const tooltip = document.createElement('div')
    tooltip.className = 'custom-tooltip'
    tooltip.textContent = t(binding.value)
    tooltip.style.position = 'absolute'
    tooltip.style.left = '100%'
    tooltip.style.top = '50%'
    tooltip.style.transform = 'translateY(-50%)'
    tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.75)'
    tooltip.style.color = 'white'
    tooltip.style.padding = '4px 8px'
    tooltip.style.borderRadius = '4px'
    tooltip.style.whiteSpace = 'nowrap'
    tooltip.style.zIndex = '1'
    tooltip.style.display = 'none'
    tooltip.style.marginLeft = '10px'

    el.style.position = 'relative'
    el.appendChild(tooltip)

    el.addEventListener('mouseenter', () => {
      tooltip.style.display = 'block'
    })

    el.addEventListener('mouseleave', () => {
      tooltip.style.display = 'none'
    })
  },
}
</script>

<style lang="scss" scoped>
:deep(.el-submenu__icon-arrow) {
  font-size: 0px !important;
}

.nav-item {
  position: relative;

  &:hover {
    .submenu-list {
      display: block;
    }

    .custom-tooltip {
      display: block;
    }
  }
}

.custom-tooltip {
  position: absolute;
  left: calc(100% + 10px);
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.75);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  white-space: nowrap;
  z-index: 9999;
  display: none;
  pointer-events: none;
}

.submenu-list {
  display: none;
  position: fixed; /* 改为fixed定位 */
  left: auto;
  right: auto;
  min-width: 160px;
  background: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  z-index: 99998; /* 提高z-index */
  padding: 5px 0;
  margin: -12px 0px 0px 0px;

  .el-menu-item {
    height: 36px;
    line-height: 36px;
    padding: 0 20px;

    &:hover {
      background-color: #189bfe;
    }
  }
}

:deep(.submenu-popper) {
  display: none !important;
}

/* 确保菜单容器不会裁剪内容 */
.side-nav {
  overflow: visible !important;
}

/* 确保父级容器不会限制定位 */
:deep(.el-menu) {
  overflow: visible !important;
}

:deep(.el-submenu.is-active .el-submenu__title) {
  background-color: #189bfe;
  box-shadow: 0px 10px 18px -6px rgba(24, 155, 254, 0.5215686275);
  border-radius: 8px;
}
</style>
