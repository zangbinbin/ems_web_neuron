<template>
  <div id="meta2d-container" ref="containerRef" :style="{ '--window-height': windowHeight + 'px' }">
    <div class="header-div">
      <h1 class="title">{{ titleName }}</h1>
    </div>
    <div id="meta2d" ref="meta2dRef"></div>
    <button class="fullscreen-button" @click="toggleFullscreen">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path
          d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1h-4zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zM.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5z"
        />
      </svg>
    </button>
    <button class="menu-button" @click.stop="menu">
      <i class="el-icon-menu"></i>
    </button>
    <!-- 菜单选项 -->
    <div v-if="showMenu" class="menu-options" ref="menuOptionsRef" tabindex="0" @blur="closeMenu">
      <div v-for="(option, index) in jsonFiles" :key="index" class="menu-option" @click.stop="changeContent(option)">
        {{ option }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Meta2d } from '@meta2d/core'
import type { Meta2dData } from '@meta2d/core'
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { EmqxMessage } from '@emqx/emqx-ui'
import { ElDropdown } from 'element-plus'
import { number } from 'echarts'

const meta2dRef = ref<HTMLElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)
const windowHeight = ref(window.innerHeight - 140)
const isFullscreen = ref(false)
let meta2dInstance: Meta2d | null = null
const titleName = ref('')
const timers = ref<Record<string, number>>({})
const abortControllers = ref<Record<string, AbortController>>({})
const showMenu = ref(false)
const menuOptionsRef = ref<HTMLElement | null>(null)
const jsonFiles = ref<string[]>([])
const currentJsonData = ref<any>(null)
const eventListenersAdded = ref(false) // 新增标志位
const screenWidth = ref(window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth)
const screenHeight = ref(window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight)
const originScale = ref(0)
const scaleVal = ref(0)

// 更新窗口高度
const updateWindowHeight = () => {
  windowHeight.value = isFullscreen.value ? window.innerHeight : window.innerHeight - 140
  screenWidth.value = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
  screenHeight.value = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
  if (meta2dInstance != null) {
    scaleVal.value = Number((screenWidth.value / 1920).toFixed(2))
    if (isFullscreen.value) {
      // 在原来基础上增加0.4的比例放大
      scaleVal.value += 0.4
    }
    meta2dInstance.scale(scaleVal.value * originScale.value)
  }
  if (meta2dInstance) {
    nextTick(() => {
      meta2dInstance?.resize()
      meta2dInstance?.render()
      meta2dInstance?.centerView()
    })
  }
}

// 全屏切换
const toggleFullscreen = () => {
  if (!containerRef.value) return

  if (!isFullscreen.value) {
    if (containerRef.value.requestFullscreen) {
      containerRef.value.requestFullscreen().catch((err) => {
        console.error('全屏失败:', err)
      })
    }
  } else if (document.exitFullscreen) {
    document.exitFullscreen()
  }
}

// 菜单切换
const menu = () => {
  showMenu.value = !showMenu.value
}

// 更改内容
const changeContent = (option: string) => {
  showMenu.value = false
  stopAllRequests()
  clearMeta2d()
  loadJsonFile(option)
}

// 清除Meta2d实例
const clearMeta2d = () => {
  if (meta2dInstance) {
    // meta2dInstance.clear(); // 会影响样式，故注释
    // meta2dInstance.destroy(); // 会影响样式，故注释
    meta2dInstance.canvas.parentElement.innerHTML = ''
    meta2dInstance = null
  }
}

// 添加关闭菜单方法
const closeMenu = () => {
  showMenu.value = false
}

// 添加点击外部检测
const handleClickOutside = (event: MouseEvent) => {
  if (menuOptionsRef.value && !menuOptionsRef.value.contains(event.target as Node)) {
    closeMenu()
  }
}

// 处理全屏变化
const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
  updateWindowHeight()
}

// 初始化一次接线图
const initMeta2d = () => {
  if (!meta2dRef.value || !currentJsonData.value) return

  // 先清理现有实例
  clearMeta2d()

  meta2dInstance = new Meta2d('meta2d', {
    disableScale: true,
    disableTranslate: true,
    disableInput: true,
    disableAnchor: true,
    mouseRightActive: false,
    rule: false,
    autoAnchor: false,
    moveConnectedLine: true,
    hoverColor: 'transparent',
  })

  const meta2dData = JSON.parse(JSON.stringify(currentJsonData.value))
  titleName.value = meta2dData.name || ''
  meta2dData.cancelFirstConnect = true
  meta2dInstance.open(meta2dData)
  originScale.value = meta2dInstance.store.data.scale
  meta2dInstance.closeHttp()

  // 确保事件只绑定一次
  if (!eventListenersAdded.value) {
    meta2dInstance.on('dblclick', dblclick)
    eventListenersAdded.value = true
  }
  updateWindowHeight()
  meta2dInstance.lock(1)
}

// 双击事件
const dblclick = (event?: any, data?: any) => {
  if (event && event.pen && event.pen.id) {
    EmqxMessage.success('操作成功！')
  }
}

// 请求数据
const getData = async () => {
  try {
    if (!currentJsonData.value?.https) return

    for (const item of currentJsonData.value.https) {
      await fetchWithInterval(item)
    }
  } catch (error) {
    console.error('请求失败:', error)
  }
}

// 封装单个请求的间隔调用逻辑
const fetchWithInterval = async (item: any) => {
  if (!meta2dRef.value || !item?.body?.node) return

  if (abortControllers.value[item.body.node]) {
    abortControllers.value[item.body.node].abort()
  }

  const controller = new AbortController()
  abortControllers.value[item.body.node] = controller

  try {
    const autoAnchor = `Bearer ${localStorage.getItem('token')}`
    item.httpHeaders.Authorization = autoAnchor

    const response = await fetch(item.http, {
      method: item.method,
      headers: item.httpHeaders,
      body: JSON.stringify(item.body),
      signal: controller.signal,
    })

    if (controller.signal.aborted) return

    const data = await response.json()

    if (data?.tags && meta2dInstance) {
      data.tags.forEach((dataInfo: any) => {
        meta2dInstance?.setValue({
          dataId: `${item.body.node}#${dataInfo.name}`,
          value: dataInfo.value,
        })
      })

      meta2dInstance?.render()
    }

    timers.value[item.body.node] = window.setTimeout(() => fetchWithInterval(item), item.httpTimeInterval || 5000)
  } catch (error) {
    if (!controller.signal.aborted) {
      console.error(`请求 ${item.http} 失败:`, error)
      timers.value[item.body.node] = window.setTimeout(() => fetchWithInterval(item), item.httpTimeInterval || 5000)
    }
  }
}

// 停止所有请求和定时器
const stopAllRequests = () => {
  Object.values(timers.value).forEach((timer) => {
    window.clearTimeout(timer)
  })
  timers.value = {}

  Object.values(abortControllers.value).forEach((controller) => {
    controller.abort()
  })
  abortControllers.value = {}
}

// 获取所有JSON文件列表
const fetchJsonFiles = async () => {
  try {
    const context = require.context('@/assets/json/', false, /\.json$/)
    const files = context.keys().map((key) => key.replace('./', '').replace('.json', ''))
    if (files.length === 0) {
      EmqxMessage.warning('未找到JSON文件，使用默认列表')
    } else {
      jsonFiles.value = files
      await loadJsonFile(jsonFiles.value[0])
    }
  } catch (error) {
    console.error('获取JSON文件列表失败:', error)
    EmqxMessage.error('获取文件列表失败，使用默认列表')
  }
}

// 加载选中的JSON文件
const loadJsonFile = async (filename: string) => {
  try {
    const module = await import(`@/assets/json/${filename}.json`)
    currentJsonData.value = module
    initMeta2d()
    getData()
  } catch (error) {
    console.error('加载JSON文件失败:', error)
    EmqxMessage.error(`加载${filename}失败`)
  }
}

onMounted(async () => {
  if (!eventListenersAdded.value) {
    window.addEventListener('resize', updateWindowHeight)
    document.addEventListener('click', handleClickOutside)
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('msfullscreenchange', handleFullscreenChange)
    eventListenersAdded.value = true
  }

  await fetchJsonFiles()
})

onUnmounted(() => {
  stopAllRequests()
  clearMeta2d()

  if (eventListenersAdded.value) {
    window.removeEventListener('resize', updateWindowHeight)
    document.removeEventListener('click', handleClickOutside)
    document.removeEventListener('fullscreenchange', handleFullscreenChange)
    document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.removeEventListener('msfullscreenchange', handleFullscreenChange)
  }
})
</script>

<style lang="scss" scoped>
@import '@/styles/font.scss';
/* 样式保持不变 */
#meta2d-container {
  position: relative;
  width: 100%;
  height: var(--window-height);
  background-image: url('~@/assets/images/bg.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header-div {
  width: 100%;
  height: 60px;
  background-image: url('~@/assets/images/header.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  flex-shrink: 0;
}

#meta2d {
  width: 100%;
  height: calc(100% - 60px);
  transform-origin: 0 0;
  transition: transform 0.3s ease;
  position: relative;
  overflow: hidden;
}

.title {
  color: white;
  font-size: 24px;
  font-weight: bold;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
  margin: 0;
  padding: 0;
}

.fullscreen-button {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 8px 8px 5px 8px;
  background: #10213a;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  z-index: 100;
  transition: background 0.2s;

  &:hover {
    background: rgba(132, 151, 192, 0.428);
  }

  svg {
    width: 16px;
    height: 16px;
    color: rgba(220, 232, 240, 0.375);
  }
}

.menu-button {
  position: absolute;
  font-size: 40px;
  color: white;
  bottom: 1px;
  left: 1px;
  padding: 8px 8px 5px 8px;
  background: #10213a;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  z-index: 100;
  transition: background 0.2s;

  &:hover {
    background: rgba(132, 151, 192, 0.428);
  }
}

.menu-options {
  position: absolute;
  bottom: 60px;
  left: 1px;
  background: #10213a;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  min-width: 120px;
  overflow: hidden;
  z-index: 101;
}

.menu-option {
  padding: 8px 12px;
  color: rgba(220, 232, 240, 0.8);
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: rgba(132, 151, 192, 0.428);
  }
}
</style>
