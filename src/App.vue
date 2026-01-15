<template>
  <div>
    <h1>RetroGame Web</h1>
    <p>Welcome to the web version of RetroGame.</p>
    <div v-if="loading">正在加载模拟器核心...</div>
    <div v-else>
      <button @click="handleInit">初始化 GameBoy 模拟器</button>
      <p>状态: {{ status }}</p>
      <div v-if="emulator">
        <p>模拟器已就绪</p>
        <button @click="handleTick">运行一帧</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
// 这里的路径对应 package.json 中 build:wasm 的 --out-dir
import init, { WasmEmulator, CoreType } from './core-wasm/index.js';

const loading = ref(true);
const status = ref('未初始化');
const emulator = ref(null);

onMounted(async () => {
  try {
    // 初始化 WASM 模块
    await init();
    loading.value = false;
    status.value = '核心已加载';
  } catch (e) {
    console.error('加载 WASM 失败:', e);
    status.value = '加载失败';
  }
});

const handleInit = () => {
  try {
    // 使用核心库导出的 WasmEmulator 和 CoreType
    emulator.value = new WasmEmulator(CoreType.GameBoy);
    status.value = '模拟器初始化成功 (GameBoy)';
  } catch (e) {
    console.error('初始化模拟器失败:', e);
    status.value = '初始化失败';
  }
};

const handleTick = () => {
  if (emulator.value) {
    emulator.value.tick_frame();
    const res = emulator.value.get_resolution();
    status.value = `运行中... 分辨率: ${res[0]}x${res[1]}`;
  }
};
</script>

<style scoped>
h1 {
  color: #42b983;
}
</style>
