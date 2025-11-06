<template>
  <emqx-card v-emqx-loading="isListLoading"> 策略管理 </emqx-card>
</template>

<script lang="ts" setup>
import { ref, computed, nextTick, defineAsyncComponent } from 'vue'

const isListLoading = ref(false)
</script>

<style lang="scss" scoped></style>
