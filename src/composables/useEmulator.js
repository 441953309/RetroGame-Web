import { ref, onBeforeUnmount } from 'vue';
import init, { WasmEmulator } from '../core-wasm/index.js';

export function useEmulator() {
  const emulator = ref(null);
  const isLoaded = ref(false);
  const isRunning = ref(false);
  const resolution = ref([0, 0]);
  let animationFrameId = null;

  const loadWasm = async () => {
    if (!isLoaded.value) {
      await init();
      isLoaded.value = true;
    }
  };

  const initCore = (coreType) => {
    if (emulator.value) {
      stop();
    }
    emulator.value = new WasmEmulator(coreType);
    const res = emulator.value.get_resolution();
    resolution.value = [res[0], res[1]];
  };

  const loadRom = (romData) => {
    if (emulator.value) {
      emulator.value.load_rom(new Uint8Array(romData));
    }
  };

  const start = (onTick) => {
    if (!emulator.value || isRunning.value) return;
    isRunning.value = true;

    const loop = () => {
      if (!isRunning.value) return;
      
      emulator.value.tick_frame();
      const pixels = emulator.value.get_display_bytes();
      
      if (onTick) {
        onTick(pixels);
      }
      
      animationFrameId = requestAnimationFrame(loop);
    };
    
    animationFrameId = requestAnimationFrame(loop);
  };

  const stop = () => {
    isRunning.value = false;
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  };

  const handleKeyDown = (key) => {
    if (emulator.value) emulator.value.key_down(key);
  };

  const handleKeyUp = (key) => {
    if (emulator.value) emulator.value.key_up(key);
  };

  onBeforeUnmount(() => {
    stop();
  });

  return {
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
  };
}
