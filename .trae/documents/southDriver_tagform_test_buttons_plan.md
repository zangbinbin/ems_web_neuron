# TagForm.vue 脚本测试按钮功能实现计划

## 1. 需求概述

在 TagForm.vue 文件中为 read_script、write_script 和 forward_script 三个字段添加测试按钮，点击按钮时调用 RESTful API 进行脚本测试。

### 1.1 API 接口信息

| 字段 | API 接口 | 请求方法 |
|------|----------|----------|
| read_script | `/api/v2/lua/composite` | POST |
| write_script | `/api/v2/lua/composite` | POST |
| forward_script | `/api/v2/lua/forward` | POST |

### 1.2 请求体格式

```json
{
  "script": "脚本内容（从对应字段获取）",
  "tag_name": "标签名称（从 form.name 获取）",
  "value": {
    "type": 5,
    "value": 1
  }
}
```

### 1.3 响应格式

```json
{
  "error": 0,
  "result": "执行结果或报错信息"
}
```

- `error === 0`：脚本测试成功
- `error !== 0`：脚本有问题，`result` 为报错信息

## 2. 实现步骤

### 步骤 1：在 api/config.ts 中添加 API 函数

在 `/home/liu/work/cse-ems-web/src/api/config.ts` 文件末尾添加：

```typescript
/* SCRIPT TEST */
export const testCompositeScript = (data: {
  script: string
  tag_name: string
  value: {
    type: number
    value: number
  }
}) => {
  return http.post('/api/v2/lua/composite', data)
}

export const testForwardScript = (data: {
  script: string
  tag_name: string
  value: {
    type: number
    value: number
  }
}) => {
  return http.post('/api/v2/lua/forward', data)
}
```

### 步骤 2：修改 TagForm.vue 模板部分

为 read_script、write_script 和 forward_script 字段添加测试按钮：

```vue
<!-- read_script -->
<emqx-col v-if="isAttrsIncludeComposite(form.attribute)" :span="12">
  <emqx-form-item :label="$t('config.read_script')">
    <div style="display: flex; gap: 8px;">
      <emqx-input v-model="form.read_script" type="textarea" style="flex: 1;" />
      <emqx-button type="primary" size="small" @click="testReadScript" :loading="loading.readScript">
        {{ $t('common.test') }}
      </emqx-button>
    </div>
  </emqx-form-item>
</emqx-col>

<!-- write_script -->
<emqx-col v-if="isAttrsIncludeComposite(form.attribute)" :span="12">
  <emqx-form-item :label="$t('config.write_script')">
    <div style="display: flex; gap: 8px;">
      <emqx-input v-model="form.write_script" type="textarea" style="flex: 1;" />
      <emqx-button type="primary" size="small" @click="testWriteScript" :loading="loading.writeScript">
        {{ $t('common.test') }}
      </emqx-button>
    </div>
  </emqx-form-item>
</emqx-col>

<!-- forward_script -->
<emqx-col v-if="isAttrsIncludeForward(form.attribute)" :span="12">
  <emqx-form-item :label="$t('config.forward_script')">
    <div style="display: flex; gap: 8px;">
      <emqx-input v-model="form.forward_script" type="textarea" style="flex: 1;" />
      <emqx-button type="primary" size="small" @click="testForwardScript" :loading="loading.forwardScript">
        {{ $t('common.test') }}
      </emqx-button>
    </div>
  </emqx-form-item>
</emqx-col>
```

### 步骤 3：修改 TagForm.vue 脚本部分

#### 3.1 添加 import 语句

```typescript
import { ElMessage } from 'element-plus'
import { testCompositeScript, testForwardScript as apiTestForwardScript } from '@/api/config'
```

注意：由于 testForwardScript 函数名与组件中的方法名冲突，需要使用别名 `apiTestForwardScript`。

#### 3.2 添加 loading 状态

```typescript
const loading = ref({
  readScript: false,
  writeScript: false,
  forwardScript: false
})
```

#### 3.3 添加测试函数

```typescript
const testReadScript = async () => {
  const script = form.value.read_script || ''
  if (!script) {
    ElMessage.warning('脚本内容不能为空')
    return
  }

  if (!form.value.name) {
    ElMessage.warning('标签名称不能为空')
    return
  }

  loading.value.readScript = true

  try {
    const response = await testCompositeScript({
      script,
      tag_name: form.value.name,
      value: {
        type: 5,
        value: 1
      }
    })

    if (response.data.error === 0) {
      ElMessage.success(`测试成功: ${response.data.result}`)
    } else {
      ElMessage.error(`脚本错误: ${response.data.result}`)
    }
  } catch (error) {
    ElMessage.error('测试失败')
    console.error('测试失败:', error)
  } finally {
    loading.value.readScript = false
  }
}

const testWriteScript = async () => {
  const script = form.value.write_script || ''
  if (!script) {
    ElMessage.warning('脚本内容不能为空')
    return
  }

  if (!form.value.name) {
    ElMessage.warning('标签名称不能为空')
    return
  }

  loading.value.writeScript = true

  try {
    const response = await testCompositeScript({
      script,
      tag_name: form.value.name,
      value: {
        type: 5,
        value: 1
      }
    })

    if (response.data.error === 0) {
      ElMessage.success(`测试成功: ${response.data.result}`)
    } else {
      ElMessage.error(`脚本错误: ${response.data.result}`)
    }
  } catch (error) {
    ElMessage.error('测试失败')
    console.error('测试失败:', error)
  } finally {
    loading.value.writeScript = false
  }
}

const testForwardScript = async () => {
  const script = form.value.forward_script || ''
  if (!script) {
    ElMessage.warning('脚本内容不能为空')
    return
  }

  if (!form.value.name) {
    ElMessage.warning('标签名称不能为空')
    return
  }

  loading.value.forwardScript = true

  try {
    const response = await apiTestForwardScript({
      script,
      tag_name: form.value.name,
      value: {
        type: 5,
        value: 1
      }
    })

    if (response.data.error === 0) {
      ElMessage.success(`测试成功: ${response.data.result}`)
    } else {
      ElMessage.error(`脚本错误: ${response.data.result}`)
    }
  } catch (error) {
    ElMessage.error('测试失败')
    console.error('测试失败:', error)
  } finally {
    loading.value.forwardScript = false
  }
}
```

## 3. 需要修改的文件

1. `/home/liu/work/cse-ems-web/src/api/config.ts` - 添加 testCompositeScript 和 testForwardScript 函数
2. `/home/liu/work/cse-ems-web/src/views/config/southDriver/components/TagForm.vue` - 添加按钮和相关逻辑

## 4. 关键实现细节

- 使用 `loading` 状态管理按钮的加载状态，防止重复点击
- 脚本为空或标签名称为空时，提前返回并显示警告信息
- 根据 `response.data.error` 判断成功或失败，并显示相应的提示信息
- 成功时显示执行结果，失败时显示错误信息