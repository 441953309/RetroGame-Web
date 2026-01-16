<template>
  <div class="virtual-controller" :class="coreId">
    <!-- GBC Layout -->
    <template v-if="coreId === 'GBC'">
      <div class="controller-row main-controls">
        <div class="dpad">
          <button class="dpad-btn up" @touchstart="press(1)" @touchend="release(1)"></button>
          <button class="dpad-btn left" @touchstart="press(2)" @touchend="release(2)"></button>
          <button class="dpad-btn right" @touchstart="press(3)" @touchend="release(3)"></button>
          <button class="dpad-btn down" @touchstart="press(0)" @touchend="release(0)"></button>
          <div class="dpad-center"></div>
        </div>
        
        <div class="action-buttons">
          <div class="btn-label-group">
            <button class="action-btn b" @touchstart="press(6)" @touchend="release(6)">B</button>
          </div>
          <div class="btn-label-group">
            <button class="action-btn a" @touchstart="press(7)" @touchend="release(7)">A</button>
          </div>
        </div>
      </div>
      
      <div class="controller-row system-controls">
        <button class="system-btn select" @touchstart="press(5)" @touchend="release(5)">SELECT</button>
        <button class="system-btn start" @touchstart="press(4)" @touchend="release(4)">START</button>
      </div>
    </template>

    <!-- XOC8 Layout -->
    <template v-else-if="coreId === 'XOC8'">
      <div class="xoc8-grid">
        <button 
          v-for="btn in xoc8Buttons" 
          :key="btn.val" 
          class="xoc8-btn"
          @touchstart="press(btn.val)"
          @touchend="release(btn.val)"
        >
          {{ btn.label }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
const props = defineProps({
  coreId: { type: String, default: '' }
});

const emit = defineEmits(['down', 'up']);

const xoc8Buttons = [
  { label: '1', val: 0x1 }, { label: '2', val: 0x2 }, { label: '3', val: 0x3 }, { label: 'C', val: 0xC },
  { label: '4', val: 0x4 }, { label: '5', val: 0x5 }, { label: '6', val: 0x6 }, { label: 'D', val: 0xD },
  { label: '7', val: 0x7 }, { label: '8', val: 0x8 }, { label: '9', val: 0x9 }, { label: 'E', val: 0xE },
  { label: 'A', val: 0xA }, { label: '0', val: 0x0 }, { label: 'B', val: 0xB }, { label: 'F', val: 0xF }
];

const press = (val) => {
  emit('down', val);
};

const release = (val) => {
  emit('up', val);
};
</script>

<style scoped>
.virtual-controller {
  width: 100%;
  max-width: 500px;
  user-select: none;
  touch-action: manipulation;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px 20px 0 0; /* 底部对齐 */
  margin-top: auto; /* 推到底部 */
}

.controller-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

/* D-PAD */
.dpad {
  position: relative;
  width: 120px;
  height: 120px;
}

.dpad-btn {
  position: absolute;
  background: #333;
  border: none;
  border-radius: 4px;
}

.dpad-btn:active {
  background: #555;
}

.up { width: 40px; height: 45px; top: 0; left: 40px; }
.down { width: 40px; height: 45px; bottom: 0; left: 40px; }
.left { width: 45px; height: 40px; top: 40px; left: 0; }
.right { width: 45px; height: 40px; top: 40px; right: 0; }
.dpad-center {
  position: absolute;
  width: 40px;
  height: 40px;
  top: 40px;
  left: 40px;
  background: #333;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 20px;
  transform: rotate(-15deg);
}

.action-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: none;
  background: #c0392b;
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
  box-shadow: 0 4px #96281b;
}

.action-btn:active {
  transform: translateY(2px);
  box-shadow: 0 2px #96281b;
}

.action-btn.a { background: #c0392b; }
.action-btn.b { background: #c0392b; }

/* System Buttons */
.system-controls {
  justify-content: center;
  gap: 30px;
}

.system-btn {
  width: 70px;
  height: 25px;
  background: #555;
  border: none;
  border-radius: 12px;
  color: #aaa;
  font-size: 0.7rem;
  font-weight: bold;
  transform: rotate(-15deg);
}

.system-btn:active {
  background: #777;
}

/* XOC8 Grid */
.xoc8-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.xoc8-btn {
  aspect-ratio: 1;
  background: #3a3a3a;
  border: 1px solid #555;
  color: #eee;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: bold;
}

.xoc8-btn:active {
  background: #42b983;
}
</style>
