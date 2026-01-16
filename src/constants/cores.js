export const CORES = {
  XOC8: {
    id: 'XOC8',
    name: 'XOC8 (CHIP-8)',
    coreType: 1, // 对应 Rust 中的 CoreType::Xoc8
    keyMap: {
      '1': 0x1, '2': 0x2, '3': 0x3, '4': 0xC,
      'q': 0x4, 'w': 0x5, 'e': 0x6, 'r': 0xD,
      'a': 0x7, 's': 0x8, 'd': 0x9, 'f': 0xE,
      'z': 0xA, 'x': 0x0, 'c': 0xB, 'v': 0xF
    }
  },
  GBC: {
    id: 'GBC',
    name: 'GameBoy Color',
    coreType: 0, // 对应 Rust 中的 CoreType::GameBoy
    keyMap: {
      'ArrowDown': 0,
      'ArrowUp': 1,
      'ArrowLeft': 2,
      'ArrowRight': 3,
      'Enter': 4,  // Start
      'Shift': 5,  // Select
      'z': 6,      // B
      'x': 7,      // A
    }
  }
};
