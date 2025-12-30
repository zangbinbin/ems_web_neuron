<template>
  <div class="log-viewer">
    <div class="log-header">
      <h3>{{ nodeName }}</h3>
      <div class="connection-status">
        <span :class="['status-indicator', { connected: isConnected }]">
          {{ isConnected ? '已连接' : '未连接' }}
        </span>
        <button @click="clearLogs" class="clear-btn">清空日志</button>
      </div>
    </div>
    <div ref="logContainer" class="log-container">
      <div v-for="(log, index) in logs" :key="index" :class="['log-item']">
        <span class="log-message">{{ log.message }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, nextTick, getCurrentInstance } from 'vue'
import { getToken } from '@/utils/user'
import { useRoute } from 'vue-router'

interface LogMessage {
  message: string
}

export default defineComponent({
  name: 'LogViewer',
  setup() {
    const route = useRoute()
    const wsUrl = ref(`ws://127.0.0.1:8080?token=Bearer ${getToken()}`)
    const logs = ref<LogMessage[]>([])
    const isConnected = ref(false)
    const websocket = ref<WebSocket | null>(null)
    const logContainer = ref<HTMLElement | null>(null)

    // 从查询参数中获取节点信息
    const nodeName = ref((route.query.nodeName as string) || '')

    // 最大日志条数，超过则清理旧日志
    const MAX_LOGS = 1000

    const connect = () => {
      if (isConnected.value) return

      wsUrl.value = `ws://127.0.0.1:8080?token=Bearer ${getToken()}`

      try {
        websocket.value = new WebSocket(wsUrl.value)
        websocket.value.onopen = () => {
          console.log('WebSocket连接已建立')
          isConnected.value = true
          sendSubscription()
        }

        websocket.value.onmessage = (event) => {
          try {
            // 假设后端发送JSON格式的日志消息
            const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data

            // 如果是简单的字符串消息，格式化为日志对象
            const logMessage: LogMessage = {
              message: data.message || String(data),
            }

            addLog(logMessage)
          } catch (e) {
            // 如果解析失败，作为普通消息处理
            addLog({
              message: event.data,
            })
          }
        }

        websocket.value.onclose = () => {
          console.log('WebSocket连接已关闭')
          isConnected.value = false
          websocket.value = null
        }

        websocket.value.onerror = (error) => {
          console.error('WebSocket错误:', error)
          isConnected.value = false
        }
      } catch (error) {
        console.error('创建WebSocket连接失败:', error)
        isConnected.value = false
      }
    }

    const disconnect = () => {
      if (websocket.value) {
        websocket.value.close()
        websocket.value = null
        isConnected.value = false
      }
    }

    const sendSubscription = () => {
      if (websocket.value && isConnected.value) {
        if (nodeName.value === '') {
          nodeName.value = 'cse_ems'
        }
        websocket.value.send(
          JSON.stringify({
            type: 'log_subscribe',
            node: nodeName.value,
          }),
        )
      }
    }
    const addLog = (log: LogMessage) => {
      logs.value.push(log)

      // 限制日志数量，保持性能
      if (logs.value.length > MAX_LOGS) {
        logs.value = logs.value.slice(-MAX_LOGS)
      }

      // 自动滚动到底部
      nextTick(() => {
        scrollToBottom()
      })
    }

    const clearLogs = () => {
      logs.value = []
    }

    const scrollToBottom = () => {
      if (logContainer.value) {
        logContainer.value.scrollTop = logContainer.value.scrollHeight
      }
    }

    onMounted(() => {
      // 组件挂载时可以自动连接，或者等待用户手动连接
      connect()
    })

    onUnmounted(() => {
      if (websocket.value) {
        websocket.value.close()
      }
    })

    return {
      wsUrl,
      logs,
      isConnected,
      logContainer,
      connect,
      disconnect,
      clearLogs,
      nodeName,
    }
  },
})
</script>

<style scoped>
.log-viewer {
  display: flex;
  flex-direction: column;
  height: 100vh; /* 改为100vh以铺满整个浏览器窗口 */
  background-color: #1e1e1e;
  color: #d4d4d4;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  border: 1px solid #333;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background-color: #252526;
  border-bottom: 1px solid #333;
}

.log-header h3 {
  margin: 0;
  color: #9cdcfe;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-indicator {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  background-color: #3c3c3c;
}

.status-indicator.connected {
  background-color: #4caf50;
}

.connect-btn {
  padding: 6px 12px;
  background-color: #007acc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.connect-btn:hover {
  background-color: #005a9e;
}

.connect-btn.connected {
  background-color: #f44336;
}

.connect-btn.connected:hover {
  background-color: #d32f2f;
}

.log-controls {
  display: flex;
  gap: 10px;
  padding: 10px;
  background-color: #2d2d30;
}

.url-input {
  flex: 1;
  padding: 6px 8px;
  background-color: #3c3c3c;
  border: 1px solid #333;
  border-radius: 4px;
  color: #d4d4d4;
}

.url-input:focus {
  outline: none;
  border-color: #007acc;
}

.clear-btn {
  padding: 3px 6px;
  background-color: #3c3c3c;
  color: #d4d4d4;
  border: 1px solid #555;
  border-radius: 4px;
  cursor: pointer;
}

.clear-btn:hover {
  background-color: #4a4a4a;
}

.log-container {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  font-size: 13px;
  line-height: 1.4;
}

.log-item {
  margin-bottom: 2px;
  white-space: pre-wrap;
  word-break: break-all;
}

.log-item .log-timestamp {
  color: #808080;
  margin-right: 8px;
}

.log-item .log-level {
  font-weight: bold;
  margin-right: 8px;
  min-width: 50px;
  display: inline-block;
}

.log-item .log-message {
  color: #d4d4d4;
}

.log-item.info .log-level {
  color: #808080;
}

.log-item.warning .log-level {
  color: #d7ba7d;
}

.log-item.error .log-level {
  color: #f44336;
}

.log-item.debug .log-level {
  color: #b5cea8;
}

/* 滚动条样式 */
.log-container::-webkit-scrollbar {
  width: 8px;
}

.log-container::-webkit-scrollbar-track {
  background: #252526;
}

.log-container::-webkit-scrollbar-thumb {
  background: #4a4a4a;
  border-radius: 4px;
}

.log-container::-webkit-scrollbar-thumb:hover {
  background: #5a5a5a;
}
</style>
