<template>
  <div class="main">
    <Header class="header" />
    <emqx-container
      normal
      fixed-nav
      :class="isShow ? 'body' : 'body aside-small'"
      :style="{
        '--margin-left': isShow ? '220px' : '64px',
        '--main-width': isShow ? 'calc(100% - 500px)' : 'calc(100% - 344px)',
      }"
      :page-min-width="1250"
    >
      <template #nav>
        <i v-if="isShow" class="el-icon-s-fold icon-class" @click="handleClick"></i>
        <i v-else class="el-icon-s-unfold icon-class" @click="handleClick"></i>
        <side-nav v-if="isShow" class="sidebar"></side-nav>
        <small-side-nav v-else class="sidebar"></small-side-nav>
      </template>
      <template #page-content>
        <div>
          <Breadcrumb />
          <router-view />
        </div>
      </template>
    </emqx-container>
  </div>
</template>

<script lang="ts">
import { ref, computed, defineComponent } from 'vue'
import Header from '@/components/Header.vue'
import SideNav from '@/components/SideNav.vue'
import SmallSideNav from '@/components/SmallSideNav.vue'
import { useStore } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb.vue'

export default defineComponent({
  name: 'Home',
  components: {
    Header,
    SideNav,
    SmallSideNav,
    Breadcrumb,
  },
  setup() {
    const isShow = ref(true)
    const store = useStore()
    const isSubAppLoading = computed(() => store.state.isSubAppLoading)
    // 点击事件处理函数
    const handleClick = () => {
      isShow.value = !isShow.value // 切换状态
      console.log('点击触发，当前状态:', isShow.value)
    }
    return {
      isSubAppLoading,
      isShow,
      handleClick,
    }
  },
})
</script>

<style lang="scss" scoped>
.aside-small {
  :deep(.el-aside) {
    width: 64px !important;
    transition: width 0.3s;
  }

  :deep(.nav-container) {
    width: 64px !important;
    transition: width 0.3s;
  }
}
.icon-class {
  font-size: 30px;
  position: absolute;
  top: 50%;
  right: 0%;
  color: rgb(159, 154, 154);
  opacity: 0.3;
  z-index: 1;
}
:deep(.el-main) {
  position: absolute;
  z-index: 1;
  margin-left: var(--margin-left);
  width: var(--main-width);
  padding-bottom: 40px !important;
}
:deep(.el-aside) {
  position: fixed;
  z-index: 999999;
}
:deep(.nav-container) {
  top: 100px !important;
}
</style>
