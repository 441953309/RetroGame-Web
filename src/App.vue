<template>
  <div class="app-container">
    <header>
      <h1>RetroGame Web</h1>
      <p>通用模拟器前端框架</p>
    </header>

    <main>
      <!-- 移动端菜单按钮 -->
      <button v-if="isMobile" class="mobile-menu-toggle" @click="showMenu = true">
        菜单
      </button>

      <!-- 移动端覆盖菜单 -->
      <div v-if="isMobile && showMenu" class="mobile-menu-overlay" @click.self="showMenu = false">
        <div class="mobile-menu-content">
          <div class="menu-header">
            <h3>模拟器设置</h3>
            <button class="close-btn" @click="showMenu = false">✕</button>
          </div>
          
          <div class="control-panel">
            <section class="core-selection">
              <h3>选择核心</h3>
              <div class="button-group">
                <button 
                  v-for="core in CORES" 
                  :key="core.id"
                  :class="{ active: currentCoreId === core.id }"
                  @click="selectCore(core.id)"
                >
                  {{ core.name }}
                </button>
              </div>
            </section>

            <section v-if="currentCore" class="rom-upload">
              <h3>加载游戏 (ROM)</h3>
              <div class="file-input-wrapper">
                <button class="upload-btn" @click="$refs.fileInput.click()">
                  {{ hasRom ? '更换游戏' : '选择游戏文件' }}
                </button>
                <input 
                  type="file" 
                  ref="fileInput"
                  @change="onFileChange" 
                  accept=".gb,.gbc,.ch8,.bin,application/octet-stream,*" 
                  style="display: none"
                />
              </div>
            </section>

            <section v-if="emulator" class="status-panel">
              <p>状态: <span :class="statusClass">{{ statusText }}</span></p>
              <div class="actions">
                <button v-if="!isRunning" @click="resume" :disabled="!hasRom">开始</button>
                <button v-else @click="pause">暂停</button>
                <button @click="reset">重置</button>
              </div>
            </section>
          </div>
        </div>
      </div>

      <!-- PC 端控制面板 -->
      <div v-if="!isMobile" class="control-panel">
        <section class="core-selection">
          <h3>选择核心</h3>
          <div class="button-group">
            <button 
              v-for="core in CORES" 
              :key="core.id"
              :class="{ active: currentCoreId === core.id }"
              @click="selectCore(core.id)"
            >
              {{ core.name }}
            </button>
          </div>
        </section>

        <section v-if="currentCore" class="rom-upload">
          <h3>加载游戏 (ROM)</h3>
          <div class="file-input-wrapper">
            <button class="upload-btn" @click="$refs.fileInput.click()">
              {{ hasRom ? '更换游戏' : '选择游戏文件' }}
            </button>
            <input 
              type="file" 
              ref="fileInput"
              @change="onFileChange" 
              accept=".gb,.gbc,.ch8,.bin,application/octet-stream,*" 
              style="display: none"
            />
          </div>
          <p class="file-hint" v-if="!hasRom">支持 .gb, .gbc, .ch8, .bin 格式</p>
        </section>

        <section v-if="emulator" class="status-panel">
          <p>状态: <span :class="statusClass">{{ statusText }}</span></p>
          <div class="actions">
            <button v-if="!isRunning" @click="resume" :disabled="!hasRom">开始</button>
            <button v-else @click="pause">暂停</button>
            <button @click="reset">重置</button>
          </div>
        </section>
      </div>

      <div class="emulator-view">
        <EmulatorScreen 
          v-if="currentCore"
          :width="resolution[0]"
          :height="resolution[1]"
          :pixelData="lastPixels"
        />
        <div v-else class="placeholder">
          请先选择一个模拟器核心
        </div>

        <!-- 移动端虚拟手柄 -->
        <VirtualController 
          v-if="currentCore && isMobile"
          :coreId="currentCoreId"
          @down="handleKeyDown"
          @up="handleKeyUp"
        />
        
        <div v-if="currentCore && !isMobile" class="controls-hint">
          <h4>按键说明</h4>
          <ul>
            <li v-for="(val, key) in currentCore.keyMap" :key="key">
              <strong>{{ key }}</strong>: {{ getActionName(val) }}
            </li>
          </ul>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { CORES } from './constants/cores';
import { useEmulator } from './composables/useEmulator';
import EmulatorScreen from './components/EmulatorScreen.vue';
import VirtualController from './components/VirtualController.vue';

const {
  emulator,
  isLoaded,
  isRunning,
  resolution,
  loadWasm,
  initCore,
  loadRom,
  start,
  stop,
  handleKeyDown,
  handleKeyUp
} = useEmulator();

const currentCoreId = ref(null);
const currentCore = computed(() => currentCoreId.value ? CORES[currentCoreId.value] : null);
const hasRom = ref(false);
const lastPixels = ref(null);
const isMobile = ref(false);
const showMenu = ref(false);

const checkMobile = () => {
  isMobile.value = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
};

const statusText = computed(() => {
  if (!isLoaded.value) return '正在初始化 WASM...';
  if (!currentCoreId.value) return '等待选择核心';
  if (!hasRom.value) return '等待加载 ROM';
  if (isRunning.value) return '运行中';
  return '已暂停';
});

const statusClass = computed(() => ({
  'status-online': isRunning.value,
  'status-offline': !isRunning.value && hasRom.value,
  'status-loading': !isLoaded.value
}));

onMounted(async () => {
  await loadWasm();
  checkMobile();
  window.addEventListener('resize', checkMobile);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkMobile);
  window.removeEventListener('keydown', onKeyDown);
  window.removeEventListener('keyup', onKeyUp);
});

const selectCore = (id) => {
  currentCoreId.value = id;
  initCore(CORES[id].coreType);
  hasRom.value = false;
  stop();
  lastPixels.value = null;
};

const onFileChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const buffer = await file.arrayBuffer();
  loadRom(buffer);
  hasRom.value = true;
  resume();
};

const resume = () => {
  start((pixels) => {
    lastPixels.value = pixels;
  });
};

const pause = () => {
  stop();
};

const reset = () => {
  if (currentCoreId.value) {
    initCore(CORES[currentCoreId.value].coreType);
    // 如果有之前的 ROM，可能需要重新加载，这里简化处理
    hasRom.value = false;
    stop();
    lastPixels.value = null;
  }
};

const getActionName = (val) => {
  if (currentCoreId.value === 'GBC') {
    const names = ['下', '上', '左', '右', 'Start', 'Select', 'B', 'A'];
    return names[val] || val;
  }
  return `键值 ${val.toString(16)}`;
};

// 键盘事件处理
const onKeyDown = (e) => {
  if (!currentCore.value) return;
  const mapped = currentCore.value.keyMap[e.key];
  if (mapped !== undefined) {
    e.preventDefault();
    handleKeyDown(mapped);
  }
};

const onKeyUp = (e) => {
  if (!currentCore.value) return;
  const mapped = currentCore.value.keyMap[e.key];
  if (mapped !== undefined) {
    e.preventDefault();
    handleKeyUp(mapped);
  }
};

window.addEventListener('keydown', onKeyDown);
window.addEventListener('keyup', onKeyUp);
</script>

<style>
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background-color: #1a1a1a;
  color: #eee;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
}

.app-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

header {
  text-align: center;
  margin-bottom: 30px;
}

header h1 {
  color: #42b983;
  margin-bottom: 5px;
}

main {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 30px;
}

@media (max-width: 768px) {
  .app-container {
    padding: 0; /* 彻底移除移动端边距 */
    max-width: none;
  }

  header {
    margin-bottom: 10px;
    padding-top: 10px;
  }

  header h1 {
    font-size: 1.2rem;
  }

  main {
    display: flex;
    flex-direction: column;
    gap: 0; /* 移除间距，让画面顶天立地 */
  }

  .control-panel {
    order: 2;
  }

  .emulator-view {
    order: 1;
    width: 100%;
  }

  header {
    margin-bottom: 15px;
  }

  header h1 {
    font-size: 1.5rem;
  }
}

/* 移动端菜单样式 */
.mobile-menu-toggle {
  position: fixed;
  top: 15px;
  right: 15px;
  z-index: 100;
  background: #42b983;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 20px;
  font-weight: bold;
  box-shadow: 0 2px 10px rgba(0,0,0,0.3);
}

.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.8);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}

.mobile-menu-content {
  width: 100%;
  background: #2a2a2a;
  border-radius: 20px 20px 0 0;
  padding: 20px;
  max-height: 80vh;
  overflow-y: auto;
  touch-action: pan-y; /* 允许菜单内滚动 */
  user-select: none;
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #444;
  padding-bottom: 10px;
}

.menu-header h3 {
  margin: 0;
  border: none;
}

.close-btn {
  background: transparent;
  border: none;
  color: #888;
  font-size: 1.5rem;
  padding: 5px;
}

.upload-btn {
  width: 100%;
  background: #42b983;
  color: white;
  border: none;
  font-weight: bold;
}

.upload-btn:hover {
  background: #3aa876;
}

.file-hint {
  font-size: 0.8rem;
  color: #888;
  margin-top: 8px;
  text-align: center;
}

.control-panel {
  background: #2a2a2a;
  padding: 20px;
  border-radius: 12px;
}

section {
  margin-bottom: 25px;
}

h3 {
  margin-top: 0;
  border-left: 4px solid #42b983;
  padding-left: 10px;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

button {
  padding: 10px 15px;
  background: #3a3a3a;
  border: 1px solid #444;
  color: #eee;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

button:hover {
  background: #444;
}

button.active {
  background: #42b983;
  color: #fff;
  border-color: #42b983;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.status-panel p {
  font-weight: bold;
}

.status-online { color: #42b983; }
.status-offline { color: #ff9800; }
.status-loading { color: #2196f3; }

.actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.emulator-view {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.placeholder {
  width: 100%;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #222;
  border: 2px dashed #444;
  border-radius: 8px;
  color: #666;
}

.controls-hint {
  margin-top: 20px;
  width: 100%;
  background: #2a2a2a;
  padding: 15px;
  border-radius: 12px;
}

.controls-hint h4 {
  margin-top: 0;
}

.controls-hint ul {
  display: grid;
  grid-template-columns: 1fr 1fr;
  list-style: none;
  padding: 0;
  gap: 5px;
}
</style>
