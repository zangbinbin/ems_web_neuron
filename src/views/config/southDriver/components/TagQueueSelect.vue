<template>
  <emqx-select
    v-model="selectedValue"
    multiple
    :collapse-tags="collapseTags"
    :placeholder="$t('common.pleaseSelect')"
    @change="change"
  >
    <emqx-option v-for="item in tagQueueTypeOptList" :key="item.value" :label="item.label" :value="item.value" />
  </emqx-select>
</template>

<script lang="ts" setup>
import { defineProps, computed, defineEmits } from 'vue'
import { useTagQueueTypeSelect } from '@/composables/config/useAddTagCommon'

const props = defineProps({
  modelValue: { type: [Number] },
  collapseTags: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'change'])

const { tagQueueTypeOptList, tagQueueValueMap } = useTagQueueTypeSelect()
const selectedValue = computed({
  get() {
    if (!props.modelValue) {
      return []
    }
    return tagQueueValueMap[props.modelValue as keyof typeof tagQueueValueMap]
  },
  set(val: Array<number>) {
    const keys = Object.keys(tagQueueValueMap)
    const value = keys.find(
      (total) =>
        tagQueueValueMap[Number(total) as keyof typeof tagQueueValueMap].join(',') ===
        val.sort((a, b) => a - b).join(','),
    )
    emit('update:modelValue', Number(value))
  },
})

const change = () => {
  emit('change', change)
}
</script>
