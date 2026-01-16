<template>
  <div class="emulator-screen">
    <canvas ref="canvasRef" :width="width" :height="height"></canvas>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';

const props = defineProps({
  width: { type: Number, default: 160 },
  height: { type: Number, default: 144 },
  pixelData: { type: Uint8Array, default: null }
});

const canvasRef = ref(null);
let ctx = null;
let imageData = null;

onMounted(() => {
  ctx = canvasRef.value.getContext('2d');
  imageData = ctx.createImageData(props.width, props.height);
});

watch(() => props.pixelData, (newData) => {
  if (!newData || !ctx) return;

  // 如果分辨率变化，重新创建 imageData
  if (imageData.width !== props.width || imageData.height !== props.height) {
    imageData = ctx.createImageData(props.width, props.height);
  }

  imageData.data.set(newData);
  ctx.putImageData(imageData, 0, 0);
});

// 监听分辨率变化，确保 canvas 大小正确
watch([() => props.width, () => props.height], ([w, h]) => {
  if (ctx) {
    imageData = ctx.createImageData(w, h);
  }
});
</script>

<style scoped>
.emulator-screen {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #000;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.8);
  width: 100%;
  max-width: 640px; /* PC端最大限制 */
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .emulator-screen {
    padding: 0;
    border-radius: 0;
    box-shadow: none;
    max-width: none;
  }
}

canvas {
  image-rendering: pixelated;
  width: 100%;
  height: auto;
  display: block;
  background-color: #111;
}
</style>
